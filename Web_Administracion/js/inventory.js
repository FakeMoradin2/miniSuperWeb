// frontend/js/inventario.js

// Variables globales para el estado del filtrado
let productosOriginales = [];
let busquedaActual = '';

// ========== SISTEMA DE ORDENAMIENTO (QuickSort - igual que script_products.js) ==========

function quickSortProductos(productosArray, izquierda = 0, derecha = productosArray.length - 1) {
    if (izquierda < derecha) {
        const indicePivote = particionarProductos(productosArray, izquierda, derecha);
        quickSortProductos(productosArray, izquierda, indicePivote - 1);
        quickSortProductos(productosArray, indicePivote + 1, derecha);
    }
    return productosArray;
}

function particionarProductos(productosArray, izquierda, derecha) {
    const pivote = (productosArray[derecha].nombre_producto ?? productosArray[derecha].nombre).toLowerCase();
    let i = izquierda - 1;
    
    for (let j = izquierda; j < derecha; j++) {
        const nombreActual = (productosArray[j].nombre_producto ?? productosArray[j].nombre).toLowerCase();
        if (nombreActual <= pivote) {
            i++;
            [productosArray[i], productosArray[j]] = [productosArray[j], productosArray[i]];
        }
    }
    
    [productosArray[i + 1], productosArray[derecha]] = [productosArray[derecha], productosArray[i + 1]];
    return i + 1;
}

// ========== FUNCIÓN DE BÚSQUEDA (igual que script_products.js) ==========

function buscarProductosInventario(termino) {
    if (!termino) {
        loadProductos();
        return;
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = productosOriginales.filter(producto => 
        (producto.nombre_producto ?? producto.nombre ?? '').toLowerCase().includes(terminoLower) ||
        (producto.descripcion ?? '').toLowerCase().includes(terminoLower)
    );

    renderizarProductosTabla(productosFiltrados);
}

// ========== FUNCIÓN PARA RENDERIZAR TABLA ==========

function renderizarProductosTabla(prods) {
    if (!Array.isArray(prods)) {
      console.error('renderizarProductosTabla: prods no es un array:', prods);
      prods = [];
    }
    
    const tbody = document.querySelector('#productosTable tbody');
    if (!tbody) {
      console.error('No se encontró el elemento #productosTable tbody');
      return;
    }
    
    tbody.innerHTML = '';
    prods.forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.nombre_producto ?? p.nombre}</td>
                      <td>$${Number(p.precio ?? 0).toFixed(2)}</td>
                      <td>${p.stock ?? 0}</td>
                      <td>${p.categoria_nombre ?? p.categoria ?? ''}</td>
                      <td>
                        <button class="btn" data-id="${p.producto_id ?? p.id}" data-action="edit">Editar</button>
                        <button class="btn danger" data-id="${p.producto_id ?? p.id}" data-action="del">Eliminar</button>
                      </td>`;
      tbody.appendChild(tr);
    });
    // listeners
    tbody.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;
        const prod = productosOriginales.find(x => String(x.producto_id ?? x.id) === String(id));
        if(action==='edit'){
          document.getElementById('prodId').value = id;
          document.getElementById('prodNombre').value = prod.nombre_producto ?? prod.nombre;
          document.getElementById('prodPrecio').value = prod.precio ?? 0;
          document.getElementById('prodStock').value = prod.stock ?? 0;
          document.getElementById('prodCategoria').value = prod.categoria_id ?? prod.categoria ?? '';
          document.getElementById('prodProveedor').value = prod.proveedor_id ?? '';
          document.getElementById('prodImagen').value = prod.imagen ?? '';
        } else if(action==='del'){
          if(!confirm('Seguro que deseas desactivar este producto?')) return;
          try{
            await api.productos.eliminar({producto_id: id});
            await loadProductos();
          }catch(err){ alert('Error al eliminar'); console.error(err); }
        }
      });
    });
}

// ========== FUNCIONES ORIGINALES ADAPTADAS ==========

async function loadCategorias() {
  try {
    const response = await api.categorias.listar();
    console.log('Respuesta de categorías:', response);
    // Manejar diferentes estructuras de respuesta
    let cats = Array.isArray(response) ? response : 
               (response.data || response.categorias || response.categoria || []);
    
    if (!Array.isArray(cats)) {
      console.error('La respuesta de categorías no es un array:', response);
      cats = [];
    }
    
    const sel = document.getElementById('prodCategoria');
    if (!sel) {
      console.error('No se encontró el elemento prodCategoria');
      return;
    }
    
    sel.innerHTML = '<option value="">--</option>';
    cats.forEach(c=> sel.innerHTML += `<option value="${c.Id_categoria ?? c.id ?? c.id_categoria}">${c.Nombre_Categoria ?? c.nombre ?? c.nombre_categoria}</option>`);
  } catch (err) { 
    console.error('Error cargando categorías:', err); 
  }
}

async function loadProveedores() {
  try {
    const response = await api.proveedores.listar();
    console.log('Respuesta de proveedores:', response);
    // Manejar diferentes estructuras de respuesta
    let prov = Array.isArray(response) ? response : 
               (response.data || response.proveedores || response.proveedor || []);
    
    if (!Array.isArray(prov)) {
      console.error('La respuesta de proveedores no es un array:', response);
      prov = [];
    }
    
    const sel = document.getElementById('prodProveedor');
    if (!sel) {
      console.error('No se encontró el elemento prodProveedor');
      return;
    }
    
    sel.innerHTML = '<option value="">--</option>';
    prov.forEach(p=> sel.innerHTML += `<option value="${p.Id_proveedor ?? p.id}">${p.nombre_proveedor ?? p.nombre}</option>`);
  } catch (err) { 
    console.error('Error cargando proveedores:', err); 
  }
}

async function loadProductos(){
  try{
    const response = await api.productos.listar();
    console.log('Respuesta de productos:', response);
    // Manejar diferentes estructuras de respuesta
    let prods = Array.isArray(response) ? response : 
                (response.data || response.productos || response.producto || []);
    
    if (!Array.isArray(prods)) {
      console.error('La respuesta de productos no es un array:', response);
      prods = [];
    }
    
    productosOriginales = prods;
    renderizarProductosTabla(prods);
  }catch(err){
    console.error('Error cargando productos:', err);
  }
}

document.getElementById('btnSaveProd').addEventListener('click', async ()=>{
  const id = document.getElementById('prodId').value;
  const body = {
    nombre_producto: document.getElementById('prodNombre').value,
    precio: Number(document.getElementById('prodPrecio').value || 0),
    stock: Number(document.getElementById('prodStock').value || 0),
    categoria_id: document.getElementById('prodCategoria').value || null,
    proveedor_id: document.getElementById('prodProveedor').value || null,
    imagen: document.getElementById('prodImagen').value || ''
  };
  try{
    if(id){
      body.producto_id = id;
      await api.productos.editar(body);
      alert('Producto actualizado');
    } else {
      await api.productos.agregar(body);
      alert('Producto creado');
    }
    document.getElementById('btnReset').click();
    await loadProductos();
  }catch(err){ console.error(err); alert('Error guardando'); }
});

document.getElementById('btnReset').addEventListener('click', ()=>{
  document.getElementById('prodId').value = '';
  document.getElementById('prodNombre').value = '';
  document.getElementById('prodPrecio').value = '';
  document.getElementById('prodStock').value = '';
  document.getElementById('prodCategoria').value = '';
  document.getElementById('prodProveedor').value = '';
  document.getElementById('prodImagen').value = '';
});

// ========== CONFIGURAR BÚSQUEDA (igual que script_products.js) ==========

function configurarBusquedaProductos() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        let timeoutId;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            const termino = this.value.trim();
            busquedaActual = termino;
            
            timeoutId = setTimeout(() => {
                if (termino.length >= 2 || termino.length === 0) {
                    if (termino.length === 0) {
                        loadProductos();
                    } else {
                        buscarProductosInventario(termino);
                    }
                }
            }, 300);
        });
    }
}

(async function initInventario(){
  await loadCategorias();
  await loadProveedores();
  await loadProductos();
  configurarBusquedaProductos();
})();