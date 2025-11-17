// frontend/js/pos.js
// Usa window.api
let cart = [];
let currentVentaId = null;

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
                    <td><button data-idx="${idx}" class="btn danger btn-remove">X</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;

  // add listeners
  document.querySelectorAll('.qinput').forEach(inp => {
    inp.addEventListener('change', (e)=>{
      const i = +e.target.dataset.idx;
      const val = Math.max(1, Number(e.target.value));
      cart[i].cantidad = val;
      // update in server if venta exists
      if(currentVentaId){
        api.ventasAPI.actualizarProducto({venta_id: currentVentaId, producto_id: cart[i].producto_id, cantidad: val})
          .catch(err => console.error('update producto', err));
      }
      renderCart();
    });
  });

  document.querySelectorAll('.btn-remove').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const i = +e.target.dataset.idx;
      if(currentVentaId){
        try{
          await api.ventasAPI.eliminarProducto({venta_id: currentVentaId, producto_id: cart[i].producto_id});
        }catch(err){ console.error(err); }
      }
      cart.splice(i,1);
      renderCart();
    });
  });
}

async function searchProducts(query){
  try{
    const prods = await api.productos.listar();
    // búsqueda cliente-side simple:
    return prods.filter(p => (p.nombre_producto || p.nombre || '').toLowerCase().includes(query.toLowerCase()) || (String(p.producto_id || p.id || '').includes(query)));
  }catch(err){
    console.error(err);
    return [];
  }
}

document.getElementById('btnSearch').addEventListener('click', async ()=>{
  const q = document.getElementById('searchInput').value.trim();
  if(!q) return;
  const results = await searchProducts(q);
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  if(results.length===0){ container.textContent = 'No se encontraron productos'; return; }
  results.forEach(p=>{
    const div = document.createElement('div');
    div.style.padding='8px 0';
    div.innerHTML = `<strong>${p.nombre_producto ?? p.nombre}</strong> — $${(p.precio ?? p.price ?? 0).toFixed(2)} — stock: ${p.stock ?? 0} <button class="btn primary btn-add" data-id="${p.producto_id ?? p.id}">Agregar</button>`;
    container.appendChild(div);
  });
  // listeners
  container.querySelectorAll('.btn-add').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      const prod = results.find(r => String(r.producto_id ?? r.id) === String(id));
      if(!prod) return;
      // si no existe venta temporal, crearla
      if(!currentVentaId){
        try{
          const resp = await api.ventasAPI.crear({comprador_id: 0, vendedor_id: 1}); // ajustar vendedor_id según tu sistema
          currentVentaId = resp.id_venta ?? resp.id ?? resp.venta_id ?? resp.idVenta;
        }catch(err){
          console.error('Error creando venta', err);
        }
      }
      // agregar al carrito en el servidor
      try{
        await api.ventasAPI.agregarProducto({venta_id: currentVentaId, producto_id: prod.producto_id ?? prod.id, cantidad: 1});
      }catch(err){
        console.warn('no se pudo agregar al backend', err);
      }
      // agregar localmente
      const exists = cart.find(c=>String(c.producto_id)===String(prod.producto_id ?? prod.id));
      if(exists) exists.cantidad += 1;
      else cart.push({
        producto_id: prod.producto_id ?? prod.id,
        nombre_producto: prod.nombre_producto ?? prod.nombre,
        precio: Number(prod.precio ?? prod.price ?? 0),
        cantidad: 1
      });
      renderCart();
    });
  });
});

document.getElementById('btnConfirm').addEventListener('click', async ()=>{
  if(!currentVentaId){
    alert('No hay venta creada.');
    return;
  }
  const metodo = document.getElementById('metodoPago').value;
  try{
    await api.ventasAPI.confirmar({venta_id: currentVentaId});
    alert('Venta confirmada');
    // limpiar
    cart = [];
    currentVentaId = null;
    renderCart();
  }catch(err){
    alert('Error al confirmar venta: ' + err.message);
    console.error(err);
  }
});

document.getElementById('btnCancel').addEventListener('click', async ()=>{
  if(!currentVentaId){
    cart = []; renderCart(); return;
  }
  try{
    await api.ventasAPI.cancelar({venta_id: currentVentaId});
    cart = []; currentVentaId = null; renderCart();
    alert('Venta cancelada');
  }catch(err){
    console.error(err);
    alert('Error al cancelar: ' + err.message);
  }
});

// init
renderCart();
