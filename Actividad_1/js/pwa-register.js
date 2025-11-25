// Registro del Service Worker - Tienda Sportsls

// Verificar si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
    });
}

async function registerServiceWorker() {
    try {
        // Registrar el Service Worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });

        console.log('✅ Service Worker registrado exitosamente:', registration.scope);

        // Escuchar actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Hay una nueva versión disponible
                    console.log('🔄 Nueva versión de la aplicación disponible');

                    // Mostrar notificación al usuario
                    showUpdateNotification();
                }
            });
        });

        // Verificar actualizaciones cada hora
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

    } catch (error) {
        console.error('❌ Error al registrar Service Worker:', error);
    }
}

// Mostrar notificación de actualización
function showUpdateNotification() {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: 'Roboto', sans-serif;
    max-width: 300px;
  `;

    notification.innerHTML = `
    <p style="margin: 0 0 10px 0; font-weight: 500;">
      ✨ Nueva versión disponible
    </p>
    <button onclick="window.location.reload()" style="
      background: white;
      color: #4CAF50;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    ">
      Actualizar ahora
    </button>
    <button onclick="this.parentElement.remove()" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
    ">
      Más tarde
    </button>
  `;

    document.body.appendChild(notification);
}

// Detectar si la app está instalada
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

// Mostrar prompt de instalación
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el prompt automático
    e.preventDefault();

    // Guardar el evento para usarlo después
    deferredPrompt = e;

    // Mostrar botón de instalación personalizado
    showInstallButton();
});

function showInstallButton() {
    // Solo mostrar si no está instalada
    if (isAppInstalled()) return;

    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 14px;
    z-index: 10000;
    transition: transform 0.2s;
  `;

    installButton.innerHTML = '📱 Instalar App';

    installButton.addEventListener('mouseover', () => {
        installButton.style.transform = 'scale(1.05)';
    });

    installButton.addEventListener('mouseout', () => {
        installButton.style.transform = 'scale(1)';
    });

    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ Usuario aceptó instalar la PWA');
        } else {
            console.log('❌ Usuario rechazó instalar la PWA');
        }

        // Limpiar el prompt
        deferredPrompt = null;
        installButton.remove();
    });

    document.body.appendChild(installButton);
}

// Detectar cuando la app se instala
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');

    // Remover botón de instalación si existe
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
        installButton.remove();
    }
});

// Log del estado de la app
console.log('📱 App instalada:', isAppInstalled());
console.log('🔧 Service Worker soportado:', 'serviceWorker' in navigator);
