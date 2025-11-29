// frontend/js/customers.js - Versión corregida y funcional
document.addEventListener('DOMContentLoaded', function() {
    const btnAddClient = document.getElementById('btnAddClient');
    const clientesKey = 'minisuper_clientes_local';
    let clientesData = [];

    // Cargar clientes al iniciar
    cargarClientes();

    // Agregar nuevo cliente
    btnAddClient.addEventListener('click', async function() {
        const nombre = document.getElementById('regNombre').value.trim();
        const pass = document.getElementById('regPass').value.trim();
        const tel = document.getElementById('regTel').value.trim();

        // Validaciones
        if (!nombre) {
            alert('El nombre de usuario es obligatorio');
            return;
        }

        if (!pass) {
            alert('La contraseña es obligatoria');
            return;
        }

        if (pass.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (tel && tel.length !== 10) {
            alert('El teléfono debe tener 10 dígitos');
            return;
        }

        const clienteData = {
            nombre_usuario: nombre,
            password: pass,
            telefono: tel || '',
            rol: 'cliente'
        };

        try {
            // Registrar en la API de auth
            const response = await window.api.auth.register(clienteData);
            
            if (response.success) {
                // Guardar en localStorage para mostrar en la tabla
                const list = JSON.parse(localStorage.getItem(clientesKey) || '[]');
                const nuevoCliente = {
                    usuario_id: response.data?.usuario_id || Date.now(),
                    nombre_usuario: nombre,
                    telefono: tel,
                    rol: 'cliente',
                    estado: 'activo',
                    creado_en: new Date().toISOString()
                };
                list.unshift(nuevoCliente);
                localStorage.setItem(clientesKey, JSON.stringify(list));
                
                alert('Cliente registrado correctamente');
                limpiarFormularioCliente();
                cargarClientes();
            } else {
                alert('Error al registrar cliente: ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar cliente: ' + (error.message || 'Error desconocido'));
        }
    });

    // Limpiar formulario de cliente
    function limpiarFormularioCliente() {
        document.getElementById('regNombre').value = '';
        document.getElementById('regPass').value = '';
        document.getElementById('regTel').value = '';
    }

    // Cargar lista de clientes
    async function cargarClientes() {
        try {
            // Obtener clientes del localStorage
            const clientesLocal = JSON.parse(localStorage.getItem(clientesKey) || '[]');
            
            // También intentar obtener de la API si existe endpoint
            let clientesAPI = [];
            try {
                // Si tienes endpoint para listar clientes, puedes usarlo aquí
                const apiResponse = await window.api.clientes.listar();
                if (apiResponse.success && Array.isArray(apiResponse.data)) {
                    clientesAPI = apiResponse.data;
                } else if (Array.isArray(apiResponse)) {
                    clientesAPI = apiResponse;
                }
            } catch (apiError) {
                console.log('No se pudo cargar clientes desde API, usando localStorage:', apiError);
            }

            // Combinar datos (priorizar localStorage para consistencia)
            clientesData = [...clientesLocal, ...clientesAPI.filter(apiCli => 
                !clientesLocal.some(localCli => localCli.usuario_id === apiCli.usuario_id)
            )];

            const tbody = document.querySelector('#clientesTable tbody');
            tbody.innerHTML = '';

            if (clientesData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay clientes registrados</td></tr>';
                return;
            }

            clientesData.forEach(cliente => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cliente.nombre_usuario || ''}</td>
                    <td>${cliente.telefono || 'No especificado'}</td>
                    <td>
                        <button class="btn small danger" onclick="eliminarCliente(${cliente.usuario_id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            const tbody = document.querySelector('#clientesTable tbody');
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Error al cargar clientes</td></tr>';
        }
    }

    // Eliminar cliente
    window.eliminarCliente = async function(id) {
        const confirmacion = confirm('¿Estás seguro de que deseas eliminar este cliente?');
        
        if (confirmacion) {
            try {
                // Eliminar de localStorage
                const list = JSON.parse(localStorage.getItem(clientesKey) || '[]');
                const nuevosClientes = list.filter(cli => cli.usuario_id != id);
                localStorage.setItem(clientesKey, JSON.stringify(nuevosClientes));
                
                // También intentar eliminar de la API si existe endpoint
                try {
                    await window.api.clientes.eliminar({ usuario_id: id });
                } catch (apiError) {
                    console.log('No se pudo eliminar cliente de API:', apiError);
                }
                
                alert('Cliente eliminado correctamente');
                cargarClientes();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar cliente: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    // Validación de teléfono en tiempo real
    const telefonoInput = document.getElementById('regTel');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
        });
    }

    // Buscar clientes
    window.buscarClientes = function() {
        const termino = document.getElementById('buscarCliente').value.toLowerCase().trim();
        const filas = document.querySelectorAll('#clientesTable tbody tr');
        
        filas.forEach(fila => {
            const nombre = fila.cells[0].textContent.toLowerCase();
            const telefono = fila.cells[1].textContent.toLowerCase();
            
            if (nombre.includes(termino) || telefono.includes(termino)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    };
});
