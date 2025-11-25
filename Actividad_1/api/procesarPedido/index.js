// Azure Function: procesarPedido
// Procesa pedidos del carrito de compras con validación de stock

// Base de datos simulada de productos y stock
const stockDB = {
    '1': { nombre: 'Camiseta Atletismo Mujer', stock: 25, precio: 80000 },
    '2': { nombre: 'Falda y Camiseta Tenis', stock: 15, precio: 120000 },
    '3': { nombre: 'Licra Atletismo', stock: 30, precio: 110000 },
    '4': { nombre: 'Uniforme Ciclismo Morado', stock: 10, precio: 98000 },
    '5': { nombre: 'Conjunto Deportivo Azul', stock: 20, precio: 99000 },
    '6': { nombre: 'Conjunto Atletismo', stock: 18, precio: 125000 },
    '7': { nombre: 'Leggins Atletismo', stock: 40, precio: 75000 },
    '8': { nombre: 'Maillot Ciclismo Hombre', stock: 12, precio: 340000 },
    '9': { nombre: 'Uniforme Futbol', stock: 22, precio: 99000 },
    '10': { nombre: 'Uniforme Baloncesto', stock: 16, precio: 99000 }
};

module.exports = async function (context, req) {
    context.log('🛒 Procesando pedido...');

    try {
        // Validar que el request tenga el formato correcto
        if (!req.body || !req.body.items || !req.body.cliente) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'Datos incompletos. Se requiere items y cliente.'
                }
            };
            return;
        }

        const { items, cliente } = req.body;

        // Validar que haya items
        if (!Array.isArray(items) || items.length === 0) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'El carrito está vacío.'
                }
            };
            return;
        }

        // Validar datos del cliente
        if (!cliente.nombre || !cliente.email) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'Se requiere nombre y email del cliente.'
                }
            };
            return;
        }

        // Validar stock y calcular total
        let total = 0;
        const itemsValidados = [];
        const erroresStock = [];

        for (const item of items) {
            const { id, cantidad } = item;

            // Verificar si el producto existe
            if (!stockDB[id]) {
                erroresStock.push(`Producto ${id} no encontrado`);
                continue;
            }

            const producto = stockDB[id];

            // Verificar stock disponible
            if (producto.stock < cantidad) {
                erroresStock.push(
                    `${producto.nombre}: solo hay ${producto.stock} unidades disponibles (solicitadas: ${cantidad})`
                );
                continue;
            }

            // Calcular subtotal
            const subtotal = producto.precio * cantidad;
            total += subtotal;

            itemsValidados.push({
                id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad,
                subtotal
            });

            context.log(`✅ ${producto.nombre} x${cantidad} = $${subtotal.toLocaleString()}`);
        }

        // Si hay errores de stock, retornar error
        if (erroresStock.length > 0) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'Problemas con el stock',
                    detalles: erroresStock
                }
            };
            return;
        }

        // Generar número de pedido único
        const fecha = new Date();
        const numeroPedido = `PED-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

        // Simular actualización de stock (en producción, esto iría a una DB)
        for (const item of itemsValidados) {
            stockDB[item.id].stock -= item.cantidad;
            context.log(`📦 Stock actualizado: ${item.nombre} - Quedan ${stockDB[item.id].stock} unidades`);
        }

        // Respuesta exitosa
        const respuesta = {
            success: true,
            numeroPedido,
            fecha: fecha.toISOString(),
            cliente: {
                nombre: cliente.nombre,
                email: cliente.email
            },
            items: itemsValidados,
            total,
            totalFormateado: `$${total.toLocaleString('es-CO')}`,
            mensaje: '¡Pedido procesado exitosamente! Recibirás un email de confirmación.'
        };

        context.log(`🎉 Pedido ${numeroPedido} procesado - Total: $${total.toLocaleString()}`);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: respuesta
        };

    } catch (error) {
        context.log.error('❌ Error procesando pedido:', error);

        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: false,
                error: 'Error interno del servidor',
                mensaje: 'Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.'
            }
        };
    }
};
