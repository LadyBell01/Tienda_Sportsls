// Configuración PWA - Tienda Sportsls
// Versión: 1.1.0

const PWA_CONFIG = {
  // Versión de la aplicación
  VERSION: 'v1.1.0',

  // Assets críticos del Application Shell (pre-cache en install)
  SHELL_ASSETS: [
    '/',
    '/index.html',
    '/pages/tienda.html',
    '/pages/carrito.html',
    '/pages/registrarme.html',
    '/css/style.css',
    '/js/app.js',
    '/js/pwa-config.js',
    '/js/pwa-register.js',
    '/img/logosportsls.jpeg',
    '/manifest.json',
    '/offline.html'
  ],

  // Nombres de las cachés
  CACHE_NAMES: {
    STATIC: 'tienda-sportsls-static-v1.1.0',
    DYNAMIC: 'tienda-sportsls-dynamic-v1.1.0',
    IMAGES: 'tienda-sportsls-images-v1.1.0'
  },

  // Configuración de red
  NETWORK_TIMEOUT: 3000, // 3 segundos

  // Recursos estáticos a cachear durante la instalación
  STATIC_ASSETS: [
    '/',
    '/index.html',
    '/pages/tienda.html',
    '/pages/carrito.html',
    '/pages/registrarme.html',
    '/css/style.css',
    '/js/app.js',
    '/js/pwa-config.js',
    '/js/pwa-register.js',
    '/manifest.json',
    // Iconos PWA
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    // Logo
    '/img/logosportsls.jpeg'
  ],

  // Recursos externos (CDN)
  EXTERNAL_RESOURCES: [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700&family=Sawarabi+Gothic&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap'
  ],

  // Estrategias de caché
  CACHE_STRATEGIES: {
    // Cache First: Para assets estáticos (CSS, JS, imágenes)
    CACHE_FIRST: 'cache-first',
    // Network First: Para contenido dinámico (HTML)
    NETWORK_FIRST: 'network-first',
    // Network Only: Para requests que no deben cachearse
    NETWORK_ONLY: 'network-only'
  },

  // Tiempo máximo de espera para network requests (ms)
  NETWORK_TIMEOUT: 3000,

  // Número máximo de items en caché dinámica
  MAX_DYNAMIC_CACHE_SIZE: 50,

  // Número máximo de imágenes en caché
  MAX_IMAGE_CACHE_SIZE: 60
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWA_CONFIG;
}
