# Tienda Sportsls - Progressive Web App

![PWA](https://img.shields.io/badge/PWA-Ready-success)
![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Azure Functions](https://img.shields.io/badge/Azure-Functions-0078D4)

Tienda de ropa y accesorios deportivos convertida en Progressive Web App con backend serverless.

## 🚀 Características

### ✅ PWA Completa
- **Offline First**: Funciona sin conexión a internet
- **Instalable**: Se puede instalar como app nativa
- **Service Worker**: Caché inteligente con estrategias optimizadas
- **Manifest**: Configuración completa para instalación
- **Push Notifications**: Notificaciones de pedidos

### ✅ Backend Serverless
- **Azure Functions**: 3 funciones serverless
  - `procesarPedido`: Procesamiento de pedidos con validación de stock
  - `consultarStock`: Consulta de inventario en tiempo real
  - `analizarImagen`: Búsqueda visual con AI (Azure Computer Vision)

### ✅ Optimizado para Rendimiento
- **Lazy Loading**: Carga diferida de imágenes
- **Caché Estratégica**: Cache-First para assets, Network-First para HTML
- **Versión 1.1.0**: Sistema de versionado automático

## 📦 Estructura del Proyecto

```
Actividad_1/
├── api/                    # Azure Functions
│   ├── procesarPedido/
│   ├── consultarStock/
│   └── analizarImagen/
├── assets/                 # Assets PWA
│   ├── icons/             # 8 tamaños + maskable
│   └── screenshots/
├── css/
│   └── style.css
├── img/                    # Imágenes de productos
├── js/
│   ├── app.js             # Lógica principal
│   ├── api-service.js     # Cliente API
│   ├── notification-service.js  # Push notifications
│   ├── pwa-config.js      # Configuración PWA
│   └── pwa-register.js    # Registro SW
├── pages/
│   ├── tienda.html        # Catálogo de productos
│   ├── carrito.html       # Carrito de compras
│   └── registrarme.html   # Registro
├── index.html             # Página principal
├── manifest.json          # Manifiesto PWA
├── service-worker.js      # Service Worker v1.1.0
└── offline.html           # Página offline
```

## 🛠️ Instalación y Uso

### Desarrollo Local

1. **Clonar repositorio**:
   ```bash
   git clone <repo-url>
   cd Tienda_Sportsls/Actividad_1
   ```

2. **Iniciar servidor HTTP**:
   ```bash
   python3 -m http.server 8000
   ```

3. **Abrir en navegador**:
   ```
   http://localhost:8000
   ```

### Azure Functions (Opcional)

1. **Instalar dependencias**:
   ```bash
   cd api
   npm install
   ```

2. **Iniciar Functions localmente**:
   ```bash
   func start
   ```

3. **Endpoints disponibles**:
   - `POST http://localhost:7071/api/pedidos`
   - `GET http://localhost:7071/api/stock/{id}`
   - `POST http://localhost:7071/api/vision/analyze`

## 📱 Instalación como PWA

### Desktop (Chrome/Edge)
1. Abrir la aplicación
2. Click en el ícono ⊕ en la barra de direcciones
3. "Instalar Tienda Sportsls"

### Android
1. Abrir en Chrome
2. Menú (⋮) > "Agregar a pantalla de inicio"

### iOS
1. Abrir en Safari
2. Compartir > "Agregar a pantalla de inicio"

## 🔔 Notificaciones Push

### Activar Notificaciones

```javascript
// Solicitar permiso
await notificationService.requestPermission();

// Mostrar notificación de prueba
await notificationService.showNotification('Test', {
  body: 'Notificación de prueba'
});
```

### VAPID Keys

Para producción, generar claves VAPID:

```bash
npx web-push generate-vapid-keys
```

Actualizar en:
- `js/notification-service.js`: `vapidPublicKey`
- Azure Functions: Variables de entorno

## 🎯 Características Implementadas

### Fase 1: Foundation ✅
- [x] Estructura PWA
- [x] Service Worker básico
- [x] Manifest.json
- [x] Iconos PWA (8 tamaños)

### Fase 2: Offline First ✅
- [x] SHELL_ASSETS
- [x] Cache-First strategy
- [x] Network-First strategy
- [x] Página offline
- [x] Maskable icons

### Fase 3: Testing (Pendiente)
- [ ] Lighthouse audit
- [ ] Tests unitarios
- [ ] Tests E2E

### Fase 4: Backend ✅
- [x] Azure Functions
- [x] procesarPedido
- [x] consultarStock
- [x] analizarImagen (AI Vision)
- [x] API Service frontend

### Fase 5: UX & Performance ✅ (Parcial)
- [x] Push notifications
- [x] Lazy loading imágenes
- [ ] Minificación CSS/JS
- [ ] Lighthouse 90+

### Fase 6: Despliegue (Pendiente)
- [ ] Azure Static Web Apps
- [ ] CI/CD con GitHub Actions
- [ ] Variables de entorno
- [ ] Dominio personalizado

## 🧪 Testing

### Verificar Service Worker

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW:', regs[0].active.state);
});
```

### Verificar Cachés

```javascript
caches.keys().then(keys => {
  console.log('Cachés:', keys);
});
```

### Test Offline

1. DevTools > Network > Offline
2. Recargar página
3. ✅ Debe funcionar

## 📊 Performance

**Target Lighthouse Scores**:
- Performance: ≥ 90
- PWA: 100
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

## 🔒 Seguridad

- ✅ API Keys protegidas (no en frontend)
- ✅ CORS configurado
- ✅ Validación de datos en backend
- ✅ `.gitignore` para archivos sensibles

## 📚 Documentación

- [API README](api/README.md) - Documentación de Azure Functions
- [Walkthrough](../.gemini/antigravity/brain/.../walkthrough.md) - Guía completa de implementación

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto es de código abierto.

## 👥 Autores

- **Tienda Sportsls** - Proyecto PWA

## 🙏 Agradecimientos

- Azure Functions
- Azure Computer Vision
- Service Workers API
- Web Push Protocol

---

**Versión**: 1.1.0  
**Última actualización**: Noviembre 2023
