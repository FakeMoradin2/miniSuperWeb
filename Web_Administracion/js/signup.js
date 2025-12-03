document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const btnAddEmpleado = document.getElementById('btnAddEmpleado');
    const btnUpdateEmpleado = document.getElementById('btnUpdateEmpleado');
    const empleadosTable = document.getElementById('empleadosTable');
    const editModal = document.getElementById('editEmpleadoModal');
    const closeModal = document.querySelector('.close');
    
    // Variables globales
    let empleados = [];
    let empleadoEditando = null;

    // Inicializar
    cargarEmpleados();
    inicializarEventos();

    function inicializarEventos() {
        // Registrar empleado
        btnAddEmpleado.addEventListener('click', registrarEmpleado);
        
        // Actualizar empleado
        btnUpdateEmpleado.addEventListener('click', actualizarEmpleado);
        
        // Cerrar modal
        closeModal.addEventListener('click', cerrarModal);
        
        // Validación de teléfono en tiempo real
        const telefonoInput = document.getElementById('telefonoEmpleado');
        if (telefonoInput) {
            telefonoInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').substring(0, 10);
            });
        }
        
        // Validación de teléfono en modal
        const editTelefonoInput = document.getElementById('editTelefonoEmpleado');
        if (editTelefonoInput) {
            editTelefonoInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').substring(0, 10);
            });
        }
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === editModal) {
                cerrarModal();
            }
        });
    }

    async function cargarEmpleados() {
        try {
            // Usar la API existente o crear una nueva para empleados
            const response = await window.api.empleados.getAll();
            
            if (response.success) {
                empleados = response.data;
                mostrarEmpleados();
            } else {
                console.error('Error al cargar empleados:', response.message);
                mostrarError('Error al cargar los empleados');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al cargar empleados');
        }
    }

    function mostrarEmpleados() {
        const tbody = empleadosTable.querySelector('tbody');
        tbody.innerHTML = '';

        if (empleados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--gray);">
                        No hay empleados registrados
                    </td>
                </tr>
            `;
            return;
        }

        empleados.forEach(empleado => {
            const fila = document.createElement('tr');
            const fechaRegistro = new Date(empleado.creado_en).toLocaleDateString('es-ES');
            
            fila.innerHTML = `
                <td>${empleado.usuario_id}</td>
                <td>${empleado.nombre_usuario}</td>
                <td>${empleado.telefono}</td>
                <td>
                    <span class="badge ${getBadgeClass(empleado.rol)}">
                        ${empleado.rol}
                    </span>
                </td>
                <td>${fechaRegistro}</td>
                <td>
                    <span class="badge ${empleado.estado === 'activo' ? 'success' : 'danger'}">
                        ${empleado.estado || 'activo'}
                    </span>
                </td>
                <td>
                    <button class="btn small primary" onclick="editarEmpleado(${empleado.usuario_id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn small danger" onclick="eliminarEmpleado(${empleado.usuario_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    }

    function getBadgeClass(rol) {
        switch(rol) {
            case 'admin': return 'danger';
            case 'cajero': return 'warning';
            case 'cliente': return 'success';
            default: return 'secondary';
        }
    }

    async function registrarEmpleado() {
        // Obtener datos del formulario
        const nombreUsuario = document.getElementById('nombreUsuario').value.trim();
        const telefono = document.getElementById('telefonoEmpleado').value.trim();
        const password = document.getElementById('passwordEmpleado').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const rol = document.getElementById('rolEmpleado').value;

        // Validaciones
        if (!nombreUsuario || !telefono || !password || !rol) {
            mostrarError('Todos los campos son obligatorios');
            return;
        }

        if (nombreUsuario.length < 3) {
            mostrarError('El nombre de usuario debe tener al menos 3 caracteres');
            return;
        }

        if (telefono.length !== 10) {
            mostrarError('El teléfono debe tener 10 dígitos');
            return;
        }

        if (password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }

        try {
            btnAddEmpleado.disabled = true;
            btnAddEmpleado.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

            const empleadoData = {
                nombre_usuario: nombreUsuario,
                telefono: telefono,
                password: password,
                rol: rol
            };

            // Usar el endpoint de registro de la API de auth
            const response = await window.api.auth.register(empleadoData);

            if (response.success) {
                mostrarExito('Empleado registrado exitosamente');
                limpiarFormulario();
                cargarEmpleados();
            } else {
                mostrarError(response.message || 'Error al registrar empleado');
            }

        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al registrar empleado');
        } finally {
            btnAddEmpleado.disabled = false;
            btnAddEmpleado.innerHTML = 'Registrar Empleado';
        }
    }

    function editarEmpleado(usuarioId) {
        const empleado = empleados.find(e => e.usuario_id === usuarioId);
        if (!empleado) return;

        empleadoEditando = empleado;

        // Llenar el modal con los datos del empleado
        document.getElementById('editNombreUsuario').value = empleado.nombre_usuario;
        document.getElementById('editTelefonoEmpleado').value = empleado.telefono;
        document.getElementById('editRolEmpleado').value = empleado.rol;
        document.getElementById('editEstadoEmpleado').value = empleado.estado || 'activo';

        // Mostrar modal
        editModal.style.display = 'block';
    }

    async function actualizarEmpleado() {
        if (!empleadoEditando) return;

        const nombreUsuario = document.getElementById('editNombreUsuario').value.trim();
        const telefono = document.getElementById('editTelefonoEmpleado').value.trim();
        const rol = document.getElementById('editRolEmpleado').value;
        const estado = document.getElementById('editEstadoEmpleado').value;

        // Validaciones
        if (!nombreUsuario || !telefono || !rol) {
            mostrarError('Todos los campos son obligatorios');
            return;
        }

        if (telefono.length !== 10) {
            mostrarError('El teléfono debe tener 10 dígitos');
            return;
        }

        try {
            btnUpdateEmpleado.disabled = true;
            btnUpdateEmpleado.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';

            const updateData = {
                usuario_id: empleadoEditando.usuario_id,
                nombre_usuario: nombreUsuario,
                telefono: telefono,
                rol: rol,
                estado: estado
            };

            // Usar la API para actualizar empleado
            const response = await window.api.empleados.update(updateData);

            if (response.success) {
                mostrarExito('Empleado actualizado exitosamente');
                cerrarModal();
                cargarEmpleados();
            } else {
                mostrarError(response.message || 'Error al actualizar empleado');
            }

        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al actualizar empleado');
        } finally {
            btnUpdateEmpleado.disabled = false;
            btnUpdateEmpleado.innerHTML = 'Actualizar Empleado';
        }
    }

    async function eliminarEmpleado(usuarioId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            return;
        }

        try {
            const response = await window.api.empleados.delete(usuarioId);

            if (response.success) {
                mostrarExito('Empleado eliminado exitosamente');
                cargarEmpleados();
            } else {
                mostrarError(response.message || 'Error al eliminar empleado');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión al eliminar empleado');
        }
    }

    function cerrarModal() {
        editModal.style.display = 'none';
        empleadoEditando = null;
    }

    function limpiarFormulario() {
        document.getElementById('nombreUsuario').value = '';
        document.getElementById('telefonoEmpleado').value = '';
        document.getElementById('passwordEmpleado').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('rolEmpleado').value = '';
    }

    function mostrarError(mensaje) {
        // Puedes implementar un sistema de notificaciones más elegante
        showError(mensaje);
    }

    function mostrarExito(mensaje) {
        // Puedes implementar un sistema de notificaciones más elegante
        showSuccess(mensaje);
    }

    // Hacer funciones globales para los eventos onclick
    window.editarEmpleado = editarEmpleado;
    window.eliminarEmpleado = eliminarEmpleado;
});