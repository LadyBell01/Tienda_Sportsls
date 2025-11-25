// Azure Function: analizarImagen
// Proxy para Azure Computer Vision API - Búsqueda visual de productos

const axios = require('axios');

// Catálogo de productos por categoría
const catalogoPorCategoria = {
    'calzado': [
        { id: '13', nombre: 'Guayos de futbol Adidas', precio: 250000, imagen: '/img/tiendaimg13.jpg' },
        { id: '11', nombre: 'Pelota de tenis Wilson', precio: 65000, imagen: '/img/tiendaimg11.jpg' }
    ],
    'ropa_deportiva': [
        { id: '1', nombre: 'Camiseta Atletismo Mujer', precio: 80000, imagen: '/img/tiendaimg1.jpg' },
        { id: '2', nombre: 'Falda y Camiseta Tenis', precio: 120000, imagen: '/img/tiendaimg2.jpg' },
        { id: '3', nombre: 'Licra Atletismo', precio: 110000, imagen: '/img/tiendaimg5.jpg' }
    ],
    'accesorios': [
        { id: '14', nombre: 'Raqueta de tenis azul', precio: 350000, imagen: '/img/tiendaimg14.jpg' },
        { id: '7', nombre: 'Balón de baloncesto', precio: 99000, imagen: '/img/tiendaimg7.jpg' }
    ],
    'ciclismo': [
        { id: '8', nombre: 'Maillot de ciclismo hombre', precio: 340000, imagen: '/img/tiendaimg8.jpg' },
        { id: '4', nombre: 'Uniforme Ciclismo Morado', precio: 98000, imagen: '/img/tiendaimg24.jpg' }
    ]
};

module.exports = async function (context, req) {
    context.log('🔍 Analizando imagen con AI Vision...');

    try {
        // Validar request
        if (!req.body || (!req.body.imageUrl && !req.body.imageData)) {
            context.res = {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: false,
                    error: 'Se requiere imageUrl o imageData'
                }
            };
            return;
        }

        const { imageUrl, imageData } = req.body;

        // Obtener credenciales de Azure Computer Vision desde variables de entorno
        const visionEndpoint = process.env.VISION_ENDPOINT;
        const visionKey = process.env.VISION_KEY;

        // Modo simulado si no hay credenciales configuradas
        if (!visionEndpoint || !visionKey || visionEndpoint.includes('your-vision')) {
            context.log('⚠️ Modo simulado - No hay credenciales de Azure Vision configuradas');

            // Retornar resultados simulados
            const categoriaSimulada = 'ropa_deportiva';
            const productosRelacionados = catalogoPorCategoria[categoriaSimulada] || [];

            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: true,
                    modo: 'simulado',
                    categoria: categoriaSimulada,
                    subcategoria: 'ropa deportiva',
                    confianza: 0.85,
                    tags: ['deportes', 'ropa', 'atletismo'],
                    productosRelacionados: productosRelacionados.slice(0, 5),
                    mensaje: 'Resultados simulados - Configura VISION_ENDPOINT y VISION_KEY para usar Azure Computer Vision'
                }
            };
            return;
        }

        // Llamar a Azure Computer Vision API
        const analyzeUrl = `${visionEndpoint}/vision/v3.2/analyze?visualFeatures=Categories,Tags,Description,Objects&language=es`;

        let visionResponse;

        if (imageUrl) {
            // Analizar imagen por URL
            visionResponse = await axios.post(
                analyzeUrl,
                { url: imageUrl },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': visionKey,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            // Analizar imagen por datos base64
            const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
            visionResponse = await axios.post(
                analyzeUrl,
                imageBuffer,
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': visionKey,
                        'Content-Type': 'application/octet-stream'
                    }
                }
            );
        }

        const visionData = visionResponse.data;

        // Procesar respuesta de Computer Vision
        const tags = visionData.tags?.map(tag => tag.name) || [];
        const description = visionData.description?.captions?.[0]?.text || '';
        const categories = visionData.categories || [];

        // Determinar categoría de producto basada en tags y descripción
        let categoriaDetectada = 'ropa_deportiva'; // Default

        if (tags.some(tag => tag.includes('shoe') || tag.includes('zapato') || tag.includes('calzado'))) {
            categoriaDetectada = 'calzado';
        } else if (tags.some(tag => tag.includes('bike') || tag.includes('ciclismo') || tag.includes('cycling'))) {
            categoriaDetectada = 'ciclismo';
        } else if (tags.some(tag => tag.includes('ball') || tag.includes('pelota') || tag.includes('raqueta'))) {
            categoriaDetectada = 'accesorios';
        }

        // Obtener productos relacionados
        const productosRelacionados = catalogoPorCategoria[categoriaDetectada] || [];

        const respuesta = {
            success: true,
            modo: 'azure_vision',
            categoria: categoriaDetectada,
            descripcion: description,
            tags: tags.slice(0, 10),
            confianza: visionData.description?.captions?.[0]?.confidence || 0,
            productosRelacionados: productosRelacionados.slice(0, 5),
            mensaje: `Encontramos ${productosRelacionados.length} productos relacionados`
        };

        context.log(`✅ Categoría detectada: ${categoriaDetectada}`);
        context.log(`📦 Productos relacionados: ${productosRelacionados.length}`);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: respuesta
        };

    } catch (error) {
        context.log.error('❌ Error analizando imagen:', error.message);

        // Si falla Azure Vision, retornar modo simulado
        if (error.response?.status === 401 || error.response?.status === 403) {
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    success: true,
                    modo: 'simulado',
                    categoria: 'ropa_deportiva',
                    confianza: 0.75,
                    productosRelacionados: catalogoPorCategoria['ropa_deportiva'].slice(0, 5),
                    mensaje: 'Error de autenticación con Azure Vision - Usando modo simulado'
                }
            };
            return;
        }

        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: false,
                error: 'Error al analizar la imagen',
                detalles: error.message
            }
        };
    }
};
