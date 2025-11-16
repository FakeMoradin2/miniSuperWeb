class Paginacion {
    constructor(productos, productosPorPagina = 12) {
        this.productos = productos;
        this.productosPorPagina = productosPorPagina;
        this.paginaActual = 1;
        this.totalPaginas = Math.ceil(productos.length / productosPorPagina);
    }

    getProductosPagina(pagina = this.paginaActual) {
        const inicio = (pagina - 1) * this.productosPorPagina;
        const fin = inicio + this.productosPorPagina;
        return this.productos.slice(inicio, fin);
    }

    irAPagina(pagina) {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
            return true;
        }
        return false;
    }

    paginaSiguiente() {
        return this.irAPagina(this.paginaActual + 1);
    }

    paginaAnterior() {
        return this.irAPagina(this.paginaActual - 1);
    }

    getInfoPagina() {
        const inicio = (this.paginaActual - 1) * this.productosPorPagina + 1;
        const fin = Math.min(this.paginaActual * this.productosPorPagina, this.productos.length);
        
        return {
            paginaActual: this.paginaActual,
            totalPaginas: this.totalPaginas,
            productosMostrados: fin - inicio + 1,
            productoInicio: inicio,
            productoFin: fin,
            totalProductos: this.productos.length
        };
    }

    generarNumerosPagina(maxBotones = 5) {
        const numeros = [];
        const mitad = Math.floor(maxBotones / 2);
        let inicio = Math.max(1, this.paginaActual - mitad);
        let fin = Math.min(this.totalPaginas, inicio + maxBotones - 1);

        // Ajustar si estamos cerca del final
        if (fin - inicio + 1 < maxBotones) {
            inicio = Math.max(1, fin - maxBotones + 1);
        }

        // Agregar primera página y elipsis si es necesario
        if (inicio > 1) {
            numeros.push(1);
            if (inicio > 2) {
                numeros.push('...');
            }
        }

        // Agregar números de página
        for (let i = inicio; i <= fin; i++) {
            numeros.push(i);
        }

        // Agregar última página y elipsis si es necesario
        if (fin < this.totalPaginas) {
            if (fin < this.totalPaginas - 1) {
                numeros.push('...');
            }
            numeros.push(this.totalPaginas);
        }

        return numeros;
    }
}

// Variables globales
let paginacionActual = null;

// Función para inicializar la paginación
function inicializarPaginacion(productos, productosPorPagina = 12) {
    paginacionActual = new Paginacion(productos, productosPorPagina);
    return paginacionActual;
}

// Función para renderizar la paginación
function renderizarPaginacion(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !paginacionActual) return;

    const info = paginacionActual.getInfoPagina();
    const numerosPagina = paginacionActual.generarNumerosPagina();

    container.innerHTML = `
        <div class="pagination">
            <button class="pagination-btn" onclick="cambiarPagina(${info.paginaActual - 1})" 
                ${info.paginaActual === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            
            <div class="pagination-numbers">
                ${numerosPagina.map(num => 
                    typeof num === 'number' 
                        ? `<button class="page-number ${num === info.paginaActual ? 'active' : ''}" 
                             onclick="cambiarPagina(${num})">${num}</button>`
                        : `<span class="page-number ellipsis">${num}</span>`
                ).join('')}
            </div>
            
            <button class="pagination-btn" onclick="cambiarPagina(${info.paginaActual + 1})" 
                ${info.paginaActual === info.totalPaginas ? 'disabled' : ''}>
                Next →
            </button>
            
            <div class="pagination-info">
                Showing ${info.productoInicio}-${info.productoFin} of ${info.totalProductos} products
            </div>
        </div>
        
        <div class="mobile-pagination-info" style="display: none;">
            Page ${info.paginaActual} of ${info.totalPaginas}
        </div>
    `;

    // Mostrar info móvil en pantallas pequeñas
    const mobileInfo = container.querySelector('.mobile-pagination-info');
    const paginationNumbers = container.querySelector('.pagination-numbers');
    
    if (window.innerWidth <= 480) {
        if (mobileInfo) mobileInfo.style.display = 'block';
        if (paginationNumbers) paginationNumbers.style.display = 'none';
    }
}

// Función para cambiar de página
function cambiarPagina(pagina) {
    if (!paginacionActual) return;

    const exito = paginacionActual.irAPagina(pagina);
    if (exito) {
        // Obtener productos de la página actual
        const productosPagina = paginacionActual.getProductosPagina();
        
        // Renderizar productos (esta función debe estar definida en tu script principal)
        if (typeof renderizarProductos === 'function') {
            renderizarProductos('productsGrid', productosPagina);
        }
        
        // Actualizar la paginación
        renderizarPaginacion('paginationContainer');
        
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Función para manejar cambios de categoría con paginación
function cambiarCategoriaConPaginacion(categoria, productosArray) {
    const productosFiltrados = categoria === 'All Products' 
        ? productosArray 
        : productosArray.filter(producto => producto.categoria === categoria);
    
    // Reinicializar paginación
    inicializarPaginacion(productosFiltrados);
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

    // Reinicializar paginación
    inicializarPaginacion(productosFiltrados);
    cambiarPagina(1);
}

// Inicializar eventos responsive
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('resize', function() {
        if (document.getElementById('paginationContainer')) {
            renderizarPaginacion('paginationContainer');
        }
    });
});