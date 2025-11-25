# Azure Functions - Tienda Sportsls

Backend serverless para procesamiento de pedidos y búsqueda visual con AI.

## 📋 Funciones Disponibles

### 1. procesarPedido
**Endpoint**: `POST /api/pedidos`

Procesa pedidos del carrito con validación de stock.

**Request**:
```json
{
  "items": [
    {
      "id": "1",
      "cantidad": 2
    }
  ],
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+57 316 234 2312",
    "direccion": "Calle 134 53-23"
  }
}
```

**Response**:
```json
{
  "success": true,
  "numeroPedido": "PED-20231125-0001",
  "fecha": "2023-11-25T17:30:00.000Z",
  "cliente": { ... },
  "items": [ ... ],
  "total": 160000,
  "totalFormateado": "$160.000",
  "mensaje": "¡Pedido procesado exitosamente!"
}
```

---

### 2. consultarStock
**Endpoint**: `GET /api/stock/{productId}`

Consulta disponibilidad de productos.

**Request**: `GET /api/stock/1`

**Response**:
```json
{
  "success": true,
  "productId": "1",
  "nombre": "Camiseta Atletismo Mujer",
  "disponible": true,
  "stock": 25,
  "estadoStock": "disponible",
  "precio": 80000,
  "precioFormateado": "$80.000"
}
```

**Consultar todo el stock**: `GET /api/stock`

---

### 3. analizarImagen (Opcional - AI Vision)
**Endpoint**: `POST /api/vision/analyze`

Analiza imágenes para búsqueda visual de productos.

**Request**:
```json
{
  "imageUrl": "https://example.com/zapato.jpg"
}
```

O con imagen base64:
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "success": true,
  "modo": "azure_vision",
  "categoria": "calzado",
  "descripcion": "Zapatos deportivos negros",
  "tags": ["shoe", "sports", "black"],
  "confianza": 0.95,
  "productosRelacionados": [
    {
      "id": "13",
      "nombre": "Guayos de futbol Adidas",
      "precio": 250000
    }
  ]
}
```

---

## 🚀 Desarrollo Local

### Prerequisitos

1. **Node.js** v18 o superior
2. **Azure Functions Core Tools**:
   ```bash
   npm install -g azure-functions-core-tools@4
   ```

### Instalación

1. Instalar dependencias:
   ```bash
   cd api
   npm install
   ```

2. Configurar variables de entorno en `local.settings.json`:
   ```json
   {
     "Values": {
       "VISION_ENDPOINT": "https://your-vision.cognitiveservices.azure.com/",
       "VISION_KEY": "your-api-key-here"
     }
   }
   ```

   > **Nota**: Si no configuras Azure Vision, la función `analizarImagen` funcionará en modo simulado.

### Ejecutar Localmente

1. Iniciar Azure Functions:
   ```bash
   cd api
   func start
   ```

   Las funciones estarán disponibles en:
   - http://localhost:7071/api/pedidos
   - http://localhost:7071/api/stock
   - http://localhost:7071/api/vision/analyze

2. En otra terminal, iniciar el frontend:
   ```bash
   cd ..
   python3 -m http.server 8000
   ```

3. Abrir http://localhost:8000

---

## 🧪 Testing

### Test procesarPedido

```bash
curl -X POST http://localhost:7071/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "1", "cantidad": 2}],
    "cliente": {"nombre": "Test", "email": "test@example.com"}
  }'
```

### Test consultarStock

```bash
# Producto específico
curl http://localhost:7071/api/stock/1

# Todo el stock
curl http://localhost:7071/api/stock
```

### Test analizarImagen

```bash
curl -X POST http://localhost:7071/api/vision/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/zapato.jpg"}'
```

---

## 📦 Despliegue

Las Azure Functions se despliegan automáticamente con Azure Static Web Apps cuando haces push a GitHub.

### Configurar Variables de Entorno en Azure

1. Azure Portal > Static Web Apps > tu app
2. Settings > Configuration
3. Agregar:
   - `VISION_ENDPOINT`: tu endpoint de Computer Vision
   - `VISION_KEY`: tu API key

---

## 🔒 Seguridad

- ✅ API Keys nunca se exponen al frontend
- ✅ CORS configurado para tu dominio
- ✅ Validación de datos en todas las funciones
- ✅ Manejo de errores robusto

---

## 💡 Notas

- **Stock**: Actualmente simulado en memoria. En producción, conectar a base de datos.
- **AI Vision**: Modo simulado si no hay credenciales configuradas.
- **CORS**: Configurado para `*` en desarrollo. Restringir en producción.

---

## 📚 Recursos

- [Azure Functions Docs](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Computer Vision](https://docs.microsoft.com/azure/cognitive-services/computer-vision/)
- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)
