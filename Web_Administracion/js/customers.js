// frontend/js/customers.js - Versión simplificada para mostrar clientes desde BD
let clientesData = [];

document.addEventListener('DOMContentLoaded', function() {
    const btnAddClient = document.getElementById('btnAddClient');

    // Cargar clientes al iniciar
    loadClientes();

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
                alert('Cliente registrado correctamente');
                limpiarFormularioCliente();
                loadClientes();
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

    // Cargar lista de clientes desde la API
    async function loadClientes() {
        try {
            console.log('Cargando clientes desde la API...');
            
            // Obtener todos los usuarios desde la API
            const response = await window.api.empleados.getAll();
            
            // Manejar diferentes formatos de respuesta
            let usuariosArray = [];
            
            if (response?.data && Array.isArray(response.data)) {
                usuariosArray = response.data;
            } else if (Array.isArray(response)) {
                usuariosArray = response;
            } else {
                console.error('La respuesta de usuarios no es un array:', response);
                usuariosArray = [];
            }
            
            console.log('Usuarios cargados:', usuariosArray);
            
            // Filtrar solo los clientes (rol = 'cliente')
            clientesData = usuariosArray.filter(usuario => 
                (usuario.rol || '').toLowerCase() === 'cliente'
            );
            
            console.log('Clientes filtrados:', clientesData);
            renderizarClientesTabla(clientesData);
            
        } catch (error) {
            console.error('Error cargando clientes:', error);
            const tbody = document.querySelector('#clientesTable tbody');
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Error al cargar clientes</td></tr>';
        }
    }

    // Función para renderizar la tabla de clientes
    function renderizarClientesTabla(clientes) {
        if (!Array.isArray(clientes)) {
            console.error('renderizarClientesTabla: clientes no es un array:', clientes);
            clientes = [];
        }
        
        const tbody = document.querySelector('#clientesTable tbody');
        if (!tbody) {
            console.error('No se encontró el elemento #clientesTable tbody');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No hay clientes registrados</td></tr>';
            return;
        }
        
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.nombre_usuario || ''}</td>
                <td>${cliente.telefono || 'No especificado'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Validación de teléfono en tiempo real
    const telefonoInput = document.getElementById('regTel');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
        });
    }
});
