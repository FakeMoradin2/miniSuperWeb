// frontend/js/dashboard.js
// usa window.api (api.js)
async function loadDashboard(){
  try {
    console.log('Cargando dashboard...');
    
    // Ventas del día
    const today = new Date();
    const f = d => d.toISOString().slice(0,10);
    const inicio = f(today);
    const fin = f(today);
    
    console.log('Fecha consulta:', inicio, fin);
    
    // Llamada al reporteDia
    const data = await window.api.reportes.reporteDia(`?inicio=${inicio}&fin=${fin}`);
    console.log('Datos recibidos del reporte:', data);
    
    // Actualizar métricas principales
    document.getElementById('ventasDia').textContent = data.total ? `$${Number(data.total).toFixed(2)}` : '$0.00';
    document.getElementById('prodVendidos').textContent = data.productos_vendidos ?? data.total_productos ?? 0;
    document.getElementById('clientesAtendidos').textContent = data.clientes_atendidos ?? data.total_clientes ?? 0;
    
    // Cargar productos bajo stock
    await loadBajoStock();
    
    // Cargar ventas recientes
    await loadVentasRecientes();

  } catch (err) {
    console.error('Error cargando dashboard:', err);
    // mostrar estado por defecto
    document.getElementById('ventasDia').textContent = '$0.00';
    document.getElementById('prodVendidos').textContent = '0';
    document.getElementById('clientesAtendidos').textContent = '0';
    document.getElementById('bajoStock').textContent = '0';
  }
}

// Cargar productos bajo stock
async function loadBajoStock() {
  try {
    console.log('Cargando productos bajo stock...');
    const bajoStockData = await window.api.stock.obtenerBajoStock();
    console.log('Datos bajo stock:', bajoStockData);
    
    let bajoStockCount = 0;
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(bajoStockData)) {
      bajoStockCount = bajoStockData.length;
    } else if (bajoStockData?.data && Array.isArray(bajoStockData.data)) {
      bajoStockCount = bajoStockData.data.length;
    } else if (bajoStockData?.productos_bajo_stock !== undefined) {
      bajoStockCount = bajoStockData.productos_bajo_stock;
    } else if (bajoStockData?.total !== undefined) {
      bajoStockCount = bajoStockData.total;
    }
    
    document.getElementById('bajoStock').textContent = bajoStockCount;
    
  } catch (error) {
    console.error('Error cargando bajo stock:', error);
    document.getElementById('bajoStock').textContent = '0';
  }
}

// Cargar ventas recientes
async function loadVentasRecientes() {
  try {
    console.log('Cargando ventas recientes...');
    
    // Intentar cargar desde diferentes endpoints
    let ventasData;
    
    try {
      // Primero intentar con el endpoint de dashboard
      ventasData = await window.api.dashboard.ventasRecientes(8);
    } catch (error) {
      console.log('Error con dashboard endpoint, intentando con reportes...');
      // Si falla, intentar con reportes
      const today = new Date();
      const inicio = today.toISOString().slice(0,10);
      const fin = today.toISOString().slice(0,10);
      ventasData = await window.api.reportes.reporteDia(`?inicio=${inicio}&fin=${fin}`);
      ventasData = ventasData.ventas || [];
    }
    
    console.log('Ventas recientes:', ventasData);
    
    const ventasTbl = document.querySelector('#ventasRecientesTable tbody');
    ventasTbl.innerHTML = '';
    
    let ventasArray = [];
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(ventasData)) {
      ventasArray = ventasData;
    } else if (ventasData?.data && Array.isArray(ventasData.data)) {
      ventasArray = ventasData.data;
    } else if (ventasData?.ventas && Array.isArray(ventasData.ventas)) {
      ventasArray = ventasData.ventas;
    }
    
    if (ventasArray.length === 0) {
      ventasTbl.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--gray);">
            No hay ventas recientes
          </td>
        </tr>
      `;
      return;
    }
    
    ventasArray.slice(0, 8).forEach(venta => {
      const tr = document.createElement('tr');
      
      // Formatear fecha
      let fechaFormateada = '';
      if (venta.fecha || venta.fecha_hora || venta.creado_en) {
        const fecha = new Date(venta.fecha || venta.fecha_hora || venta.creado_en);
        fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // Determinar estado
      let estado = 'Completada';
      let estadoClass = 'success';
      if (venta.estado_venta || venta.estado) {
        estado = venta.estado_venta || venta.estado;
        if (estado.toLowerCase() === 'cancelada') {
          estadoClass = 'danger';
        }
      }
      
      tr.innerHTML = `
        <td>${venta.id_venta ?? venta.id ?? venta.idVenta ?? 'N/A'}</td>
        <td>${fechaFormateada}</td>
        <td>${venta.cliente ?? venta.nombre_cliente ?? venta.cliente_nombre ?? 'Cliente General'}</td>
        <td>$${formatCurrency(venta.total ?? venta.total_venta ?? 0)}</td>
        <td>${venta.metodo_pago ?? venta.metodo ?? 'Efectivo'}</td>
        <td><span class="badge ${estadoClass}">${estado}</span></td>
      `;
      ventasTbl.appendChild(tr);
    });
    
  } catch (error) {
    console.error('Error cargando ventas recientes:', error);
    const ventasTbl = document.querySelector('#ventasRecientesTable tbody');
    ventasTbl.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--danger);">
          Error al cargar ventas
        </td>
      </tr>
    `;
  }
}

// Función auxiliar para formatear moneda
function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

// Cargar dashboard cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, iniciando dashboard...');
  loadDashboard();
  
  // Recargar cada 30 segundos para datos en tiempo real
  setInterval(loadDashboard, 30000);
});
