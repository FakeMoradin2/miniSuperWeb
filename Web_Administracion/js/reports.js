// frontend/js/reportes.js
async function cargarReporteRango(inicio, fin){
  try{
    console.log('Cargando reporte del', inicio, 'al', fin);
    
    let ventasBackend = [];
    let ventasLocal = [];
    
    // 1. Cargar ventas del backend (incluye móvil y web del servidor)
    try {
      const query = `?inicio=${inicio}&fin=${fin}`;
      const ventasResponse = await window.api.reportes.historial(query);
      console.log('Respuesta backend:', JSON.stringify(ventasResponse, null, 2));
      
      if(Array.isArray(ventasResponse)) {
        ventasBackend = ventasResponse;
      } else if(ventasResponse?.success && Array.isArray(ventasResponse?.data)) {
        ventasBackend = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.data)) {
        ventasBackend = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.ventas)) {
        ventasBackend = ventasResponse.ventas;
      }

      // Filtrar por rango de fechas
      if(ventasBackend.length > 0) {
        const inicioDate = new Date(inicio);
        const finDate = new Date(`${fin}T23:59:59`);
        ventasBackend = ventasBackend.filter(v => {
          const fechaStr = v?.fecha ?? v?.creada_en_venta ?? v?.creada_en ?? v?.creada_enVenta;
          if(!fechaStr) return false;
          const fechaVenta = new Date(fechaStr);
          if(isNaN(fechaVenta.getTime())) return false;
          return fechaVenta >= inicioDate && fechaVenta <= finDate;
        });
      }
      
      console.log('Ventas del backend:', ventasBackend.length);
    } catch(error) {
      console.warn('Error cargando desde backend:', error);
    }
    
    // 2. Cargar ventas de localStorage (POS web local)
    try {
      const todasVentasLocal = JSON.parse(localStorage.getItem('minisuper_ventas') || '[]');
      ventasLocal = todasVentasLocal.filter(v => {
        const fechaVenta = v.fecha ? v.fecha.split('T')[0] : '';
        return fechaVenta >= inicio && fechaVenta <= fin;
      });
      console.log('Ventas de localStorage:', ventasLocal.length);
    } catch(error) {
      console.warn('Error cargando localStorage:', error);
    }
    
    // 3. Combinar ambas fuentes evitando duplicados
    const ventasMap = new Map();
    
    // Agregar del backend
    ventasBackend.forEach(v => {
      const id = v?.id_venta ?? v?.venta_id ?? v?.id ?? v?.idVenta;
      if(id) ventasMap.set(String(id), v);
    });
    
    // Agregar de localStorage (sobrescribe si tiene más info)
    ventasLocal.forEach(v => {
      const id = v?.id_venta ?? v?.venta_id ?? v?.id ?? v?.idVenta;
      if(id) {
        const ventaExistente = ventasMap.get(String(id));
        // Si la venta existe pero no tiene productos y localStorage sí, combinar
        if(ventaExistente) {
          if((!ventaExistente.productos || ventaExistente.productos.length === 0) && v.productos) {
            ventasMap.set(String(id), { ...ventaExistente, productos: v.productos });
          }
        } else {
          // Si no existe, agregarla
          ventasMap.set(String(id), v);
        }
      }
    });
    
    // Convertir a array
    let ventas = Array.from(ventasMap.values());
    
    console.log('Total ventas combinadas (backend + localStorage):', ventas.length);
    
    // Filtrar solo confirmadas
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
        let fecha = 'N/A';
        if (fechaVenta) {
          // MySQL devuelve fechas en formato 'YYYY-MM-DD HH:MM:SS' sin zona horaria
          // JavaScript las interpreta como hora local si no tiene 'Z' o '+/-'
          // Para asegurar que se interprete como hora local, agregar 'T' y no 'Z'
          let fechaStr = fechaVenta.toString();
          // Si no tiene 'T', agregarlo para que JavaScript lo interprete correctamente
          if (!fechaStr.includes('T') && !fechaStr.includes('Z')) {
            fechaStr = fechaStr.replace(' ', 'T');
          }
          const fechaObj = new Date(fechaStr);
          // Verificar si la fecha es válida
          if (!isNaN(fechaObj.getTime())) {
            fecha = fechaObj.toLocaleString('es-MX', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
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
