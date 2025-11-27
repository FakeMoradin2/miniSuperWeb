# Documentación - Módulo Inventario (inventory.js)

## 📦 Conexión con Base de Datos

El archivo `inventory.js` está completamente conectado con la base de datos a través de `api.js` y `window.api`.

## 🚀 Funcionalidades Implementadas

### 1. **Carga de Datos**
- ✅ Carga de productos al iniciar
- ✅ Carga de categorías automáticamente
- ✅ Carga de proveedores automáticamente
- ✅ Cache local de datos para mejor rendimiento

### 2. **Búsqueda y Filtrado**
- ✅ Búsqueda por nombre de producto
- ✅ Búsqueda por código de producto
- ✅ Filtro por categoría
- ✅ Filtro por estado (Activo/Inactivo)
- ✅ Búsqueda en tiempo real (debounce 300ms)

### 3. **Gestión de Productos**
- ✅ **Agregar** nuevo producto
- ✅ **Editar** producto existente
- ✅ **Eliminar** producto
- ✅ **Visualizar** estado (Activo/Inactivo)
- ✅ **Mostrar** imágenes de productos

### 4. **Validaciones**
- ✅ Campos requeridos (*): Nombre, Precio, Stock, Categoría
- ✅ Validación de números positivos
- ✅ Confirmación antes de eliminar
- ✅ Mensajes de éxito/error

## 📊 Flujo del Módulo

```
1. Inicialización (initInventario)
   ├── Cargar categorías
   ├── Cargar proveedores
   ├── Cargar productos
   └── Configurar búsqueda y filtros

2. Mostrar Tabla de Productos
   ├── Renderizar cada producto con imagen
   ├── Mostrar estado (badge)
   ├── Indicar bajo stock (⚠️)
   └── Botones de Editar/Eliminar

3. Buscar/Filtrar Productos
   ├── Búsqueda por nombre/código
   ├── Filtro por categoría
   ├── Filtro por estado
   └── Aplicar múltiples filtros simultáneamente

4. Guardar Producto
   ├── Validar campos requeridos
   ├── Crear o editar en BD
   ├── Mostrar mensaje de confirmación
   └── Recargar tabla

5. Eliminar Producto
   ├── Pedir confirmación
   ├── Eliminar de BD
   └── Recargar tabla
```

## 🔗 API Disponible

### Productos
```javascript
// Listar todos
const productos = await window.api.productos.listar();

// Buscar
const resultados = await window.api.productos.buscar('leche');

// Agregar
await window.api.productos.agregar({
  nombre_producto: 'Producto X',
  precio: 10.50,
  stock: 50,
  categoria_id: 1,
  proveedor_id: 2,
  imagen: 'https://...',
  activo: true
});

// Editar
await window.api.productos.editar({
  producto_id: 1,
  nombre_producto: 'Producto X Actualizado',
  precio: 12.00,
  stock: 75
});

// Eliminar
await window.api.productos.eliminar({
  producto_id: 1
});
```

### Categorías
```javascript
const categorias = await window.api.categorias.listar();
```

### Proveedores
```javascript
const proveedores = await window.api.proveedores.listar();
```

### Stock
```javascript
// Obtener productos con bajo stock
const bajoStock = await window.api.stock.obtenerBajoStock();

// Actualizar stock
await window.api.stock.actualizar({
  producto_id: 1,
  cantidad_nueva: 100
});
```

## 🎯 Funciones Internas

### Búsqueda y Filtros

```javascript
// Aplicar todos los filtros simultáneamente
aplicarFiltros();

// Búsqueda simple
buscarProductosInventario('termino');
```

### Edición

```javascript
// Cargar producto para editar
editarProducto(productoObj);

// Se llena automáticamente el formulario con los datos
```

### Eliminación

```javascript
// Eliminar producto
eliminarProducto(productoId);
```

### Renderizado

```javascript
// Renderizar tabla con productos
renderizarProductosTabla(arrayProductos);

// Se muestran:
// - Imagen del producto
// - Nombre, precio, stock
// - Categoría, estado
// - Botones de acciones
```

## 💡 Variables Globales

```javascript
productosOriginales = [];    // Todos los productos cargados
categoriasCache = [];        // Categorías cargadas
proveedoresCache = [];       // Proveedores cargados
busquedaActual = '';         // Término de búsqueda actual
filtroCategoria = '';        // Categoría seleccionada
filtroEstado = '';           // Estado seleccionado (true/false/'')
```

## 📝 Validación de Campos

Los siguientes campos son **REQUERIDOS** (*):
- Nombre del Producto
- Precio
- Stock
- Categoría

Campos opcionales:
- Proveedor
- URL de Imagen
- Estado

## 🎨 UI/UX Mejorada

### Indicadores Visuales
- 🟢 **Badge Verde**: Producto Activo
- 🔴 **Badge Rojo**: Producto Inactivo
- ⚠️ **Warning**: Stock ≤ 10 unidades (en rojo)

### Estados de Tabla
- Mostrar mensaje "Cargando..." al cargar
- Mostrar "No se encontraron productos" si lista vacía
- Fila que cambia de color al pasar mouse

### Manejo de Errores
- Validación de campos requeridos
- Confirmación antes de eliminar
- Mensajes claros de error
- Logs en consola para debugging

## 🔄 Sincronización con BD

Cada operación se sincroniza automáticamente:

1. **Agregar**: Guarda en BD → Recarga tabla
2. **Editar**: Actualiza en BD → Recarga tabla
3. **Eliminar**: Elimina de BD → Recarga tabla
4. **Búsqueda**: Busca en BD o caché según sea necesario

## 🚨 Alertas Especiales

### Bajo Stock (≤ 10 unidades)
- Se muestra en rojo en la tabla
- Se agrega "⚠️ Bajo stock" al lado del número
- Se puede usar `window.api.stock.obtenerBajoStock()` para reporte

## 📌 Notas Importantes

- Los cambios en caché se aplican al renderizar
- La búsqueda es case-insensitive
- Los filtros pueden combinarse
- Las imágenes se cargan de URL externa o muestran placeholder
- El sistema maneja diferentes nombres de campos de API

