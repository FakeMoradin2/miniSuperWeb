// frontend/js/reportes.js
async function cargarReporteRango(inicio, fin){
  try{
    console.log('Cargando reporte del', inicio, 'al', fin);
    
    // Intentar cargar desde backend primero
    let ventas = [];
    let usandoLocalStorage = false;
    
    try {
      const ventasResponse = await window.api.ventasAPI.listar(`?inicio=${inicio}&fin=${fin}`);
      console.log('Respuesta ventas completa:', JSON.stringify(ventasResponse, null, 2));
      
      // Extraer array de ventas - intentar múltiples formatos
      if(Array.isArray(ventasResponse)) {
        ventas = ventasResponse;
      } else if(ventasResponse?.success && Array.isArray(ventasResponse?.data)) {
        ventas = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.ventas)) {
        ventas = ventasResponse.ventas;
      } else if(ventasResponse?.data && Array.isArray(ventasResponse.data)) {
        ventas = ventasResponse.data;
      }
    } catch(error) {
      console.warn('No se pudo cargar desde backend, usando localStorage:', error);
      usandoLocalStorage = true;
    }
    
    // Si no hay ventas del backend o falló, usar localStorage
    if(ventas.length === 0 || usandoLocalStorage) {
      console.log('Cargando ventas desde localStorage...');
      const ventasLocal = JSON.parse(localStorage.getItem('minisuper_ventas') || '[]');
      
      // Filtrar por rango de fechas
      ventas = ventasLocal.filter(v => {
        const fechaVenta = v.fecha.split('T')[0]; // YYYY-MM-DD
        return fechaVenta >= inicio && fechaVenta <= fin;
      });
      
      console.log('Ventas desde localStorage:', ventas.length, ventas);
    }
    
    console.log('Ventas extraídas:', ventas.length, ventas);
    
    // Filtrar solo ventas confirmadas
    ventas = ventas.filter(v => v?.estado === 'confirmada' || v?.estado === 'completada');
    console.log('Ventas confirmadas:', ventas.length);
    
    // Calcular totales
    let totalVentas = 0;
    let totalTransacciones = ventas.length;
    
    ventas.forEach(v => {
      const total = Number(v?.total ?? v?.monto_total ?? v?.precio_total ?? 0);
      totalVentas += total;
    });
    
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;
    
    document.getElementById('resumenTotales').innerHTML = `
      <strong>Total ventas:</strong> $${totalVentas.toFixed(2)}<br>
      <strong>Transacciones:</strong> ${totalTransacciones}<br>
      <strong>Ticket promedio:</strong> $${ticketPromedio.toFixed(2)}
    `;

    // Cargar tabla de ventas
    const tbody = document.querySelector('#ventasTable tbody'); 
    tbody.innerHTML='';
    
    if(ventas.length === 0){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" style="text-align:center;color:var(--gray)">No hay ventas confirmadas en este periodo</td>';
      tbody.appendChild(tr);
    } else {
      for(const venta of ventas){
        const tr = document.createElement('tr');
        
        const folio = venta?.id_venta ?? venta?.venta_id ?? venta?.id ?? 'N/A';
        const fecha = venta?.fecha ? new Date(venta.fecha).toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A';
        const cliente = venta?.nombre_cliente ?? venta?.cliente ?? venta?.comprador ?? 'Cliente General';
        const metodoPago = venta?.metodo_pago ?? venta?.metodoPago ?? venta?.forma_pago ?? 'N/A';
        const total = Number(venta?.total ?? venta?.monto_total ?? venta?.precio_total ?? 0);
        const estado = venta?.estado ?? 'pendiente';
        
        // Si la venta ya tiene productos en la respuesta, mostrarlos directamente
        let productosHTML = '<em style="color:var(--gray)">Cargando...</em>';
        
        tr.innerHTML = `
          <td>${folio}</td>
          <td>${fecha}</td>
          <td>${cliente}</td>
          <td id="productos-${folio}">${productosHTML}</td>
          <td>${metodoPago}</td>
          <td>$${total.toFixed(2)}</td>
          <td><span class="badge ${estado === 'confirmada' || estado === 'completada' ? 'success' : 'warning'}">${estado}</span></td>
        `;
        tbody.appendChild(tr);
        
        // Cargar productos asíncronamente
        cargarProductosVenta(folio, venta);
      }
    }
  }catch(err){ 
    console.error('Error en reportes:', err); 
    document.getElementById('resumenTotales').innerHTML = '<span style="color:red">Error al cargar reportes</span>';
    const tbody = document.querySelector('#ventasTable tbody'); 
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red">Error: ' + err.message + '</td></tr>';
  }
}

// Función para cargar productos de una venta específica
async function cargarProductosVenta(ventaId, ventaData = null) {
  const celda = document.getElementById(`productos-${ventaId}`);
  if(!celda) return;
  
  try {
    // Si la venta ya tiene productos en los datos, usarlos directamente
    if(ventaData?.productos && Array.isArray(ventaData.productos)) {
      mostrarProductos(celda, ventaData.productos);
      return;
    }
    if(ventaData?.detalles && Array.isArray(ventaData.detalles)) {
      mostrarProductos(celda, ventaData.detalles);
      return;
    }
    
    // Si no, hacer petición al backend
    const ventaDetalle = await window.api.ventasAPI.obtenerPorId(ventaId);
    console.log(`Detalle venta ${ventaId}:`, ventaDetalle);
    
    // Extraer productos del detalle
    let productos = [];
    if(Array.isArray(ventaDetalle?.productos)) {
      productos = ventaDetalle.productos;
    } else if(Array.isArray(ventaDetalle?.detalles)) {
      productos = ventaDetalle.detalles;
    } else if(Array.isArray(ventaDetalle?.items)) {
      productos = ventaDetalle.items;
    } else if(Array.isArray(ventaDetalle?.data?.productos)) {
      productos = ventaDetalle.data.productos;
    } else if(Array.isArray(ventaDetalle?.data?.detalles)) {
      productos = ventaDetalle.data.detalles;
    } else if(ventaDetalle?.success && Array.isArray(ventaDetalle?.data)) {
      productos = ventaDetalle.data;
    }
    
    mostrarProductos(celda, productos);
    
  } catch(err) {
    console.error(`Error cargando productos de venta ${ventaId}:`, err);
    celda.innerHTML = '<em style="color:orange">No disponible</em>';
  }
}

// Función auxiliar para mostrar productos en una celda
function mostrarProductos(celda, productos) {
  if(!productos || productos.length === 0) {
    celda.innerHTML = '<em style="color:var(--gray)">Sin productos</em>';
  } else {
    const productosTexto = productos.map(p => {
      const nombre = p?.nombre_producto ?? p?.nombre ?? p?.producto ?? 'Producto';
      const cantidad = p?.cantidad ?? 1;
      return `${nombre} (x${cantidad})`;
    }).join(', ');
    celda.innerHTML = productosTexto;
  }
}

document.getElementById('btnVerReporte').addEventListener('click', async ()=>{
  const inicio = document.getElementById('fechaInicio').value;
  const fin = document.getElementById('fechaFin').value;
  if(!inicio || !fin){ alert('Selecciona fecha inicio y fin'); return; }
  await cargarReporteRango(inicio, fin);
});

// Autocargar si vienen parámetros en la URL
(function initReportes(){
  const params = new URLSearchParams(window.location.search);
  let inicio = params.get('inicio');
  let fin = params.get('fin');
  if(!inicio || !fin){
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth()+1).padStart(2,'0');
    const dd = String(hoy.getDate()).padStart(2,'0');
    inicio = `${yyyy}-${mm}-${dd}`; fin = inicio;
  }
  const iEl = document.getElementById('fechaInicio');
  const fEl = document.getElementById('fechaFin');
  if(iEl && fEl){ iEl.value = inicio; fEl.value = fin; }
  cargarReporteRango(inicio, fin);
})();
