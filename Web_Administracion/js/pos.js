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

// Helpers
function safeExtractId(obj){
  if(!obj || typeof obj !== 'object') return null;
  const fields = ['id_venta','venta_id','idVenta','ventaId','id','usuario_id','cliente_id','ID','insertId','insert_id'];
  for(const f of fields){
    const v = obj[f];
    if(typeof v === 'number' && v > 0) return v;
    if(typeof v === 'string' && v.trim() && !isNaN(+v) && +v > 0) return +v;
  }
  if(obj.data) return safeExtractId(obj.data);
  
  // Buscar en todas las propiedades cualquier número > 0
  for(const key in obj){
    const val = obj[key];
    if(typeof val === 'number' && val > 0 && !key.includes('precio') && !key.includes('total') && !key.includes('cantidad')){
      console.log(`Usando ${key}=${val} como posible ID`);
      return val;
    }
  }
  return null;
}

// Eliminada función ensureDefaultClienteId - ya no necesitamos validar IDs

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
    // Operamos localmente; la venta en servidor se creará al confirmar
    const productoId = prod.producto_id ?? prod.id;
    const nombre = prod.nombre_producto || prod.nombre || 'Producto';
    const precio = parseFloat(prod.precio) || 0;

    const exists = cart.find(c => String(c.producto_id) === String(productoId));
    if(exists){
      exists.cantidad += 1;
    } else {
      cart.push({ producto_id: productoId, nombre_producto: nombre, precio, cantidad: 1 });
    }

    renderCart();
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
  }catch(err){
    console.error('Error agregando producto al carrito:', err);
    alert('Error: No se pudo agregar el producto. ' + err.message);
  }
}

document.getElementById('btnConfirm').addEventListener('click', async ()=>{
  if(cart.length === 0){ alert('El carrito está vacío. Agrega productos primero.'); return; }

  const metodo = document.getElementById('metodoPago').value;
  const clienteNombre = document.getElementById('clienteInput').value.trim() || 'Cliente';

  try{
    console.log('Iniciando proceso de venta...');
    
    // Usar ID del cliente_general_pos (ID: 18)
    const userId = 18;
    
    // Paso 1: Crear venta básica
    const crearResp = await window.api.ventasAPI.crear({
      comprador_id: userId,
      vendedor_id: userId,
      estado: 'pendiente'
    });
    
    console.log('Respuesta crear venta:', crearResp);
    currentVentaId = safeExtractId(crearResp);
    
    if(!currentVentaId){
      console.error('No se obtuvo ID de venta. Respuesta completa:', crearResp);
      throw new Error('No se pudo crear la venta en el servidor');
    }
    
    console.log('Venta creada con ID:', currentVentaId);
    
    // Paso 2: Agregar cada producto a la venta
    for(const item of cart){
      console.log('Agregando producto:', item.nombre_producto);
      await window.api.ventasAPI.agregarProducto({
        venta_id: currentVentaId,
        producto_id: item.producto_id,
        cantidad: item.cantidad
      });
    }
    
    console.log('Todos los productos agregados');
    
    // Paso 3: Confirmar la venta con nombre del cliente
    const confirmResp = await window.api.ventasAPI.confirmar({
      venta_id: currentVentaId,
      metodo_pago: metodo,
      cliente: clienteNombre
    });
    
    console.log('Respuesta de confirmar venta:', confirmResp);
    console.log('Venta confirmada exitosamente con ID:', currentVentaId);

    // Armar recibo
    const fechaIso = new Date();
    const fechaStr = fechaIso.toLocaleString();
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,'0');
    const dd = String(hoy.getDate()).padStart(2,'0');
    const total = cart.reduce((s,i)=> s + i.precio*i.cantidad, 0);
    const reciboHtml = `
      <div style="font-size:14px">
        <div style="display:flex;justify-content:space-between">
          <div><strong>Minisúper</strong><br><span style="color:var(--gray)">Punto de Venta</span></div>
          <div style="text-align:right">
            <div><strong>Folio:</strong> ${currentVentaId}</div>
            <div><strong>Fecha:</strong> ${fechaStr}</div>
            <div><strong>Método:</strong> ${metodo}</div>
          </div>
        </div>
        <div style="margin:10px 0"><strong>Cliente:</strong> ${clienteNombre}</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#eee"><th style="text-align:left;padding:6px;border:1px solid #ddd">Producto</th><th style="text-align:right;padding:6px;border:1px solid #ddd">Precio</th><th style="text-align:right;padding:6px;border:1px solid #ddd">Cant</th><th style="text-align:right;padding:6px;border:1px solid #ddd">Subtotal</th></tr>
          </thead>
          <tbody>
            ${cart.map(i=>`<tr><td style=\"padding:6px;border:1px solid #ddd\">${i.nombre_producto}</td><td style=\"padding:6px;border:1px solid #ddd;text-align:right\">$${i.precio.toFixed(2)}</td><td style=\"padding:6px;border:1px solid #ddd;text-align:right\">${i.cantidad}</td><td style=\"padding:6px;border:1px solid #ddd;text-align:right\">$${(i.precio*i.cantidad).toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style="text-align:right;margin-top:8px;font-size:15px"><strong>Total: $${total.toFixed(2)}</strong></div>
      </div>
    `;
    const modal = document.getElementById('receiptModal');
    const content = document.getElementById('receiptContent');
    content.innerHTML = reciboHtml;
    modal.style.display = 'flex';

    // Configurar acciones del modal
    const inicio = `${yyyy}-${mm}-${dd}`;
    const fin = inicio; // rango de hoy
    const openReports = document.getElementById('btnOpenReports');
    openReports.onclick = () => { window.location.href = `reports.html?inicio=${inicio}&fin=${fin}`; };
    const printBtn = document.getElementById('btnPrintReceipt');
    printBtn.onclick = () => { const w = window.open('', '_blank'); w.document.write(`<html><head><title>Recibo</title></head><body>${reciboHtml}</body></html>`); w.document.close(); w.focus(); w.print(); w.close(); };
    const closeBtn = document.getElementById('btnCloseReceipt');
    closeBtn.onclick = () => { modal.style.display = 'none'; };

    // Limpiar UI y estado para nueva venta
    cart = []; currentVentaId = null;
    document.getElementById('clienteInput').value = '';
    document.getElementById('metodoPago').value = 'Efectivo';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    renderCart();
  }catch(err){
    console.error('Error en confirmación:', err);
    // Si ya se creó la venta pero algo falló, intentar cancelar
    try{ if(currentVentaId) await window.api.ventasAPI.cancelar({venta_id: currentVentaId}); }catch{}
    alert('Error al procesar la venta: ' + (err.message || err));
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
