# Guía de Testing - Tienda Sportsls PWA

Guía completa para validar tu Progressive Web App antes de publicar.

## 🎯 Objetivo

Verificar que la PWA cumple con todos los estándares y funciona correctamente en diferentes dispositivos y condiciones.

---

## 📋 Checklist General

### Antes de Empezar

- [ ] Servidor corriendo en http://localhost:8000
- [ ] Chrome DevTools abierto (F12)
- [ ] Conexión a internet estable

---

## 1️⃣ Lighthouse Audit

### Ejecutar Audit

1. **Abrir Chrome DevTools**: F12
2. **Ir a pestaña Lighthouse**
3. **Configuración**:
   - Mode: Navigation (Default)
   - Device: Mobile
   - Categories: Marcar todas
4. **Click**: "Analyze page load"
5. **Esperar**: 30-60 segundos

### Resultados Esperados

| Categoría | Target | ¿Pasó? |
|-----------|--------|--------|
| Performance | ≥ 90 | ⬜ |
| Progressive Web App | 100 | ⬜ |
| Accessibility | ≥ 90 | ⬜ |
| Best Practices | ≥ 90 | ⬜ |
| SEO | ≥ 90 | ⬜ |

### Core Web Vitals

| Métrica | Target | Resultado |
|---------|--------|-----------|
| First Contentful Paint (FCP) | < 1.8s | _____ |
| Largest Contentful Paint (LCP) | < 2.5s | _____ |
| Total Blocking Time (TBT) | < 200ms | _____ |
| Cumulative Layout Shift (CLS) | < 0.1 | _____ |
| Speed Index | < 3.4s | _____ |

### PWA Checklist (Lighthouse)

- [ ] ✅ Installable
- [ ] ✅ Works offline
- [ ] ✅ Configured for custom splash screen
- [ ] ✅ Sets a theme color
- [ ] ✅ Content is sized correctly for viewport
- [ ] ✅ Has a `<meta name="viewport">` tag
- [ ] ✅ Provides a valid apple-touch-icon

---

## 2️⃣ Service Worker Validation

### Verificar Registro

**DevTools > Application > Service Workers**

Verificar:
- [ ] Estado: "activated and is running"
- [ ] Versión: v1.1.0
- [ ] Scope: /
- [ ] Update on reload: OFF (para testing)

### Verificar Cachés

**DevTools > Application > Cache Storage**

Cachés esperadas:
- [ ] `tienda-sportsls-static-v1.1.0`
- [ ] `tienda-sportsls-dynamic-v1.1.0`
- [ ] `tienda-sportsls-images-v1.1.0`

### Contenido de Caché Estática

Verificar que contiene (mínimo):
- [ ] `/index.html`
- [ ] `/pages/tienda.html`
- [ ] `/pages/carrito.html`
- [ ] `/css/style.css`
- [ ] `/js/app.js`
- [ ] `/js/pwa-config.js`
- [ ] `/js/pwa-register.js`
- [ ] `/img/logosportsls.jpeg`
- [ ] `/manifest.json`
- [ ] `/offline.html`

### Logs en Consola

Verificar logs del Service Worker:
```
[SW v1.1.0] 📱 Service Worker cargado
[SW] 🔧 Timeout de red: 3000ms
[SW] 📦 Assets del Shell: 12
[SW] 🔔 Push notifications habilitadas
```

---

## 3️⃣ Manifest Validation

### Verificar Manifest

**DevTools > Application > Manifest**

Verificar campos:
- [ ] Name: "Tienda Sportsls"
- [ ] Short name: "Sportsls"
- [ ] Start URL: "/"
- [ ] Display: "standalone"
- [ ] Theme color: "#667eea"
- [ ] Background color: "#ffffff"

### Iconos

Verificar que aparecen 8 iconos:
- [ ] 72x72
- [ ] 96x96
- [ ] 128x128
- [ ] 144x144
- [ ] 152x152
- [ ] 192x192
- [ ] 384x384
- [ ] 512x512

Verificar iconos maskable:
- [ ] 192x192 (maskable)
- [ ] 512x512 (maskable)

---

## 4️⃣ Instalación Desktop

### Chrome/Edge

**Pasos**:
1. Buscar ícono ⊕ en barra de direcciones
2. Click en "Instalar Tienda Sportsls"
3. Verificar ventana de confirmación
4. Click "Instalar"
5. Esperar que se abra la app

**Verificaciones**:
- [ ] App se abre en ventana standalone
- [ ] No hay barra de navegador del browser
- [ ] Icono aparece en el dock/taskbar
- [ ] App aparece en lista de aplicaciones del sistema

**Test de Funcionalidad**:
- [ ] Navegar a /pages/tienda.html
- [ ] Agregar productos al carrito
- [ ] Ver carrito
- [ ] Cerrar y reabrir app
- [ ] Carrito persiste (localStorage)

---

## 5️⃣ Test Offline Completo

### Escenario 1: Contenido Cacheado

**Setup**:
1. Con la app abierta, navegar por todas las páginas:
   - [ ] Index (/)
   - [ ] Tienda (/pages/tienda.html)
   - [ ] Carrito (/pages/carrito.html)
2. Verificar en Network que todo carga

**Test Offline**:
1. DevTools > Network > Throttling > Offline
2. Recargar página (Cmd/Ctrl + R)
3. Verificar que carga correctamente
4. Navegar entre páginas
5. Verificar que todas funcionan

**Resultados Esperados**:
- [ ] ✅ Página principal carga
- [ ] ✅ Tienda carga
- [ ] ✅ Carrito carga
- [ ] ✅ Imágenes aparecen
- [ ] ✅ CSS aplicado correctamente
- [ ] ✅ JavaScript funciona
- [ ] ✅ Navegación entre páginas funciona

### Escenario 2: Página No Cacheada

**Setup**:
1. DevTools > Application > Clear storage
2. Click "Clear site data"
3. Recargar página
4. Activar modo Offline inmediatamente

**Resultado Esperado**:
- [ ] ✅ Muestra página offline.html
- [ ] ✅ Mensaje amigable
- [ ] ✅ Botón "Reintentar"
- [ ] ✅ Auto-reconexión funciona

---

## 6️⃣ Push Notifications

### Test de Permisos

**Consola**:
```javascript
await notificationService.requestPermission();
```

**Verificaciones**:
- [ ] Aparece prompt del navegador
- [ ] Opciones: "Permitir" / "Bloquear"
- [ ] Al permitir, se muestra notificación de bienvenida

### Test de Notificación Local

**Consola**:
```javascript
await notificationService.showNotification('Test', {
  body: 'Notificación de prueba',
  icon: '/assets/icons/icon-192x192.png'
});
```

**Verificaciones**:
- [ ] Notificación aparece
- [ ] Icono correcto
- [ ] Título y cuerpo correctos
- [ ] Vibración (en móvil)

### Test de Notificación de Pedido

**Consola**:
```javascript
await notificationService.notificarPedidoProcesado({
  numeroPedido: 'PED-TEST-001',
  totalFormateado: '$150.000'
});
```

**Verificaciones**:
- [ ] Notificación con número de pedido
- [ ] Botones de acción aparecen
- [ ] Click en "Ver detalles" navega correctamente

---

## 7️⃣ Performance Testing

### Lazy Loading

**Test**:
1. Abrir /pages/tienda.html
2. DevTools > Network
3. Filtrar por "Img"
4. Scroll lento hacia abajo

**Verificaciones**:
- [ ] Imágenes cargan solo al entrar en viewport
- [ ] No todas las imágenes cargan al inicio
- [ ] Scroll suave sin lag

### Cache Performance

**Test 1: Primera Visita**:
1. Clear cache
2. Recargar página
3. Network tab > Ver tiempos de carga

**Test 2: Visita Repetida**:
1. Recargar página
2. Verificar que recursos vienen de ServiceWorker

**Resultados**:
- [ ] Primera visita: < 3s
- [ ] Visita repetida: < 1s
- [ ] Recursos desde ServiceWorker: ✅

---

## 8️⃣ Mobile Testing (Opcional)

### Android Chrome

**Instalación**:
1. Abrir Chrome en Android
2. Navegar a la URL
3. Menú (⋮) > "Agregar a pantalla de inicio"
4. Verificar instalación

**Tests**:
- [ ] App instalada en launcher
- [ ] Icono correcto
- [ ] Abre en modo standalone
- [ ] Funciona offline (modo avión)
- [ ] Notificaciones funcionan

### iOS Safari

**Instalación**:
1. Abrir Safari en iOS
2. Botón Compartir
3. "Agregar a pantalla de inicio"

**Tests**:
- [ ] App instalada en home screen
- [ ] Icono correcto (apple-touch-icon)
- [ ] Abre en modo standalone
- [ ] Funciona offline

**Limitaciones iOS**:
- ⚠️ Push notifications NO soportadas
- ⚠️ Service Worker limitado
- ✅ Offline funciona
- ✅ Instalación funciona

---

## 9️⃣ Azure Functions Testing (Si están corriendo)

### Test procesarPedido

**Consola**:
```javascript
const resultado = await apiService.procesarPedido(
  [{ id: '1', cantidad: 2 }],
  { nombre: 'Test', email: 'test@example.com' }
);
console.log(resultado);
```

**Verificaciones**:
- [ ] Respuesta exitosa
- [ ] Número de pedido generado
- [ ] Total calculado correctamente
- [ ] Stock actualizado

### Test consultarStock

**Consola**:
```javascript
const stock = await apiService.consultarStock('1');
console.log(stock);
```

**Verificaciones**:
- [ ] Respuesta con disponibilidad
- [ ] Stock correcto
- [ ] Precio formateado

### Test analizarImagen

**Consola**:
```javascript
const resultado = await apiService.analizarImagen(
  'https://example.com/zapato.jpg'
);
console.log(resultado);
```

**Verificaciones**:
- [ ] Modo simulado funciona
- [ ] Categoría detectada
- [ ] Productos relacionados retornados

---

## 🔟 Accessibility Testing

### Keyboard Navigation

**Test**:
1. Usar solo teclado (Tab, Enter, Escape)
2. Navegar por toda la app

**Verificaciones**:
- [ ] Todos los botones accesibles
- [ ] Focus visible
- [ ] Enter activa botones
- [ ] Escape cierra modales

### Screen Reader (Opcional)

**Test con VoiceOver (Mac) o NVDA (Windows)**:
- [ ] Imágenes tienen alt text
- [ ] Botones tienen labels
- [ ] Navegación lógica

### Color Contrast

**Lighthouse ya lo verifica, pero manualmente**:
- [ ] Texto legible sobre fondos
- [ ] Botones con contraste suficiente

---

## 📊 Resumen de Resultados

### Scores Finales

| Test | Resultado | Notas |
|------|-----------|-------|
| Lighthouse Performance | ___/100 | |
| Lighthouse PWA | ___/100 | |
| Lighthouse Accessibility | ___/100 | |
| Service Worker | ✅ / ❌ | |
| Manifest | ✅ / ❌ | |
| Instalación Desktop | ✅ / ❌ | |
| Offline Mode | ✅ / ❌ | |
| Push Notifications | ✅ / ❌ | |
| Lazy Loading | ✅ / ❌ | |
| Azure Functions | ✅ / ❌ | |

### Issues Encontrados

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Próximos Pasos

- [ ] Optimizar según resultados de Lighthouse
- [ ] Corregir issues encontrados
- [ ] Re-testear
- [ ] Preparar para publicación

---

## 🚀 Listo para Publicar

**Criterios mínimos**:
- ✅ Lighthouse PWA: 100
- ✅ Lighthouse Performance: ≥ 80
- ✅ Funciona offline
- ✅ Instalable
- ✅ Sin errores críticos en consola

**Criterios ideales**:
- ✅ Lighthouse Performance: ≥ 90
- ✅ Lighthouse Accessibility: ≥ 90
- ✅ Testeado en dispositivos reales
- ✅ Push notifications funcionando
- ✅ Azure Functions operativas

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs en DevTools Console
2. Verificar Service Worker en Application tab
3. Limpiar caché y reintentar
4. Verificar que servidor está corriendo

**Comandos útiles**:
```javascript
// Limpiar todas las cachés
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Desregistrar Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Verificar estado
console.log('SW:', await navigator.serviceWorker.ready);
console.log('Cachés:', await caches.keys());
```

---

¡Buena suerte con el testing! 🎉
