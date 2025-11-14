class NodoCarrito {
    constructor(producto, cantidad = 1) {
        this.producto = producto;
        this.cantidad = cantidad;
        this.siguiente = null;
    }
}

// Clase para la lista simplemente enlazada del carrito
class ListaCarrito {
    constructor() {
        this.cabeza = null;
        this.total = 0;
        this.contadorItems = 0;

function agregarAlCarrito(producto) {
    carrito.agregar(producto);
    renderizarCarrito();
    
    // Mostrar notificación
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
    }

    // Agregar producto al carrito
    agregar(producto, cantidad = 1) {
        const nuevoNodo = new NodoCarrito(producto, cantidad);
        
        // Si el carrito está vacío
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            // Verificar si el producto ya existe en el carrito
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
            
            // Si no existe, agregarlo al final
            if (!productoExistente) {
                actual.siguiente = nuevoNodo;
            }
        }
        
        this.actualizarTotales();
        this.guardarEnLocalStorage();
        return this;
    }

    // Eliminar producto del carrito
    eliminar(productoId) {
        if (!this.cabeza) return this;

        // Si el producto a eliminar es la cabeza
        if (this.cabeza.producto.id === productoId) {
            this.cabeza = this.cabeza.siguiente;
            this.actualizarTotales();
            this.guardarEnLocalStorage();
            return this;
        }

        // Buscar el producto en la lista
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

    // Actualizar cantidad de un producto
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

    // Vaciar todo el carrito
    vaciar() {
        this.cabeza = null;
        this.total = 0;
        this.contadorItems = 0;
        this.guardarEnLocalStorage();
        return this;
    }

    // Calcular totales
    actualizarTotales() {
        this.total = 0;
        this.contadorItems = 0;

        let actual = this.cabeza;
        while (actual) {
            this.total += actual.producto.precio * actual.cantidad;
            this.contadorItems += actual.cantidad;
            actual = actual.siguiente;
        }
    }

    // Obtener todos los items del carrito
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

    // Guardar en localStorage
    guardarEnLocalStorage() {
        const datosCarrito = {
            items: this.obtenerItems(),
            total: this.total,
            contadorItems: this.contadorItems
        };
        localStorage.setItem('carrito', JSON.stringify(datosCarrito));
    }

    // Cargar desde localStorage
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

    // Obtener cantidad de un producto específico
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

    // Obtener longitud de la lista
    obtenerLongitud() {
        let contador = 0;
        let actual = this.cabeza;
        while (actual) {
            contador++;
            actual = actual.siguiente;
        }
        return contador;
    }

    // Buscar producto en la lista
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

// Instancia global del carrito
const carrito = new ListaCarrito();

// Funciones para la interfaz de usuario
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
                <a href="Principal.html" class="btn">Comenzar a comprar</a>
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

// Función para agregar productos desde otras páginas
function agregarAlCarrito(producto) {
    carrito.agregar(producto);
    renderizarCarrito();
    
    // Mostrar notificación
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

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    carrito.cargarDesdeLocalStorage();
    renderizarCarrito();

    // Event listeners
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
            // Aquí iría la lógica real de pago
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

// Ejemplo de producto para testing
const productoEjemplo = {
    id: '1',
    nombre: 'Producto de Ejemplo',
    precio: 10.99,
    categoria: 'Abarrotes',
    imagen: null
};

// Función para probar la lista enlazada
function probarListaEnlazada() {
    console.log("=== Probando Lista Enlazada ===");
    
    // Crear productos de prueba
    const producto1 = { id: '1', nombre: 'Producto 1', precio: 10.99 };
    const producto2 = { id: '2', nombre: 'Producto 2', precio: 5.50 };
    const producto3 = { id: '3', nombre: 'Producto 3', precio: 7.25 };
    
    // Agregar productos al carrito
    carrito.agregar(producto1);
    carrito.agregar(producto2);
    carrito.agregar(producto3);
    
    // Mostrar la estructura de la lista
    console.log("Lista después de agregar productos:");
    let actual = carrito.cabeza;
    while (actual) {
        console.log(`Nodo: ${actual.producto.nombre} -> Siguiente: ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
    }
    
    console.log("Longitud de la lista:", carrito.obtenerLongitud());
    console.log("Total items:", carrito.contadorItems);
    console.log("Total precio:", carrito.total);
    
    // Eliminar un producto del medio
    carrito.eliminar('2');
    
    console.log("Lista después de eliminar producto 2:");
    actual = carrito.cabeza;
    while (actual) {
        console.log(`Nodo: ${actual.producto.nombre} -> Siguiente: ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
    }
    
    console.log("Longitud de la lista:", carrito.obtenerLongitud());
    console.log("Total items:", carrito.contadorItems);
    console.log("Total precio:", carrito.total);
}

// Descomentar para probar:
// probarListaEnlazada();
// Función completa para probar la lista enlazada
function probarListaEnlazadaCompleta() {
    console.log("🧪 === INICIANDO PRUEBAS DE LISTA ENLAZADA ===");
    
    // Crear un carrito temporal para pruebas
    const carritoPrueba = new ListaCarrito();
    
    // 1. Prueba: Carrito vacío
    console.log("1. ✅ Carrito vacío:");
    console.log("   - Cabeza:", carritoPrueba.cabeza);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    console.log("   - Items:", carritoPrueba.obtenerItems());
    
    // 2. Prueba: Agregar primer producto
    const producto1 = { 
        id: 'p1', 
        nombre: 'Leche Entera', 
        precio: 25.50, 
        categoria: 'Lácteos' 
    };
    carritoPrueba.agregar(producto1, 2);
    console.log("2. ✅ Agregar primer producto:");
    console.log("   - Cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Siguiente:", carritoPrueba.cabeza.siguiente);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    console.log("   - Total:", carritoPrueba.total);
    
    // 3. Prueba: Agregar segundo producto
    const producto2 = { 
        id: 'p2', 
        nombre: 'Pan Integral', 
        precio: 18.75, 
        categoria: 'Panadería' 
    };
    carritoPrueba.agregar(producto2, 1);
    console.log("3. ✅ Agregar segundo producto:");
    console.log("   - Cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Siguiente:", carritoPrueba.cabeza.siguiente.producto.nombre);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    // 4. Prueba: Agregar producto existente (debe sumar cantidad)
    carritoPrueba.agregar(producto1, 1);
    console.log("4. ✅ Agregar producto existente:");
    console.log("   - Cantidad de Leche:", carritoPrueba.obtenerCantidad('p1'));
    console.log("   - Total items:", carritoPrueba.contadorItems);
    
    // 5. Prueba: Agregar tercer producto
    const producto3 = { 
        id: 'p3', 
        nombre: 'Huevos', 
        precio: 45.00, 
        categoria: 'Lácteos' 
    };
    carritoPrueba.agregar(producto3, 1);
    console.log("5. ✅ Agregar tercer producto:");
    console.log("   - Estructura completa:");
    let actual = carritoPrueba.cabeza;
    let posicion = 1;
    while (actual) {
        console.log(`     Nodo ${posicion}: ${actual.producto.nombre} -> ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
        posicion++;
    }
    
    // 6. Prueba: Buscar producto
    console.log("6. ✅ Buscar producto 'p2':");
    const productoEncontrado = carritoPrueba.buscarProducto('p2');
    console.log("   - Encontrado:", productoEncontrado ? productoEncontrado.producto.nombre : 'No encontrado');
    
    // 7. Prueba: Eliminar producto del medio
    carritoPrueba.eliminar('p2');
    console.log("7. ✅ Eliminar producto del medio (Pan Integral):");
    console.log("   - Nueva estructura:");
    actual = carritoPrueba.cabeza;
    posicion = 1;
    while (actual) {
        console.log(`     Nodo ${posicion}: ${actual.producto.nombre} -> ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
        posicion++;
    }
    
    // 8. Prueba: Eliminar cabeza
    carritoPrueba.eliminar('p1');
    console.log("8. ✅ Eliminar cabeza (Leche):");
    console.log("   - Nueva cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    // 9. Prueba: Actualizar cantidad
    carritoPrueba.actualizarCantidad('p3', 3);
    console.log("9. ✅ Actualizar cantidad de Huevos a 3:");
    console.log("   - Nueva cantidad:", carritoPrueba.obtenerCantidad('p3'));
    console.log("   - Nuevo total:", carritoPrueba.total);
    
    // 10. Prueba: Vaciar carrito
    carritoPrueba.vaciar();
    console.log("10. ✅ Vaciar carrito:");
    console.log("   - Cabeza:", carritoPrueba.cabeza);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    console.log("🎉 === PRUEBAS COMPLETADAS ===");
}

// Ejecutar pruebas automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Descomenta la siguiente línea para ejecutar las pruebas automáticamente
    // probarListaEnlazadaCompleta();
});
// === FUNCIONES DE PRUEBA - AGREGAR AL FINAL DE script_Carrito.js ===

// 1. Función completa para probar la lista enlazada
function probarListaEnlazadaCompleta() {
    console.log("🧪 === INICIANDO PRUEBAS DE LISTA ENLAZADA ===");
    
    // Crear un carrito temporal para pruebas
    const carritoPrueba = new ListaCarrito();
    
    // 1. Prueba: Carrito vacío
    console.log("1. ✅ Carrito vacío:");
    console.log("   - Cabeza:", carritoPrueba.cabeza);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    console.log("   - Items:", carritoPrueba.obtenerItems());
    
    // 2. Prueba: Agregar primer producto
    const producto1 = { 
        id: 'p1', 
        nombre: 'Leche Entera', 
        precio: 25.50, 
        categoria: 'Lácteos' 
    };
    carritoPrueba.agregar(producto1, 2);
    console.log("2. ✅ Agregar primer producto:");
    console.log("   - Cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Siguiente:", carritoPrueba.cabeza.siguiente);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    console.log("   - Total:", carritoPrueba.total);
    
    // 3. Prueba: Agregar segundo producto
    const producto2 = { 
        id: 'p2', 
        nombre: 'Pan Integral', 
        precio: 18.75, 
        categoria: 'Panadería' 
    };
    carritoPrueba.agregar(producto2, 1);
    console.log("3. ✅ Agregar segundo producto:");
    console.log("   - Cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Siguiente:", carritoPrueba.cabeza.siguiente.producto.nombre);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    // 4. Prueba: Agregar producto existente (debe sumar cantidad)
    carritoPrueba.agregar(producto1, 1);
    console.log("4. ✅ Agregar producto existente:");
    console.log("   - Cantidad de Leche:", carritoPrueba.obtenerCantidad('p1'));
    console.log("   - Total items:", carritoPrueba.contadorItems);
    
    // 5. Prueba: Agregar tercer producto
    const producto3 = { 
        id: 'p3', 
        nombre: 'Huevos', 
        precio: 45.00, 
        categoria: 'Lácteos' 
    };
    carritoPrueba.agregar(producto3, 1);
    console.log("5. ✅ Agregar tercer producto:");
    console.log("   - Estructura completa:");
    let actual = carritoPrueba.cabeza;
    let posicion = 1;
    while (actual) {
        console.log(`     Nodo ${posicion}: ${actual.producto.nombre} -> ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
        posicion++;
    }
    
    // 6. Prueba: Buscar producto
    console.log("6. ✅ Buscar producto 'p2':");
    const productoEncontrado = carritoPrueba.buscarProducto('p2');
    console.log("   - Encontrado:", productoEncontrado ? productoEncontrado.producto.nombre : 'No encontrado');
    
    // 7. Prueba: Eliminar producto del medio
    carritoPrueba.eliminar('p2');
    console.log("7. ✅ Eliminar producto del medio (Pan Integral):");
    console.log("   - Nueva estructura:");
    actual = carritoPrueba.cabeza;
    posicion = 1;
    while (actual) {
        console.log(`     Nodo ${posicion}: ${actual.producto.nombre} -> ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}`);
        actual = actual.siguiente;
        posicion++;
    }
    
    // 8. Prueba: Eliminar cabeza
    carritoPrueba.eliminar('p1');
    console.log("8. ✅ Eliminar cabeza (Leche):");
    console.log("   - Nueva cabeza:", carritoPrueba.cabeza.producto.nombre);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    // 9. Prueba: Actualizar cantidad
    carritoPrueba.actualizarCantidad('p3', 3);
    console.log("9. ✅ Actualizar cantidad de Huevos a 3:");
    console.log("   - Nueva cantidad:", carritoPrueba.obtenerCantidad('p3'));
    console.log("   - Nuevo total:", carritoPrueba.total);
    
    // 10. Prueba: Vaciar carrito
    carritoPrueba.vaciar();
    console.log("10. ✅ Vaciar carrito:");
    console.log("   - Cabeza:", carritoPrueba.cabeza);
    console.log("   - Longitud:", carritoPrueba.obtenerLongitud());
    
    console.log("🎉 === PRUEBAS COMPLETADAS ===");
}

// 2. Funciones para el panel de pruebas visual
function ejecutarPruebas() {
    const resultado = document.getElementById('resultadoPruebas');
    const panel = document.getElementById('panelPruebas');
    
    // Capturar console.log
    const logs = [];
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        logs.push(args.join(' '));
        originalConsoleLog.apply(console, args);
    };
    
    probarListaEnlazadaCompleta();
    
    // Restaurar console.log
    console.log = originalConsoleLog;
    
    // Mostrar resultados en el panel
    resultado.innerHTML = logs.map(log => `<div style="margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px; font-size: 12px; border-left: 3px solid #3B82F6;">${log}</div>`).join('');
    panel.style.display = 'block';
}

function mostrarEstructura() {
    const resultado = document.getElementById('resultadoPruebas');
    const panel = document.getElementById('panelPruebas');
    
    let estructuraHTML = `<h5 style="color: #2c3e50; margin-bottom: 10px;">🏪 Estructura Actual del Carrito:</h5>`;
    
    if (carrito.obtenerLongitud() === 0) {
        estructuraHTML += `<p style="color: #6c757d; font-style: italic;">El carrito está vacío</p>`;
    } else {
        estructuraHTML += `
            <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <p><strong>📊 Resumen:</strong></p>
                <p><strong>Total Productos:</strong> ${carrito.contadorItems}</p>
                <p><strong>Total Precio:</strong> $${carrito.total.toFixed(2)}</p>
                <p><strong>Longitud de la lista:</strong> ${carrito.obtenerLongitud()}</p>
            </div>
            <div style="margin-top: 10px;">
                <strong>🔗 Estructura de Nodos:</strong>
        `;
        
        let actual = carrito.cabeza;
        let posicion = 1;
        while (actual) {
            const esCabeza = posicion === 1 ? " 🏁 (Cabeza)" : "";
            estructuraHTML += `
                <div style="margin: 8px 0; padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid #dee2e6;">
                    <strong>📦 Nodo ${posicion}:</strong> ${actual.producto.nombre}${esCabeza}<br>
                    <small>🆔 ID: ${actual.producto.id} | 📦 Cantidad: ${actual.cantidad} | 💰 Precio: $${actual.producto.precio}</small><br>
                    <small>➡️ Siguiente: ${actual.siguiente ? actual.siguiente.producto.nombre : 'null'}</small>
                </div>
            `;
            actual = actual.siguiente;
            posicion++;
        }
        
        estructuraHTML += `</div>`;
    }
    
    resultado.innerHTML = estructuraHTML;
    panel.style.display = 'block';
}

// 3. Función para agregar productos de prueba rápidamente
function agregarProductosPrueba() {
    const productosPrueba = [
        { id: '1', nombre: 'Leche Entera', precio: 25.50, categoria: 'Lácteos' },
        { id: '2', nombre: 'Pan Integral', precio: 18.75, categoria: 'Panadería' },
        { id: '3', nombre: 'Huevos Grade A', precio: 45.00, categoria: 'Lácteos' },
        { id: '4', nombre: 'Manzanas', precio: 32.00, categoria: 'Frutas' },
        { id: '5', nombre: 'Arroz', precio: 28.50, categoria: 'Abarrotes' }
    ];
    
    productosPrueba.forEach(producto => {
        carrito.agregar(producto, Math.floor(Math.random() * 3) + 1);
    });
    
    renderizarCarrito();
    mostrarEstructura();
    alert('✅ Productos de prueba agregados al carrito');
}

// 4. Función para activar modo debug visual
function activarModoDebug() {
    const container = document.getElementById('cartContainer');
    if (container.classList.contains('debug-nodos')) {
        container.classList.remove('debug-nodos');
        alert('🔧 Modo debug desactivado');
    } else {
        container.classList.add('debug-nodos');
        alert('🐛 Modo debug activado - Puedes ver las flechas de la lista enlazada');
    }
}

// Ejecutar pruebas automáticamente al cargar la página (opcional)
document.addEventListener('DOMContentLoaded', function() {
    // Descomenta la siguiente línea para ejecutar las pruebas automáticamente
    // probarListaEnlazadaCompleta();
    
    // Agregar estilos para el modo debug
    const debugStyles = `
        .debug-nodos .cart-item {
            border-left: 4px solid #3B82F6;
            position: relative;
            background: #f0f9ff !important;
        }
        .debug-nodos .cart-item::after {
            content: "→";
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            color: #3B82F6;
            font-weight: bold;
            font-size: 16px;
        }
        .debug-nodos .cart-item:last-child::after {
            content: "null";
            color: #EF4444;
        }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = debugStyles;
    document.head.appendChild(styleSheet);
});