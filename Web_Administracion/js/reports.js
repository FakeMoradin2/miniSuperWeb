// frontend/js/reportes.js
document.getElementById('btnVerReporte').addEventListener('click', async ()=>{
  const inicio = document.getElementById('fechaInicio').value;
  const fin = document.getElementById('fechaFin').value;
  if(!inicio || !fin){ alert('Selecciona fecha inicio y fin'); return; }
  try{
    const resumen = await api.reportes.reporteDia(`?inicio=${inicio}&fin=${fin}`);
    // mostrar totales: ajustar segun la respuesta de la API
    document.getElementById('resumenTotales').innerHTML = `
      <strong>Total ventas:</strong> $${(resumen.total ?? 0).toFixed ? (resumen.total).toFixed(2) : (resumen.total ?? 0)}<br>
      <strong>Transacciones:</strong> ${resumen.transacciones ?? resumen.count ?? 0}
    `;

    const top = await api.reportes.productosTop(`?inicio=${inicio}&fin=${fin}`);
    const tbody = document.querySelector('#topProductosTable tbody'); tbody.innerHTML='';
    (top || []).forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.nombre_producto ?? p.nombre}</td><td>${p.cantidad ?? p.ventas ?? 0}</td><td>$${(p.total ?? 0).toFixed ? (p.total).toFixed(2) : p.total ?? 0}</td>`;
      tbody.appendChild(tr);
    });
  }catch(err){ console.error(err); alert('Error al cargar reporte'); }
});
