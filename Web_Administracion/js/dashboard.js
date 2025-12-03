// frontend/js/dashboard.js
// usa window.api (api.js)
function formatDateLocal(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

async function loadDashboard(){
  try {
    console.log('Cargando dashboard...');
    
    // Fechas de hoy y ayer
    const today = new Date();
    const inicio = formatDateLocal(today);
    const fin = formatDateLocal(today);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);
    const ayerInicio = formatDateLocal(yesterday);
    const ayerFin = ayerInicio;
    
    console.log('Fecha consulta hoy:', inicio, fin);
    
    // Cargar ventas usando historial (igual que reportes)
    let ventasBackend = [];
    try {
      const query = `?inicio=${inicio}&fin=${fin}`;
      const ventasResponse = await window.api.reportes.historial(query);
      console.log('Respuesta historial backend:', JSON.stringify(ventasResponse, null, 2));
      
      if(Array.isArray(ventasResponse)) {
        ventasBackend = ventasResponse;
      } else if(ventasResponse?.success && Array.isArray(ventasResponse?.data)) {
        ventasBackend = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.data)) {
        ventasBackend = ventasResponse.data;
      } else if(Array.isArray(ventasResponse?.ventas)) {
        ventasBackend = ventasResponse.ventas;
      }

      // Filtrar por fecha de hoy (igual que en reportes.js)
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
      
      console.log('Ventas filtradas de hoy:', ventasBackend.length);
    } catch(error) {
      console.warn('Error cargando historial desde backend:', error);
    }
    
    // Filtrar solo confirmadas (igual que reportes)
    const ventasHoy = ventasBackend.filter(v => {
      const estado = v?.estado ?? v?.estado_venta ?? '';
      return estado === 'confirmada' || estado === 'completada';
    });
    
    console.log('Ventas confirmadas de hoy:', ventasHoy.length);
    
    // Guardar globalmente para la tabla de ventas recientes
    window.__ventasHoy = ventasHoy;
    
    // Calcular métricas del día
    let totalVentas = 0;
    let totalProductos = 0;
    const clientesSet = new Set();
    
    ventasHoy.forEach(v => {
      const total = Number(v?.total ?? v?.monto_total ?? v?.precio_total ?? 0);
      totalVentas += total;
      
      const productos = Number(v?.cantidad_total ?? v?.total_items ?? v?.productos ?? 0);
      totalProductos += productos;
      
      const idCliente = v?.cliente_id ?? v?.id_cliente ?? v?.cliente ?? v?.nombre_cliente ?? v?.cliente_nombre;
      if (idCliente) clientesSet.add(String(idCliente));
    });
    
    const clientesAtendidos = clientesSet.size > 0 ? clientesSet.size : ventasHoy.length;
    
    // Actualizar métricas principales
    document.getElementById('ventasDia').textContent = `$${totalVentas.toFixed(2)}`;
    document.getElementById('prodVendidos').textContent = totalProductos;
    document.getElementById('clientesAtendidos').textContent = clientesAtendidos;
    
    // Cambio vs. ayer
    try {
      const queryAyer = `?inicio=${ayerInicio}&fin=${ayerFin}`;
      const ventasAyerResponse = await window.api.reportes.historial(queryAyer);
      let ventasAyerBackend = [];
      
      if(Array.isArray(ventasAyerResponse)) {
        ventasAyerBackend = ventasAyerResponse;
      } else if(ventasAyerResponse?.data && Array.isArray(ventasAyerResponse.data)) {
        ventasAyerBackend = ventasAyerResponse.data;
      } else if(Array.isArray(ventasAyerResponse?.ventas)) {
        ventasAyerBackend = ventasAyerResponse.ventas;
      }
      
      // Filtrar por fecha de ayer
      if(ventasAyerBackend.length > 0) {
        const inicioDate = new Date(ayerInicio);
        const finDate = new Date(`${ayerFin}T23:59:59`);
        ventasAyerBackend = ventasAyerBackend.filter(v => {
          const fechaStr = v?.fecha ?? v?.creada_en_venta ?? v?.creada_en ?? v?.creada_enVenta;
          if(!fechaStr) return false;
          const fechaVenta = new Date(fechaStr);
          if(isNaN(fechaVenta.getTime())) return false;
          return fechaVenta >= inicioDate && fechaVenta <= finDate;
        });
      }
      
      const ventasAyer = ventasAyerBackend.filter(v => {
        const estado = v?.estado ?? v?.estado_venta ?? '';
        return estado === 'confirmada' || estado === 'completada';
      });
      
      let totalAyer = 0;
      ventasAyer.forEach(v => {
        totalAyer += Number(v?.total ?? v?.monto_total ?? v?.precio_total ?? 0);
      });
      
      let cambioTxt = '-';
      if (totalAyer > 0) {
        const diff = totalVentas - totalAyer;
        const pct = (diff / totalAyer) * 100;
        const sign = diff >= 0 ? '+' : '';
        cambioTxt = `${sign}${pct.toFixed(1)}% vs ayer`;
      } else if (totalVentas > 0) {
        cambioTxt = '+100% vs ayer';
      }
      const ventasCambioEl = document.getElementById('ventasCambio');
      if (ventasCambioEl) ventasCambioEl.textContent = cambioTxt;
    } catch (e) {
      console.warn('No se pudo calcular cambio vs ayer');
      const ventasCambioEl = document.getElementById('ventasCambio');
      if (ventasCambioEl) ventasCambioEl.textContent = '-';
    }
    
    // Cargar productos bajo stock
    await loadBajoStock();
    
    // Cargar ventas recientes
    await loadVentasRecientes();

    // Cargar Top 10 productos más vendidos
    await loadTopProductos();

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

// Top 10 productos más vendidos
async function loadTopProductos() {
  try {
    console.log('Cargando Top 10 productos...');
    const hoy = new Date();
    const inicio = formatDateLocal(hoy);
    const fin = inicio;
    let topData = await window.api.reportes.productosTop(`?inicio=${inicio}&fin=${fin}`);

    let items = [];
    if (Array.isArray(topData)) items = topData;
    else if (topData?.data && Array.isArray(topData.data)) items = topData.data;
    else if (topData?.productos && Array.isArray(topData.productos)) items = topData.productos;

    // Si el backend devuelve más de 10, limitar
    items = items.slice(0, 10);

    const tbody = document.querySelector('#topProductosTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:var(--gray)">Sin datos para hoy</td>
        </tr>`;
      return;
    }

    items.forEach((p, idx) => {
      const nombre = p.nombre_producto ?? p.producto ?? p.nombre ?? 'Producto';
      const cantidad = Number(p.cantidad_vendida ?? p.total_cantidad ?? p.cantidad ?? 0);
      const ingresos = Number(p.ingresos ?? p.total_vendido ?? p.monto_total ?? 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${nombre}</td>
        <td>${cantidad}</td>
        <td>$${formatCurrency(ingresos)}</td>`;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error cargando Top 10 productos:', error);
    const tbody = document.querySelector('#topProductosTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:var(--danger)">Error al cargar</td>
        </tr>`;
    }
  }
}

// Cargar ventas recientes
async function loadVentasRecientes() {
  try {
    console.log('Cargando ventas recientes...');
    
    const ventasTbl = document.querySelector('#ventasRecientesTable tbody');
    ventasTbl.innerHTML = '';
    
    // Usar las ventas ya filtradas en loadDashboard
    const ventasArray = Array.isArray(window.__ventasHoy) ? window.__ventasHoy : [];
    
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
      if (venta.fecha || venta.fecha_hora || venta.creado_en || venta.creada_en_venta) {
        let fechaStr = (venta.fecha || venta.fecha_hora || venta.creado_en || venta.creada_en_venta).toString();
        // Si no tiene 'T', agregarlo para que JavaScript lo interprete como hora local
        if (!fechaStr.includes('T') && !fechaStr.includes('Z')) {
          fechaStr = fechaStr.replace(' ', 'T');
        }
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
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
        <td>$${formatCurrency(venta.total ?? venta.total_venta ?? venta.monto_total ?? 0)}</td>
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
