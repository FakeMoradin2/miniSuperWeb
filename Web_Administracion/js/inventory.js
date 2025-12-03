// frontend/js/inventory.js
// Conectado con api.js para gestión de inventario

let productosOriginales = [];
let categoriasCache = [];
let proveedoresCache = [];
let busquedaActual = '';
let filtroCategoria = '';
let filtroEstado = '';
let cloudinaryUrl = ''; // Variable para almacenar la URL de Cloudinary

// ========== CONFIGURACIÓN DE CLOUDINARY ==========

// Configura tus credenciales de Cloudinary aquí
const CLOUDINARY_CONFIG = {
    cloudName: 'dmssshsp9', // Reemplaza con tu cloud name
    uploadPreset: 'minisuper_products', // Crea un upload preset en tu dashboard de Cloudinary
    apiKey: '843194535233728' // Opcional para uploads directos
};

// ========== WIDGET DE CLOUDINARY ==========

function inicializarCloudinary() {
    // El widget de Cloudinary se carga desde el CDN
    console.log('Cloudinary SDK cargado');
}

function abrirWidgetCloudinary() {
    return new Promise((resolve, reject) => {
        const widget = cloudinary.createUploadWidget({
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            sources: ['local', 'camera', 'url'], // Fuentes permitidas
            multiple: false,
            maxFiles: 1,
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 5000000, // 5MB
            styles: {
                palette: {
                    window: "#FFFFFF",
                    sourceBg: "#F4F4F5",
                    windowBorder: "#90a0b3",
                    tabIcon: "#0078FF",
                    inactiveTabIcon: "#69778A",
                    menuIcons: "#0078FF",
                    link: "#0078FF",
                    action: "#FF620C",
                    inProgress: "#0078FF",
                    complete: "#20B832",
                    error: "#EA3D3D",
                    textDark: "#000000",
                    textLight: "#FFFFFF"
                }
            }
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Imagen subida a Cloudinary:', result.info);
                cloudinaryUrl = result.info.secure_url;
                mostrarPrevisualizacion(cloudinaryUrl);
                resolve(cloudinaryUrl);
            } else if (error) {
                console.error('Error subiendo a Cloudinary:', error);
                reject(error);
            }
        });

        widget.open();
    });
}

// ========== SUBIDA DIRECTA CON XMLHttpRequest (Alternativa) ==========

async function subirImagenCloudinary(file) {
    return new Promise((resolve, reject) => {
        mostrarProgresoSubida(0);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                mostrarProgresoSubida(percentComplete);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                cloudinaryUrl = response.secure_url;
                mostrarPrevisualizacion(cloudinaryUrl);
                ocultarProgresoSubida();
                resolve(cloudinaryUrl);
            } else {
                ocultarProgresoSubida();
                reject(new Error('Error en la subida'));
            }
        });
        
        xhr.addEventListener('error', () => {
            ocultarProgresoSubida();
            reject(new Error('Error de conexión'));
        });
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
        xhr.send(formData);
    });
}

function mostrarProgresoSubida(porcentaje) {
    const progress = document.getElementById('uploadProgress');
    const progressBar = progress.querySelector('.progress-bar');
    const progressPercent = document.getElementById('progressPercent');
    
    progress.style.display = 'block';
    progressBar.style.width = `${porcentaje}%`;
    progressPercent.textContent = `${Math.round(porcentaje)}%`;
}

function ocultarProgresoSubida() {
    const progress = document.getElementById('uploadProgress');
    progress.style.display = 'none';
}

// ========== SISTEMA DE ORDENAMIENTO (QuickSort) ==========

function quickSortProductos(productosArray, izquierda = 0, derecha = productosArray.length - 1) {
    if (izquierda < derecha) {
        const indicePivote = particionarProductos(productosArray, izquierda, derecha);
        quickSortProductos(productosArray, izquierda, indicePivote - 1);
        quickSortProductos(productosArray, indicePivote + 1, derecha);
    }
    return productosArray;
}

function particionarProductos(productosArray, izquierda, derecha) {
    const pivote = (productosArray[derecha].nombre_producto ?? productosArray[derecha].nombre).toLowerCase();
    let i = izquierda - 1;
    
    for (let j = izquierda; j < derecha; j++) {
        const nombreActual = (productosArray[j].nombre_producto ?? productosArray[j].nombre).toLowerCase();
        if (nombreActual <= pivote) {
            i++;
            [productosArray[i], productosArray[j]] = [productosArray[j], productosArray[i]];
        }
    }
    
    [productosArray[i + 1], productosArray[derecha]] = [productosArray[derecha], productosArray[i + 1]];
    return i + 1;
}

// ========== FUNCIÓN DE BÚSQUEDA CON FILTROS ==========

function aplicarFiltros() {
    let productosFiltrados = [...productosOriginales];
    
    // Filtro de búsqueda
    if (busquedaActual) {
        const terminoLower = busquedaActual.toLowerCase();
        productosFiltrados = productosFiltrados.filter(producto => 
            (producto.nombre_producto ?? producto.nombre ?? '').toLowerCase().includes(terminoLower) ||
            (producto.codigo ?? '').toLowerCase().includes(terminoLower) ||
            (producto.descripcion ?? '').toLowerCase().includes(terminoLower)
        );
    }
    
    // Filtro de categoría
    if (filtroCategoria) {
        productosFiltrados = productosFiltrados.filter(p => 
            String(p.categoria_id ?? p.id_categoria ?? '') === String(filtroCategoria)
        );
    }
    
    // Filtro de estado
    if (filtroEstado !== '') {
        const estadoBooleano = filtroEstado === 'true';
        productosFiltrados = productosFiltrados.filter(p => 
            (p.activo ?? p.estado ?? true) === estadoBooleano
        );
    }
    
    renderizarProductosTabla(productosFiltrados);
}

function buscarProductosInventario(termino) {
    busquedaActual = termino;
    aplicarFiltros();
}

// ========== FUNCIÓN PARA RENDERIZAR TABLA ==========

function renderizarProductosTabla(prods) {
    if (!Array.isArray(prods)) {
        console.error('renderizarProductosTabla: prods no es un array:', prods);
        prods = [];
    }
    
    const tbody = document.querySelector('#productosTable tbody');
    if (!tbody) {
        console.error('No se encontró el elemento #productosTable tbody');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (prods.length === 0) {
        document.getElementById('noProductsMessage').style.display = 'block';
        document.getElementById('loadingMessage').style.display = 'none';
        return;
    }
    
    document.getElementById('noProductsMessage').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'none';
    
    prods.forEach(p => {
        const tr = document.createElement('tr');
        const stock = p.stock || 0;
        const precio = Number(p.precio || 0);
        const activo = p.activo_producto === 1 || p.activo === 1 || p.activo === true || p.estado === 'activo';
        const imagen = p.image_url || p.imagen || '';
        const nombre = p.nombre_producto || p.nombre || '';
        const categoria = p.categoria || p.nombre_categoria || '';
        const productoId = p.producto_id;
        
        const estadoBadge = activo 
            ? '<span class="status-badge status-active">Activo</span>'
            : '<span class="status-badge status-inactive">Inactivo</span>';
        
        const imagenHTML = imagen 
            ? `<img src="${imagen}" class="product-image" alt="${nombre}" onerror="this.src='https://via.placeholder.com/50'">`
            : '<div class="product-image" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">Sin imagen</div>';
        
        const stockClass = stock <= 10 ? 'style="color:#e74c3c;font-weight:bold;"' : '';
        
        tr.innerHTML = `<td>${imagenHTML}</td>
                        <td><strong>${nombre}</strong></td>
                        <td>$${precio.toFixed(2)}</td>
                        <td ${stockClass}>${stock} ${stock <= 10 ? '⚠️ Bajo stock' : ''}</td>
                        <td>${categoria}</td>
                        <td>${estadoBadge}</td>
                        <td>
                            <button class="btn primary btn-edit" data-id="${productoId}" style="padding: 4px 8px; font-size: 12px;">Editar</button>
                            <button class="btn danger btn-delete" data-id="${productoId}" style="padding: 4px 8px; font-size: 12px;">Eliminar</button>
                        </td>`;
        tbody.appendChild(tr);
    });
    
    // Listeners para botones
    tbody.querySelectorAll('.btn-edit').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const prod = productosOriginales.find(x => x.producto_id === parseInt(id));
            if (prod) editarProducto(prod);
        });
    });
    
    tbody.querySelectorAll('.btn-delete').forEach(b => {
        b.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            await eliminarProducto(id);
        });
    });
}

// ========== FUNCIONES DE SUBIDA DE IMÁGENES ==========

function configurarSubidaImagen() {
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const btnUploadImage = document.getElementById('btnUploadImage');
    const prodImagen = document.getElementById('prodImagen');
    
    // Abrir widget de Cloudinary
    imageUploadBtn.addEventListener('click', async () => {
        try {
            await abrirWidgetCloudinary();
        } catch (error) {
            console.error('Error abriendo widget de Cloudinary:', error);
            showError('Error al subir imagen.');
        }
    });
    
    // Usar URL manual
    btnUploadImage.addEventListener('click', () => {
        const url = prodImagen.value.trim();
        if (url) {
            if (url.startsWith('http')) {
                cloudinaryUrl = url;
                mostrarPrevisualizacion(url);
            } else {
                showWarning('Por favor ingresa una URL válida que comience con http:// o https://');
            }
        } else {
            showWarning('Por favor ingresa una URL de imagen');
        }
    });
}

function mostrarPrevisualizacion(src) {
    const preview = document.getElementById('imagePreview');
    
    preview.innerHTML = `
        <div class="image-preview-container">
            <img src="${src}" style="max-width:100%;border-radius:4px;" onerror="this.style.display='none'">
            <button type="button" class="remove-image-btn" title="Eliminar imagen">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    preview.style.display = 'block';
    
    // Agregar listener para eliminar imagen
    const removeBtn = preview.querySelector('.remove-image-btn');
    removeBtn.addEventListener('click', function() {
        cloudinaryUrl = '';
        preview.style.display = 'none';
        document.getElementById('prodImagen').value = '';
    });
}

// ========== FUNCIONES DE EDICIÓN Y ELIMINACIÓN ==========

function editarProducto(prod) {
    document.getElementById('formTitle').textContent = 'Editar Producto';
    document.getElementById('prodId').value = prod.producto_id;
    document.getElementById('prodNombre').value = prod.nombre_producto || prod.nombre || '';
    document.getElementById('prodPrecio').value = prod.precio || 0;
    document.getElementById('prodStock').value = prod.stock || 0;
    
    // Buscar categoria_id a partir del nombre (prod.categoria contiene el nombre)
    let categoriaId = prod.categoria_id || prod.id_categoria || '';
    if (!categoriaId && prod.categoria && categoriasCache.length > 0) {
        const catMatch = categoriasCache.find(c => c.Nombre_Categoria === prod.categoria);
        categoriaId = catMatch ? catMatch.Id_categoria : '';
    }
    document.getElementById('prodCategoria').value = categoriaId;
    
    // Buscar proveedor_id a partir del nombre (prod.proveedor contiene el nombre)
    let proveedorId = prod.proveedor_id || prod.id_proveedor || '';
    if (!proveedorId && prod.proveedor && proveedoresCache.length > 0) {
        const provMatch = proveedoresCache.find(p => p.nombre_proveedor === prod.proveedor);
        proveedorId = provMatch ? provMatch.Id_proveedor : '';
    }
    document.getElementById('prodProveedor').value = proveedorId;
    
    // Manejar imagen
    const imagen = prod.image_url || prod.imagen || '';
    document.getElementById('prodImagen').value = imagen;
    cloudinaryUrl = imagen;
    
    if (imagen) {
        mostrarPrevisualizacion(imagen);
    } else {
        document.getElementById('imagePreview').style.display = 'none';
    }
    
    const activo = prod.activo_producto === 1 || prod.activo === 1 || prod.activo === true;
    document.getElementById('prodActivo').value = activo.toString();
    
    document.getElementById('btnCancelEdit').style.display = 'inline-block';
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
}

async function eliminarProducto(id) {
    if (!confirm('¿Deseas eliminar este producto? Esta acción no se puede deshacer.')) return;
    
    try {
        await window.api.productos.eliminar({ producto_id: id });
        showSuccess('Producto eliminado exitosamente');
        await loadProductos();
    } catch (err) {
        console.error('Error eliminando producto:', err);
        showError('Error al eliminar el producto.');
    }
}

// ========== CARGA DE DATOS INICIALES ==========

async function loadCategorias() {
    try {
        const response = await window.api.categorias.listar();
        let cats = Array.isArray(response) ? response : 
                   (response.data || response.categorias || response.categoria || []);
        
        if (!Array.isArray(cats)) {
            console.error('La respuesta de categorías no es un array:', response);
            cats = [];
        }
        
        categoriasCache = cats;
        console.log('Categorías cargadas:', cats);
        
        // Llenar selector de formulario
        const sel = document.getElementById('prodCategoria');
        if (sel) {
            sel.innerHTML = '<option value="">Seleccionar categoría...</option>';
            cats.forEach(c => {
                const id = c.Id_categoria;
                const nombre = c.Nombre_Categoria;
                if (id && nombre) {
                    sel.innerHTML += `<option value="${id}">${nombre}</option>`;
                }
            });
        }
        
        // Llenar filtro de categorías
        const filter = document.getElementById('filterCategoria');
        if (filter) {
            filter.innerHTML = '<option value="">Todas las categorías</option>';
            cats.forEach(c => {
                const id = c.Id_categoria;
                const nombre = c.Nombre_Categoria;
                if (id && nombre) {
                    filter.innerHTML += `<option value="${id}">${nombre}</option>`;
                }
            });
        }
        
        console.log('Categorías cargadas:', cats.length);
    } catch (err) {
        console.error('Error cargando categorías:', err);
    }
}

async function loadProveedores() {
    try {
        const response = await window.api.proveedores.listar();
        let prov = Array.isArray(response) ? response : 
                   (response.data || response.proveedores || response.proveedor || []);
        
        if (!Array.isArray(prov)) {
            console.error('La respuesta de proveedores no es un array:', response);
            prov = [];
        }
        
        proveedoresCache = prov;
        console.log('Proveedores cargados:', prov);
        
        const sel = document.getElementById('prodProveedor');
        if (sel) {
            sel.innerHTML = '<option value="">Seleccionar proveedor...</option>';
            prov.forEach(p => {
                const id = p.Id_proveedor;
                const nombre = p.nombre_proveedor;
                if (id && nombre) {
                    sel.innerHTML += `<option value="${id}">${nombre}</option>`;
                }
            });
        }
        
        console.log('Proveedores cargados:', prov.length);
    } catch (err) {
        console.error('Error cargando proveedores:', err);
    }
}

async function loadProductos() {
    try {
        document.getElementById('loadingMessage').style.display = 'block';
        const response = await window.api.productos.listar();
        
        let prods = Array.isArray(response) ? response : [];
        
        if (!Array.isArray(prods)) {
            console.error('La respuesta de productos no es un array:', response);
            prods = [];
        }
        
        console.log('Productos cargados:', prods.length, prods);
        productosOriginales = prods;
        aplicarFiltros();
    } catch (err) {
        console.error('Error cargando productos:', err);
        document.getElementById('loadingMessage').textContent = 'Error al cargar productos';
    }
}

// ========== GUARDAR PRODUCTO ==========

document.getElementById('btnSaveProd').addEventListener('click', async () => {
    const id = document.getElementById('prodId').value;
    const nombre = document.getElementById('prodNombre').value.trim();
    const precio = document.getElementById('prodPrecio').value;
    const stock = document.getElementById('prodStock').value;
    const categoria = document.getElementById('prodCategoria').value;
    
    if (!nombre || !precio || !stock || !categoria) {
        showWarning('Por favor completa todos los campos requeridos (*)');
        return;
    }
    
    // Determinar qué imagen usar (prioridad: Cloudinary > URL)
    let imagenFinal = cloudinaryUrl || document.getElementById('prodImagen').value.trim();
    
    const body = {
        nombre_producto: nombre,
        precio: Number(precio),
        stock: Number(stock),
        categoria_id: categoria || null,
        proveedor_id: document.getElementById('prodProveedor').value || null,
        image_url: imagenFinal,
        activo_producto: document.getElementById('prodActivo').value === 'true' ? 1 : 0
    };
    
    try {
        if (id) {
            body.producto_id = id;
            await window.api.productos.editar(body);
            showSuccess('Producto actualizado');
        } else {
            await window.api.productos.agregar(body);
            showSuccess('Producto creado');
        }
        document.getElementById('btnReset').click();
        await loadProductos();
    } catch (err) {
        console.error('Error guardando producto:', err);
        showError('Error al guardar el producto.');
    }
});

// ========== BOTONES DE CONTROL ==========

document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('prodId').value = '';
    document.getElementById('prodNombre').value = '';
    document.getElementById('prodPrecio').value = '';
    document.getElementById('prodStock').value = '';
    document.getElementById('prodCategoria').value = '';
    document.getElementById('prodProveedor').value = '';
    document.getElementById('prodImagen').value = '';
    document.getElementById('prodActivo').value = 'true';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('formTitle').textContent = 'Agregar Nuevo Producto';
    document.getElementById('btnCancelEdit').style.display = 'none';
    cloudinaryUrl = ''; // Limpiar URL de Cloudinary
    ocultarProgresoSubida();
});

document.getElementById('btnCancelEdit').addEventListener('click', () => {
    document.getElementById('btnReset').click();
});

// ========== CONFIGURAR BÚSQUEDA Y FILTROS ==========

function configurarBusquedaProductos() {
    const searchInput = document.getElementById('searchInput');
    const filterCategoria = document.getElementById('filterCategoria');
    const filterEstado = document.getElementById('filterEstado');
    
    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            const termino = this.value.trim();
            timeoutId = setTimeout(() => {
                buscarProductosInventario(termino);
            }, 300);
        });
    }
    
    if (filterCategoria) {
        filterCategoria.addEventListener('change', function() {
            filtroCategoria = this.value;
            aplicarFiltros();
        });
    }
    
    if (filterEstado) {
        filterEstado.addEventListener('change', function() {
            filtroEstado = this.value;
            aplicarFiltros();
        });
    }
}

// ========== INICIALIZACIÓN ==========

(async function initInventario() {
    console.log('Inicializando inventario...');
    await loadCategorias();
    await loadProveedores();
    await loadProductos();
    configurarBusquedaProductos();
    configurarSubidaImagen();
    inicializarCloudinary();
    console.log('Inventario inicializado');
})();