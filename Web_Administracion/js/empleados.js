// js/empleados.js - Versión corregida basada en proveedores.js
document.addEventListener('DOMContentLoaded', function() {
    const btnAddEmpleado = document.getElementById('btnAddEmpleado');
    const btnUpdateEmpleado = document.getElementById('btnUpdateEmpleado');
    const modal = document.getElementById('editEmpleadoModal');
    const closeBtn = document.querySelector('.close');
    let empleadoEditId = null;
    let empleadosData = []; // Almacenar datos de empleados

    // Cargar empleados al iniciar
    cargarEmpleados();

    // Agregar nuevo empleado
    btnAddEmpleado.addEventListener('click', async function() {
        const nombre = document.getElementById('nombreUsuario').value.trim();
        const telefono = document.getElementById('telefonoEmpleado').value.trim();
        const password = document.getElementById('passwordEmpleado').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const rol = document.getElementById('rolEmpleado').value;

        // Validaciones
        if (!nombre) {
            alert('El nombre de usuario es obligatorio');
            return;
        }

        if (!telefono || telefono.length !== 10) {
            alert('El teléfono debe tener 10 dígitos');
            return;
        }

        if (!password || password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!rol) {
            alert('Debe seleccionar un rol');
            return;
        }

        const empleadoData = {
            nombre_usuario: nombre,
            telefono: telefono,
            password: password,
            rol: rol
        };

        try {
            // Registrar en la API de auth (igual que clientes)
            const response = await window.api.auth.register(empleadoData);
            
            if (response.success) {
                // Guardar en localStorage para mostrar en la tabla
                const list = JSON.parse(localStorage.getItem('minisuper_empleados') || '[]');
                const nuevoEmpleado = {
                    usuario_id: Date.now(), // ID temporal
                    nombre_usuario: nombre,
                    telefono: telefono,
                    rol: rol,
                    estado: 'activo',
                    creado_en: new Date().toISOString()
                };
                list.unshift(nuevoEmpleado);
                localStorage.setItem('minisuper_empleados', JSON.stringify(list));
                
                alert('Empleado registrado correctamente');
                limpiarFormularioEmpleado();
                cargarEmpleados();
            } else {
                alert('Error al registrar empleado: ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar empleado: ' + (error.message || 'Error desconocido'));
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

    // Cargar lista de empleados
    async function cargarEmpleados() {
        try {
            const response = await window.api.empleados.getAll();
            
            const tbody = document.querySelector('#empleadosTable tbody');
            tbody.innerHTML = '';

            // Manejar diferentes formatos de respuesta
            let empleadosArray = [];
            
            if (response.data && Array.isArray(response.data)) {
                empleadosArray = response.data;
            } else if (Array.isArray(response)) {
                empleadosArray = response;
            } else {
                empleadosArray = [];
            }

            // Guardar datos para usar en otras funciones
            empleadosData = empleadosArray;

            if (empleadosArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay empleados registrados</td></tr>';
                return;
            }

            empleadosArray.forEach(empleado => {
                const isActive = empleado.estado !== 'inactivo';
                const fechaRegistro = empleado.creado_en ? 
                    new Date(empleado.creado_en).toLocaleDateString('es-ES') : 
                    'No especificado';
                
                const tr = document.createElement('tr');
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
                    <td><span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <button class="btn small" onclick="editarEmpleado(${empleado.usuario_id})">Editar</button>
                        <button class="btn small ${isActive ? 'danger' : 'success'}" onclick="cambiarEstadoEmpleado(${empleado.usuario_id}, ${isActive})">
                            ${isActive ? 'Desactivar' : 'Activar'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            const tbody = document.querySelector('#empleadosTable tbody');
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error al cargar empleados</td></tr>';
        }
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
    window.editarEmpleado = async function(id) {
        try {
            const empleado = empleadosData.find(p => p.usuario_id == id);
            if (empleado) {
                document.getElementById('editNombreUsuario').value = empleado.nombre_usuario || '';
                document.getElementById('editTelefonoEmpleado').value = empleado.telefono || '';
                document.getElementById('editRolEmpleado').value = empleado.rol || '';
                document.getElementById('editEstadoEmpleado').value = empleado.estado === 'inactivo' ? 'inactivo' : 'activo';
                empleadoEditId = id;
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar datos del empleado');
        }
    };

    // Actualizar empleado
    btnUpdateEmpleado.addEventListener('click', async function() {
        const nombre = document.getElementById('editNombreUsuario').value;
        const telefono = document.getElementById('editTelefonoEmpleado').value;
        const rol = document.getElementById('editRolEmpleado').value;
        const estado = document.getElementById('editEstadoEmpleado').value;

        if (!nombre) {
            alert('El nombre de usuario es obligatorio');
            return;
        }

        if (!telefono || telefono.length !== 10) {
            alert('El teléfono debe tener 10 dígitos');
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
                alert('Empleado actualizado correctamente');
                modal.style.display = 'none';
                cargarEmpleados();
            } else {
                alert('Error al actualizar empleado: ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar empleado: ' + (error.message || 'Error desconocido'));
        }
    });

    // Cambiar estado del empleado (Activar/Desactivar)
    window.cambiarEstadoEmpleado = async function(id, estaActivo) {
        const accion = estaActivo ? 'desactivar' : 'activar';
        const confirmacion = confirm(`¿Estás seguro de que deseas ${accion} este empleado?`);
        
        if (confirmacion) {
            try {
                const empleadoData = {
                    usuario_id: id,
                    estado: estaActivo ? 'inactivo' : 'activo'
                };

                const response = await window.api.empleados.update(empleadoData);

                if (response.success) {
                    alert(`Empleado ${accion}do correctamente`);
                    cargarEmpleados();
                } else {
                    alert(`Error al ${accion} empleado: ` + (response.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al ${accion} empleado: ` + (error.message || 'Error desconocido'));
            }
        }
    };

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