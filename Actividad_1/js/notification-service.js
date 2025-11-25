// Notification Service - Push Notifications para PWA
// Maneja permisos, suscripciones y notificaciones locales

class NotificationService {
    constructor() {
        this.vapidPublicKey = 'BEl62iUYgUivxIkv-8Uw8wQqQZPDWMuNPXJqXbKBXPGJNDVGQqGqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ'; // Placeholder - Generar con web-push
        this.subscription = null;
        this.permissionGranted = false;

        console.log('🔔 Notification Service inicializado');
        this.checkPermission();
    }

    /**
     * Verificar estado actual de permisos
     */
    checkPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Este navegador no soporta notificaciones');
            return false;
        }

        this.permissionGranted = Notification.permission === 'granted';
        console.log('🔔 Permiso de notificaciones:', Notification.permission);

        return this.permissionGranted;
    }

    /**
     * Solicitar permiso para notificaciones
     * @returns {Promise<boolean>} True si se concedió el permiso
     */
    async requestPermission() {
        try {
            if (!('Notification' in window)) {
                throw new Error('Notificaciones no soportadas');
            }

            if (Notification.permission === 'granted') {
                console.log('✅ Permiso ya concedido');
                this.permissionGranted = true;
                await this.subscribe();
                return true;
            }

            if (Notification.permission === 'denied') {
                console.warn('❌ Permiso denegado previamente');
                return false;
            }

            console.log('📱 Solicitando permiso de notificaciones...');
            const permission = await Notification.requestPermission();

            this.permissionGranted = permission === 'granted';

            if (this.permissionGranted) {
                console.log('✅ Permiso concedido');
                await this.subscribe();

                // Mostrar notificación de bienvenida
                await this.showNotification('¡Notificaciones activadas!', {
                    body: 'Te avisaremos sobre el estado de tus pedidos',
                    icon: '/assets/icons/icon-192x192.png',
                    badge: '/assets/icons/icon-72x72.png'
                });
            } else {
                console.log('❌ Permiso denegado');
            }

            return this.permissionGranted;

        } catch (error) {
            console.error('❌ Error solicitando permiso:', error);
            return false;
        }
    }

    /**
     * Suscribirse a push notifications
     */
    async subscribe() {
        try {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker no soportado');
            }

            const registration = await navigator.serviceWorker.ready;

            // Verificar si ya hay una suscripción
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Crear nueva suscripción
                console.log('📝 Creando suscripción push...');

                // Convertir VAPID key a Uint8Array
                const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey
                });

                console.log('✅ Suscripción creada');
            } else {
                console.log('✅ Suscripción existente encontrada');
            }

            this.subscription = subscription;

            // Enviar suscripción al servidor (opcional)
            // await this.sendSubscriptionToServer(subscription);

            return subscription;

        } catch (error) {
            console.error('❌ Error suscribiendo:', error);
            throw error;
        }
    }

    /**
     * Enviar suscripción al servidor
     * @param {PushSubscription} subscription 
     */
    async sendSubscriptionToServer(subscription) {
        try {
            // En producción, enviar al backend para almacenar
            console.log('📤 Enviando suscripción al servidor...');

            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                console.log('✅ Suscripción guardada en servidor');
            }

        } catch (error) {
            console.warn('⚠️ No se pudo enviar suscripción al servidor:', error.message);
            // No es crítico, continuar
        }
    }

    /**
     * Mostrar notificación local
     * @param {string} title - Título de la notificación
     * @param {Object} options - Opciones de la notificación
     */
    async showNotification(title, options = {}) {
        try {
            if (!this.permissionGranted) {
                console.warn('⚠️ No hay permiso para mostrar notificaciones');
                return;
            }

            const registration = await navigator.serviceWorker.ready;

            const defaultOptions = {
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                tag: 'tienda-sportsls',
                requireInteraction: false,
                ...options
            };

            await registration.showNotification(title, defaultOptions);
            console.log('🔔 Notificación mostrada:', title);

        } catch (error) {
            console.error('❌ Error mostrando notificación:', error);
        }
    }

    /**
     * Notificar pedido procesado
     * @param {Object} pedido - Datos del pedido
     */
    async notificarPedidoProcesado(pedido) {
        await this.showNotification('¡Pedido confirmado!', {
            body: `Pedido ${pedido.numeroPedido} por ${pedido.totalFormateado}`,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            data: {
                url: '/pages/carrito.html',
                pedidoId: pedido.numeroPedido
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
            vibrate: [200, 100, 200, 100, 200]
        });
    }

    /**
     * Convertir VAPID key de base64 a Uint8Array
     * @param {string} base64String 
     * @returns {Uint8Array}
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Desuscribirse de notificaciones
     */
    async unsubscribe() {
        try {
            if (!this.subscription) {
                console.log('⚠️ No hay suscripción activa');
                return;
            }

            await this.subscription.unsubscribe();
            this.subscription = null;
            console.log('✅ Desuscrito de notificaciones');

        } catch (error) {
            console.error('❌ Error desuscribiendo:', error);
        }
    }
}

// Crear instancia global
const notificationService = new NotificationService();

// Exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
