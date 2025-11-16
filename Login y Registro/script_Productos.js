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
        'Groceries',
        'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-2',
        'Black Beans',
        'High-quality black beans, 500g. Perfect for traditional dishes.',
        22.00,
        'Groceries',
        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-3',
        'Extra Virgin Olive Oil',
        'Extra virgin olive oil, 500ml. Perfect for salads and cooking.',
        85.00,
        'Groceries',
        'https://images.unsplash.com/photo-1531386450457-90dd0c7d99c1?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-4',
        'Whole Wheat Pasta',
        'Whole wheat pasta, 400g. Good source of fiber and protein.',
        18.50,
        'Groceries',
        'https://images.unsplash.com/photo-1551462147-37885a3ac0c9?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-5',
        'Tuna in Water',
        'Tuna in water, 140g. High in protein and low in fat.',
        15.75,
        'Groceries',
        'https://images.unsplash.com/photo-1589923186741-b013b447c3c3?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'abarrotes-6',
        'Ground Coffee',
        '100% Arabica ground coffee, 250g. Rich aroma and flavor.',
        65.00,
        'Groceries',
        'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400&h=300&fit=crop',
        false
    ),

    // Lácteos y Huevos
    new Producto(
        'lacteos-1',
        'Whole Milk',
        'Pasteurized whole milk, 1L. Source of calcium and vitamins.',
        25.50,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-2',
        'Panela Cheese',
        'Fresh panela cheese, 400g. Great for quesadillas and snacks.',
        48.00,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1566305977571-5666677c6e98?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-3',
        'Natural Yogurt',
        'Unsweetened natural yogurt, 1kg. Rich in probiotics.',
        32.00,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1570194065650-d99fb4bed8fd?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-4',
        'White Eggs',
        'Grade A white eggs, 18pcs. Fresh and nutritious.',
        45.00,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-5',
        'Unsalted Butter',
        'Unsalted butter, 200g. Ideal for cooking and baking.',
        28.50,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'lacteos-6',
        'Heavy Cream',
        'Heavy cream, 250ml. Perfect for desserts and coffee.',
        35.00,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        false
    ),

    // Frutas y Verduras
    new Producto(
        'frutas-1',
        'Red Apples',
        'Fresh red apples, 1kg. Sweet and crisp.',
        32.00,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-2',
        'Ripe Bananas',
        'Ripe bananas, 1kg. Perfect for smoothies or eating as is.',
        18.50,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-3',
        'Fresh Carrots',
        'Fresh carrots, 1kg. Ideal for salads and stews.',
        15.00,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-4',
        'Salad Tomatoes',
        'Fresh salad tomatoes, 1kg. Perfect for sauces and salads.',
        22.00,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1546470427-e212b7d3106a?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-5',
        'Hass Avocados',
        'Ripe Hass avocados, 1kg. Creamy and delicious.',
        65.00,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'frutas-6',
        'Limes',
        'Juicy green limes, 1kg. Great for drinks and dressings.',
        20.00,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1587496679742-bad502958f4f?w=400&h=300&fit=crop',
        false
    ),

    // Carnes y Pescados
    new Producto(
        'carnes-1',
        'Chicken Breast',
        'Boneless chicken breast, 1kg. Fresh and high quality.',
        120.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-2',
        'Ground Beef',
        'Ground beef, 1kg. Great for burgers and tacos.',
        150.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1602472918622-3910b0c94d13?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-3',
        'Fresh Salmon',
        'Fresh salmon fillet, 500g. Rich in omega-3.',
        180.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-4',
        'Pork Chops',
        'Pork chops, 1kg. Juicy and perfect for grilling.',
        95.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1604503468406-b3c7d37c708d?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-5',
        'Large Shrimp',
        'Large peeled shrimp, 500g. Fresh and delicious.',
        220.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1587334941619-24f6ce7e8030?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'carnes-6',
        'Beef Steak',
        'Premium beef steak, 500g. Tender and juicy.',
        250.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop',
        false
    ),

    // Limpieza del Hogar
    new Producto(
        'limpieza-1',
        'Liquid Detergent',
        'Liquid laundry detergent, 3L. Removes tough stains.',
        85.00,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-2',
        'Dish Soap',
        'Liquid dish soap, 1L. Effectively removes grease.',
        32.50,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-3',
        'Multi-purpose Disinfectant',
        'Multi-purpose disinfectant, 1L. Kills 99.9% of bacteria.',
        45.00,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1585435557343-3b092031d5ad?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-4',
        'Toilet Paper',
        'Soft toilet paper, 12 rolls. Double-ply for extra comfort.',
        65.00,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1584555130103-b8d0084d8d8f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-5',
        'Paper Towels',
        'Absorbent paper towels, 2 rolls. Ideal for kitchen use.',
        42.00,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1628088062854-d1877bd35821?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'limpieza-6',
        'Glass Cleaner',
        'Glass cleaner, 500ml. Leaves surfaces streak-free.',
        28.00,
        'Home Cleaning',
        'https://images.unsplash.com/photo-1611251432626-1c17f1d7d6c6?w=400&h=300&fit=crop',
        false
    ),

    // Cuidado Personal
    new Producto(
        'cuidado-1',
        'Moisturizing Shampoo',
        'Moisturizing shampoo for all hair types, 400ml.',
        75.00,
        'Personal Care',
        'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-2',
        'Oat Soap',
        'Oat soap for sensitive skin, 3 bars. Gentle and nourishing.',
        35.00,
        'Personal Care',
        'https://images.unsplash.com/photo-1600857062244-5c0071b61b8a?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-3',
        'Toothpaste',
        'Fluoride toothpaste, 100ml. Protects against cavities.',
        28.50,
        'Personal Care',
        'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-4',
        'Stick Deodorant',
        '48h protection stick deodorant, 50g.',
        45.00,
        'Personal Care',
        'https://images.unsplash.com/photo-1617991677377-4fd0f81741c2?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-5',
        'Body Lotion',
        'Moisturizing body lotion, 400ml. Keeps skin soft all day.',
        65.00,
        'Personal Care',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
        false
    ),
    new Producto(
        'cuidado-6',
        'Toothbrush',
        'Soft-bristle toothbrush, 2 pack.',
        25.00,
        'Personal Care',
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
        'Groceries',
        'https://images.unsplash.com/photo-1531386450457-90dd0c7d99c1?w=400&h=300&fit=crop',
        true,
        85.00
    ),
    new Producto(
        'oferta-2',
        'Natural Yogurt',
        'Unsweetened natural yogurt, 1kg. Limited time promotion.',
        25.60,
        'Dairy & Eggs',
        'https://images.unsplash.com/photo-1570194065650-d99fb4bed8fd?w=400&h=300&fit=crop',
        true,
        32.00
    ),
    new Producto(
        'oferta-3',
        'Red Apples',
        'Fresh red apples, 1kg. Seasonal offer.',
        25.60,
        'Fruits & Vegetables',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
        true,
        32.00
    ),
    new Producto(
        'oferta-4',
        'Chicken Breast',
        'Boneless chicken breast, 1kg. Special offer.',
        96.00,
        'Meat & Seafood',
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        true,
        120.00
    )
];

// Variables globales para el estado del filtrado
let categoriaActual = 'All Products';
let busquedaActual = '';

// Función para renderizar productos en una sección
function renderizarProductos(containerId, productosArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productosArray.map(producto => {
        // Determinar si estamos en Daily Deals
        const isDailyDeals = categoriaActual === 'Daily Deals';
        const buttonText = isDailyDeals ? 'Grab Offer' : (producto.oferta ? 'Grab Offer' : 'Add to Cart');
        const buttonClass = isDailyDeals || producto.oferta ? 'add-to-cart-btn daily-deals-btn' : 'add-to-cart-btn';
        
        return `
        <div class="product-card">
            <div class="product-image">
                ${producto.oferta ? '<div class="offer-badge">Special Offer</div>' : ''}
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
                <button class="${buttonClass}" onclick="agregarAlCarritoDesdePrincipal('${producto.id}')">
                    ${buttonText}
                </button>
            </div>
        </div>
    `}).join('');
}

// Función para obtener productos destacados (para compatibilidad)
function obtenerProductosDestacados() {
    return productos;
}

// Función para renderizar ofertas (para compatibilidad)
function renderizarOfertas(containerId, productosArray) {
    renderizarProductos(containerId, productosArray);
}

// Función para manejar cambios de categoría con paginación
function cambiarCategoriaConPaginacion(categoria, productosArray) {
    let productosFiltrados;
    
    if (categoria === 'All Products') {
        productosFiltrados = productosArray;
    } else if (categoria === 'Daily Deals') {
        productosFiltrados = productosOferta;
    } else {
        productosFiltrados = productosArray.filter(producto => producto.categoria === categoria);
    }
    
    // Actualizar categoría actual para el renderizado
    categoriaActual = categoria;
    
    // Actualizar título de la sección
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        if (categoria === 'Daily Deals') {
            sectionTitle.textContent = 'Daily Deals';
        } else if (categoria === 'All Products') {
            sectionTitle.textContent = 'All Products';
        } else {
            sectionTitle.textContent = categoria;
        }
    }
    
    // Reinicializar paginación con 8 productos por página
    inicializarPaginacion(productosFiltrados, 8);
    cambiarPagina(1);
}

// Función para manejar búsqueda con paginación
function buscarProductosConPaginacion(termino, productosArray) {
    if (!termino) {
        cambiarCategoriaConPaginacion('All Products', productosArray);
        return;
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productosArray.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion.toLowerCase().includes(terminoLower) ||
        producto.categoria.toLowerCase().includes(terminoLower)
    );

    // Actualizar categoría actual para el renderizado
    categoriaActual = 'All Products';
    
    // Actualizar título de la sección
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = `Search Results for "${termino}"`;
    }
    
    // Reinicializar paginación con 8 productos por página
    inicializarPaginacion(productosFiltrados, 8);
    cambiarPagina(1);
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
            
            // Show notification
            mostrarNotificacion(`${producto.nombre} added to cart!`);
            
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
    // Ocultar sección de ofertas especiales
    const specialOffersSection = document.querySelector('.special-offers');
    if (specialOffersSection) {
        specialOffersSection.style.display = 'none';
    }
    
    // Inicializar con todos los productos y paginación de 8
    inicializarPaginacion(productos, 8);
    cambiarPagina(1);
    
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
            
            // Actualizar clases activas
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Cambiar categoría con paginación
            cambiarCategoriaConPaginacion(categoria, productos);
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
                // Cambiar a "All Products" y buscar
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                document.querySelector('.category-link').classList.add('active'); // Primera categoría (All Products)
                
                buscarProductosConPaginacion(termino, productos);
            }
        });
        
        // Búsqueda en tiempo real (opcional)
        searchInput.addEventListener('input', function() {
            const termino = this.value.trim();
            if (termino.length >= 3 || termino.length === 0) {
                if (termino.length === 0) {
                    // Si se borra la búsqueda, volver a todos los productos
                    cambiarCategoriaConPaginacion('All Products', productos);
                } else {
                    buscarProductosConPaginacion(termino, productos);
                }
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