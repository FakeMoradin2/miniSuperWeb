// js/proveedores.js
document.addEventListener('DOMContentLoaded', function() {
    const btnAddProveedor = document.getElementById('btnAddProveedor');
    const btnUpdateProveedor = document.getElementById('btnUpdateProveedor');
    const modal = document.getElementById('editProveedorModal');
    const closeBtn = document.querySelector('.close');
    let proveedorEditId = null;
    let proveedoresData = []; // Almacenar datos de proveedores

    // Cargar proveedores al iniciar
    cargarProveedores();

    // Agregar nuevo proveedor
    btnAddProveedor.addEventListener('click', async function() {
        const nombre = document.getElementById('nombreProveedor').value;
        const telefono = document.getElementById('telefonoProveedor').value;
        const correo = document.getElementById('correoProveedor').value;

        if (!nombre) {
            showWarning('El nombre del proveedor es obligatorio');
            return;
        }

        const proveedorData = {
            nombre_proveedor: nombre,
            telefono_proveedor: telefono,
            correo_proveedor: correo
        };

        try {
            const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/proveedores/agregar.php`, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(proveedorData)
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const result = await response.json();
            showSuccess('Proveedor agregado correctamente');
            limpiarFormularioProveedor();
            cargarProveedores();
        } catch (error) {
            console.error('Error:', error);
            showError('Error al agregar proveedor.');
        }
    });

    // Limpiar formulario de proveedor
    function limpiarFormularioProveedor() {
        document.getElementById('nombreProveedor').value = '';
        document.getElementById('telefonoProveedor').value = '';
        document.getElementById('correoProveedor').value = '';
    }

    // Cargar lista de proveedores
    async function cargarProveedores() {
        try {
            const response = await window.api.proveedores.listar();
            
            // Debug: ver qué devuelve la API
            console.log('Respuesta de proveedores:', response);
            
            const tbody = document.querySelector('#proveedoresTable tbody');
            tbody.innerHTML = '';

            // Manejar diferentes formatos de respuesta
            let proveedoresArray = [];
            
            if (Array.isArray(response)) {
                proveedoresArray = response;
            } else if (response && Array.isArray(response.data)) {
                proveedoresArray = response.data;
            } else if (response && response.proveedores) {
                proveedoresArray = response.proveedores;
            } else if (response && typeof response === 'object') {
                // Si es un objeto, convertirlo a array
                proveedoresArray = Object.values(response);
            } else {
                console.warn('Formato de respuesta inesperado:', response);
                proveedoresArray = [];
            }

            // Guardar datos para usar en otras funciones
            proveedoresData = proveedoresArray;

            if (proveedoresArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay proveedores registrados</td></tr>';
                return;
            }

            proveedoresArray.forEach(proveedor => {
                const isActive = (proveedor.activo_proveedor !== false && proveedor.activo_proveedor !== 0);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${proveedor.Id_proveedor || proveedor.id || ''}</td>
                    <td>${proveedor.nombre_proveedor || proveedor.nombre || ''}</td>
                    <td>${proveedor.telefono_proveedor || proveedor.telefono || 'No especificado'}</td>
                    <td>${proveedor.correo_proveedor || proveedor.correo || 'No especificado'}</td>
                    <td><span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <button class="btn small" onclick="editarProveedor(${proveedor.Id_proveedor || proveedor.id})">Editar</button>
                        <button class="btn small ${isActive ? 'danger' : 'success'}" onclick="cambiarEstadoProveedor(${proveedor.Id_proveedor || proveedor.id}, ${isActive})">
                            ${isActive ? 'Desactivar' : 'Activar'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            const tbody = document.querySelector('#proveedoresTable tbody');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error al cargar proveedores: ' + error.message + '</td></tr>';
        }
    }

    // Editar proveedor
    window.editarProveedor = async function(id) {
        try {
            const proveedor = proveedoresData.find(p => (p.Id_proveedor == id || p.id == id));
            if (proveedor) {
                document.getElementById('editNombreProveedor').value = proveedor.nombre_proveedor || proveedor.nombre || '';
                document.getElementById('editTelefonoProveedor').value = proveedor.telefono_proveedor || proveedor.telefono || '';
                document.getElementById('editCorreoProveedor').value = proveedor.correo_proveedor || proveedor.correo || '';
                document.getElementById('editEstadoProveedor').value = (proveedor.activo_proveedor !== false && proveedor.activo_proveedor !== 0) ? 'true' : 'false';
                proveedorEditId = id;
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error al cargar datos del proveedor.');
        }
    };

    // Actualizar proveedor
    btnUpdateProveedor.addEventListener('click', async function() {
        const nombre = document.getElementById('editNombreProveedor').value;
        const telefono = document.getElementById('editTelefonoProveedor').value;
        const correo = document.getElementById('editCorreoProveedor').value;
        const activo = document.getElementById('editEstadoProveedor').value === 'true';

        if (!nombre) {
            showWarning('El nombre del proveedor es obligatorio');
            return;
        }

        const proveedorData = {
            Id_proveedor: proveedorEditId,
            nombre_proveedor: nombre,
            telefono_proveedor: telefono,
            correo_proveedor: correo,
            activo_proveedor: activo
        };

        try {
            const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/proveedores/editar.php`, {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(proveedorData)
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const result = await response.json();
            showSuccess('Proveedor actualizado correctamente');
            modal.style.display = 'none';
            cargarProveedores();
        } catch (error) {
            console.error('Error:', error);
            showError('Error al actualizar proveedor.');
        }
    });

    // Cambiar estado del proveedor (Activar/Desactivar)
    window.cambiarEstadoProveedor = async function(id, estaActivo) {
        const accion = estaActivo ? 'desactivar' : 'activar';
        const confirmacion = confirm(`¿Estás seguro de que deseas ${accion} este proveedor?`);
        
        if (confirmacion) {
            try {
                // Usamos editar.php para cambiar el estado
                const proveedorData = {
                    Id_proveedor: id,
                    activo_proveedor: !estaActivo // Cambiamos el estado
                };

                const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/proveedores/editar.php`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(proveedorData)
                });
                
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }

                const result = await response.json();
                showSuccess(`Proveedor ${accion}do correctamente`);
                cargarProveedores();
            } catch (error) {
                console.error('Error:', error);
                showError(`Error al ${accion} proveedor.`);
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
});