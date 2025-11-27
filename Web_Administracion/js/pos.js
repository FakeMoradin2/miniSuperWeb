// frontend/js/pos.js
// Usa window.api para conectar con la base de datos
//
// FUNCIONES DISPONIBLES EN API:
// - window.api.productos.listar()                         // Obtener todos los productos
// - window.api.productos.buscar(termino)                  // Buscar productos por nombre/código
// - window.api.ventasAPI.crear({vendedor_id, comprador_id})    // Crear nueva venta
// - window.api.ventasAPI.agregarProducto({venta_id, producto_id, cantidad})
// - window.api.ventasAPI.actualizarProducto({venta_id, producto_id, cantidad})
// - window.api.ventasAPI.eliminarProducto({venta_id, producto_id})
// - window.api.ventasAPI.confirmar({venta_id, metodo_pago, cliente})
// - window.api.ventasAPI.cancelar({venta_id})
// - window.api.clientes.listar()                          // Obtener todos los clientes
// - window.api.clientes.agregar({nombre, email, telefono})
// - window.api.stock.obtenerBajoStock()                   // Productos con bajo stock

let cart = [];
let currentVentaId = null;
let allProducts = []; // cache de productos
let usuarioActual = {id: 1, nombre: 'Juan Delgado', rol: 'Cajero'}; // obtener del sistema de login

// Cargar productos al iniciar
async function cargarProductos(){
  try{
    console.log('Cargando productos...');
    allProducts = await window.api.productos.listar();
    console.log('Productos cargados:', allProducts.length, allProducts);
  }catch(err){
    console.error('Error cargando productos:', err);
    allProducts = [];
  }
}

function renderCart(){
  const tbody = document.querySelector('#cartTable tbody');
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    tr.innerHTML = `<td>${item.nombre_producto}</td>
                    <td>$${item.precio.toFixed(2)}</td>
                    <td><input type="number" min="1" value="${item.cantidad}" data-idx="${idx}" class="qinput" style="width:70px"></td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button data-idx="${idx}" class="btn danger btn-remove" style="padding: 4px 8px;">X</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;

  // add listeners para cantidad
  document.querySelectorAll('.qinput').forEach(inp => {
    inp.addEventListener('change', (e)=>{
      const i = +e.target.dataset.idx;
      const val = Math.max(1, Number(e.target.value));
      cart[i].cantidad = val;
      // update en server si venta existe
      if(currentVentaId){
        window.api.ventasAPI.actualizarProducto({
          venta_id: currentVentaId, 
          producto_id: cart[i].producto_id, 
          cantidad: val
        }).catch(err => console.error('Error actualizando producto:', err));
      }
      renderCart();
    });
  });

  // listeners para remover items
  document.querySelectorAll('.btn-remove').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      const i = +e.target.dataset.idx;
      if(currentVentaId){
        try{
          await window.api.ventasAPI.eliminarProducto({
            venta_id: currentVentaId, 
            producto_id: cart[i].producto_id
          });
        }catch(err){ 
          console.error('Error eliminando producto:', err); 
        }
      }
      cart.splice(i, 1);
      renderCart();
    });
  });
}

async function searchProducts(query){
  try{
    if(!query.trim()) return [];
    
    // Buscar en servidor
    const results = await window.api.productos.buscar(query);
    console.log('Búsqueda de:', query, 'Resultados:', results);
    
    return Array.isArray(results) ? results : [];
  }catch(err){
    console.error('Error buscando productos:', err);
    return [];
  }
}

document.getElementById('btnSearch').addEventListener('click', async ()=>{
  const q = document.getElementById('searchInput').value.trim();
  if(!q) {
    document.getElementById('searchResults').innerHTML = '<p style="color: var(--gray);">Ingresa un término de búsqueda</p>';
    return;
  }
  
  const results = await searchProducts(q);
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  // Filtrar resultados en cliente por seguridad (algunos endpoints devuelven todo)
  const queryLower = q.toLowerCase();
  const filtered = results.filter(p => {
    const nombre = (p.nombre_producto || p.nombre || '').toString().toLowerCase();
    const categoria = (p.categoria || '').toString().toLowerCase();
    const proveedor = (p.proveedor || '').toString().toLowerCase();
    const id = String(p.producto_id || p.id || '');
    return nombre.includes(queryLower) || categoria.includes(queryLower) || proveedor.includes(queryLower) || id === q;
  });

  if(filtered.length === 0){ 
    container.innerHTML = '<p style="color: var(--gray); padding: 10px 0;">No se encontraron productos</p>'; 
    return; 
  }

  filtered.forEach(p=>{
    const div = document.createElement('div');
    div.style.cssText = 'padding:12px;border:1px solid var(--border-color);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;background:#f8f9fa';
    
    const stock = p.stock || 0;
    const disponible = stock > 0;
    const precio = parseFloat(p.precio) || 0;
    const nombre = p.nombre_producto || p.nombre || 'Producto';
    
    div.innerHTML = `
      <div>
        <div style="font-weight:600;color:var(--text-dark)">${nombre}</div>
        <div style="font-size:0.9rem;color:var(--gray)">
          Precio: <strong>$${precio.toFixed(2)}</strong> — Stock: <strong>${stock}</strong>
        </div>
      </div>
      <button class="btn ${disponible ? 'primary' : 'secondary'} btn-add" 
              data-id="${p.producto_id}" 
              ${disponible ? '' : 'disabled'}
              style="margin-left: 10px;">
        ${disponible ? 'Agregar' : 'Sin stock'}
      </button>
    `;
    container.appendChild(div);
  });
  
  // listeners para agregar productos
  container.querySelectorAll('.btn-add:not(:disabled)').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      e.preventDefault();
      const id = e.target.dataset.id;
      // buscar en filtered primero
      const prod = (filtered.find(r => String(r.producto_id ?? r.id) === String(id)) || results.find(r => String(r.producto_id ?? r.id) === String(id)));
      if(!prod) return;
      
      await agregarProductoAlCarrito(prod);
    });
  });
});

// Botón para limpiar la búsqueda
document.getElementById('btnClearSearch').addEventListener('click', ()=>{
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '<p style="color: var(--gray);">Ingresa un término de búsqueda</p>';
  document.getElementById('searchInput').focus();
});

async function agregarProductoAlCarrito(prod){
  try{
    // Si no existe venta temporal, crearla
    if(!currentVentaId){
      const vendedor_id = usuarioActual.id || 1;
      const resp = await window.api.ventasAPI.crear({
        comprador_id: 0, 
        vendedor_id: vendedor_id,
        estado: 'pendiente'
      });
      currentVentaId = resp.id_venta ?? resp.id ?? resp.venta_id ?? resp.idVenta;
      console.log('Venta creada:', currentVentaId);
    }
    
    // Agregar al carrito en el servidor
    const productoId = prod.producto_id;
    const nombre = prod.nombre_producto || prod.nombre || 'Producto';
    const precio = parseFloat(prod.precio) || 0;
    
    await window.api.ventasAPI.agregarProducto({
      venta_id: currentVentaId, 
      producto_id: productoId, 
      cantidad: 1
    });
    
    // Agregar localmente
    const exists = cart.find(c => String(c.producto_id) === String(productoId));
    if(exists){
      exists.cantidad += 1;
    } else {
      cart.push({
        producto_id: productoId,
        nombre_producto: nombre,
        precio: precio,
        cantidad: 1
      });
    }
    
    renderCart();
    
    // Limpiar input
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    
  }catch(err){
    console.error('Error agregando producto al carrito:', err);
    alert('Error: No se pudo agregar el producto. ' + err.message);
  }
}

document.getElementById('btnConfirm').addEventListener('click', async ()=>{
  if(!currentVentaId){
    alert('No hay venta creada. Agrega productos primero.');
    return;
  }
  
  if(cart.length === 0){
    alert('El carrito está vacío.');
    return;
  }
  
  const metodo = document.getElementById('metodoPago').value;
  const cliente = document.getElementById('clienteInput').value || 'Cliente General';
  
  try{
    // Confirmar venta en servidor
    await window.api.ventasAPI.confirmar({
      venta_id: currentVentaId,
      metodo_pago: metodo,
      cliente: cliente
    });
    
    alert('✓ Venta confirmada exitosamente');
    
    // Limpiar formulario
    cart = [];
    currentVentaId = null;
    document.getElementById('clienteInput').value = '';
    document.getElementById('metodoPago').value = 'Efectivo';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    
    renderCart();
  }catch(err){
    alert('Error al confirmar venta: ' + err.message);
    console.error(err);
  }
});

document.getElementById('btnCancel').addEventListener('click', async ()=>{
  if(!currentVentaId && cart.length === 0){
    alert('No hay venta activa.');
    return;
  }
  
  if(!confirm('¿Deseas cancelar esta venta?')) return;
  
  try{
    if(currentVentaId){
      await window.api.ventasAPI.cancelar({venta_id: currentVentaId});
    }
    
    cart = [];
    currentVentaId = null;
    document.getElementById('clienteInput').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    
    renderCart();
    alert('✓ Venta cancelada');
  }catch(err){
    console.error('Error cancelando venta:', err);
    alert('Error al cancelar: ' + err.message);
  }
});

// Permitir buscar con Enter
document.getElementById('searchInput').addEventListener('keypress', (e)=>{
  if(e.key === 'Enter'){
    document.getElementById('btnSearch').click();
  }
});

// Inicializar
async function init(){
  console.log('Inicializando POS...');
  await cargarProductos();
  renderCart();
}
