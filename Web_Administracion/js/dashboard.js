// frontend/js/dashboard.js
// usa window.api (api.js)
async function loadDashboard(){
  try {
    // Ventas del día (usar reporteDia.php ?inicio=YYYY-MM-DD&fin=YYYY-MM-DD)
    const today = new Date();
    const f = d => d.toISOString().slice(0,10);
    const inicio = f(today);
    const fin = f(today);
    // Llamada al reporteDia
    const data = await api.reportes.reporteDia(`?inicio=${inicio}&fin=${fin}`);
    // Aquí esperamos que el endpoint devuelva { total: ..., productos_vendidos: ..., clientes_atendidos: ..., ventas: [...] }
    // Si tu API responde diferente, ajusta las claves.
    document.getElementById('ventasDia').textContent = data.total ? `$${Number(data.total).toFixed(2)}` : '$0.00';
    document.getElementById('prodVendidos').textContent = data.productos_vendidos ?? 0;
    document.getElementById('clientesAtendidos').textContent = data.clientes_atendidos ?? 0;
    document.getElementById('bajoStock').textContent = data.productos_bajo_stock ?? 0;

    // Ventas recientes
    const ventasTbl = document.querySelector('#ventasRecientesTable tbody');
    ventasTbl.innerHTML = '';
    const ventas = data.ventas ?? [];
    ventas.slice(0,8).forEach(v=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${v.id_venta ?? v.id ?? v.idVenta ?? ''}</td>
                      <td>${v.fecha ?? v.fecha_hora ?? ''}</td>
                      <td>${v.cliente ?? v.nombre_cliente ?? 'Cliente General'}</td>
                      <td>$${(v.total ?? 0).toFixed ? (v.total).toFixed(2) : v.total ?? '0.00'}</td>
                      <td>${v.metodo_pago ?? v.metodo ?? ''}</td>
                      <td><span class="badge success">${v.estado_venta ?? v.estado ?? 'Completada'}</span></td>`;
      ventasTbl.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    // mostrar estado por defecto
    document.getElementById('ventasDia').textContent = '$0.00';
  }
}

loadDashboard();
