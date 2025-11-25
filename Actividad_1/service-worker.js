// Service Worker - Tienda Sportsls v1.1.0
// Implementación Offline First con estrategias refinadas

// Importar configuración
importScripts('/js/pwa-config.js');

const CACHE_VERSION = PWA_CONFIG.VERSION;
const STATIC_CACHE = PWA_CONFIG.CACHE_NAMES.STATIC;
const DYNAMIC_CACHE = PWA_CONFIG.CACHE_NAMES.DYNAMIC;
const IMAGE_CACHE = PWA_CONFIG.CACHE_NAMES.IMAGES;
const SHELL_ASSETS = PWA_CONFIG.SHELL_ASSETS;
const NETWORK_TIMEOUT = PWA_CONFIG.NETWORK_TIMEOUT;

// ============================================
// EVENTO INSTALL - Pre-cachear Application Shell
// ============================================
self.addEventListener('install', (event) => {
    console.log(`[SW ${CACHE_VERSION}] 🔧 Instalando Service Worker...`);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] 📦 Cacheando Application Shell...');

                // Pre-cachear assets críticos uno por uno para mejor logging
                return Promise.all(
                    SHELL_ASSETS.map(url => {
                        return cache.add(url)
                            .then(() => console.log(`[SW] ✅ Cacheado: ${url}`))
                            .catch(err => console.error(`[SW] ❌ Error cacheando ${url}:`, err));
                    })
                );
            })
            .then(() => {
                console.log('[SW] 🎉 Application Shell cacheado exitosamente');
                // Activar inmediatamente el nuevo SW
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] ❌ Error durante instalación:', error);
            })
    );
});

// ============================================
// EVENTO ACTIVATE - Limpieza de cachés antiguas
// ============================================
self.addEventListener('activate', (event) => {
    console.log(`[SW ${CACHE_VERSION}] 🚀 Activando Service Worker...`);

    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Eliminar cachés que no están en la lista actual
                        if (!currentCaches.includes(cacheName)) {
                            console.log('[SW] 🗑️ Eliminando caché antigua:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] ✨ Cachés antiguas eliminadas');
                console.log('[SW] 📋 Cachés activas:', currentCaches);
                // Tomar control de todas las páginas inmediatamente
                return self.clients.claim();
            })
            .then(() => {
                console.log('[SW] ✅ Service Worker activado y en control');
            })
    );
});

// ============================================
// EVENTO FETCH - Interceptar peticiones de red
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones que no sean HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // Ignorar peticiones POST (formularios, etc.)
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar analytics y tracking
    if (url.hostname.includes('analytics') ||
        url.hostname.includes('tracking') ||
        url.hostname.includes('googletagmanager')) {
        return;
    }

    // ============================================
    // ESTRATEGIA 1: Cache First para Assets Estáticos
    // ============================================

    // Imágenes
    if (request.destination === 'image' ||
        request.url.includes('/img/') ||
        request.url.includes('/assets/icons/')) {
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
        return;
    }

    // CSS
    if (request.destination === 'style' || request.url.includes('/css/')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // JavaScript
    if (request.destination === 'script' || request.url.includes('/js/')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // Fuentes y recursos externos (CDN)
    if (request.destination === 'font' ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdnjs.cloudflare.com')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // Manifest y assets PWA
    if (request.url.includes('/manifest.json') ||
        request.url.includes('/assets/')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // ============================================
    // ESTRATEGIA 2: Network First para Contenido Dinámico
    // ============================================

    // Páginas HTML
    if (request.destination === 'document' ||
        request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // API calls (si existen)
    if (request.url.includes('/api/')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Por defecto: Network First
    event.respondWith(networkFirstStrategy(request));
});

// ============================================
// ESTRATEGIA: Cache First
// Busca en caché primero, luego en red
// ============================================
async function cacheFirstStrategy(request, cacheName) {
    try {
        // 1. Buscar en caché
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] ✅ Cache hit:', request.url.split('/').pop());

            // Actualizar caché en background (stale-while-revalidate)
            fetch(request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        caches.open(cacheName).then(cache => {
                            cache.put(request, networkResponse);
                        });
                    }
                })
                .catch(() => { }); // Ignorar errores de actualización

            return cachedResponse;
        }

        // 2. Si no está en caché, fetch de red
        console.log('[SW] ⬇️ Fetching:', request.url.split('/').pop());
        const networkResponse = await fetch(request);

        // 3. Cachear si es exitoso
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('[SW] 💾 Cached:', request.url.split('/').pop());

            // Limpiar caché si excede el límite
            if (cacheName === IMAGE_CACHE) {
                await limitCacheSize(cacheName, PWA_CONFIG.MAX_IMAGE_CACHE_SIZE);
            }
        }

        return networkResponse;

    } catch (error) {
        console.error('[SW] ❌ Cache First error:', error.message);

        // Fallback para imágenes
        if (request.destination === 'image') {
            const fallbackImage = await caches.match('/img/logosportsls.jpeg');
            if (fallbackImage) return fallbackImage;
        }

        throw error;
    }
}

// ============================================
// ESTRATEGIA: Network First
// Intenta red primero con timeout, luego caché
// ============================================
async function networkFirstStrategy(request) {
    try {
        // 1. Intentar red primero con timeout
        console.log('[SW] 🌐 Network first:', request.url.split('/').pop());
        const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);

        // 2. Cachear respuesta exitosa
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('[SW] 💾 Cached dynamic:', request.url.split('/').pop());

            // Limpiar caché dinámica si excede el límite
            await limitCacheSize(DYNAMIC_CACHE, PWA_CONFIG.MAX_DYNAMIC_CACHE_SIZE);
        }

        return networkResponse;

    } catch (error) {
        console.log('[SW] 🔌 Network failed, using cache:', request.url.split('/').pop());

        // 3. Fallback a caché
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] ✅ Serving from cache');
            return cachedResponse;
        }

        // 4. Fallback final a página offline
        if (request.destination === 'document' ||
            request.headers.get('accept')?.includes('text/html')) {
            console.log('[SW] 📄 Serving offline page');
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;

            // Si no hay offline.html, intentar index.html
            const indexPage = await caches.match('/index.html');
            if (indexPage) return indexPage;
        }

        throw error;
    }
}

// ============================================
// UTILIDAD: Fetch con Timeout
// ============================================
async function fetchWithTimeout(request, timeout = 3000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(request, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Network timeout');
        }
        throw error;
    }
}

// ============================================
// UTILIDAD: Limitar tamaño de caché
// ============================================
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        const deleteCount = keys.length - maxSize;
        console.log(`[SW] 🧹 Limpiando ${deleteCount} items de ${cacheName}`);

        // Eliminar los más antiguos (FIFO)
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
    }
}

// ============================================
// EVENTO: Mensajes desde la página
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] ⏭️ Skip waiting solicitado');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[SW] 🗑️ Limpiando todas las cachés');
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            console.log('[SW] ✅ Cachés eliminadas');
        });
    }
});

// ============================================
// EVENTO: Push Notifications
// ============================================
self.addEventListener('push', (event) => {
    console.log('[SW] 🔔 Push notification recibida');

    let data = {
        title: 'Tienda Sportsls',
        body: 'Tienes una nueva notificación',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        url: '/'
    };

    // Parsear datos si vienen en el push
    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: {
            url: data.url,
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'view',
                title: 'Ver detalles'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ],
        tag: 'tienda-sportsls',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ============================================
// EVENTO: Notification Click
// ============================================
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 🖱️ Click en notificación');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Abrir URL de la notificación
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Buscar si ya hay una ventana abierta
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================
// LOG INICIAL
// ============================================
console.log(`[SW ${CACHE_VERSION}] 📱 Service Worker cargado`);
console.log(`[SW] 🔧 Timeout de red: ${NETWORK_TIMEOUT}ms`);
console.log(`[SW] 📦 Assets del Shell: ${SHELL_ASSETS.length}`);
console.log(`[SW] 🔔 Push notifications habilitadas`);
