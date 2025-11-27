// js/categorias.js - Versión con debug mejorado
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Script categorias.js cargado correctamente');

    // Debug: mostrar todos los elementos con ID que contengan "categoria" o "edit"
    console.log('🔍 Todos los elementos relevantes:');
    const allElements = document.querySelectorAll('[id]');
    allElements.forEach(el => {
        const id = el.id.toLowerCase();
        if (id.includes('categoria') || id.includes('edit') || id.includes('modal') || id.includes('close')) {
            console.log(`📌 ${el.id}:`, el);
        }
    });

    // Buscar elementos con nombres más flexibles
    const btnAddCategoria = document.getElementById('btnAddCategoria');
    const btnUpdateCategoria = document.getElementById('btnUpdateCategoria') || 
                              document.getElementById('btnUpdateCategoria') ||
                              document.querySelector('[id*="update"][id*="categoria"]') ||
                              document.querySelector('[id*="actualizar"][id*="categoria"]');

    const modal = document.getElementById('editCategoriaModal') ||
                  document.getElementById('editModal') ||
                  document.querySelector('.modal');

    const closeBtn = document.querySelector('.close') ||
                     document.querySelector('[class*="close"]') ||
                     document.querySelector('span.close');

    console.log('🎯 Elementos encontrados (con búsqueda flexible):');
    console.log('btnAddCategoria:', btnAddCategoria);
    console.log('btnUpdateCategoria:', btnUpdateCategoria);
    console.log('modal:', modal);
    console.log('closeBtn:', closeBtn);

    // Si el botón principal existe, continuar (los otros pueden cargarse después)
    if (!btnAddCategoria) {
        console.error('❌ Error: No se encontró el botón btnAddCategoria');
        return;
    }

    let categoriaEditId = null;
    let categoriasData = [];

    // Cargar categorías al iniciar
    cargarCategorias();

    // Agregar nueva categoría
    btnAddCategoria.addEventListener('click', async function() {
        const nombreInput = document.getElementById('nombreCategoria');
        if (!nombreInput) {
            console.error('❌ No se encontró el input nombreCategoria');
            return;
        }

        const nombre = nombreInput.value;

        if (!nombre) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        const categoriaData = {
            Nombre_Categoria: nombre
        };

        try {
            const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/categoria/agregar.php`, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(categoriaData)
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const result = await response.json();
            alert('Categoría agregada correctamente');
            nombreInput.value = '';
            cargarCategorias();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar categoría: ' + (error.message || 'Error desconocido'));
        }
    });

    // Cargar lista de categorías
    async function cargarCategorias() {
        try {
            const response = await window.api.categorias.listar();
            
            console.log('Respuesta de categorías:', response);
            
            const tbody = document.querySelector('#categoriasTable tbody');
            if (!tbody) {
                console.error('❌ No se encontró el tbody de la tabla');
                return;
            }
            
            tbody.innerHTML = '';

            let categoriasArray = [];
            
            if (Array.isArray(response)) {
                categoriasArray = response;
            } else if (response && Array.isArray(response.data)) {
                categoriasArray = response.data;
            } else if (response && response.categorias) {
                categoriasArray = response.categorias;
            } else if (response && typeof response === 'object') {
                categoriasArray = Object.values(response);
            } else {
                console.warn('Formato de respuesta inesperado:', response);
                categoriasArray = [];
            }

            categoriasData = categoriasArray;

            if (categoriasArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay categorías registradas</td></tr>';
                return;
            }

            categoriasArray.forEach(categoria => {
                const isActive = (categoria.activo !== false && categoria.activo !== 0);
                const categoriaId = categoria.Id_categoria || categoria.id || '';
                const categoriaNombre = categoria.Nombre_Categoria || categoria.nombre || '';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${categoriaId}</td>
                    <td>${categoriaNombre}</td>
                    <td><span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                        <button class="btn small edit-btn" data-id="${categoriaId}" data-nombre="${categoriaNombre}" data-activo="${isActive}">Editar</button>
                        <button class="btn small ${isActive ? 'danger' : 'success'} estado-btn" data-id="${categoriaId}" data-activo="${isActive}">
                            ${isActive ? 'Desactivar' : 'Activar'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Agregar event listeners
            agregarEventListeners();

        } catch (error) {
            console.error('Error al cargar categorías:', error);
            const tbody = document.querySelector('#categoriasTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error al cargar categorías</td></tr>';
            }
        }
    }

    // Agregar event listeners
    function agregarEventListeners() {
        // Botones de editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const nombre = this.getAttribute('data-nombre');
                const activo = this.getAttribute('data-activo') === 'true';
                editarCategoria(id, nombre, activo);
            });
        });

        // Botones de cambiar estado
        document.querySelectorAll('.estado-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const activo = this.getAttribute('data-activo') === 'true';
                cambiarEstadoCategoria(id, activo);
            });
        });
    }

    // Editar categoría
    function editarCategoria(id, nombre, activo) {
        console.log('✏️ Editando categoría:', { id, nombre, activo });
        
        // Buscar elementos del modal de forma flexible
        const editNombreInput = document.getElementById('editNombreCategoria') || 
                               document.getElementById('editNombre') ||
                               document.querySelector('#editCategoriaModal input[type="text"]');
        
        const editEstadoSelect = document.getElementById('editEstadoCategoria') || 
                                document.getElementById('editEstado') ||
                                document.querySelector('#editCategoriaModal select');
        
        const modal = document.getElementById('editCategoriaModal') ||
                      document.querySelector('.modal');

        console.log('🔍 Elementos del modal encontrados:', {
            editNombreInput,
            editEstadoSelect,
            modal
        });

        if (!editNombreInput || !editEstadoSelect || !modal) {
            console.error('❌ No se encontraron todos los elementos del modal');
            alert('Error: No se puede abrir el editor. Verifica que el modal esté correctamente definido en el HTML.');
            return;
        }
        
        editNombreInput.value = nombre;
        editEstadoSelect.value = activo ? 'true' : 'false';
        categoriaEditId = id;
        modal.style.display = 'block';

        // Configurar el botón de actualizar si existe
        if (btnUpdateCategoria) {
            btnUpdateCategoria.onclick = function() {
                actualizarCategoria();
            };
        }
    }

    // Función para actualizar categoría
    async function actualizarCategoria() {
        const editNombreInput = document.getElementById('editNombreCategoria') || 
                               document.querySelector('#editCategoriaModal input[type="text"]');
        
        const editEstadoSelect = document.getElementById('editEstadoCategoria') || 
                                document.querySelector('#editCategoriaModal select');

        if (!editNombreInput || !editEstadoSelect) {
            alert('Error: No se pueden obtener los datos del formulario');
            return;
        }
        
        const nombre = editNombreInput.value;
        const activo = editEstadoSelect.value === 'true';

        if (!nombre) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        if (!categoriaEditId) {
            alert('Error: No se ha seleccionado una categoría para editar');
            return;
        }

        const categoriaData = {
            Id_categoria: categoriaEditId,
            Nombre_Categoria: nombre,
            activo: activo
        };

        try {
            console.log('🔄 Actualizando categoría:', categoriaData);
            const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/categoria/editar.php`, {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(categoriaData)
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta de actualización:', result);
            alert('Categoría actualizada correctamente');
            
            const modal = document.getElementById('editCategoriaModal') || document.querySelector('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            cargarCategorias();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar categoría: ' + (error.message || 'Error desconocido'));
        }
    }

    // Cambiar estado de la categoría
    async function cambiarEstadoCategoria(id, estaActivo) {
        const accion = estaActivo ? 'desactivar' : 'activar';
        const confirmacion = confirm(`¿Estás seguro de que deseas ${accion} esta categoría?`);
        
        if (confirmacion) {
            try {
                const categoriaData = {
                    Id_categoria: id,
                    activo: !estaActivo
                };

                console.log('🔄 Cambiando estado de categoría:', categoriaData);
                const response = await fetch(`${window.api.auth.API_BASE || 'http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com'}/api/categoria/editar.php`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(categoriaData)
                });
                
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }

                const result = await response.json();
                alert(`Categoría ${accion}da correctamente`);
                cargarCategorias();
            } catch (error) {
                console.error('Error:', error);
                alert(`Error al ${accion} categoría: ` + (error.message || 'Error desconocido'));
            }
        }
    }

    // Configurar cierre del modal si se encontró
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            categoriaEditId = null;
        });

        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                categoriaEditId = null;
            }
        });
    }

    // Si no se encontró el botón de actualizar, crear uno temporal
    if (!btnUpdateCategoria) {
        console.warn('⚠️ No se encontró btnUpdateCategoria, se usará función interna');
    }
});