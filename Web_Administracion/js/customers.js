// frontend/js/clientes.js
// Usamos api.auth.register para crear clientes.
// Dependiendo de tu API, es posible que necesites campos extra (rol, correo, etc.)
const clientesKey = 'minisuper_clientes_local';

function loadLocalClients(){
  const tbl = document.querySelector('#clientesTable tbody');
  tbl.innerHTML = '';
  const list = JSON.parse(localStorage.getItem(clientesKey) || '[]');
  list.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.nombre_usuario}</td><td>${c.telefono ?? ''}</td>`;
    tbl.appendChild(tr);
  });
}

document.getElementById('btnAddClient').addEventListener('click', async ()=>{
  const nombre = document.getElementById('regNombre').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const tel = document.getElementById('regTel').value.trim();
  if(!nombre || !pass){ alert('Nombre y password requeridos'); return; }
  try{
    const body = { nombre_usuario: nombre, password: pass, telefono: tel, rol: 'cliente' };
    const res = await api.auth.register(body);
    // guardamos localmente para mostrar en la tabla (y porque no hay endpoint listar usuarios en el PDF)
    const list = JSON.parse(localStorage.getItem(clientesKey) || '[]');
    list.unshift({nombre_usuario: nombre, telefono: tel});
    localStorage.setItem(clientesKey, JSON.stringify(list));
    loadLocalClients();
    alert('Cliente registrado');
    document.getElementById('regNombre').value = ''; document.getElementById('regPass').value=''; document.getElementById('regTel').value='';
  }catch(err){
    console.error(err);
    alert('Error registrando cliente');
  }
});

loadLocalClients();
