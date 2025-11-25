// script_pages.js - Pagination System

// Arreglo de opciones para productos por página
const opcionesProductosPorPagina = [4, 8, 12, 16, 24];

// Variable para almacenar el valor seleccionado (por defecto 8)
let productosPorPaginaSeleccionado = 8;

let paginacionActual = null;
let productosActuales = [];

// Función para obtener el valor seleccionado del arreglo
function obtenerProductosPorPagina() {
    return productosPorPaginaSeleccionado;
}

// Función para actualizar el valor seleccionado
function actualizarProductosPorPagina(nuevoValor) {
    // Validar que el valor esté en el arreglo
    if (opcionesProductosPorPagina.includes(nuevoValor)) {
        productosPorPaginaSeleccionado = nuevoValor;
        // Guardar en localStorage para persistencia
        localStorage.setItem('productosPorPagina', nuevoValor.toString());
        
        // Si hay paginación activa, reinicializar con el nuevo valor
        if (paginacionActual && productosActuales.length > 0) {
            inicializarPaginacion(productosActuales, nuevoValor);
        }
    }
}

// Función para cargar el valor guardado desde localStorage
function cargarProductosPorPaginaDesdeStorage() {
    const valorGuardado = localStorage.getItem('productosPorPagina');
    if (valorGuardado && opcionesProductosPorPagina.includes(parseInt(valorGuardado))) {
        productosPorPaginaSeleccionado = parseInt(valorGuardado);
    }
}

// Pagination Initialization
function inicializarPaginacion(productos, productosPorPagina = null) {
    // Si no se proporciona productosPorPagina, usar el valor del arreglo
    const productosPorPaginaFinal = productosPorPagina || productosPorPaginaSeleccionado;
    productosActuales = productos;
    paginacionActual = {
        productos: productos,
        productosPorPagina: productosPorPaginaFinal,
        paginaActual: 1,
        totalPaginas: Math.ceil(productos.length / productosPorPaginaFinal)
    };
    
    cambiarPagina(1);
}

// Page Navigation
function cambiarPagina(numeroPagina) {
    if (!paginacionActual || numeroPagina < 1 || numeroPagina > paginacionActual.totalPaginas) {
        return;
    }
    
    paginacionActual.paginaActual = numeroPagina;
    
    const inicio = (numeroPagina - 1) * paginacionActual.productosPorPagina;
    const fin = inicio + paginacionActual.productosPorPagina;
    const productosPagina = paginacionActual.productos.slice(inicio, fin);
    
    renderizarProductosPagina(productosPagina);
    renderizarControlesPaginacion();
}

// Product Rendering for Pagination
function renderizarProductosPagina(productosPagina) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    if (productosPagina.length === 0) {
        mostrarMensajeSinProductos();
        return;
    }
    
    productosPagina.forEach(producto => {
        const productCard = crearProductCard(producto);
        productsGrid.appendChild(productCard);
    });
}

// Product Card Creation
function crearProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isDailyDeals = categoriaActual === 'Daily Deals';
    const buttonText = isDailyDeals ? 'Grab Offer' : (producto.oferta ? 'Grab Offer' : 'Add to Cart');
    const buttonClass = isDailyDeals || producto.oferta ? 'add-to-cart-btn daily-deals-btn' : 'add-to-cart-btn';
    
    card.innerHTML = `
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
    `;
    
    return card;
}

// No Products Message
function mostrarMensajeSinProductos() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = `
        <div class="no-results-message">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button class="clear-search-btn" onclick="limpiarBusqueda()">
                Clear Search & Filters
            </button>
        </div>
    `;
}

// Pagination Controls
function renderizarControlesPaginacion() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer || !paginacionActual) return;
    
    const { paginaActual, totalPaginas } = paginacionActual;
    
    if (totalPaginas <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <div class="pagination-info">
            Page ${paginaActual} of ${totalPaginas}
        </div>
        <div class="pagination">
    `;
    
    // Previous Button
    paginationHTML += `
        <button onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>
            Previous
        </button>
    `;
    
    // Page Numbers
    const paginasMostrar = generarNumerosPagina(paginaActual, totalPaginas);
    paginasMostrar.forEach(numero => {
        if (numero === '...') {
            paginationHTML += `<span>...</span>`;
        } else {
            paginationHTML += `
                <button 
                    onclick="cambiarPagina(${numero})" 
                    class="${numero === paginaActual ? 'active' : ''}"
                >
                    ${numero}
                </button>
            `;
        }
    });
    
    // Next Button
    paginationHTML += `
        <button onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>
            Next
        </button>
    `;
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Page Number Generation
function generarNumerosPagina(paginaActual, totalPaginas) {
    const paginas = [];
    const paginasALado = 2;
    
    paginas.push(1);
    
    let inicio = Math.max(2, paginaActual - paginasALado);
    let fin = Math.min(totalPaginas - 1, paginaActual + paginasALado);
    
    if (inicio > 2) {
        paginas.push('...');
    }
    
    for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
    }
    
    if (fin < totalPaginas - 1) {
        paginas.push('...');
    }
    
    if (totalPaginas > 1) {
        paginas.push(totalPaginas);
    }
    
    return paginas;
}

// Utility Function
function obtenerProductosActuales() {
    return productosActuales;
}