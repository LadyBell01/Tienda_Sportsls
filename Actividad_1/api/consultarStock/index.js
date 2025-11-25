// Azure Function: consultarStock
// Consulta disponibilidad de productos en tiempo real

// Base de datos simulada de productos y stock
const stockDB = {
    '1': { nombre: 'Camiseta Atletismo Mujer', stock: 25, precio: 80000, categoria: 'atletismo mujer' },
    '2': { nombre: 'Falda y Camiseta Tenis', stock: 15, precio: 120000, categoria: 'tenis mujer' },
    '3': { nombre: 'Licra Atletismo', stock: 30, precio: 110000, categoria: 'atletismo mujer' },
    '4': { nombre: 'Uniforme Ciclismo Morado', stock: 10, precio: 98000, categoria: 'ciclismo mujer' },
    '5': { nombre: 'Conjunto Deportivo Azul', stock: 20, precio: 99000, categoria: 'atletismo mujer' },
    '6': { nombre: 'Conjunto Atletismo', stock: 18, precio: 125000, categoria: 'atletismo mujer' },
    '7': { nombre: 'Leggins Atletismo', stock: 40, precio: 75000, categoria: 'atletismo mujer' },
    '8': { nombre: 'Maillot Ciclismo Hombre', stock: 12, precio: 340000, categoria: 'ciclismo hombre' },
    '9': { nombre: 'Uniforme Futbol', stock: 22, precio: 99000, categoria: 'futbol hombre' },
    '10': { nombre: 'Uniforme Baloncesto', stock: 16, precio: 99000, categoria: 'baloncesto hombre' }
};

module.exports = async function (context, req) {
    const productId = req.params.productId;

    context.log(`📦 Consultando stock para producto: ${productId || 'todos'}`);

    try {
        // Si no se especifica productId, retornar todo el stock
        if (!productId) {
            const todosLosProductos = Object.keys(stockDB).map(id => ({
                id,
                ...stockDB[id],
                disponible: stockDB[id].stock > 0,
                precioFormateado: `$${stockDB[id].precio.toLocaleString('es-CO')}`
            }));

            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: true,
                    productos: todosLosProductos,
                    total: todosLosProductos.length
                }
            };
            return;
        }

        // Consultar producto específico
        if (!stockDB[productId]) {
            context.res = {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'Producto no encontrado',
                    productId
                }
            };
            return;
        }

        const producto = stockDB[productId];
        const disponible = producto.stock > 0;

        // Determinar estado de stock
        let estadoStock = 'disponible';
        if (producto.stock === 0) {
            estadoStock = 'agotado';
        } else if (producto.stock < 5) {
            estadoStock = 'pocas_unidades';
        }

        const respuesta = {
            success: true,
            productId,
            nombre: producto.nombre,
            categoria: producto.categoria,
            disponible,
            stock: producto.stock,
            estadoStock,
            precio: producto.precio,
            precioFormateado: `$${producto.precio.toLocaleString('es-CO')}`,
            mensaje: disponible
                ? `${producto.stock} unidades disponibles`
                : 'Producto agotado'
        };

        context.log(`✅ Stock: ${producto.nombre} - ${producto.stock} unidades`);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: respuesta
        };

    } catch (error) {
        context.log.error('❌ Error consultando stock:', error);

        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: false,
                error: 'Error interno del servidor'
            }
        };
    }
};
