// script_products.js - VERSIÓN CORREGIDA PARA IMÁGENES DE BD

// Product Class
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

// FUNCIONES MEJORADAS PARA MANEJO DE IMÁGENES
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

// jss/script_products.js - VERSIÓN CON GOOGLE DRIVE FIX

// FUNCIÓN MEJORADA PARA ENCONTRAR IMÁGENES
function encontrarImagen(item) {
    console.log('🔍 Buscando imagen en:', item);
    
    const camposImagen = ['image_url', 'imagen_url', 'imagen', 'url_imagen', 'foto', 'image', 'Imagen'];
    
    for (let campo of camposImagen) {
        if (item[campo] && typeof item[campo] === 'string' && item[campo].trim().length > 0) {
            const imagenUrl = item[campo].trim();
            console.log(`✅ Imagen encontrada en campo "${campo}":`, imagenUrl);
            
            return procesarUrlImagen(imagenUrl);
        }
    }
    
    console.log('❌ No se encontró imagen, usando placeholder');
    return obtenerPlaceholderPorCategoria(encontrarCategoria(item));
}

// FUNCIÓN MEJORADA PARA PROCESAR URLS (CON GOOGLE DRIVE)
function procesarUrlImagen(url) {
    console.log('🔄 Procesando URL:', url);
    
    // CASO 1: Google Drive link - CONVERTIR a URL directa
    if (url.includes('drive.google.com')) {
        const driveUrl = convertirGoogleDriveADirecto(url);
        console.log('📁 Google Drive convertido:', driveUrl);
        return driveUrl;
    }
    
    // CASO 2: Ya es URL completa (http://...)
    if (url.startsWith('http')) {
        console.log('🌐 URL completa, usando directamente');
        return url;
    }
    
    // CASO 3: Es imagen en base64 (data:image...)
    if (url.startsWith('data:')) {
        console.log('📸 Imagen base64, usando directamente');
        return url;
    }
    
    // CASO 4: Ruta absoluta (/uploads/imagen.jpg)
    if (url.startsWith('/')) {
        const urlCompleta = `http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com${url}`;
        console.log('📁 Ruta absoluta, construyendo URL:', urlCompleta);
        return urlCompleta;
    }
    
    // CASO 5: Ruta relativa (productos/leche.jpg)
    if (!url.startsWith('../') && !url.startsWith('./')) {
        const urlCompleta = `http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com/uploads/${url}`;
        console.log('📂 Ruta relativa, construyendo URL:', urlCompleta);
        return urlCompleta;
    }
    
    // CASO 6: Ruta local (../images/producto.jpg)
    console.log('🏠 Ruta local, usando directamente');
    return url;
}

// NUEVA FUNCIÓN: Convertir Google Drive a URL directa
function convertirGoogleDriveADirecto(driveUrl) {
    try {
        console.log('🔄 Convirtiendo Google Drive URL:', driveUrl);
        
        // Extraer el file ID de la URL
        const match = driveUrl.match(/\/d\/([^\/]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
            
            console.log('✅ Google Drive convertido:', {
                original: driveUrl,
                fileId: fileId,
                directUrl: directUrl
            });
            
            return directUrl;
        }
        
        // Si no se puede extraer el ID, devolver placeholder
        console.warn('❌ No se pudo extraer fileId de Google Drive URL');
        return obtenerPlaceholderPorCategoria('General');
        
    } catch (error) {
        console.error('❌ Error convirtiendo Google Drive URL:', error);
        return obtenerPlaceholderPorCategoria('General');
    }
}
// FUNCIÓN PARA OBTENER PLACEHOLDER POR CATEGORÍA
function obtenerPlaceholderPorCategoria(categoria) {
    const categoriaLower = categoria.toLowerCase();
    
    const placeholders = {
        'frutas': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'vegetales': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'lácteos': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'huevos': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'carnes': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'mariscos': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'limpieza': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        'cuidado personal': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    };
    
    for (const [key, placeholder] of Object.entries(placeholders)) {
        if (categoriaLower.includes(key)) {
            return placeholder;
        }
    }
    
    return 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
}

// FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN
function manejarErrorImagen(imgElement, productName) {
    console.warn(`❌ Error cargando imagen para: ${productName}`, imgElement.src);
    
    // Intentar con placeholder genérico
    imgElement.src = 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
    imgElement.alt = `Imagen no disponible para ${productName}`;
    
    // Forzar recarga
    setTimeout(() => {
        imgElement.style.display = 'none';
        setTimeout(() => {
            imgElement.style.display = 'block';
        }, 100);
    }, 500);
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

// Cargar productos desde la base de datos - VERSIÓN MEJORADA
async function cargarProductosDesdeBD() {
    try {
        console.log('🔄 Cargando productos desde la base de datos...');
        
        const productosData = await window.api.productos.listar();
        
        console.log('🎯 RESPUESTA CRUDA DE LA API:', productosData);
        
        let productosArray = productosData;
        
        if (!Array.isArray(productosData)) {
            console.warn('⚠️ La respuesta no es un array, convirtiendo...');
            if (productosData && typeof productosData === 'object') {
                const arrayKeys = Object.keys(productosData).filter(key => 
                    Array.isArray(productosData[key])
                );
                if (arrayKeys.length > 0) {
                    productosArray = productosData[arrayKeys[0]];
                } else {
                    productosArray = [productosData];
                }
            }
        }
        
        console.log('🔍 Procesando', productosArray.length, 'productos...');
        
        productosGlobal = productosArray.map((item, index) => {
            console.log(`📊 Producto ${index}:`, item);
            
            // Convertir ID a número para compatibilidad con el backend
            // El backend usa 'producto_id' según la documentación
            const idRaw = item.producto_id || item.Id_producto || item.id_producto || item.ID || item.id;
            const id = idRaw ? parseInt(idRaw, 10) : null;
            if (!id || isNaN(id)) {
                console.warn('Producto sin ID válido, omitiendo:', item);
                return null; // Retornar null para filtrar después
            }
            
            // Buscar nombre del producto
            let nombre = item.nombre_producto || item.nombre || item.name || `Producto ${index + 1}`;
            
            // Si no se encontró nombre en campos comunes, buscar en otros campos
            if (nombre === `Producto ${index + 1}`) {
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
            }
            
            const precio = encontrarPrecio(item);
            const categoria = encontrarCategoria(item);
            const imagen = encontrarImagen(item);
            const stock = item.stock || item.Stock || 0;
            
            console.log('✅ Producto extraído:', { 
                id, 
                nombre, 
                precio, 
                categoria,
                imagen,
                stock
            });
            
            return new Producto(
                id,
                nombre,
                precio,
                categoria,
                imagen,
                false,
                null,
                stock
            );
        }).filter(producto => producto !== null); // Filtrar productos nulos
        
        console.log('🎉 Productos cargados exitosamente:', productosGlobal);
        
        productosOfertaGlobal = productosGlobal.filter(producto => producto.oferta);
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos. Usando datos de ejemplo.', 'error');
        usarDatosEjemplo();
    }
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
async function agregarAlCarritoDesdePrincipal(productoId) {
    // Verificar autenticación antes de continuar
    try {
        const isAuth = window.authManager && window.authManager.checkAuthentication();
        if (!isAuth) {
            if (typeof window.mostrarAuthModal === 'function') {
                window.mostrarAuthModal();
            }
            mostrarNotificacion('Necesitas iniciar sesión para agregar productos', 'error');
            return;
        }
    } catch (e) {
        console.warn('⚠️ No se pudo verificar autenticación:', e);
        mostrarNotificacion('Error de autenticación. Intenta iniciar sesión.', 'error');
        if (typeof window.mostrarAuthModal === 'function') {
            window.mostrarAuthModal();
        }
        return;
    }

    // Convertir productoId a número para comparación
    const productoIdNum = typeof productoId === 'number' ? productoId : parseInt(productoId, 10);
    
    // Buscar producto (comparar como números)
    let producto = productosGlobal.find(p => {
        const pId = typeof p.id === 'number' ? p.id : parseInt(p.id, 10);
        return pId === productoIdNum;
    });
    
    if (!producto) {
        producto = productosOfertaGlobal.find(p => {
            const pId = typeof p.id === 'number' ? p.id : parseInt(p.id, 10);
            return pId === productoIdNum;
        });
    }
    
    if (!producto) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }

    if (producto.stock === 0) {
        mostrarNotificacion(`${producto.nombre} is out of stock!`, 'error');
        return;
    }

    try {
        // Obtener o crear venta_id (carrito en backend)
        const user = window.authManager.getUser();
        if (!user || !user.id) {
            mostrarNotificacion('Error: Usuario no válido', 'error');
            return;
        }

        // Obtener o crear venta_id
        const ventaId = await getOrCreateVentaId();
        if (!ventaId) {
            mostrarNotificacion('Error al crear/obtener carrito', 'error');
            return;
        }

        // Verificar si el producto ya está en el carrito local
        const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": []}');
        const itemExistente = carritoActual.items.find(item => {
            const itemId = typeof item.producto.id === 'number' ? item.producto.id : parseInt(item.producto.id, 10);
            return itemId === productoIdNum;
        });
        
        let cantidadAAgregar = 1;
        if (itemExistente) {
            // Si ya existe, incrementar cantidad
            cantidadAAgregar = itemExistente.cantidad + 1;
            if (cantidadAAgregar > producto.stock) {
                mostrarNotificacion(`Cannot add more ${producto.nombre}. Only ${producto.stock} available.`, 'error');
                return;
            }
        }

        // Agregar producto al backend
        const respuesta = await window.api.ventas.agregarProducto({
            venta_id: ventaId,
            producto_id: productoIdNum,
            cantidad: cantidadAAgregar
        });

        if (!respuesta || !respuesta.success) {
            const mensaje = respuesta?.message || 'Error al agregar producto al carrito';
            mostrarNotificacion(mensaje, 'error');
            return;
        }

        // Si el producto ya existía, actualizar cantidad; si no, agregarlo
        if (itemExistente) {
            itemExistente.cantidad = cantidadAAgregar;
            itemExistente.subtotal = producto.precio * cantidadAAgregar;
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
        
        // Si existe la función del carrito, actualizar también ahí
        if (typeof window.carrito !== 'undefined' && window.carrito.agregar) {
            window.carrito.agregar(producto, 1);
        }
        
        mostrarNotificacion(`${producto.nombre} agregado al carrito!`);
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        mostrarNotificacion('Error al agregar producto: ' + (error.message || 'Error desconocido'), 'error');
    }
}

// Función auxiliar para obtener o crear venta_id
async function getOrCreateVentaId() {
    const user = window.authManager.getUser();
    if (!user || !user.id) {
        console.error('❌ Usuario no válido o sin ID:', user);
        mostrarNotificacion('Error: Usuario no válido. Por favor, inicia sesión nuevamente.', 'error');
        return null;
    }

    // Asegurar que el ID sea un número
    const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
    if (isNaN(userId)) {
        console.error('❌ ID de usuario inválido:', user.id);
        mostrarNotificacion('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.', 'error');
        return null;
    }

    // Validar que el ID no sea un hash generado (los hashes son muy grandes)
    // Los usuario_id reales de la BD suelen ser números pequeños (1, 2, 3, etc.)
    // Si el ID es mayor a 1000000, probablemente es un hash generado
    if (userId > 1000000) {
        console.error('❌ ID parece ser un hash generado, no un usuario_id real:', userId);
        mostrarNotificacion('Error: Tu sesión no es válida. Por favor, cierra sesión e inicia sesión nuevamente usando tu teléfono y contraseña.', 'error');
        // Opcional: forzar logout
        setTimeout(() => {
            if (confirm('Tu sesión no es válida. ¿Deseas cerrar sesión e iniciar sesión nuevamente?')) {
                window.authManager.logout();
            }
        }, 1000);
        return null;
    }

    console.log('🔑 Usando usuario_id:', userId);

    const key = `venta_id_user_${userId}`;
    let ventaId = localStorage.getItem(key);
    
    if (ventaId) {
        const ventaIdNum = parseInt(ventaId, 10);
        console.log('✅ Carrito existente encontrado, venta_id:', ventaIdNum);
        return ventaIdNum;
    }

    try {
        console.log('🛒 Creando nuevo carrito para usuario_id:', userId);
        const respuesta = await window.api.ventas.crear({
            comprador_id: userId,
            vendedor_id: userId
        });

        console.log('📡 Respuesta del backend:', respuesta);

        if (respuesta && respuesta.success && respuesta.venta_id) {
            localStorage.setItem(key, String(respuesta.venta_id));
            console.log('✅ Carrito creado exitosamente, venta_id:', respuesta.venta_id);
            return respuesta.venta_id;
        } else {
            console.error('❌ Error creando carrito:', respuesta);
            const mensaje = respuesta?.message || respuesta?.error || 'Error desconocido al crear carrito';
            
            // Si el error es de clave foránea, el usuario no existe en la BD
            if (mensaje.includes('foreign key constraint') || mensaje.includes('1452')) {
                mostrarNotificacion('Error: Tu usuario no está registrado en el sistema. Por favor, regístrate primero.', 'error');
                setTimeout(() => {
                    if (confirm('Tu usuario no está registrado. ¿Deseas ir a la página de registro?')) {
                        window.location.href = 'signup.html';
                    }
                }, 1000);
            } else {
                alert('Error al crear carrito: ' + mensaje);
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error API crear carrito:', error);
        mostrarNotificacion('Error al conectar con el servidor: ' + (error.message || 'Error desconocido'), 'error');
        return null;
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

// Hacer funciones globales
window.manejarErrorImagen = manejarErrorImagen;
window.agregarAlCarritoDesdePrincipal = agregarAlCarritoDesdePrincipal;

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