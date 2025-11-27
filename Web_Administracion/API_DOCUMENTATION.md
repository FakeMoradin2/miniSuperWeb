# Documentación de API Frontend - Minisuper System

## Base de Datos
Base URL: `http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com`

## Acceso Global
Todas las funciones están disponibles mediante: `window.api`

---

## 📦 PRODUCTOS

### Listar todos los productos
```javascript
const productos = await window.api.productos.listar();
```

### Listar por categoría
```javascript
const productos = await window.api.productos.listar('categoria_id');
```

### Buscar productos
```javascript
const resultados = await window.api.productos.buscar('leche');
```

### Agregar producto
```javascript
await window.api.productos.agregar({
  nombre_producto: 'Leche',
  precio: 2.50,
  stock: 100,
  categoria_id: 1,
  codigo: 'LECHE001'
});
```

### Editar producto
```javascript
await window.api.productos.editar({
  producto_id: 1,
  nombre_producto: 'Leche Premium',
  precio: 3.00,
  stock: 150
});
```

### Eliminar producto
```javascript
await window.api.productos.eliminar({
  producto_id: 1
});
```

---

## 🛒 VENTAS / CARRITO

### Crear venta
```javascript
const venta = await window.api.ventasAPI.crear({
  comprador_id: 0,
  vendedor_id: 1,
  estado: 'pendiente'
});
console.log(venta.id_venta); // ID de la venta
```

### Agregar producto al carrito
```javascript
await window.api.ventasAPI.agregarProducto({
  venta_id: 5,
  producto_id: 3,
  cantidad: 2
});
```

### Actualizar cantidad de producto
```javascript
await window.api.ventasAPI.actualizarProducto({
  venta_id: 5,
  producto_id: 3,
  cantidad: 5
});
```

### Eliminar producto del carrito
```javascript
await window.api.ventasAPI.eliminarProducto({
  venta_id: 5,
  producto_id: 3
});
```

### Confirmar venta
```javascript
await window.api.ventasAPI.confirmar({
  venta_id: 5,
  metodo_pago: 'Efectivo',
  cliente: 'Juan Pérez'
});
```

### Cancelar venta
```javascript
await window.api.ventasAPI.cancelar({
  venta_id: 5
});
```

### Listar ventas
```javascript
const ventas = await window.api.ventasAPI.listar();
```

### Obtener venta por ID
```javascript
const venta = await window.api.ventasAPI.obtenerPorId(5);
```

---

## 👥 CLIENTES

### Listar clientes
```javascript
const clientes = await window.api.clientes.listar();
```

### Obtener cliente por ID
```javascript
const cliente = await window.api.clientes.obtenerPorId(1);
```

### Agregar cliente
```javascript
await window.api.clientes.agregar({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '123456789'
});
```

### Editar cliente
```javascript
await window.api.clientes.editar({
  cliente_id: 1,
  nombre: 'Juan Delgado',
  email: 'juan.delgado@example.com',
  telefono: '987654321'
});
```

### Eliminar cliente
```javascript
await window.api.clientes.eliminar({
  cliente_id: 1
});
```

---

## 📊 STOCK

### Obtener productos con bajo stock
```javascript
const productosBajos = await window.api.stock.obtenerBajoStock();
```

### Actualizar stock
```javascript
await window.api.stock.actualizar({
  producto_id: 1,
  cantidad_nueva: 50
});
```

### Historial de stock
```javascript
const historial = await window.api.stock.historial();
```

---

## 📈 REPORTES

### Historial de ventas
```javascript
const historial = await window.api.reportes.historial();
```

### Reporte del día
```javascript
const reporteDia = await window.api.reportes.reporteDia();
```

### Productos más vendidos
```javascript
const topProductos = await window.api.reportes.productosTop();
```

---

## 📊 DASHBOARD

### Estadísticas generales
```javascript
const stats = await window.api.dashboard.estadisticas();
```

### Ventas recientes
```javascript
const ventas = await window.api.dashboard.ventasRecientes(10); // últimas 10 ventas
```

### Productos más vendidos
```javascript
const tops = await window.api.dashboard.productosMasVendidos(5); // top 5
```

---

## 🏷️ CATEGORÍAS

### Listar categorías
```javascript
const categorias = await window.api.categorias.listar();
```

---

## 🚚 PROVEEDORES

### Listar proveedores
```javascript
const proveedores = await window.api.proveedores.listar();
```

---

## 🔐 AUTENTICACIÓN

### Login
```javascript
const resultado = await window.api.auth.login({
  email: 'usuario@example.com',
  password: 'contraseña'
});
```

### Registro
```javascript
await window.api.auth.register({
  nombre: 'Nuevo Usuario',
  email: 'nuevo@example.com',
  password: 'contraseña',
  telefono: '123456789'
});
```

---

## Manejo de Errores

```javascript
try {
  const productos = await window.api.productos.listar();
} catch (error) {
  console.error('Error:', error.message);
  alert('Error: ' + error.message);
}
```

---

## Conexión del POS con la Base de Datos

El archivo `pos.js` ya está completamente conectado:

1. **Carga de productos**: Se ejecuta `cargarProductos()` al iniciar
2. **Búsqueda**: Busca en caché local o en servidor
3. **Agregar al carrito**: Crea venta temporal y agrega productos
4. **Sincronización**: Cada cambio se sincroniza con el servidor
5. **Confirmación**: Guarda la venta en la BD

### Funciones principales en pos.js

- `init()` - Inicialización del módulo
- `cargarProductos()` - Carga productos al iniciar
- `searchProducts(query)` - Busca productos
- `renderCart()` - Renderiza el carrito
- `agregarProductoAlCarrito(prod)` - Agrega producto

