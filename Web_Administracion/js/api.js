// frontend/js/api.js
const API_BASE = "http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com";

async function fetchJSON(url, opts = {}) {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Adjuntar token si existe
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const config = {
      method: opts.method || 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        ...defaultHeaders,
        ...authHeaders,
        ...(opts.headers || {})
      },
      ...opts
    };
    
    // No incluir body en peticiones GET
    if (config.method === 'GET' && config.body) {
      delete config.body;
    }
    
    console.log('Fetching:', url, config);
    
    const res = await fetch(url, config);
    
    if (!res.ok) {
      console.error(`HTTP Error ${res.status}:`, res.statusText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const text = await res.text();
    console.log('Response:', text);
    
    // Intentar parsear como JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Respuesta no es JSON válido:', text);
      throw new Error(`Respuesta no válida del servidor: ${text.substring(0, 100)}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error en fetchJSON:', error);
    throw error;
  }
}

/* Autenticación */
const auth = {
  login: (body) => fetchJSON(`${API_BASE}/api/auth/login.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  register: (body) => fetchJSON(`${API_BASE}/api/auth/register.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  })
};

/* Categorías */
const categorias = {
  listar: () => fetchJSON(`${API_BASE}/api/categoria/listar.php`).then(res => {
    // Manejar respuestas envueltas en {data: []}
    if (res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  })
};

/* Proveedores */
const proveedores = {
  listar: () => fetchJSON(`${API_BASE}/api/proveedores/listar.php`).then(res => {
    // Manejar respuestas envueltas en {data: []}
    if (res.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  })
};

/* Productos */
const productos = {
  listar: (categoriaId = '') => {
    const q = categoriaId ? `?categoria=${categoriaId}` : '';
    return fetchJSON(`${API_BASE}/api/productos/listar.php${q}`).then(res => {
      // Manejar respuestas envueltas en {data: []}
      if (res.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    });
  },
  agregar: (body) => fetchJSON(`${API_BASE}/api/productos/agregar.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  editar: (body) => fetchJSON(`${API_BASE}/api/productos/editar.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  eliminar: (body) => fetchJSON(`${API_BASE}/api/productos/eliminar.php`, {
    method: 'DELETE',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  buscar: (termino = '') => {
    const q = termino ? `?busca=${encodeURIComponent(termino)}` : '';
    // Algunos backends manejan la búsqueda a través de listar.php?busca=... en vez de buscar.php
    return fetchJSON(`${API_BASE}/api/productos/listar.php${q}`).then(res => {
      // Manejar respuestas envueltas en {data: []}
      if (res.data && Array.isArray(res.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    });
  }
};

/* Ventas / Carrito */
const ventasAPI = {
  crearCompleta: async (body) => {
    // Nueva función: crear venta completa sin IDs de usuario
    const response = await fetchJSON(`${API_BASE}/api/ventas/crear.php`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    
    console.log('Respuesta de crear venta completa:', response);
    return response;
  },
  crear: async (body) => {
    const response = await fetchJSON(`${API_BASE}/api/ventas/crear.php`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    
    console.log('Respuesta RAW de crear venta:', JSON.stringify(response, null, 2));
    
    // Buscar ID en todas las ubicaciones posibles
    const possibleId = response.id_venta || response.id || response.venta_id || 
                      response.idVenta || response.ventaId || response.ID ||
                      response.data?.id_venta || response.data?.id || response.data?.venta_id ||
                      response.insertId || response.insert_id;
    
    console.log('ID extraído:', possibleId);
    
    if (possibleId) {
      return {
        ...response,
        id_venta: possibleId,
        id: possibleId
      };
    }
    
    // Si no encontramos ID pero la respuesta indica éxito, devolver todo
    return response;
  },
  listar: (params = '') => fetchJSON(`${API_BASE}/api/ventas/listar.php${params}`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
  }),
  obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/ventas/obtener.php?id=${id}`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
  }),
  agregarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/agregarProducto.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  actualizarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/actualizarProducto.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  eliminarProducto: (body) => fetchJSON(`${API_BASE}/api/ventas/eliminarProducto.php`, {
    method: 'DELETE',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  cancelar: (body) => fetchJSON(`${API_BASE}/api/ventas/cancelar.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  confirmar: (body) => fetchJSON(`${API_BASE}/api/ventas/confirmar.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  listarCarritos: () => fetchJSON(`${API_BASE}/api/ventas/listarCarritos.php`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
  }),
  obtenerCarrito: (venta_id) => fetchJSON(`${API_BASE}/api/ventas/obtenerCarrito.php?venta_id=${venta_id}`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
  }),
  buscarPorTelefono: (telefono) => fetchJSON(`${API_BASE}/api/ventas/buscarPorTelefono.php?telefono=${encodeURIComponent(telefono)}`, {
    method: 'GET',
    headers: {'Accept':'application/json'}
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
  listar: () => fetchJSON(`${API_BASE}/api/clientes/listar.php`),
  agregar: (body) => fetchJSON(`${API_BASE}/api/clientes/agregar.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  editar: (body) => fetchJSON(`${API_BASE}/api/clientes/editar.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  eliminar: (body) => fetchJSON(`${API_BASE}/api/clientes/eliminar.php`, {
    method: 'DELETE',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/clientes/obtener.php?id=${id}`)
};

/* Stock */
const stock = {
  actualizar: (body) => fetchJSON(`${API_BASE}/api/stock/actualizar.php`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  obtenerBajoStock: () => fetchJSON(`${API_BASE}/api/stock/bajoStock.php`),
  historial: (params = '') => fetchJSON(`${API_BASE}/api/stock/historial.php${params}`)
};

/* Dashboard */
const dashboard = {
  estadisticas: (params = '') => fetchJSON(`${API_BASE}/api/dashboard/estadisticas.php${params}`),
  ventasRecientes: (limit = 10) => fetchJSON(`${API_BASE}/api/dashboard/ventasRecientes.php?limit=${limit}`),
  productosMasVendidos: (limit = 5) => fetchJSON(`${API_BASE}/api/dashboard/productosMasVendidos.php?limit=${limit}`)
};

/* Empleados - Usando el mismo endpoint de auth pero con localStorage para listar */
const empleados = {
  register: (body) => fetchJSON(`${API_BASE}/api/auth/register.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  
  // Listar desde el backend (clientes y cajeros)
  getAll: () => fetchJSON(`${API_BASE}/api/auth/listar.php`),
  
  // Actualizar en localStorage
  update: (body) => {
    try {
      const empleadosData = JSON.parse(localStorage.getItem('minisuper_empleados') || '[]');
      const index = empleadosData.findIndex(emp => emp.usuario_id == body.usuario_id);
      
      if (index !== -1) {
        empleadosData[index] = { ...empleadosData[index], ...body };
        localStorage.setItem('minisuper_empleados', JSON.stringify(empleadosData));
      }
      
      return Promise.resolve({ success: true, message: 'Empleado actualizado' });
    } catch (error) {
      return Promise.resolve({ success: false, message: error.message });
    }
  },
  
  // Eliminar de localStorage
  delete: (usuarioId) => {
    try {
      const empleadosData = JSON.parse(localStorage.getItem('minisuper_empleados') || '[]');
      const nuevosEmpleados = empleadosData.filter(emp => emp.usuario_id != usuarioId);
      localStorage.setItem('minisuper_empleados', JSON.stringify(nuevosEmpleados));
      
      return Promise.resolve({ success: true, message: 'Empleado eliminado' });
    } catch (error) {
      return Promise.resolve({ success: false, message: error.message });
    }
  }
};

/* Export objetos para uso global */
window.api = { auth, categorias, proveedores, productos, ventasAPI, reportes, clientes, stock, dashboard, empleados };