// API Service - Cliente para Azure Functions
// Maneja todas las llamadas al backend serverless

class APIService {
    constructor() {
        // Detectar entorno (local vs producción)
        this.baseURL = window.location.hostname === 'localhost'
            ? 'http://localhost:7071/api'  // Azure Functions local
            : '/api';  // Azure Static Web Apps en producción

        console.log('🔧 API Service inicializado:', this.baseURL);
    }

    /**
     * Procesar pedido del carrito
     * @param {Array} items - Items del carrito
     * @param {Object} cliente - Datos del cliente
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async procesarPedido(items, cliente) {
        try {
            console.log('🛒 Procesando pedido...', { items: items.length, cliente: cliente.nombre });

            const response = await fetch(`${this.baseURL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ items, cliente })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pedido');
            }

            console.log('✅ Pedido procesado:', data.numeroPedido);
            return data;

        } catch (error) {
            console.error('❌ Error procesando pedido:', error);
            throw error;
        }
    }

    /**
     * Consultar stock de un producto
     * @param {string} productId - ID del producto (opcional)
     * @returns {Promise<Object>} Información de stock
     */
    async consultarStock(productId = null) {
        try {
            const url = productId
                ? `${this.baseURL}/stock/${productId}`
                : `${this.baseURL}/stock`;

            console.log('📦 Consultando stock:', productId || 'todos');

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al consultar stock');
            }

            console.log('✅ Stock consultado:', data);
            return data;

        } catch (error) {
            console.error('❌ Error consultando stock:', error);
            throw error;
        }
    }

    /**
     * Analizar imagen con AI Vision
     * @param {string} imageUrl - URL de la imagen
     * @param {string} imageData - Datos base64 de la imagen
     * @returns {Promise<Object>} Resultados del análisis
     */
    async analizarImagen(imageUrl = null, imageData = null) {
        try {
            console.log('🔍 Analizando imagen con AI...');

            const response = await fetch(`${this.baseURL}/vision/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl, imageData })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al analizar la imagen');
            }

            console.log('✅ Imagen analizada:', data.categoria);
            return data;

        } catch (error) {
            console.error('❌ Error analizando imagen:', error);
            throw error;
        }
    }

    /**
     * Manejo genérico de errores
     * @param {Error} error - Error capturado
     * @returns {string} Mensaje de error amigable
     */
    getMensajeError(error) {
        if (error.message.includes('Failed to fetch')) {
            return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        if (error.message.includes('stock')) {
            return 'Algunos productos no tienen stock disponible.';
        }
        return error.message || 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
    }
}

// Exportar instancia global
const apiService = new APIService();

// Para uso en módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
