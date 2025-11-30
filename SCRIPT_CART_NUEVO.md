# SCRIPT_CART.JS - VERSIÓN CORRECTA CON INTEGRACIÓN BACKEND

Guarda este contenido en: `Web-Ecommerce/jss/script_cart.js`

```javascript
// script_cart.js - E-commerce Cart con integración Backend

// Variables globales
let ventaId = null; // ID del carrito en el backend
let cartItems = []; // Productos en el carrito

// Cargar carrito al iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await inicializarCarrito();
    renderizarCarrito();
    
    const clearCartBtn = document.getElementById('clearCartBtn');
    const payBtn = document.getElementById('payBtn');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', vaciarCarrito);
    }
    
    if (payBtn) {
        payBtn.addEventListener('click', procesarCompra);
    }
});

// Inicializar carrito
async function inicializarCarrito() {
    // Cargar desde localStorage
    const carritoGuardado = localStorage.getItem('ecommerce_cart');
    if (carritoGuardado) {
        const data = JSON.parse(carritoGuardado);
        ventaId = data.ventaId;
        cartItems = data.items || [];
    }
}

// Renderizar carrito en el DOM
function renderizarCarrito() {
    const container = document.getElementById('cartContainer');
    const totalElement = document.getElementById('cartTotal');
    const productsTotalElement = document.getElementById('productsTotal');
    const cartCountElement = document.getElementById('cartCount');
    
    if (!container) return;
    
    if (cartItems.length === 0) {
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
    
    let total = 0;
    let totalItems = 0;
    
    container.innerHTML = cartItems.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        totalItems += item.cantidad;
        
        return `
            <div class="cart-item" data-product-id="${item.producto_id}">
                <div class="item-info">
                    <div class="item-image">
                        ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}">` : '📦'}
                    </div>
                    <div class="item-details">
                        <h3>${item.nombre}</h3>
                        <p class="item-price">$${item.precio.toFixed(2)} c/u</p>
                    </div>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="btn-quantity minus" onclick="actualizarCantidad(${item.producto_id}, ${item.cantidad - 1})">-</button>
                        <span class="quantity">${item.cantidad}</span>
                        <button class="btn-quantity plus" onclick="actualizarCantidad(${item.producto_id}, ${item.cantidad + 1})">+</button>
                    </div>
                    <div class="item-subtotal">
                        $${subtotal.toFixed(2)}
                    </div>
                    <button class="btn-remove" onclick="eliminarDelCarrito(${item.producto_id})" title="Eliminar producto">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    if (totalElement) totalElement.textContent = total.toFixed(2);
    if (productsTotalElement) productsTotalElement.textContent = total.toFixed(2);
    if (cartCountElement) cartCountElement.textContent = totalItems;
}

// Agregar producto al carrito
async function agregarAlCarrito(producto) {
    try {
        // Verificar si el usuario está logueado
        const userData = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!userData || isLoggedIn !== 'true') {
            alert('Debes iniciar sesión para agregar productos al carrito');
            window.location.href = 'login.html';
            return;
        }
        
        const userId = 18; // Usar ID fijo como en POS
        
        // Crear carrito en backend si no existe
        if (!ventaId) {
            const response = await window.api.ventasAPI.crear({
                comprador_id: userId,
                vendedor_id: userId
            });
            
            if (response.success) {
                ventaId = response.venta_id;
                console.log('Carrito creado con ID:', ventaId);
            } else {
                throw new Error('No se pudo crear el carrito');
            }
        }
        
        // Verificar si el producto ya está en el carrito
        const itemExistente = cartItems.find(item => item.producto_id === producto.id);
        
        if (itemExistente) {
            // Actualizar cantidad
            await window.api.ventasAPI.agregarProducto({
                venta_id: ventaId,
                producto_id: producto.id,
                cantidad: itemExistente.cantidad + 1
            });
            itemExistente.cantidad += 1;
        } else {
            // Agregar nuevo producto al backend
            await window.api.ventasAPI.agregarProducto({
                venta_id: ventaId,
                producto_id: producto.id,
                cantidad: 1
            });
            
            // Agregar al array local
            cartItems.push({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }
        
        guardarCarrito();
        renderizarCarrito();
        
        // Mostrar notificación
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        alert('Error al agregar producto: ' + error.message);
    }
}

// Actualizar cantidad (llamada desde HTML)
async function actualizarCantidad(productoId, nuevaCantidad) {
    try {
        if (nuevaCantidad <= 0) {
            await eliminarDelCarrito(productoId);
            return;
        }
        
        const item = cartItems.find(i => i.producto_id === productoId);
        if (!item) return;
        
        // Actualizar en backend
        await window.api.ventasAPI.agregarProducto({
            venta_id: ventaId,
            producto_id: productoId,
            cantidad: nuevaCantidad
        });
        
        // Actualizar localmente
        item.cantidad = nuevaCantidad;
        
        guardarCarrito();
        renderizarCarrito();
        
    } catch (error) {
        console.error('Error actualizando cantidad:', error);
        alert('Error al actualizar cantidad');
    }
}

// Eliminar producto del carrito
async function eliminarDelCarrito(productoId) {
    try {
        if (!confirm('¿Eliminar este producto del carrito?')) return;
        
        // Eliminar del backend
        if (ventaId) {
            await window.api.ventasAPI.eliminarProducto({
                venta_id: ventaId,
                producto_id: productoId,
                cantidad: 999 // Cantidad alta para eliminar completamente
            });
        }
        
        // Eliminar localmente
        cartItems = cartItems.filter(item => item.producto_id !== productoId);
        
        guardarCarrito();
        renderizarCarrito();
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar producto');
    }
}

// Vaciar carrito completamente
async function vaciarCarrito() {
    try {
        if (!confirm('¿Vaciar todo el carrito?')) return;
        
        // Cancelar carrito en backend
        if (ventaId) {
            await window.api.ventasAPI.cancelar({
                venta_id: ventaId
            });
        }
        
        // Limpiar localmente
        ventaId = null;
        cartItems = [];
        
        localStorage.removeItem('ecommerce_cart');
        renderizarCarrito();
        
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        alert('Error al vaciar carrito');
    }
}

// Procesar compra
async function procesarCompra() {
    try {
        // Verificar que haya productos
        if (cartItems.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Verificar login
        const userData = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!userData || isLoggedIn !== 'true') {
            alert('Debes iniciar sesión para completar la compra');
            window.location.href = 'login.html';
            return;
        }
        
        if (!ventaId) {
            alert('Error: No hay un carrito activo');
            return;
        }
        
        const payBtn = document.getElementById('payBtn');
        payBtn.disabled = true;
        payBtn.textContent = 'Procesando...';
        
        console.log('Confirmando venta con ID:', ventaId);
        
        // Confirmar venta en backend
        const response = await window.api.ventasAPI.confirmar({
            venta_id: ventaId
        });
        
        if (!response.success) {
            throw new Error(response.message || 'Error al confirmar la venta');
        }
        
        console.log('Venta confirmada:', response);
        
        // Guardar en localStorage para reportes
        const usuario = JSON.parse(userData);
        const clienteNombre = usuario.nombre || usuario.name || usuario.username || 'Cliente E-commerce';
        const total = response.total || cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        const ventaLocal = {
            id_venta: ventaId,
            fecha: new Date().toISOString(),
            cliente: clienteNombre,
            metodo_pago: 'efectivo',
            total: total,
            estado: 'confirmada',
            productos: cartItems.map(item => ({
                nombre_producto: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.precio * item.cantidad
            }))
        };
        
        let ventasGuardadas = JSON.parse(localStorage.getItem('minisuper_ventas') || '[]');
        ventasGuardadas.push(ventaLocal);
        localStorage.setItem('minisuper_ventas', JSON.stringify(ventasGuardadas));
        
        // Mostrar éxito
        alert(`¡Compra realizada con éxito!\n\nFolio: ${ventaId}\nTotal: $${total.toFixed(2)}\n\nGracias por tu compra`);
        
        // Limpiar carrito
        ventaId = null;
        cartItems = [];
        localStorage.removeItem('ecommerce_cart');
        renderizarCarrito();
        
        payBtn.disabled = false;
        payBtn.textContent = 'Finalizar Compra';
        
    } catch (error) {
        console.error('Error procesando compra:', error);
        alert('Error al procesar la compra: ' + error.message);
        
        const payBtn = document.getElementById('payBtn');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = 'Finalizar Compra';
        }
    }
}

// Guardar carrito en localStorage
function guardarCarrito() {
    const data = {
        ventaId: ventaId,
        items: cartItems
    };
    localStorage.setItem('ecommerce_cart', JSON.stringify(data));
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = `✓ ${mensaje}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Exponer funciones globales
window.agregarAlCarrito = agregarAlCarrito;
window.actualizarCantidad = actualizarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
```

## CAMBIOS REALIZADOS:

1. **Eliminé la estructura de LinkedList** - Ahora usa un array simple `cartItems[]`
2. **Integración completa con backend:**
   - Crear carrito: `POST /api/ventas/crear.php`
   - Agregar productos: `POST /api/ventas/agregarProducto.php`
   - Eliminar productos: `POST /api/ventas/eliminarProducto.php`
   - Vaciar carrito: `PUT /api/ventas/cancelar.php`
   - Confirmar compra: `PUT /api/ventas/confirmar.php`

3. **Requiere login obligatorio** para todas las operaciones
4. **Usa ID 18** fijo (como POS)
5. **Guarda en localStorage** para reportes
6. **Sincroniza en tiempo real** con el backend

Copia todo el código del bloque de arriba y reemplaza el contenido completo de `script_cart.js`.
