// frontend/js/api.js
const API_BASE = "http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com";

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
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
  crear: (body) => fetchJSON(`${API_BASE}/api/ventas/crear.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  }),
  listar: (params = '') => fetchJSON(`${API_BASE}/api/ventas/listar.php${params}`),
  obtenerPorId: (id) => fetchJSON(`${API_BASE}/api/ventas/obtener.php?id=${id}`),
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
  
  // Listar desde localStorage (similar a clientes)
  getAll: () => {
    try {
      const empleadosData = JSON.parse(localStorage.getItem('minisuper_empleados') || '[]');
      return Promise.resolve({ success: true, data: empleadosData });
    } catch (error) {
      return Promise.resolve({ success: true, data: [] });
    }
  },
  
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