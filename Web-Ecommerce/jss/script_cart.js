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
        localStorage.setItem('carrito', JSON.stringify(datosCarrito));
    }

    cargarDesdeLocalStorage() {
        const datosGuardados = localStorage.getItem('carrito');
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

function ventaKeyForUser(user) {
    return user ? `venta_id_user_${user.id}` : null;
}

async function getOrCreateVentaId() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.error('❌ Usuario no válido o sin ID:', user);
        alert('Debes iniciar sesión para usar el carrito.');
        return null;
    }

    // Asegurar que el ID sea un número
    const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
    if (isNaN(userId)) {
        console.error('❌ ID de usuario inválido:', user.id);
        alert('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.');
        return null;
    }

    console.log('🔑 Usando usuario_id:', userId);

    const key = ventaKeyForUser(user);
    let ventaId = key ? localStorage.getItem(key) : null;
    if (ventaId) {
        const ventaIdNum = parseInt(ventaId, 10);
        console.log('✅ Carrito existente encontrado, venta_id:', ventaIdNum);
        return ventaIdNum;
    }

    try {
        console.log('🛒 Creando nuevo carrito para usuario_id:', userId);
        const res = await window.api.ventas.crear({ 
            comprador_id: userId, 
            vendedor_id: userId 
        });
        
        console.log('📡 Respuesta del backend:', res);
        
        if (res && res.success && res.venta_id) {
            localStorage.setItem(key, String(res.venta_id));
            console.log('✅ Carrito creado exitosamente, venta_id:', res.venta_id);
            return res.venta_id;
        } else {
            console.error('❌ Error creando/obteniendo carrito:', res);
            const mensaje = res?.message || res?.error || 'Error desconocido al crear carrito';
            alert('Error al crear carrito: ' + mensaje);
            return null;
        }
    } catch (err) {
        console.error('❌ Error API crear carrito:', err);
        alert('Error al conectar con el servidor: ' + (err.message || 'Error desconocido'));
        return null;
    }
}

async function apiAgregarProducto(productoId, cantidad) {
    // Verificar que window.api esté disponible
    if (!window.api || !window.api.ventas) {
        console.error('❌ window.api.ventas no está disponible. Asegúrate de que api.js se cargue antes de script_cart.js');
        alert('Error: La API no está disponible. Por favor, recarga la página.');
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    try {
        const productoIdNum = parseInt(productoId, 10);
        if (isNaN(productoIdNum)) {
            console.error('ID de producto inválido:', productoId);
            return false;
        }

        console.log('➕ Agregando producto:', { venta_id: ventaId, producto_id: productoIdNum, cantidad });
        const res = await window.api.ventas.agregarProducto({
            venta_id: ventaId,
            producto_id: productoIdNum,
            cantidad: cantidad
        });
        
        console.log('📡 Respuesta del backend:', res);
        
        if (res && res.success) {
            console.log('✅ Producto agregado exitosamente');
            return true;
        }
        console.warn('No se pudo agregar producto:', res);
        alert(res && res.message ? res.message : 'No se pudo agregar el producto.');
        return false;
    } catch (err) {
        console.error('❌ Error API agregarProducto:', err);
        alert('Error al conectar con el servidor para agregar producto: ' + (err.message || 'Error desconocido'));
        return false;
    }
}

async function apiActualizarProducto(productoId, cantidad) {
    // WORKAROUND: El endpoint actualizarProducto.php tiene un bug con la columna generada 'subtotal'
    // Solución: Eliminamos el producto y lo volvemos a agregar con la nueva cantidad
    
    if (!window.api || !window.api.ventas) {
        console.error('❌ window.api.ventas no está disponible');
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    
    try {
        const productoIdNum = parseInt(productoId, 10);
        const cantidadNum = parseInt(cantidad, 10);
        
        if (isNaN(productoIdNum) || isNaN(cantidadNum)) {
            console.error('ID de producto o cantidad inválida');
            return false;
        }

        console.log('🔄 Actualizando cantidad (eliminar + agregar):', { venta_id: ventaId, producto_id: productoIdNum, cantidad: cantidadNum });
        
        // Paso 1: Eliminar el producto del carrito
        const resEliminar = await window.api.ventas.eliminarProducto({
            venta_id: parseInt(ventaId, 10),
            producto_id: productoIdNum
        });
        
        if (!resEliminar || !resEliminar.success) {
            console.warn('No se pudo eliminar producto para actualizar:', resEliminar);
            return false;
        }
        
        // Paso 2: Agregar el producto con la nueva cantidad
        const resAgregar = await window.api.ventas.agregarProducto({
            venta_id: parseInt(ventaId, 10),
            producto_id: productoIdNum,
            cantidad: cantidadNum
        });
        
        console.log('📡 Respuesta agregar:', resAgregar);
        
        if (resAgregar && resAgregar.success) {
            console.log('✅ Cantidad actualizada exitosamente');
            return true;
        }
        
        console.warn('No se pudo agregar producto después de eliminar:', resAgregar);
        return false;
        
    } catch (err) {
        console.error('❌ Error API actualizarProducto:', err);
        return false;
    }
}

async function apiEliminarProducto(productoId) {
    // Verificar que window.api esté disponible
    if (!window.api || !window.api.ventas) {
        console.error('❌ window.api.ventas no está disponible. Asegúrate de que api.js se cargue antes de script_cart.js');
        alert('Error: La API no está disponible. Por favor, recarga la página.');
        return false;
    }

    const ventaId = await getOrCreateVentaId();
    if (!ventaId) return false;
    try {
        const productoIdNum = parseInt(productoId, 10);
        if (isNaN(productoIdNum)) {
            console.error('ID de producto inválido:', productoId);
            return false;
        }

        console.log('🗑️ Eliminando producto:', { venta_id: ventaId, producto_id: productoIdNum });
        const res = await window.api.ventas.eliminarProducto({
            venta_id: ventaId,
            producto_id: productoIdNum
        });
        
        console.log('📡 Respuesta del backend:', res);
        
        if (res && res.success) {
            console.log('✅ Producto eliminado exitosamente');
            return true;
        }
        console.warn('No se pudo eliminar producto:', res);
        alert(res && res.message ? res.message : 'No se pudo eliminar el producto.');
        return false;
    } catch (err) {
        console.error('❌ Error API eliminarProducto:', err);
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
        console.warn('No se pudo cancelar carrito:', res);
        alert(res && res.message ? res.message : 'No se pudo cancelar el carrito.');
        return false;
    } catch (err) {
        console.error('Error API cancelar:', err);
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
        console.error('ID de producto inválido:', productoId);
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
        console.error('ID de producto inválido:', productoId);
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

// Add to Cart Function
async function agregarAlCarrito(producto) {
    // Asegurar que el ID sea un número
    const productoId = typeof producto.id === 'number' ? producto.id : parseInt(producto.id, 10);
    if (isNaN(productoId)) {
        console.error('ID de producto inválido:', producto.id);
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
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: fadeIn 0.2s ease;
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
        console.log('Usuario no autenticado, usando carrito local');
        return;
    }

    try {
        const ventaId = await getOrCreateVentaId();
        if (!ventaId) {
            console.log('No se pudo obtener venta_id, usando carrito local');
            return;
        }

        // El carrito se sincroniza automáticamente al agregar/actualizar/eliminar productos
        // No es necesario obtener la venta completa desde el backend
        console.log('Carrito listo con venta_id:', ventaId);
        
    } catch (error) {
        console.error('Error sincronizando carrito:', error);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar carrito desde localStorage primero
    carrito.cargarDesdeLocalStorage();
    
    // Intentar sincronizar con el backend
    await sincronizarCarritoDesdeBackend();
    
    // Renderizar el carrito
    renderizarCarrito();

    const clearCartBtn = document.getElementById('clearCartBtn');
    const payBtn = document.getElementById('payBtn');
    const couponBtn = document.querySelector('.coupon-btn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', vaciarCarrito);
    }

    if (payBtn) {
        payBtn.addEventListener('click', function() {
            if (carrito.contadorItems === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            alert(`Procesando pago por $${carrito.total.toFixed(2)}`);
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
});

// Test Product
const productoEjemplo = {
    id: '1',
    nombre: 'Producto de Ejemplo',
    precio: 10.99,
    categoria: 'Abarrotes',
    imagen: null
};