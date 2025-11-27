// jss/api.js - API completa para Minisuper Market
const API_BASE = "http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com";

// Función auxiliar para hacer peticiones HTTP
async function fetchJSON(url, opts = {}) {
    try {
        const res = await fetch(url, {
            ...opts,
            headers: {
                'Content-Type': 'application/json',
                ...opts.headers
            }
        });
        
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error('Error en fetchJSON:', error);
        throw error;
    }
}

/* Autenticación */
const auth = {
    login: (body) => fetchJSON(`${API_BASE}/api/auth/login.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    register: (body) => fetchJSON(`${API_BASE}/api/auth/register.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    // Nueva función para verificar el token/estado de autenticación
    verify: () => fetchJSON(`${API_BASE}/api/auth/verify.php`, {
        method: 'POST'
    }),
    
    logout: () => fetchJSON(`${API_BASE}/api/auth/logout.php`, {
        method: 'POST'
    })
};

/* Categorías */
const categorias = {
    listar: () => fetchJSON(`${API_BASE}/api/categoria/listar.php`).then(res => {
        // Manejar diferentes formatos de respuesta
        if (res.data && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        if (res.categorias && Array.isArray(res.categorias)) return res.categorias;
        return [];
    }),
    
    agregar: (body) => fetchJSON(`${API_BASE}/api/categoria/agregar.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    editar: (body) => fetchJSON(`${API_BASE}/api/categoria/editar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    eliminar: (id) => fetchJSON(`${API_BASE}/api/categoria/eliminar.php`, {
        method: 'DELETE',
        body: JSON.stringify({ Id_categoria: id })
    })
};

/* Proveedores */
const proveedores = {
    listar: () => fetchJSON(`${API_BASE}/api/proveedores/listar.php`).then(res => {
        if (res.data && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
    }),
    
    agregar: (body) => fetchJSON(`${API_BASE}/api/proveedores/agregar.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    editar: (body) => fetchJSON(`${API_BASE}/api/proveedores/editar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    eliminar: (id) => fetchJSON(`${API_BASE}/api/proveedores/eliminar.php`, {
        method: 'DELETE',
        body: JSON.stringify({ Id_proveedor: id })
    })
};

/* Productos */
const productos = {
    listar: (categoriaId = '', termino = '') => {
        let params = new URLSearchParams();
        if (categoriaId) params.append('categoria', categoriaId);
        if (termino) params.append('busca', termino);
        
        const queryString = params.toString();
        const url = `${API_BASE}/api/productos/listar.php${queryString ? '?' + queryString : ''}`;
        
        return fetchJSON(url).then(res => {
            // Manejar diferentes formatos de respuesta
            if (res.data && Array.isArray(res.data)) return res.data;
            if (Array.isArray(res)) return res;
            if (res.productos && Array.isArray(res.productos)) return res.productos;
            return [];
        });
    },
    
    buscar: (termino = '') => {
        const queryString = termino ? `?busca=${encodeURIComponent(termino)}` : '';
        return fetchJSON(`${API_BASE}/api/productos/listar.php${queryString}`).then(res => {
            if (res.data && Array.isArray(res.data)) return res.data;
            if (Array.isArray(res)) return res;
            return [];
        });
    },
    
    agregar: (body) => fetchJSON(`${API_BASE}/api/productos/agregar.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    editar: (body) => fetchJSON(`${API_BASE}/api/productos/editar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    eliminar: (id) => fetchJSON(`${API_BASE}/api/productos/eliminar.php`, {
        method: 'DELETE',
        body: JSON.stringify({ Id_producto: id })
    }),
    
    obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/productos/obtener.php?id=${id}`)
};

/* Ventas / Carrito */
const ventas = {
    crear: (body) => fetchJSON(`${API_BASE}/api/ventas/crear.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    listar: (params = '') => fetchJSON(`${API_BASE}/api/ventas/listar.php${params}`),
    
    obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/ventas/obtener.php?id=${id}`),
    
    agregarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/agregarProducto.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    actualizarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/actualizarProducto.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    eliminarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/eliminarProducto.php`, {
        method: 'DELETE',
        body: JSON.stringify(body)
    }),
    
    cancelar: (body) => fetchJSON(`${API_BASE}/api/ventas/cancelar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    confirmar: (body) => fetchJSON(`${API_BASE}/api/ventas/confirmar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    })
};

/* Reportes */
const reportes = {
    historial: (params = '') => fetchJSON(`${API_BASE}/api/reportes/historial.php${params}`),
    
    reporteDia: (params = '') => fetchJSON(`${API_BASE}/api/reportes/reporteDia.php${params}`),
    
    productosTop: (params = '') => fetchJSON(`${API_BASE}/api/reportes/productosTop.php${params}`)
};

/* Clientes */
const clientes = {
    listar: () => fetchJSON(`${API_BASE}/api/clientes/listar.php`).then(res => {
        if (res.data && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
    }),
    
    agregar: (body) => fetchJSON(`${API_BASE}/api/clientes/agregar.php`, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    editar: (body) => fetchJSON(`${API_BASE}/api/clientes/editar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    eliminar: (id) => fetchJSON(`${API_BASE}/api/clientes/eliminar.php`, {
        method: 'DELETE',
        body: JSON.stringify({ Id_cliente: id })
    }),
    
    obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/clientes/obtener.php?id=${id}`)
};

/* Stock */
const stock = {
    actualizar: (body) => fetchJSON(`${API_BASE}/api/stock/actualizar.php`, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    obtenerBajoStock: () => fetchJSON(`${API_BASE}/api/stock/bajoStock.php`).then(res => {
        if (res.data && Array.isArray(res.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
    }),
    
    historial: (params = '') => fetchJSON(`${API_BASE}/api/stock/historial.php${params}`)
};

/* Dashboard */
const dashboard = {
    estadisticas: (params = '') => fetchJSON(`${API_BASE}/api/dashboard/estadisticas.php${params}`),
    
    ventasRecientes: (limit = 10) => fetchJSON(`${API_BASE}/api/dashboard/ventasRecientes.php?limit=${limit}`),
    
    productosMasVendidos: (limit = 5) => fetchJSON(`${API_BASE}/api/dashboard/productosMasVendidos.php?limit=${limit}`)
};

/* Utilidades para manejo de errores */
const apiUtils = {
    handleError: (error, defaultMessage = 'Error en la operación') => {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || defaultMessage,
            error: error
        };
    },
    
    validateResponse: (response, expectedField = 'success') => {
        if (!response) {
            throw new Error('No se recibió respuesta del servidor');
        }
        return response;
    }
};

/* Exportar todos los módulos para uso global */
window.api = {
    API_BASE,
    auth,
    categorias,
    proveedores,
    productos,
    ventas,
    reportes,
    clientes,
    stock,
    dashboard,
    utils: apiUtils
};

// Log para verificar que la API se cargó correctamente
console.log('✅ API cargada correctamente. Endpoints disponibles:');
console.log('- auth:', Object.keys(auth));
console.log('- categorias:', Object.keys(categorias));
console.log('- productos:', Object.keys(productos));
console.log('- ventas:', Object.keys(ventas));
console.log('- Base URL:', API_BASE);