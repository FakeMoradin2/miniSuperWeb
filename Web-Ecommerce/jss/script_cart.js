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

    container.innerHTML = items.map(item => `
        <div class="cart-item" data-product-id="${item.producto.id}">
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
                    <button class="btn-quantity minus" onclick="actualizarCantidad('${item.producto.id}', ${item.cantidad - 1})">-</button>
                    <span class="quantity">${item.cantidad}</span>
                    <button class="btn-quantity plus" onclick="actualizarCantidad('${item.producto.id}', ${item.cantidad + 1})">+</button>
                </div>
                <div class="item-subtotal">
                    $${item.subtotal.toFixed(2)}
                </div>
                <button class="btn-remove" onclick="eliminarDelCarrito('${item.producto.id}')" title="Eliminar producto">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');

    if (totalElement) totalElement.textContent = carrito.total.toFixed(2);
    if (productsTotalElement) productsTotalElement.textContent = carrito.total.toFixed(2);
    if (cartCountElement) cartCountElement.textContent = carrito.contadorItems;
}

function actualizarCantidad(productoId, nuevaCantidad) {
    carrito.actualizarCantidad(productoId, nuevaCantidad);
    renderizarCarrito();
}

function eliminarDelCarrito(productoId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        carrito.eliminar(productoId);
        renderizarCarrito();
    }
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito.vaciar();
        renderizarCarrito();
    }
}

// Add to Cart Function
function agregarAlCarrito(producto) {
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    carrito.cargarDesdeLocalStorage();
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