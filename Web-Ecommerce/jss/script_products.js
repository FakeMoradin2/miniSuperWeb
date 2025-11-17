// script_products.js

// Product Class
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

// Sample Products Data
const productos = [
    new Producto('1', 'Fresh Apples', 'Crisp and sweet red apples', 2.99, 'Fruits & Vegetables', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('2', 'Organic Milk', 'Fresh organic whole milk', 3.49, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('3', 'Whole Wheat Bread', 'Freshly baked whole wheat bread', 2.29, 'Groceries', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('4', 'Chicken Breast', 'Boneless skinless chicken breast', 8.99, 'Meat & Seafood', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('5', 'Laundry Detergent', 'Concentrated laundry detergent', 5.99, 'Home Cleaning', 'https://images.unsplash.com/photo-1584305574647-469b2283f6d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('6', 'Toothpaste', 'Fluoride toothpaste for cavity protection', 3.79, 'Personal Care', 'https://images.unsplash.com/photo-1559599076-9c61d8ed1f89?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('7', 'Orange Juice', '100% pure orange juice', 4.49, 'Groceries', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('8', 'Greek Yogurt', 'Creamy Greek yogurt', 1.99, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('9', 'Bananas', 'Fresh yellow bananas', 1.49, 'Fruits & Vegetables', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('10', 'Salmon Fillet', 'Fresh Atlantic salmon fillet', 12.99, 'Meat & Seafood', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('11', 'Dish Soap', 'Lemon scented dish soap', 2.49, 'Home Cleaning', 'https://images.unsplash.com/photo-1584305574647-469b2283f6d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'),
    new Producto('12', 'Shampoo', 'Moisturizing shampoo for all hair types', 6.99, 'Personal Care', 'https://images.unsplash.com/photo-1556228578-8c89e6d6a6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')
];

// Special Offers
const productosOferta = [
    new Producto('13', 'Premium Coffee', 'Dark roast whole bean coffee', 9.99, 'Groceries', 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, 12.99),
    new Producto('14', 'Organic Eggs', 'Farm fresh organic eggs', 4.99, 'Dairy & Eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, 6.49),
    new Producto('15', 'Avocados', 'Fresh Hass avocados', 3.99, 'Fruits & Vegetables', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', true, 5.49)
];

// Global State
let categoriaActual = 'All Products';
let busquedaActual = '';

// Sorting Algorithms
function quickSortProductos(productosArray, izquierda = 0, derecha = productosArray.length - 1) {
    if (izquierda < derecha) {
        const indicePivote = particionarProductos(productosArray, izquierda, derecha);
        quickSortProductos(productosArray, izquierda, indicePivote - 1);
        quickSortProductos(productosArray, indicePivote + 1, derecha);
    }
    return productosArray;
}

function particionarProductos(productosArray, izquierda, derecha) {
    const pivote = productosArray[derecha].nombre.toLowerCase();
    let i = izquierda - 1;
    
    for (let j = izquierda; j < derecha; j++) {
        if (productosArray[j].nombre.toLowerCase() <= pivote) {
            i++;
            [productosArray[i], productosArray[j]] = [productosArray[j], productosArray[i]];
        }
    }
    
    [productosArray[i + 1], productosArray[derecha]] = [productosArray[derecha], productosArray[i + 1]];
    return i + 1;
}

function bubbleSortProductos(productosArray) {
    const n = productosArray.length;
    let intercambiado;
    
    do {
        intercambiado = false;
        for (let i = 0; i < n - 1; i++) {
            if (productosArray[i].nombre.toLowerCase() > productosArray[i + 1].nombre.toLowerCase()) {
                [productosArray[i], productosArray[i + 1]] = [productosArray[i + 1], productosArray[i]];
                intercambiado = true;
            }
        }
    } while (intercambiado);
    
    return productosArray;
}

function ordenarProductos(productosArray, metodo = 'quicksort') {
    const productosCopia = [...productosArray];
    
    switch (metodo.toLowerCase()) {
        case 'quicksort':
            return quickSortProductos(productosCopia);
        case 'bubblesort':
            return bubbleSortProductos(productosCopia);
        case 'nativo':
            return productosCopia.sort((a, b) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase()));
        default:
            return quickSortProductos(productosCopia);
    }
}

function ordenarProductosAlfabeticamente(orden = 'asc') {
    if (!paginacionActual) return;
    
    let productosParaOrdenar;
    
    if (categoriaActual === 'All Products') {
        productosParaOrdenar = [...productos];
    } else if (categoriaActual === 'Daily Deals') {
        productosParaOrdenar = [...productosOferta];
    } else {
        productosParaOrdenar = productos.filter(producto => producto.categoria === categoriaActual);
    }
    
    const productosOrdenados = ordenarProductos(productosParaOrdenar, 'quicksort');
    
    if (orden === 'desc') {
        productosOrdenados.reverse();
    }
    
    inicializarPaginacion(productosOrdenados, 8);
    cambiarPagina(1);
    
    const ordenTexto = orden === 'asc' ? 'ascendente (A-Z)' : 'descendente (Z-A)';
    mostrarNotificacion(`Productos ordenados alfabéticamente en orden ${ordenTexto}`);
}

// Product Rendering
function renderizarProductos(containerId, productosArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productosArray.map(producto => {
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

// Category Management
function cambiarCategoriaConPaginacion(categoria) {
    let productosFiltrados;
    
    if (categoria === 'All Products') {
        productosFiltrados = productos;
    } else if (categoria === 'Daily Deals') {
        productosFiltrados = productosOferta;
    } else {
        productosFiltrados = productos.filter(producto => producto.categoria === categoria);
    }
    
    categoriaActual = categoria;
    
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
        
        const activeFilters = document.getElementById('activeFilters');
        if (activeFilters) {
            activeFilters.style.display = 'none';
        }
    }
    
    inicializarPaginacion(productosFiltrados, 8);
    cambiarPagina(1);
}

// Search Functionality
function buscarProductosConPaginacion(termino) {
    if (!termino) {
        cambiarCategoriaConPaginacion('All Products');
        return;
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion.toLowerCase().includes(terminoLower) ||
        producto.categoria.toLowerCase().includes(terminoLower)
    );

    categoriaActual = 'All Products';
    
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = `Search Results for "${termino}"`;
    }
    
    inicializarPaginacion(productosFiltrados, 8);
    cambiarPagina(1);
}

// Cart Integration
function agregarAlCarritoDesdePrincipal(productoId) {
    let producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        producto = productosOferta.find(p => p.id === productoId);
    }
    
    if (producto) {
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
        
        carritoActual.total = carritoActual.items.reduce((sum, item) => sum + item.subtotal, 0);
        carritoActual.contadorItems = carritoActual.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        localStorage.setItem('carrito', JSON.stringify(carritoActual));
        
        mostrarNotificacion(`${producto.nombre} added to cart!`);
        
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = carritoActual.contadorItems;
        }
    }
}

// Notification System
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

// Hybrid Search System
function configurarBusquedaHibrida() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const categoryLinks = document.querySelectorAll('.category-link');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchForm && searchInput && searchContainer) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termino = searchInput.value.trim();
            ocultarSugerencias();
            if (termino) {
                realizarBusquedaHibrida(termino, categoriaActual);
            } else {
                cambiarCategoriaConPaginacion(categoriaActual);
            }
        });
        
        let timeoutId;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            const termino = this.value.trim();
            busquedaActual = termino;
            
            if (termino.length >= 2) {
                mostrarSugerencias(termino);
                searchContainer.classList.add('search-active');
            } else {
                ocultarSugerencias();
                searchContainer.classList.remove('search-active');
                
                if (termino.length === 0) {
                    limpiarBusqueda();
                }
            }
            
            timeoutId = setTimeout(() => {
                if (termino.length >= 3 || termino.length === 0) {
                    if (termino.length === 0) {
                        limpiarBusqueda();
                    } else {
                        realizarBusquedaHibrida(termino, categoriaActual);
                    }
                }
            }, 300);
        });
        
        document.addEventListener('click', function(e) {
            if (!searchContainer.contains(e.target)) {
                ocultarSugerencias();
                searchContainer.classList.remove('search-active');
            }
        });
    }
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.getAttribute('data-category');
            
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const searchTerm = document.querySelector('.search-input').value.trim();
            if (searchTerm) {
                realizarBusquedaHibrida(searchTerm, categoria);
            } else {
                cambiarCategoriaConPaginacion(categoria);
            }
        });
    });
}

function realizarBusquedaHibrida(termino, categoria) {
    let productosFiltrados;
    
    mostrarEstadoCarga();
    
    setTimeout(() => {
        if (categoria === 'All Products') {
            productosFiltrados = [...productos];
        } else if (categoria === 'Daily Deals') {
            productosFiltrados = [...productosOferta];
        } else {
            productosFiltrados = productos.filter(producto => producto.categoria === categoria);
        }
        
        if (termino) {
            const terminoLower = termino.toLowerCase();
            productosFiltrados = productosFiltrados.filter(producto => 
                producto.nombre.toLowerCase().includes(terminoLower) ||
                producto.descripcion.toLowerCase().includes(terminoLower) ||
                producto.categoria.toLowerCase().includes(terminoLower)
            );
        }
        
        const sectionTitle = document.querySelector('.featured-products .section-title');
        if (sectionTitle) {
            if (termino && categoria !== 'All Products') {
                sectionTitle.textContent = `Results for "${termino}" in ${categoria}`;
            } else if (termino) {
                sectionTitle.textContent = `Results for "${termino}"`;
            } else {
                if (categoria === 'Daily Deals') {
                    sectionTitle.textContent = 'Daily Deals';
                } else if (categoria === 'All Products') {
                    sectionTitle.textContent = 'All Products';
                } else {
                    sectionTitle.textContent = categoria;
                }
            }
        }
        
        if (termino) {
            mostrarInformacionResultados(termino, categoria, productosFiltrados.length);
            mostrarFiltrosActivos(termino, categoria);
        } else {
            const resultsInfo = document.getElementById('searchResultsInfo');
            if (resultsInfo) {
                resultsInfo.style.display = 'none';
            }
            const activeFilters = document.getElementById('activeFilters');
            if (activeFilters) {
                activeFilters.style.display = 'none';
            }
        }
        
        inicializarPaginacion(productosFiltrados, 8);
        cambiarPagina(1);
        
        if (termino) {
            const resultadosTexto = productosFiltrados.length === 1 ? 'result' : 'results';
            mostrarNotificacion(`Found ${productosFiltrados.length} ${resultadosTexto} for "${termino}"`);
        }
        
        ocultarEstadoCarga();
    }, 500);
}

function mostrarInformacionResultados(termino, categoria, cantidad) {
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (!resultsInfo) return;
    
    if (termino) {
        let infoText = '';
        
        if (termino && categoria !== 'All Products') {
            infoText = `Showing ${cantidad} results for "${termino}" in ${categoria}`;
        } else if (termino) {
            infoText = `Showing ${cantidad} results for "${termino}"`;
        }
        
        resultsInfo.innerHTML = `
            ${infoText}
            <button class="clear-search-btn" onclick="limpiarBusqueda()">
                Clear Search
            </button>
        `;
        resultsInfo.style.display = 'block';
    } else {
        resultsInfo.style.display = 'none';
    }
}

function mostrarFiltrosActivos(termino, categoria) {
    const activeFilters = document.getElementById('activeFilters');
    if (!activeFilters) return;
    
    activeFilters.innerHTML = '';
    
    if (termino || categoria !== 'All Products') {
        if (termino) {
            activeFilters.innerHTML += `
                <div class="filter-badge">
                    Search: "${termino}"
                    <button class="remove-filter" onclick="removerFiltroBusqueda()">×</button>
                </div>
            `;
        }
        
        if (categoria !== 'All Products') {
            activeFilters.innerHTML += `
                <div class="filter-badge">
                    Category: ${categoria}
                    <button class="remove-filter" onclick="removerFiltroCategoria()">×</button>
                </div>
            `;
        }
        
        activeFilters.style.display = 'flex';
    } else {
        activeFilters.style.display = 'none';
    }
}

function removerFiltroBusqueda() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        busquedaActual = '';
    }
    
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        resultsInfo.style.display = 'none';
    }
    
    mostrarFiltrosActivos('', categoriaActual);
    cambiarCategoriaConPaginacion(categoriaActual);
}

function removerFiltroCategoria() {
    const allProductsLink = document.querySelector('.category-link[data-category="All Products"]');
    if (allProductsLink) {
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        allProductsLink.classList.add('active');
        categoriaActual = 'All Products';
    }
    
    mostrarFiltrosActivos(busquedaActual, 'All Products');
    
    if (busquedaActual) {
        realizarBusquedaHibrida(busquedaActual, 'All Products');
    } else {
        cambiarCategoriaConPaginacion('All Products');
    }
}

function limpiarBusqueda() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        busquedaActual = '';
    }
    
    const allProductsLink = document.querySelector('.category-link[data-category="All Products"]');
    if (allProductsLink) {
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        allProductsLink.classList.add('active');
        categoriaActual = 'All Products';
    }
    
    const resultsInfo = document.getElementById('searchResultsInfo');
    if (resultsInfo) {
        resultsInfo.style.display = 'none';
    }
    
    const activeFilters = document.getElementById('activeFilters');
    if (activeFilters) {
        activeFilters.style.display = 'none';
    }
    
    const sectionTitle = document.querySelector('.featured-products .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = 'All Products';
    }
    
    const sortSelect = document.getElementById('sortOrder');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    ocultarSugerencias();
    
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.classList.remove('search-active');
    }
    
    cambiarCategoriaConPaginacion('All Products');
}

function mostrarSugerencias(termino) {
    const sugerencias = obtenerSugerenciasBusqueda(termino);
    const searchContainer = document.querySelector('.search-container');
    
    ocultarSugerencias();
    
    if (sugerencias.length > 0) {
        const suggestionsHTML = `
            <div class="search-suggestions">
                ${sugerencias.map(sug => `
                    <div class="suggestion-item" onclick="seleccionarSugerencia('${sug.replace(/'/g, "\\'")}')">
                        ${resaltarCoincidencia(sug, termino)}
                    </div>
                `).join('')}
            </div>
        `;
        
        searchContainer.insertAdjacentHTML('beforeend', suggestionsHTML);
    }
}

function ocultarSugerencias() {
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
}

function seleccionarSugerencia(sugerencia) {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = sugerencia;
        realizarBusquedaHibrida(sugerencia, categoriaActual);
        ocultarSugerencias();
    }
}

function resaltarCoincidencia(texto, termino) {
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.replace(regex, '<strong>$1</strong>');
}

function obtenerSugerenciasBusqueda(termino) {
    const terminoLower = termino.toLowerCase();
    const sugerencias = new Set();
    
    productos.forEach(producto => {
        if (producto.nombre.toLowerCase().includes(terminoLower)) {
            sugerencias.add(producto.nombre);
        }
    });
    
    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
    categoriasUnicas.forEach(categoria => {
        if (categoria.toLowerCase().includes(terminoLower)) {
            sugerencias.add(categoria);
        }
    });
    
    return Array.from(sugerencias).slice(0, 5);
}

function mostrarEstadoCarga() {
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.classList.add('search-loading');
        searchButton.disabled = true;
    }
}

function ocultarEstadoCarga() {
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.classList.remove('search-loading');
        searchButton.disabled = false;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    const specialOffersSection = document.querySelector('.special-offers');
    if (specialOffersSection) {
        specialOffersSection.style.display = 'none';
    }
    
    inicializarPaginacion(productos, 8);
    cambiarPagina(1);
    
    const carritoActual = JSON.parse(localStorage.getItem('carrito') || '{"items": [], "contadorItems": 0}');
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = carritoActual.contadorItems || 0;
    }
    
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.textContent;
            
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            cambiarCategoriaConPaginacion(categoria);
        });
    });
    
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const termino = searchInput.value.trim();
            if (termino) {
                document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
                document.querySelector('.category-link').classList.add('active');
                
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
    
    const sortSelect = document.getElementById('sortOrder');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const orden = this.value;
            
            if (orden === 'default') {
                if (categoriaActual === 'All Products') {
                    cambiarCategoriaConPaginacion('All Products');
                } else if (categoriaActual === 'Daily Deals') {
                    cambiarCategoriaConPaginacion('Daily Deals');
                } else {
                    cambiarCategoriaConPaginacion(categoriaActual);
                }
            } else {
                ordenarProductosAlfabeticamente(orden);
            }
        });
    }
    
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
    
    configurarBusquedaHibrida();
});