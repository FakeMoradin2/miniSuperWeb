// frontend/js/reportes.js
async function cargarReporteRango(inicio, fin){
  try{
    console.log('Cargando reporte del', inicio, 'al', fin);
    
    const resumen = await api.reportes.reporteDia(`?inicio=${inicio}&fin=${fin}`);
    console.log('Respuesta reporteDia completa:', JSON.stringify(resumen, null, 2));
    
    // Extraer valores del resumen (puede estar en diferentes estructuras)
    const totalNum = Number(resumen?.total ?? resumen?.data?.total ?? 0);
    const transNum = Number(resumen?.transacciones ?? resumen?.count ?? resumen?.data?.transacciones ?? 0);
    
    document.getElementById('resumenTotales').innerHTML = `
      <strong>Total ventas:</strong> $${totalNum.toFixed(2)}<br>
      <strong>Transacciones:</strong> ${transNum}
    `;

    const top = await api.reportes.productosTop(`?inicio=${inicio}&fin=${fin}`);
    console.log('Respuesta productosTop completa:', JSON.stringify(top, null, 2));
    
    const tbody = document.querySelector('#topProductosTable tbody'); 
    tbody.innerHTML='';
    
    // Intentar múltiples formas de extraer el array de productos
    let productos = [];
    if(Array.isArray(top)) {
      productos = top;
    } else if(Array.isArray(top?.data)) {
      productos = top.data;
    } else if(Array.isArray(top?.productos)) {
      productos = top.productos;
    } else if(top && typeof top === 'object') {
      // Si es un objeto con propiedades, intentar convertirlo a array
      productos = Object.values(top).filter(item => item && typeof item === 'object');
    }
    
    console.log('Productos extraídos:', productos.length, productos);
    
    if(productos.length === 0){
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="3" style="text-align:center;color:var(--gray)">No hay productos vendidos en este periodo</td>';
      tbody.appendChild(tr);
    } else {
      productos.forEach(p=>{
        const tr = document.createElement('tr');
        const totalProd = Number(p?.total ?? p?.precio_total ?? 0);
        const cantProd = Number(p?.cantidad ?? p?.ventas ?? p?.total_vendido ?? 0);
        const nombreProd = p?.nombre_producto ?? p?.nombre ?? p?.producto ?? 'N/A';
        tr.innerHTML = `<td>${nombreProd}</td><td>${cantProd}</td><td>$${totalProd.toFixed(2)}</td>`;
        tbody.appendChild(tr);
      });
    }
  }catch(err){ 
    console.error('Error en reportes:', err); 
    document.getElementById('resumenTotales').innerHTML = '<span style="color:red">Error al cargar reportes</span>';
    alert('Error al cargar reporte: ' + err.message); 
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
