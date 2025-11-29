// frontend/js/reportes.js
async function cargarReporteRango(inicio, fin){
  try{
    console.log('Cargando reporte del', inicio, 'al', fin);
    
    // Intentar cargar desde backend primero
    let ventas = [];
    let usandoLocalStorage = false;
    
    try {
      // El backend ya expone los datos del historial, filtramos client-side por rango
      const query = `?inicio=${inicio}&fin=${fin}`;
      const ventasResponse = await window.api.reportes.historial(query);
      console.log('Respuesta historial completa:', JSON.stringify(ventasResponse, null, 2));
      
      if(Array.isArray(ventasResponse)) {
        ventas = ventasResponse;
      } else if(ventasResponse?.success && Array.isArray(ventasResponse?.data)) {
        ventas = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.data)) {
        ventas = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.ventas)) {
        ventas = ventasResponse.ventas;
      }

      // Aplicar filtro por rango en el frontend por si el backend ignora los parámetros
      if(ventas.length > 0) {
        const inicioDate = new Date(inicio);
        const finDate = new Date(`${fin}T23:59:59`);
        ventas = ventas.filter(v => {
          const fechaStr = v?.fecha ?? v?.creada_en_venta ?? v?.creada_en ?? v?.creada_enVenta;
          if(!fechaStr) return false;
          const fechaVenta = new Date(fechaStr);
          if(isNaN(fechaVenta.getTime())) return false;
          return fechaVenta >= inicioDate && fechaVenta <= finDate;
        });
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
    ventas = ventas.filter(v => {
      const estado = v?.estado ?? v?.estado_venta ?? '';
      return estado === 'confirmada' || estado === 'completada';
    });
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
      tr.innerHTML = '<td colspan="6" style="text-align:center;color:var(--gray)">No hay ventas confirmadas en este periodo</td>';
      tbody.appendChild(tr);
    } else {
      for(const venta of ventas){
        const tr = document.createElement('tr');
        
        const folio = venta?.id_venta ?? venta?.venta_id ?? venta?.id ?? 'N/A';
        const fechaVenta = venta?.fecha ?? venta?.creada_en_venta ?? venta?.creada_en ?? null;
        const fecha = fechaVenta ? new Date(fechaVenta).toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A';
        const cliente = venta?.nombre_cliente ?? venta?.cliente ?? venta?.comprador ?? 'Cliente General';
        const metodoPago = venta?.metodo_pago ?? venta?.metodoPago ?? venta?.forma_pago ?? 'N/A';
        const total = Number(venta?.total ?? venta?.monto_total ?? venta?.precio_total ?? 0);
        const estado = venta?.estado ?? venta?.estado_venta ?? 'pendiente';
        
        // Fila simple sin cards/modales de productos
        tr.innerHTML = `
          <td>${folio}</td>
          <td>${fecha}</td>
          <td>${cliente}</td>
          <td>${metodoPago}</td>
          <td>$${total.toFixed(2)}</td>
          <td><span class="badge ${estado === 'confirmada' || estado === 'completada' ? 'success' : 'warning'}">${estado}</span></td>
        `;
        tbody.appendChild(tr);
      }
    }
  }catch(err){ 
    console.error('Error en reportes:', err); 
    document.getElementById('resumenTotales').innerHTML = '<span style="color:red">Error al cargar reportes</span>';
    const tbody = document.querySelector('#ventasTable tbody'); 
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red">Error: ' + err.message + '</td></tr>';
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
