        // script_cart.js - Shopping Cart with Linked List

// Linked List Node
class NodoCarrito {
    constructor(producto, cantidad = 1) {
        this.producto = producto;
        this.cantidad = cantidad;
        this.siguiente = null;
    }
}

// Linked List Cart
class ListaCarrito {
    constructor() {
        this.cabeza = null;
        this.total = 0;
        this.contadorItems = 0;
    }

    // Add Product to Cart
    agregar(producto, cantidad = 1) {
        const nuevoNodo = new NodoCarrito(producto, cantidad);
        
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            let productoExistente = false;
            
            while (actual) {
                if (actual.producto.id === producto.id) {
                    actual.cantidad += cantidad;
                    productoExistente = true;
                    break;
                }
                if (!actual.siguiente) break;
                actual = actual.siguiente;
            }
            
            if (!productoExistente) {
                actual.siguiente = nuevoNodo;
            }
        }
        
        this.actualizarTotales();
        this.guardarEnLocalStorage();
        return this;
    }

    // Remove Product from Cart
    eliminar(productoId) {
        if (!this.cabeza) return this;

        if (this.cabeza.producto.id === productoId) {
            this.cabeza = this.cabeza.siguiente;
            this.actualizarTotales();
            this.guardarEnLocalStorage();
            return this;
        }

        let anterior = this.cabeza;
        let actual = this.cabeza.siguiente;

        while (actual) {
            if (actual.producto.id === productoId) {
                anterior.siguiente = actual.siguiente;
                this.actualizarTotales();
                this.guardarEnLocalStorage();
                return this;
            }
            anterior = actual;
            actual = actual.siguiente;
        }

        return this;
    }

    // Update Product Quantity
    actualizarCantidad(productoId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.eliminar(productoId);
            return this;
        }

        let actual = this.cabeza;
        while (actual) {
            if (actual.producto.id === productoId) {
                actual.cantidad = nuevaCantidad;
                this.actualizarTotales();
                this.guardarEnLocalStorage();
                return this;
            }
            actual = actual.siguiente;
        }

        return this;
    }

    // Clear Cart
    vaciar() {
        this.cabeza = null;
        this.total = 0;
        this.contadorItems = 0;
        this.guardarEnLocalStorage();
        return this;
    }

    // Calculate Totals - Función recursiva
    actualizarTotales() {
        // Función recursiva auxiliar para calcular el total
        const calcularTotalRecursivo = (nodo) => {
            // Caso base: si el nodo es null, retornar 0
            if (!nodo) {
                return { total: 0, contadorItems: 0 };
            }
            
            // Calcular el subtotal del nodo actual
            const subtotalNodo = nodo.producto.precio * nodo.cantidad;
            const cantidadNodo = nodo.cantidad;
            
            // Llamada recursiva para el siguiente nodo
            const resultadoSiguiente = calcularTotalRecursivo(nodo.siguiente);
            
            // Retornar la suma del nodo actual con el resultado recursivo
            return {
                total: subtotalNodo + resultadoSiguiente.total,
                contadorItems: cantidadNodo + resultadoSiguiente.contadorItems
            };
        };
        
        // Iniciar la recursión desde la cabeza de la lista
        const resultado = calcularTotalRecursivo(this.cabeza);
        this.total = resultado.total;
        this.contadorItems = resultado.contadorItems;
    }

    // Get All Items
    obtenerItems() {
        const items = [];
        let actual = this.cabeza;
        
        while (actual) {
            items.push({
                producto: actual.producto,
                cantidad: actual.cantidad,
                subtotal: actual.producto.precio * actual.cantidad
            });
            actual = actual.siguiente;
        }
        
        return items;
    }

    // Local Storage Management
    guardarEnLocalStorage() {
        const datosCarrito = {
            items: this.obtenerItems(),
            total: this.total,
            contadorItems: this.contadorItems
        };
        // Persistir por usuario si está autenticado
        const user = getCurrentUser();
        if (user && user.id) {
            const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
            if (!isNaN(userId)) {
                localStorage.setItem(`carrito_user_${userId}`, JSON.stringify(datosCarrito));
            }
        }
        // También mantener la clave general para compatibilidad
        localStorage.setItem('carrito', JSON.stringify(datosCarrito));
    }

    cargarDesdeLocalStorage() {
        // Intentar cargar primero el carrito específico del usuario
        let datosGuardados = null;
        const user = getCurrentUser();
        if (user && user.id) {
            const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
            if (!isNaN(userId)) {
                datosGuardados = localStorage.getItem(`carrito_user_${userId}`);
            }
        }
        // Fallback a la clave general
        if (!datosGuardados) {
            datosGuardados = localStorage.getItem('carrito');
        }
        if (datosGuardados) {
            const datos = JSON.parse(datosGuardados);
            this.vaciar();
            
            datos.items.forEach(item => {
                this.agregar(item.producto, item.cantidad);
            });
            
            this.total = datos.total;
            this.contadorItems = datos.contadorItems;
        }
    }

    // Utility Methods
    obtenerCantidad(productoId) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.producto.id === productoId) {
                return actual.cantidad;
            }
            actual = actual.siguiente;
        }
        return 0;
    }

    obtenerLongitud() {
        let contador = 0;
        let actual = this.cabeza;
        while (actual) {
            contador++;
            actual = actual.siguiente;
        }
        return contador;
    }

    buscarProducto(productoId) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.producto.id === productoId) {
                return actual;
            }
            actual = actual.siguiente;
        }
        return null;
    }
}

// Global Cart Instance
const carrito = new ListaCarrito();

// --- Backend sync helpers ---
function getCurrentUser() {
    return window.authManager ? window.authManager.getUser() : null;
}

// Función para procesar URLs de imágenes (compatible con Google Drive, rutas relativas, etc.)
function procesarUrlImagen(url) {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
        return null;
    }
    
    const imagenUrl = url.trim();
    
    // CASO 1: Google Drive link - CONVERTIR a URL directa
    if (imagenUrl.includes('drive.google.com')) {
        try {
            const match = imagenUrl.match(/\/d\/([^\/]+)/);
            if (match && match[1]) {
                const fileId = match[1];
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
        } catch (error) {
            // Error al convertir URL de Google Drive
        }
    }
    
    // CASO 2: Ya es URL completa (http://... o https://...)
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
        return imagenUrl;
    }
    
    // CASO 3: Es imagen en base64 (data:image...)
    if (imagenUrl.startsWith('data:')) {
        return imagenUrl;
    }
    
    // CASO 4: Ruta absoluta (/uploads/imagen.jpg)
    if (imagenUrl.startsWith('/')) {
        return `http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com${imagenUrl}`;
    }
    
    // CASO 5: Ruta relativa (productos/leche.jpg)
    if (!imagenUrl.startsWith('../') && !imagenUrl.startsWith('./')) {
        return `http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com/uploads/${imagenUrl}`;
    }
    
    // CASO 6: Ruta local (../images/producto.jpg) - usar directamente
    return imagenUrl;
}

function ventaKeyForUser(user) {
    return user ? `venta_id_user_${user.id}` : null;
}

async function getOrCreateVentaId() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Debes iniciar sesión para usar el carrito.');
        return null;
    }

    // Asegurar que el ID sea un número
    const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
    if (isNaN(userId)) {
        alert('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.');
        return null;
    }

    const key = ventaKeyForUser(user);
    let ventaId = key ? localStorage.getItem(key) : null;
    if (ventaId) {
        const ventaIdNum = parseInt(ventaId, 10);
        
        // Verificar que el carrito todavía exista y esté en estado "carrito"
        // Si la verificación falla, simplemente continuar para crear un nuevo carrito
        try {
            const carritoBackend = await obtenerCarritoDesdeBackend(ventaIdNum);
            if (carritoBackend && carritoBackend.success && carritoBackend.venta) {
                // Si el carrito está en estado "carrito" (vacío o con productos), usarlo
                if (carritoBackend.venta.estado_venta === 'carrito') {
                    return ventaIdNum;
                } else {
                    // Si el carrito ya fue procesado (completada, cancelada, etc.), limpiar y crear uno nuevo
                    if (key) localStorage.removeItem(key);
                    // Continuar para crear un nuevo carrito
                }
            } else {
                // Si el carrito no existe o no está en estado "carrito", limpiar y crear uno nuevo
                if (key) localStorage.removeItem(key);
                // Continuar para crear un nuevo carrito
            }
        } catch (error) {
            // Si hay un error al verificar, limpiar y crear uno nuevo
            if (key) localStorage.removeItem(key);
            // Continuar para crear un nuevo carrito
        }
    }

    try {
        const res = await window.api.ventas.crear({ 
            comprador_id: userId, 
            vendedor_id: userId 
        });
        
        if (res && res.success && res.venta_id) {
            localStorage.setItem(key, String(res.venta_id));
            return res.venta_id;
        } else {
            const mensaje = res?.message || res?.error || 'Error desconocido al crear carrito';
            alert('Error al crear carrito: ' + mensaje);
            return null;
        }
    } catch (err) {
        alert('Error al conectar con el servidor: ' + (err.message || 'Error desconocido'));
        return null;
    }
}

async function apiAgregarProducto(productoId, cantidad) {
    // Verificar que window.api esté disponible
    if (!window.api || !window.api.ventas) {
        alert('Error: La API no está disponible. Por favor, recarga la página.');
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    try {
        const productoIdNum = parseInt(productoId, 10);
        if (isNaN(productoIdNum)) {
            return false;
        }

        const res = await window.api.ventas.agregarProducto({
            venta_id: ventaId,
            producto_id: productoIdNum,
            cantidad: cantidad
        });
        
        if (res && res.success) {
            return true;
        }
        alert(res && res.message ? res.message : 'No se pudo agregar el producto.');
        return false;
    } catch (err) {
        alert('Error al conectar con el servidor para agregar producto: ' + (err.message || 'Error desconocido'));
        return false;
    }
}

async function apiActualizarProducto(productoId, cantidad) {
    // WORKAROUND: El endpoint actualizarProducto.php tiene un bug con la columna generada 'subtotal'
    // Solución: Eliminamos el producto y lo volvemos a agregar con la nueva cantidad
    
    if (!window.api || !window.api.ventas) {
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    
    try {
        const productoIdNum = parseInt(productoId, 10);
        const cantidadNum = parseInt(cantidad, 10);
        
        if (isNaN(productoIdNum) || isNaN(cantidadNum)) {
            return false;
        }
        
        // Paso 1: Eliminar el producto del carrito
        const resEliminar = await window.api.ventas.eliminarProducto({
            venta_id: parseInt(ventaId, 10),
            producto_id: productoIdNum
        });
        
        if (!resEliminar || !resEliminar.success) {
            return false;
        }
        
        // Paso 2: Agregar el producto con la nueva cantidad
        const resAgregar = await window.api.ventas.agregarProducto({
            venta_id: parseInt(ventaId, 10),
            producto_id: productoIdNum,
            cantidad: cantidadNum
        });
        
        if (resAgregar && resAgregar.success) {
            return true;
        }
        
        return false;
        
    } catch (err) {
        return false;
    }
}

async function apiEliminarProducto(productoId) {
    // Verificar que window.api esté disponible
    if (!window.api || !window.api.ventas) {
        alert('Error: La API no está disponible. Por favor, recarga la página.');
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    try {
        const productoIdNum = parseInt(productoId, 10);
        if (isNaN(productoIdNum)) {
            return false;
        }

        const res = await window.api.ventas.eliminarProducto({
            venta_id: ventaId,
            producto_id: productoIdNum
        });
        
        if (res && res.success) {
            return true;
        }
        alert(res && res.message ? res.message : 'No se pudo eliminar el producto.');
        return false;
    } catch (err) {
        alert('Error al conectar con el servidor para eliminar producto: ' + (err.message || 'Error desconocido'));
        return false;
    }
}

async function apiCancelarCarrito() {
    const user = getCurrentUser();
    const key = ventaKeyForUser(user);
    const ventaId = key ? localStorage.getItem(key) : null;
    if (!ventaId) return true; // nada que cancelar
    try {
        const res = await window.api.ventas.cancelar({ venta_id: parseInt(ventaId, 10) });
        if (res && res.success) {
            localStorage.removeItem(key);
            return true;
        }
        alert(res && res.message ? res.message : 'No se pudo cancelar el carrito.');
        return false;
    } catch (err) {
        alert('Error al conectar con el servidor para cancelar el carrito.');
        return false;
    }
}

// UI Functions
function renderizarCarrito() {
    const container = document.getElementById('cartContainer');
    const totalElement = document.getElementById('cartTotal');
    const productsTotalElement = document.getElementById('productsTotal');
    const cartCountElement = document.getElementById('cartCount');
    
    if (!container) return;

    const items = carrito.obtenerItems();
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Tu carrito está vacío</p>
                <a href="principal.html" class="btn">Comenzar a comprar</a>
            </div>
        `;
        if (totalElement) totalElement.textContent = '0.00';
        if (productsTotalElement) productsTotalElement.textContent = '0.00';
        if (cartCountElement) cartCountElement.textContent = '0';
        return;
    }

    container.innerHTML = items.map(item => {
        // Asegurar que el ID sea un número para pasarlo correctamente
        const productoId = typeof item.producto.id === 'number' ? item.producto.id : parseInt(item.producto.id, 10);
        return `
        <div class="cart-item" data-product-id="${productoId}">
            <div class="item-info">
                <div class="item-image">
                    ${item.producto.imagen ? `<img src="${item.producto.imagen}" alt="${item.producto.nombre}">` : '📦'}
                </div>
                <div class="item-details">
                    <h3>${item.producto.nombre}</h3>
                    <p>${item.producto.categoria || 'Producto'}</p>
                    <p class="item-price">$${item.producto.precio.toFixed(2)} c/u</p>
                </div>
            </div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="btn-quantity minus" onclick="actualizarCantidad(${productoId}, ${item.cantidad - 1})">-</button>
                    <span class="quantity">${item.cantidad}</span>
                    <button class="btn-quantity plus" onclick="actualizarCantidad(${productoId}, ${item.cantidad + 1})">+</button>
                </div>
                <div class="item-subtotal">
                    $${item.subtotal.toFixed(2)}
                </div>
                <button class="btn-remove" onclick="eliminarDelCarrito(${productoId})" title="Eliminar producto">
                    🗑️
                </button>
            </div>
        </div>
        `;
    }).join('');

    if (totalElement) totalElement.textContent = carrito.total.toFixed(2);
    if (productsTotalElement) productsTotalElement.textContent = carrito.total.toFixed(2);
    if (cartCountElement) cartCountElement.textContent = carrito.contadorItems;
}

async function actualizarCantidad(productoId, nuevaCantidad) {
    // Convertir productoId a número si es necesario
    const productoIdNum = typeof productoId === 'number' ? productoId : parseInt(productoId, 10);
    if (isNaN(productoIdNum)) {
        alert('Error: ID de producto inválido');
        return;
    }

    // Si nuevaCantidad <= 0, elimina
    if (nuevaCantidad <= 0) {
        const ok = await apiEliminarProducto(productoIdNum);
        if (ok) {
            carrito.eliminar(productoIdNum);
            renderizarCarrito();
        }
        return;
    }
    
    // Actualizar cantidad en el backend
    const ok = await apiActualizarProducto(productoIdNum, nuevaCantidad);
    if (ok) {
        carrito.actualizarCantidad(productoIdNum, nuevaCantidad);
        renderizarCarrito();
    }
}

async function eliminarDelCarrito(productoId) {
    // Convertir productoId a número si es necesario
    const productoIdNum = typeof productoId === 'number' ? productoId : parseInt(productoId, 10);
    if (isNaN(productoIdNum)) {
        alert('Error: ID de producto inválido');
        return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        const ok = await apiEliminarProducto(productoIdNum);
        if (ok) {
            carrito.eliminar(productoIdNum);
            renderizarCarrito();
        }
    }
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        (async () => {
            // Cancela en backend y limpia local
            const ok = await apiCancelarCarrito();
            if (ok) {
                carrito.vaciar();
                renderizarCarrito();
            }
        })();
    }
}

// Función auxiliar para limpiar completamente todo el carrito (usado cuando fue confirmado)
function limpiarTodoElCarrito(user) {
    // Limpiar el carrito local
    carrito.vaciar();
    
    // Limpiar localStorage del carrito
    if (user && user.id) {
        const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
        if (!isNaN(userId)) {
            localStorage.removeItem(`carrito_user_${userId}`);
        }
        const key = ventaKeyForUser(user);
        if (key) {
            localStorage.removeItem(key);
        }
    }
    // Limpiar carrito general también
    localStorage.removeItem('carrito');
    
    // Renderizar carrito vacío
    renderizarCarrito();
}

// Función para limpiar solo la vista local (carrito permanece en backend para procesar en POS)
function limpiarVistaLocalCarrito() {
    // Limpiar solo el carrito local y localStorage visual
    // NO cancelamos el carrito en el backend - debe quedar en estado "carrito" para el POS
    carrito.vaciar();
    renderizarCarrito();
    
    // El venta_id se mantiene en localStorage por si el usuario quiere ver el estado
    // Pero el carrito visual se limpia para que no se muestren los productos
}

// Add to Cart Function
async function agregarAlCarrito(producto) {
    // Asegurar que el ID sea un número
    const productoId = typeof producto.id === 'number' ? producto.id : parseInt(producto.id, 10);
    if (isNaN(productoId)) {
        alert('Error: ID de producto inválido');
        return;
    }

    const ok = await apiAgregarProducto(productoId, 1);
    if (!ok) return;
    
    carrito.agregar(producto);
    renderizarCarrito();

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = `✓ ${producto.nombre} agregado al carrito`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para sincronizar el carrito desde el backend
async function sincronizarCarritoDesdeBackend() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        return;
    }

    try {
        // Primero verificar si hay un venta_id guardado
        const key = ventaKeyForUser(user);
        const ventaIdGuardado = key ? localStorage.getItem(key) : null;
        
        // Si hay un venta_id guardado, verificar su estado primero
        if (ventaIdGuardado) {
            const ventaIdNum = parseInt(ventaIdGuardado, 10);
            try {
                const carritoBackend = await obtenerCarritoDesdeBackend(ventaIdNum);
                
                // Si no se puede obtener o el estado no es "carrito", el carrito fue procesado
                if (!carritoBackend || !carritoBackend.success || 
                    (carritoBackend.venta && carritoBackend.venta.estado_venta !== 'carrito')) {
                    limpiarTodoElCarrito(user);
                    // Continuar para obtener o crear un nuevo carrito
                }
            } catch (error) {
                // Si hay error al obtener, probablemente fue procesado o no existe
                limpiarTodoElCarrito(user);
            }
        }
        
        // Ahora obtener o crear un venta_id válido
        const ventaId = await getOrCreateVentaId();
        if (!ventaId) {
            return;
        }

        // Verificar si el carrito existe en el backend y cargar sus productos
        try {
            // Intentar obtener el carrito desde el backend
            const carritoBackend = await obtenerCarritoDesdeBackend(ventaId);
            
            if (carritoBackend && carritoBackend.success && carritoBackend.venta) {
                // Verificar que el carrito esté en estado "carrito"
                if (carritoBackend.venta.estado_venta === 'carrito') {
                    // Si el carrito tiene productos, cargarlos en la vista local
                    if (carritoBackend.productos && carritoBackend.productos.length > 0) {
                        carrito.vaciar();
                        carritoBackend.productos.forEach(item => {
                            // Procesar la imagen del producto
                            let imagen = null;
                            const imagenUrl = item.image_url || item.imagen_url || item.imagen;
                            
                            if (imagenUrl) {
                                imagen = procesarUrlImagen(imagenUrl);
                            }
                            
                            carrito.agregar({
                                id: item.producto_id,
                                nombre: item.nombre_producto,
                                precio: parseFloat(item.precio_unitario),
                                categoria: item.categoria || 'Producto',
                                imagen: imagen
                            }, parseInt(item.cantidad));
                        });
                        renderizarCarrito();
                    } else {
                        // Carrito está vacío pero en estado carrito, solo limpiar la vista local
                        // Esto permite que el usuario empiece a agregar productos nuevamente
                        carrito.vaciar();
                        renderizarCarrito();
                    }
                } else {
                    // Si el carrito ya fue confirmado o cancelado, limpiar TODO
                    const userForCleanup = getCurrentUser();
                    limpiarTodoElCarrito(userForCleanup);
                }
            }
        } catch (error) {
            // Si hay error al obtener el carrito, puede que ya fue procesado o no existe
            const user = getCurrentUser();
            limpiarTodoElCarrito(user);
        }
        
    } catch (error) {
        // Error sincronizando carrito
    }
}

// Función para obtener el carrito desde el backend
async function obtenerCarritoDesdeBackend(ventaId) {
    if (!window.api || !window.api.ventas || !window.api.ventas.obtenerCarrito) {
        return null;
    }
    
    try {
        const data = await window.api.ventas.obtenerCarrito(ventaId);
        return data;
    } catch (error) {
        return null;
    }
}

// Variable global para el timeout del modal de checkout
let checkoutModalTimeout = null;

// Funciones para el modal de checkout
function mostrarCheckoutModal(total) {
    // Cancelar timeout anterior si existe
    if (checkoutModalTimeout) {
        clearTimeout(checkoutModalTimeout);
        checkoutModalTimeout = null;
    }
    
    document.body.classList.add('show-checkout-modal');
    const modal = document.getElementById('checkoutModal');
    const totalElement = document.getElementById('checkoutTotalAmount');
    
    if (modal) {
        if (totalElement) {
            totalElement.textContent = `$${total}`;
        }
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        // Cerrar automáticamente después de 6 segundos
        checkoutModalTimeout = setTimeout(async () => {
            // Limpiar solo la vista local cuando se cierre automáticamente
            await ocultarCheckoutModal(true); // true = limpiar vista local
            checkoutModalTimeout = null;
        }, 6000); // 6 segundos
    }
}

async function ocultarCheckoutModal(limpiarVistaLocal = true) {
    // Cancelar el timeout si el usuario cierra manualmente
    if (checkoutModalTimeout) {
        clearTimeout(checkoutModalTimeout);
        checkoutModalTimeout = null;
    }
    
    document.body.classList.remove('show-checkout-modal');
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // Limpiar solo la vista local si se solicita (NO cancelar en backend)
    if (limpiarVistaLocal) {
        limpiarVistaLocalCarrito();
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Primero verificar y sincronizar con el backend (esto limpiará si fue confirmado)
    await sincronizarCarritoDesdeBackend();
    
    // Después cargar desde localStorage solo si no hay productos del backend
    // (Esto es para productos que puedan estar solo en localStorage temporalmente)
    if (carrito.contadorItems === 0) {
        carrito.cargarDesdeLocalStorage();
    }
    
    // Renderizar el carrito
    renderizarCarrito();

    const clearCartBtn = document.getElementById('clearCartBtn');
    const payBtn = document.getElementById('payBtn');
    const couponBtn = document.querySelector('.coupon-btn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', vaciarCarrito);
    }

    if (payBtn) {
        payBtn.addEventListener('click', async function() {
            if (carrito.contadorItems === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            // Mostrar modal bonito de pasar a caja
            mostrarCheckoutModal(carrito.total.toFixed(2));
        });
    }

    if (couponBtn) {
        couponBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const couponInput = document.querySelector('.coupon-input');
            if (couponInput.value.trim() === '') {
                alert('Por favor ingresa un código de cupón');
                return;
            }
            alert(`Cupón "${couponInput.value}" aplicado (simulado)`);
            couponInput.value = '';
        });
    }

    // Event listener para cerrar el modal de checkout
    const closeCheckoutBtn = document.getElementById('closeCheckoutModal');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', async function() {
            await ocultarCheckoutModal(true); // true = limpiar vista local
        });
    }

    // Cerrar modal al hacer clic fuera de él
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('click', async function(e) {
            if (e.target === checkoutModal) {
                await ocultarCheckoutModal(true); // true = limpiar vista local
            }
        });
    }
});

// Test Product
const productoEjemplo = {
    id: '1',
    nombre: 'Producto de Ejemplo',
    precio: 10.99,
    categoria: 'Abarrotes',
    imagen: null
};