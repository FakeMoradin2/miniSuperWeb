// js/empleados.js - Versión corregida basada en inventory.js con filtro de cajeros
let empleadosOriginales = [];
let empleadosFiltrados = [];

document.addEventListener('DOMContentLoaded', function() {
    const btnAddEmpleado = document.getElementById('btnAddEmpleado');
    const btnUpdateEmpleado = document.getElementById('btnUpdateEmpleado');
    const modal = document.getElementById('editEmpleadoModal');
    const closeBtn = document.querySelector('.close');
    let empleadoEditId = null;

    // Cargar empleados al iniciar
    loadEmpleados();

    // Agregar nuevo empleado
    btnAddEmpleado.addEventListener('click', async function() {
        const nombre = document.getElementById('nombreUsuario').value.trim();
        const telefono = document.getElementById('telefonoEmpleado').value.trim();
        const password = document.getElementById('passwordEmpleado').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const rol = document.getElementById('rolEmpleado').value;

        // Validaciones
        if (!nombre) {
            showWarning('El nombre de usuario es obligatorio');
            return;
        }

        if (!telefono || telefono.length !== 10) {
            showWarning('El teléfono debe tener 10 dígitos');
            return;
        }

        if (!password || password.length < 8) {
            showWarning('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            showWarning('Las contraseñas no coinciden');
            return;
        }

        if (!rol) {
            showWarning('Debe seleccionar un rol');
            return;
        }

        const empleadoData = {
            nombre_usuario: nombre,
            telefono: telefono,
            password: password,
            rol: rol
        };

        try {
            // Registrar en la API de auth
            const response = await window.api.auth.register(empleadoData);
            
            if (response.success) {
                showSuccess('Empleado registrado correctamente');
                limpiarFormularioEmpleado();
                await loadEmpleados(); // Recargar la lista desde la base de datos
            } else {
                showError('Error al registrar empleado.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error al registrar empleado.');
        }
    });

    // Limpiar formulario de empleado
    function limpiarFormularioEmpleado() {
        document.getElementById('nombreUsuario').value = '';
        document.getElementById('telefonoEmpleado').value = '';
        document.getElementById('passwordEmpleado').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('rolEmpleado').value = '';
    }

    // Cargar lista de empleados desde la API
    async function loadEmpleados() {
        try {
            console.log('Cargando empleados desde la API...');
            
            const response = await window.api.empleados.getAll();
            
            // Manejar diferentes formatos de respuesta como en inventory.js
            let empleadosArray = [];
            
            if (response?.data && Array.isArray(response.data)) {
                empleadosArray = response.data;
            } else if (Array.isArray(response)) {
                empleadosArray = response;
            } else {
                console.error('La respuesta de empleados no es un array:', response);
                empleadosArray = [];
            }
            
            console.log('Empleados cargados:', empleadosArray);
            empleadosOriginales = empleadosArray;
            
            // Aplicar filtro para mostrar solo cajeros
            aplicarFiltroCajeros();
            
        } catch (error) {
            console.error('Error cargando empleados:', error);
            const tbody = document.querySelector('#empleadosTable tbody');
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Error al cargar empleados</td></tr>';
        }
    }

    // Función para filtrar solo cajeros (similar a aplicarFiltros en inventory.js)
    function aplicarFiltroCajeros() {
        empleadosFiltrados = empleadosOriginales.filter(empleado => 
            (empleado.rol || '').toLowerCase() === 'cajero'
        );
        
        console.log('Cajeros filtrados:', empleadosFiltrados);
        renderizarEmpleadosTabla(empleadosFiltrados);
    }

    // Función para renderizar la tabla de empleados (similar a inventory.js)
    function renderizarEmpleadosTabla(empleados) {
        if (!Array.isArray(empleados)) {
            console.error('renderizarEmpleadosTabla: empleados no es un array:', empleados);
            empleados = [];
        }
        
        const tbody = document.querySelector('#empleadosTable tbody');
        if (!tbody) {
            console.error('No se encontró el elemento #empleadosTable tbody');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (empleados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay cajeros registrados</td></tr>';
            return;
        }
        
        empleados.forEach(empleado => {
            const tr = document.createElement('tr');
            const fechaRegistro = empleado.creado_en ? 
                new Date(empleado.creado_en).toLocaleDateString('es-ES') : 
                'No especificado';
            
            tr.innerHTML = `
                <td>${empleado.usuario_id || ''}</td>
                <td>${empleado.nombre_usuario || ''}</td>
                <td>${empleado.telefono || 'No especificado'}</td>
                <td>
                    <span class="badge ${getBadgeClass(empleado.rol)}">
                        ${empleado.rol || 'No especificado'}
                    </span>
                </td>
                <td>${fechaRegistro}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Función para obtener clase del badge según el rol
    function getBadgeClass(rol) {
        switch(rol) {
            case 'admin': return 'danger';
            case 'cajero': return 'warning';
            case 'cliente': return 'success';
            default: return 'secondary';
        }
    }

    // Editar empleado
    function editarEmpleado(empleado) {
        document.getElementById('editNombreUsuario').value = empleado.nombre_usuario || '';
        document.getElementById('editTelefonoEmpleado').value = empleado.telefono || '';
        document.getElementById('editRolEmpleado').value = empleado.rol || '';
        document.getElementById('editEstadoEmpleado').value = empleado.estado === 'inactivo' ? 'inactivo' : 'activo';
        empleadoEditId = empleado.usuario_id;
        modal.style.display = 'block';
    }

    // Actualizar empleado
    btnUpdateEmpleado.addEventListener('click', async function() {
        const nombre = document.getElementById('editNombreUsuario').value;
        const telefono = document.getElementById('editTelefonoEmpleado').value;
        const rol = document.getElementById('editRolEmpleado').value;
        const estado = document.getElementById('editEstadoEmpleado').value;

        if (!nombre) {
            showWarning('El nombre de usuario es obligatorio');
            return;
        }

        if (!telefono || telefono.length !== 10) {
            showWarning('El teléfono debe tener 10 dígitos');
            return;
        }

        const empleadoData = {
            usuario_id: empleadoEditId,
            nombre_usuario: nombre,
            telefono: telefono,
            rol: rol,
            estado: estado
        };

        try {
            const response = await window.api.empleados.update(empleadoData);
            
            if (response.success) {
                showSuccess('Empleado actualizado correctamente');
                modal.style.display = 'none';
                await loadEmpleados(); // Recargar desde la base de datos
            } else {
                showError('Error al actualizar empleado.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error al actualizar empleado.');
        }
    });

    // Cerrar modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Validación de teléfono en tiempo real
    const telefonoInput = document.getElementById('telefonoEmpleado');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
        });
    }

    const editTelefonoInput = document.getElementById('editTelefonoEmpleado');
    if (editTelefonoInput) {
        editTelefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
        });
    }
});