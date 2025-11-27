// script_products.js - VERSIÓN SIN DESCRIPCIÓN Y CON FILTRO CORREGIDO

// Product Class (sin descripción)
class Producto {
    constructor(id, nombre, precio, categoria, imagen, oferta = false, precioOriginal = null, stock = 0) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
        this.oferta = oferta;
        this.precioOriginal = precioOriginal;
        this.stock = stock;
    }
}

// Global State
let categoriaActual = 'All Products';
let busquedaActual = '';
let productosGlobal = [];
let productosOfertaGlobal = [];
let categoriasGlobal = [];

// Funciones auxiliares para encontrar datos
function encontrarPrecio(item) {
    const clavesPrecio = ['Precio_venta', 'precio_venta', 'Precio', 'precio', 'precio_publico', 'costo', 'valor'];
    for (let clave of clavesPrecio) {
        if (item[clave] !== undefined && item[clave] !== null) {
            const precio = parseFloat(item[clave]);
            if (!isNaN(precio)) return precio;
        }
    }
    return 9.99;
}

function encontrarCategoria(item) {
    const clavesCategoria = ['Nombre_Categoria', 'categoria_nombre', 'categoria', 'tipo', 'departamento', 'grupo'];
    for (let clave of clavesCategoria) {
        if (item[clave] && typeof item[clave] === 'string' && item[clave].trim().length > 0) {
            return item[clave];
        }
    }
    return 'General';
}

function encontrarImagen(item) {
    const clavesImagen = ['Imagen_url', 'imagen_url', 'imagen', 'url_imagen', 'foto', 'image'];
    for (let clave of clavesImagen) {
        if (item[clave] && typeof item[clave] === 'string' && item[clave].trim().length > 0) {
            return item[clave];
        }
    }
    const categoria = encontrarCategoria(item).toLowerCase();
    if (categoria.includes('fruta') || categoria.includes('vegetal')) {
        return 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
    } else if (categoria.includes('lácteo') || categoria.includes('leche') || categoria.includes('huevo')) {
        return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
    } else {
        return 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
    }
}

// Cargar categorías desde la base de datos
async function cargarCategoriasDesdeBD() {
    try {
        console.log('🔄 Cargando categorías desde la base de datos...');
        
        if (!window.api || !window.api.categorias) {
            throw new Error('API de categorías no disponible');
        }
        
        const categoriasData = await window.api.categorias.listar();
        
        console.log('📂 Categorías recibidas:', categoriasData);
        
        // Transformar categorías al formato necesario
        categoriasGlobal = categoriasData.map(categoria => {
            return {
                id: categoria.Id_categoria || categoria.id || categoria.ID || '',
                nombre: categoria.Nombre_Categoria || categoria.nombre || categoria.Nombre || 'Categoría sin nombre',
                activo: categoria.activo !== false && categoria.activo !== 0
            };
        }).filter(categoria => categoria.activo);
        
        console.log('✅ Categorías procesadas:', categoriasGlobal);
        
        renderizarCategorias();
        
    } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        mostrarNotificacion('Error al cargar categorías. Usando categorías por defecto.', 'error');
        usarCategoriasPorDefecto();
    }
}

// Función para usar categorías por defecto
function usarCategoriasPorDefecto() {
    console.log('🔄 Usando categorías por defecto...');
    categoriasGlobal = [
        { id: '1', nombre: 'Groceries', activo: true },
        { id: '2', nombre: 'Dairy & Eggs', activo: true },
        { id: '3', nombre: 'Fruits & Vegetables', activo: true },
        { id: '4', nombre: 'Meat & Seafood', activo: true },
        { id: '5', nombre: 'Home Cleaning', activo: true },
        { id: '6', nombre: 'Personal Care', activo: true }
    ];
    renderizarCategorias();
}

// Renderizar categorías en la interfaz
function renderizarCategorias() {
    const categoriesContainer = document.querySelector('.categories-container');
    if (!categoriesContainer) {
        console.error('❌ No se encontró el contenedor de categorías');
        return;
    }
    
    console.log('🎨 Renderizando categorías:', categoriasGlobal);
    
    let categoriasHTML = `
        <a href="#" class="category-link active" data-category="All Products">All Products</a>
        <a href="#" class="category-link" data-category="Daily Deals">Daily Deals</a>
    `;
    
    categoriasGlobal.forEach(categoria => {
        categoriasHTML += `
            <a href="#" class="category-link" data-category="${categoria.nombre}">
                ${categoria.nombre}
            </a>
        `;
    });
    
    categoriesContainer.innerHTML = categoriasHTML;
    
    configurarEventListenersCategorias();
    
    console.log('✅ Categorías renderizadas correctamente');
}

// Configurar event listeners para categorías
function configurarEventListenersCategorias() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.getAttribute('data-category');
            
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            cambiarCategoriaConPaginacion(categoria);
        });
    });
}

// Función para usar datos de ejemplo (productos)
function usarDatosEjemplo() {
    console.log('🔄 Usando datos de ejemplo...');
    productosGlobal = [
        new Producto('1', 'Manzanas Frescas', 2.99, 'Fruits & Vegetables', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', false, null, 15),
        new Producto('2', 'Leche Orgánica', 3.49, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', false, null, 8),
        new Producto('3', 'Pan Integral', 2.29, 'Groceries', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', false, null, 12),
        new Producto('4', 'Pechuga de Pollo', 8.99, 'Meat & Seafood', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', false, null, 6)
    ];
    
    productosOfertaGlobal = [
        new Producto('5', 'Café Premium', 9.99, 'Groceries', 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, 12.99, 5),
        new Producto('6', 'Huevos Orgánicos', 4.99, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, 6.49, 3)
    ];
}

// Cargar productos desde la base de datos
async function cargarProductosDesdeBD() {
    try {
        console.log('🔄 Cargando productos desde la base de datos...');
        
        const productosData = await window.api.productos.listar();
        
        console.log('🎯 RESPUESTA CRUDA DE LA API:', productosData);
        
        if (!Array.isArray(productosData)) {
            console.warn('⚠️ La respuesta no es un array, convirtiendo...');
            if (productosData && typeof productosData === 'object') {
                const arrayKeys = Object.keys(productosData).filter(key => 
                    Array.isArray(productosData[key])
                );
                if (arrayKeys.length > 0) {
                    productosData = productosData[arrayKeys[0]];
                } else {
                    productosData = [productosData];
                }
            }
        }
        
        console.log('🔍 Procesando', productosData.length, 'productos...');
        
        productosGlobal = productosData.map((item, index) => {
            console.log(`📊 Producto ${index}:`, item);
            
            let nombre = `Producto ${index + 1}`;
            const posiblesNombres = Object.entries(item)
                .filter(([key, value]) => 
                    typeof value === 'string' && 
                    value.length > 2 && 
                    value.length < 50 &&
                    !key.toLowerCase().includes('id') &&
                    !key.toLowerCase().includes('precio') &&
                    !key.toLowerCase().includes('imagen') &&
                    !key.toLowerCase().includes('descripcion') &&
                    !key.toLowerCase().includes('categoria') &&
                    !key.toLowerCase().includes('stock')
                )
                .map(([key, value]) => ({ key, value }));
            
            if (posiblesNombres.length > 0) {
                const nombrePreferido = posiblesNombres.find(p => 
                    p.key.toLowerCase().includes('nombre') || 
                    p.key.toLowerCase().includes('name')
                );
                nombre = nombrePreferido ? nombrePreferido.value : posiblesNombres[0].value;
            }
            
            const id = item.Id_producto?.toString() || 
                      item.id_producto?.toString() || 
                      item.ID?.toString() || 
                      item.id?.toString() || 
                      `prod-${Date.now()}-${index}`;
            
            const precio = encontrarPrecio(item);
            const categoria = encontrarCategoria(item);
            const imagen = encontrarImagen(item);
            
            console.log('✅ Extraído:', { 
                id, 
                nombre, 
                precio, 
                categoria
            });
            
            return new Producto(
                id,
                nombre,
                precio,
                categoria,
                imagen,
                false,
                null,
                10
            );
        });
        
        console.log('🎉 Productos cargados exitosamente:', productosGlobal);
        
        productosOfertaGlobal = productosGlobal.filter(producto => producto.oferta);
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos. Usando datos de ejemplo.', 'error');
        usarDatosEjemplo();
    }
}

// Función principal para cargar todos los datos
async function cargarTodosLosDatos() {
    try {
        console.log('🚀 Cargando todos los datos...');
        
        await Promise.all([
            cargarCategoriasDesdeBD(),
            cargarProductosDesdeBD()
        ]);
        
        console.log('✅ Todos los datos cargados exitosamente');
        console.log('📂 Categorías:', categoriasGlobal.length);
        console.log('📦 Productos:', productosGlobal.length);
        
        inicializarInterfaz();
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        usarCategoriasPorDefecto();
        usarDatosEjemplo();
        inicializarInterfaz();
    }
}

// Inicializar interfaz después de cargar productos y categorías
function inicializarInterfaz() {
    console.log('🎨 Inicializando interfaz...');
    console.log('📂 Categorías disponibles:', categoriasGlobal.length);
    console.log('📦 Productos disponibles:', productosGlobal.length);
    
    // Configurar productos por página
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        cargarProductosPorPaginaDesdeStorage();
        itemsPerPageSelect.value = obtenerProductosPorPagina();
        
        itemsPerPageSelect.addEventListener('change', function(e) {
            const nuevoValor = parseInt(e.target.value);
            actualizarProductosPorPagina(nuevoValor);
            cambiarPagina(1);
        });
    }
    
    // Inicializar paginación con todos los productos
    inicializarPaginacion(productosGlobal);
    cambiarPagina(1);
    
    // Configurar carrito
    actualizarContadorCarrito();
    
    // Configurar búsqueda
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termino = searchInput.value.trim();
            if (termino) {
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                const allProductsLink = document.querySelector('.category-link[data-category="All Products"]');
                if (allProductsLink) allProductsLink.classList.add('active');
                
                buscarProductosConPaginacion(termino);
            }
        });
        
        searchInput.addEventListener('input', function() {
            const termino = this.value.trim();
            if (termino.length >= 3 || termino.length === 0) {
                if (termino.length === 0) {
                    cambiarCategoriaConPaginacion('All Products');
                } else {
                    buscarProductosConPaginacion(termino);
                }
            }
        });
    }
    
    // Configurar ordenamiento
    const sortSelect = document.getElementById('sortOrder');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const orden = this.value;
            
            if (orden === 'default') {
                cambiarCategoriaConPaginacion(categoriaActual);
            } else {
                ordenarProductosAlfabeticamente(orden);
            }
        });
    }
    
    console.log('✅ Interfaz inicializada correctamente');
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": [], "contadorItems": 0}');
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = carritoActual.contadorItems || 0;
    }
}

// Sorting Algorithms
function ordenarProductosAlfabeticamente(orden = 'asc') {
    let productosParaOrdenar;
    
    if (categoriaActual === 'All Products') {
        productosParaOrdenar = [...productosGlobal];
    } else if (categoriaActual === 'Daily Deals') {
        productosParaOrdenar = [...productosOfertaGlobal];
    } else {
        // FILTRO CORREGIDO: Comparación exacta de categorías
        productosParaOrdenar = productosGlobal.filter(producto => 
            producto.categoria.trim().toLowerCase() === categoriaActual.trim().toLowerCase()
        );
    }
    
    const productosOrdenados = productosParaOrdenar.sort((a, b) => {
        return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    });
    
    if (orden === 'desc') {
        productosOrdenados.reverse();
    }
    
    inicializarPaginacion(productosOrdenados);
    cambiarPagina(1);
    
    const ordenTexto = orden === 'asc' ? 'ascendente (A-Z)' : 'descendente (Z-A)';
    mostrarNotificacion(`Productos ordenados alfabéticamente en orden ${ordenTexto}`);
}

// Category Management - CORREGIDO
function cambiarCategoriaConPaginacion(categoria) {
    let productosFiltrados = [];
    
    console.log(`🔄 Cambiando a categoría: "${categoria}"`);
    
    if (categoria === 'All Products') {
        productosFiltrados = productosGlobal;
    } else if (categoria === 'Daily Deals') {
        productosFiltrados = productosOfertaGlobal;
    } else {
        // FILTRO CORREGIDO: Comparación exacta y case-insensitive
        productosFiltrados = productosGlobal.filter(producto => {
            const coincide = producto.categoria.trim().toLowerCase() === categoria.trim().toLowerCase();
            console.log(`🔍 Producto: "${producto.nombre}" - Categoría: "${producto.categoria}" - Coincide: ${coincide}`);
            return coincide;
        });
    }
    
    categoriaActual = categoria;
    
    console.log(`📊 Productos encontrados en "${categoria}":`, productosFiltrados.length);
    
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
    
    if (!busquedaActual) {
        const resultsInfo = document.getElementById('searchResultsInfo');
        if (resultsInfo) {
            resultsInfo.style.display = 'none';
        }
    }
    
    // Mostrar mensaje si no hay productos
    if (productosFiltrados.length === 0 && categoria !== 'All Products') {
        mostrarMensajeSinProductos(categoria);
    } else {
        inicializarPaginacion(productosFiltrados);
        cambiarPagina(1);
    }
}

// Función para mostrar mensaje cuando no hay productos
function mostrarMensajeSinProductos(categoria) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = `
        <div class="no-products-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h3>No hay productos en esta categoría</h3>
            <p>No se encontraron productos en la categoría "${categoria}"</p>
            <button class="clear-search-btn" onclick="cambiarCategoriaConPaginacion('All Products')" style="margin-top: 1rem;">
                Ver Todos los Productos
            </button>
        </div>
    `;
    
    // Limpiar paginación
    const paginationContainer = document.getElementById('paginationContainer');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}

// Search Functionality
function buscarProductosConPaginacion(termino) {
    if (!termino) {
        cambiarCategoriaConPaginacion('All Products');
        return;
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productosGlobal.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.categoria.toLowerCase().includes(terminoLower)
    );

    categoriaActual = 'All Products';
    
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = `Search Results for "${termino}"`;
    }
    
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        resultsInfo.innerHTML = `
            Showing ${productosFiltrados.length} results for "${termino}"
            <button class="clear-search-btn" onclick="limpiarBusqueda()">Clear Search</button>
        `;
        resultsInfo.style.display = 'block';
    }
    
    inicializarPaginacion(productosFiltrados);
    cambiarPagina(1);
}

function limpiarBusqueda() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        busquedaActual = '';
    }
    
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        resultsInfo.style.display = 'none';
    }
    
    const allProductsLink = document.querySelector('.category-link[data-category="All Products"]');
    if (allProductsLink) {
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        allProductsLink.classList.add('active');
    }
    
    cambiarCategoriaConPaginacion('All Products');
}

// Cart Integration
function agregarAlCarritoDesdePrincipal(productoId) {
    let producto = productosGlobal.find(p => p.id === productoId);
    
    if (!producto) {
        producto = productosOfertaGlobal.find(p => p.id === productoId);
    }
    
    if (producto) {
        if (producto.stock === 0) {
            mostrarNotificacion(`${producto.nombre} is out of stock!`, 'error');
            return;
        }
        
        const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": []}');
        const itemExistente = carritoActual.items.find(item => item.producto.id === productoId);
        
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                mostrarNotificacion(`Cannot add more ${producto.nombre}. Only ${producto.stock} available.`, 'error');
                return;
            }
            itemExistente.cantidad += 1;
            itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
        } else {
            carritoActual.items.push({
                producto: producto,
                cantidad: 1,
                subtotal: producto.precio
            });
        }
        
        carritoActual.total = carritoActual.items.reduce((sum, item) => sum + item.subtotal, 0);
        carritoActual.contadorItems = carritoActual.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        localStorage.setItem('carrito', JSON.stringify(carritoActual));
        
        mostrarNotificacion(`${producto.nombre} added to cart!`);
        actualizarContadorCarrito();
    }
}

// Notification System
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    const backgroundColor = tipo === 'error' ? '#EF4444' : '#10B981';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    
    const specialOffersSection = document.querySelector('.special-offers');
    if (specialOffersSection) {
        specialOffersSection.style.display = 'none';
    }
    
    // Cargar todos los datos (categorías y productos)
    cargarTodosLosDatos();
});