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
  listar: () => fetchJSON(`${API_BASE}/api/categoria/listar.php`)
};

/* Proveedores */
const proveedores = {
  listar: () => fetchJSON(`${API_BASE}/api/proveedores/listar.php`)
};

/* Productos */
const productos = {
  listar: (categoriaId = '') => {
    const q = categoriaId ? `?categoria=${categoriaId}` : '';
    return fetchJSON(`${API_BASE}/api/productos/listar.php${q}`);
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
    return fetchJSON(`${API_BASE}/api/productos/buscar.php${q}`);
  }
};

/* Ventas / Carrito */
const ventasAPI = {
  crear: (body) => fetchJSON(`${API_BASE}/api/ventas/crear.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
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
  })
};

/* Reportes */
const reportes = {
  historial: (params = '') => fetchJSON(`${API_BASE}/api/reportes/historial.php${params}`),
  reporteDia: (params = '') => fetchJSON(`${API_BASE}/api/reportes/reporteDia.php${params}`),
  productosTop: (params = '') => fetchJSON(`${API_BASE}/api/reportes/productosTop.php${params}`)
};

/* Export objetos para uso global */
window.api = { auth, categorias, proveedores, productos, ventasAPI, reportes };
