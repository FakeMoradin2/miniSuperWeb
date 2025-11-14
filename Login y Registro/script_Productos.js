// script_Productos.js

// Clase para representar un producto
class Producto {
    constructor(id, nombre, descripcion, precio, categoria, imagen, oferta = false, precioOriginal = null) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
        this.oferta = oferta;
        this.precioOriginal = precioOriginal;
    }
}

// Base de datos de productos
const productos = [
    // Productos Abarrotes
    new Producto(
        'abarrotes-1',
        'Brown Rice',
        'Long-grain brown rice, 1kg. High in fiber and essential nutrients.',
        28.50,
        'Abarrotes',
        'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-2',
        'Black Beans',
        'High-quality black beans, 500g. Perfect for traditional dishes.',
        22.00,
        'Abarrotes',
        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-3',
        'Extra Virgin Olive Oil',
        'Extra virgin olive oil, 500ml. Perfect for salads and cooking.',
        85.00,
        'Abarrotes',
        'https://images.unsplash.com/photo-1531386450457-90dd0c7d99c1?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-4',
        'Whole Wheat Pasta',
        'Whole wheat pasta, 400g. Good source of fiber and protein.',
        18.50,
        'Abarrotes',
        'https://images.unsplash.com/photo-1551462147-37885a3ac0c9?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-5',
        'Tuna in Water',
        'Tuna in water, 140g. High in protein and low in fat.',
        15.75,
        'Abarrotes',
        'https://images.unsplash.com/photo-1589923186741-b013b447c3c3?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-6',
        'Ground Coffee',
        '100% Arabica ground coffee, 250g. Rich aroma and flavor.',
        65.00,
        'Abarrotes',
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=300&fit=crop',
        false
    ),

    // Lácteos y Huevos
    new Producto(
        'lacteos-1',
        'Whole Milk',
        'Pasteurized whole milk, 1L. Source of calcium and vitamins.',
        25.50,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-2',
        'Panela Cheese',
        'Fresh panela cheese, 400g. Great for quesadillas and snacks.',
        48.00,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1566305977571-5666677c6e98?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-3',
        'Natural Yogurt',
        'Unsweetened natural yogurt, 1kg. Rich in probiotics.',
        32.00,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1570194065650-d99fb4bed8fd?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-4',
        'White Eggs',
        'Grade A white eggs, 18pcs. Fresh and nutritious.',
        45.00,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-5',
        'Unsalted Butter',
        'Unsalted butter, 200g. Ideal for cooking and baking.',
        28.50,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-6',
        'Heavy Cream',
        'Heavy cream, 250ml. Perfect for desserts and coffee.',
        35.00,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        false
    ),

    // Frutas y Verduras
    new Producto(
        'frutas-1',
        'Red Apples',
        'Fresh red apples, 1kg. Sweet and crisp.',
        32.00,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-2',
        'Ripe Bananas',
        'Ripe bananas, 1kg. Perfect for smoothies or eating as is.',
        18.50,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-3',
        'Fresh Carrots',
        'Fresh carrots, 1kg. Ideal for salads and stews.',
        15.00,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-4',
        'Salad Tomatoes',
        'Fresh salad tomatoes, 1kg. Perfect for sauces and salads.',
        22.00,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1546470427-e212b7d3106a?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-5',
        'Hass Avocados',
        'Ripe Hass avocados, 1kg. Creamy and delicious.',
        65.00,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-6',
        'Limes',
        'Juicy green limes, 1kg. Great for drinks and dressings.',
        20.00,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1587496679742-bad502958f4f?w=400&h=300&fit=crop',
        false
    ),

    // Carnes y Pescados
    new Producto(
        'carnes-1',
        'Chicken Breast',
        'Boneless chicken breast, 1kg. Fresh and high quality.',
        120.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-2',
        'Ground Beef',
        'Ground beef, 1kg. Great for burgers and tacos.',
        150.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1602472918622-3910b0c94d13?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-3',
        'Fresh Salmon',
        'Fresh salmon fillet, 500g. Rich in omega-3.',
        180.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-4',
        'Pork Chops',
        'Pork chops, 1kg. Juicy and perfect for grilling.',
        95.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1604503468406-b3c7d37c708d?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-5',
        'Large Shrimp',
        'Large peeled shrimp, 500g. Fresh and delicious.',
        220.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1587334941619-24f6ce7e8030?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-6',
        'Beef Steak',
        'Premium beef steak, 500g. Tender and juicy.',
        250.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
        false
    ),

    // Limpieza del Hogar
    new Producto(
        'limpieza-1',
        'Liquid Detergent',
        'Liquid laundry detergent, 3L. Removes tough stains.',
        85.00,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-2',
        'Dish Soap',
        'Liquid dish soap, 1L. Effectively removes grease.',
        32.50,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-3',
        'Multi-purpose Disinfectant',
        'Multi-purpose disinfectant, 1L. Kills 99.9% of bacteria.',
        45.00,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-4',
        'Toilet Paper',
        'Soft toilet paper, 12 rolls. Double-ply for extra comfort.',
        65.00,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1584555130103-b8d0084d8d8f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-5',
        'Paper Towels',
        'Absorbent paper towels, 2 rolls. Ideal for kitchen use.',
        42.00,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1628088062854-d1877bd35821?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-6',
        'Glass Cleaner',
        'Glass cleaner, 500ml. Leaves surfaces streak-free.',
        28.00,
        'Limpieza del Hogar',
        'https://images.unsplash.com/photo-1611251432626-1c17f1d7d6c6?w=400&h=300&fit=crop',
        false
    ),

    // Cuidado Personal
    new Producto(
        'cuidado-1',
        'Moisturizing Shampoo',
        'Moisturizing shampoo for all hair types, 400ml.',
        75.00,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-2',
        'Oat Soap',
        'Oat soap for sensitive skin, 3 bars. Gentle and nourishing.',
        35.00,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-1600857062244-5c0071b61b8a?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-3',
        'Toothpaste',
        'Fluoride toothpaste, 100ml. Protects against cavities.',
        28.50,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-4',
        'Stick Deodorant',
        '48h protection stick deodorant, 50g.',
        45.00,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-1617991677377-4fd0f81741c2?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-5',
        'Body Lotion',
        'Moisturizing body lotion, 400ml. Keeps skin soft all day.',
        65.00,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-6',
        'Toothbrush',
        'Soft-bristle toothbrush, 2 pack.',
        25.00,
        'Cuidado Personal',
        'https://images.unsplash.com/photo-162179148c5-2a5ec2b39e72?w=400&h=300&fit=crop',
        false
    )
];

// Productos en oferta (para la sección de ofertas especiales)
const productosOferta = [
    new Producto(
        'oferta-1',
        'Extra Virgin Olive Oil',
        'Extra virgin olive oil, 500ml. Special offer of the day.',
        68.00,
        'Abarrotes',
        'https://images.unsplash.com/photo-1531386450457-90dd0c7d99c1?w=400&h=300&fit=crop',
        true,
        85.00
    ),
    new Producto(
        'oferta-2',
        'Natural Yogurt',
        'Unsweetened natural yogurt, 1kg. Limited time promotion.',
        25.60,
        'Lácteos y Huevos',
        'https://images.unsplash.com/photo-1570194065650-d99fb4bed8fd?w=400&h=300&fit=crop',
        true,
        32.00
    ),
    new Producto(
        'oferta-3',
        'Red Apples',
        'Fresh red apples, 1kg. Seasonal offer.',
        25.60,
        'Frutas y Verduras',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
        true,
        32.00
    ),
    new Producto(
        'oferta-4',
        'Chicken Breast',
        'Boneless chicken breast, 1kg. Special offer.',
        96.00,
        'Carnes y Pescados',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        true,
        120.00
    )
];

// Variables globales para el estado del filtrado
let productosFiltrados = [];
let categoriaActual = 'Todos los Productos';
let busquedaActual = '';

// Función para renderizar productos en una sección
function renderizarProductos(containerId, productosArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productosArray.map(producto => `
        <div class="product-card">
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNkZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPsOXIEltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-price">
                    ${producto.oferta ? 
                        `<span class="original-price">$${producto.precioOriginal.toFixed(2)}</span>
                         <span class="discount-price">$${producto.precio.toFixed(2)}</span>` 
                        : `$${producto.precio.toFixed(2)}`
                    }
                </div>
                <button class="add-to-cart-btn" onclick="agregarAlCarritoDesdePrincipal('${producto.id}')">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

// Función para renderizar ofertas especiales
function renderizarOfertas(containerId, ofertasArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ofertasArray.map(oferta => `
        <div class="offer-card">
            <div class="offer-badge">Oferta</div>
            <div class="offer-image">
                <img src="${oferta.imagen}" alt="${oferta.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNkZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPsOXIEltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="offer-info">
                <h3>${oferta.nombre}</h3>
                <p class="offer-description">${oferta.descripcion}</p>
                <div class="offer-price">
                    <span class="original-price">$${oferta.precioOriginal.toFixed(2)}</span>
                    <span class="discount-price">$${oferta.precio.toFixed(2)}</span>
                </div>
                <button class="offer-btn" onclick="agregarAlCarritoDesdePrincipal('${oferta.id}')">
                    Aprovechar Oferta
                </button>
            </div>
        </div>
    `).join('');
}

// Función para filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
    if (categoria === 'Todos los Productos') {
        return productos;
    }
    if (categoria === 'Ofertas del Día') {
        return productosOferta;
    }
    return productos.filter(producto => producto.categoria === categoria);
}

// Función para filtrar productos por búsqueda
function filtrarProductosPorBusqueda(termino) {
    if (!termino) return productosFiltrados;
    
    const terminoLower = termino.toLowerCase();
    return productosFiltrados.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion.toLowerCase().includes(terminoLower) ||
        producto.categoria.toLowerCase().includes(terminoLower)
    );
}

// Función principal para aplicar filtros
function aplicarFiltros() {
    let productosMostrar = filtrarProductosPorCategoria(categoriaActual);
    
    if (busquedaActual) {
        productosMostrar = filtrarProductosPorBusqueda(busquedaActual);
    }
    
    // Actualizar el título de la sección según el filtro
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        if (categoriaActual === 'Todos los Productos' && !busquedaActual) {
            sectionTitle.textContent = 'Productos Destacados';
        } else if (categoriaActual === 'Ofertas del Día') {
            sectionTitle.textContent = 'Ofertas del Día';
        } else if (busquedaActual) {
            sectionTitle.textContent = `Resultados para "${busquedaActual}" (${productosMostrar.length})`;
        } else {
            sectionTitle.textContent = categoriaActual;
        }
    }
    
    renderizarProductos('productsGrid', productosMostrar);
    
    // Mostrar u ocultar sección de ofertas según el filtro
    const specialOffersSection = document.querySelector('.special-offers');
    if (specialOffersSection) {
        if (categoriaActual === 'Todos los Productos' && !busquedaActual) {
            specialOffersSection.style.display = 'block';
        } else {
            specialOffersSection.style.display = 'none';
        }
    }
}

// Función para cambiar categoría
function cambiarCategoria(categoria) {
    // Actualizar estado
    categoriaActual = categoria;
    productosFiltrados = filtrarProductosPorCategoria(categoria);
    
    // Actualizar clases activas en los enlaces
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Encontrar y activar el enlace correspondiente
    const activeLink = Array.from(document.querySelectorAll('.category-link'))
        .find(link => link.textContent === categoria);
    
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Aplicar filtros
    aplicarFiltros();
    
    // Scroll suave a la sección de productos
    const productsSection = document.querySelector('.featured-products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Función para buscar productos
function buscarProductos(termino) {
    busquedaActual = termino;
    aplicarFiltros();
}

// Función para obtener productos destacados (mezcla de categorías)
function obtenerProductosDestacados() {
    // Seleccionar algunos productos de diferentes categorías
    const destacados = [];
    const categorias = ['Abarrotes', 'Lácteos y Huevos', 'Frutas y Verduras', 'Carnes y Pescados'];
    
    categorias.forEach(categoria => {
        const productosCategoria = productos.filter(p => p.categoria === categoria);
        if (productosCategoria.length > 0) {
            // Agregar 2 productos de cada categoría
            destacados.push(...productosCategoria.slice(0, 2));
        }
    });
    
    return destacados;
}

// Función para agregar al carrito desde la página principal
function agregarAlCarritoDesdePrincipal(productoId) {
    // Buscar el producto en productos normales
    let producto = productos.find(p => p.id === productoId);
    
    // Si no se encuentra, buscar en productos de oferta
    if (!producto) {
        producto = productosOferta.find(p => p.id === productoId);
    }
    
    if (producto) {
        // Verificar si el carrito está disponible (en la página del carrito)
        if (typeof agregarAlCarrito === 'function') {
            agregarAlCarrito(producto);
        } else {
            // Si estamos en la página principal, usar localStorage temporal
            const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": []}');
            const itemExistente = carritoActual.items.find(item => item.producto.id === productoId);
            
            if (itemExistente) {
                itemExistente.cantidad += 1;
                itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
            } else {
                carritoActual.items.push({
                    producto: producto,
                    cantidad: 1,
                    subtotal: producto.precio
                });
            }
            
            // Recalcular totales
            carritoActual.total = carritoActual.items.reduce((sum, item) => sum + item.subtotal, 0);
            carritoActual.contadorItems = carritoActual.items.reduce((sum, item) => sum + item.cantidad, 0);
            
            localStorage.setItem('carrito', JSON.stringify(carritoActual));
            
            // Mostrar notificación
            mostrarNotificacion(`¡${producto.nombre} agregado al carrito!`);
            
            // Actualizar contador en el navbar si existe
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = carritoActual.contadorItems;
            }
        }
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar estado
    productosFiltrados = obtenerProductosDestacados();
    
    // Renderizar productos destacados inicialmente
    renderizarProductos('productsGrid', productosFiltrados);
    
    // Renderizar ofertas especiales
    renderizarOfertas('offersGrid', productosOferta);
    
    // Actualizar contador del carrito en el navbar
    const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": [], "contadorItems": 0}');
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = carritoActual.contadorItems || 0;
    }
    
    // Configurar event listeners para las categorías
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.textContent;
            cambiarCategoria(categoria);
        });
    });
    
    // Configurar event listener para la búsqueda
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termino = searchInput.value.trim();
            if (termino) {
                cambiarCategoria('Todos los Productos');
                buscarProductos(termino);
            }
        });
        
        // Búsqueda en tiempo real (opcional)
        searchInput.addEventListener('input', function() {
            const termino = this.value.trim();
            if (termino.length >= 3 || termino.length === 0) {
                buscarProductos(termino);
            }
        });
    }
    
    // Agregar estilos para las animaciones de notificación
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}); 