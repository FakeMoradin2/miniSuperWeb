# E-commerce Cart System - Complete Flow Diagram

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ LOGIN (login.html)
   │
   ├─> auth.js → POST /api/auth/login.php
   │   └─> Saves user to localStorage('user')
   │   └─> Sets localStorage('isLoggedIn') = 'true'
   │
   └─> Redirects to principal.html

2️⃣ BROWSE PRODUCTS (principal.html)
   │
   ├─> script_products.js loads products from backend
   │   └─> GET /api/productos/listar.php
   │
   └─> User clicks "Add to Cart" button

3️⃣ ADD TO CART (principal.html)
   │
   ├─> script_products.js → agregarAlCarritoDesdePrincipal()
   │   ├─> Validates stock availability
   │   ├─> Reads localStorage('carrito')
   │   ├─> Adds/updates item: {producto, cantidad, subtotal}
   │   ├─> Calculates new total and contadorItems
   │   ├─> Saves to localStorage('carrito')
   │   └─> Shows notification + updates cart counter
   │
   └─> User clicks "Cart" link

4️⃣ VIEW CART (cart.html)
   │
   ├─> script_cart.js → DOMContentLoaded
   │   ├─> carrito.cargarDesdeLocalStorage()
   │   │   ├─> Reads localStorage('carrito')
   │   │   ├─> Rebuilds LinkedList structure
   │   │   └─> For each item: creates NodoCarrito
   │   │
   │   └─> renderizarCarrito()
   │       └─> Displays all items with quantities and prices
   │
   └─> User clicks "Continue Purchase" button

5️⃣ PURCHASE PROCESS (cart.html)
   │
   ├─> script_cart.js → payBtn event handler
   │   │
   │   ├─> Step 1: Validate Authentication
   │   │   ├─> AuthManager.isLoggedIn() → false?
   │   │   └─> Redirect to login.html
   │   │
   │   ├─> Step 2: Create Sale
   │   │   ├─> POST /api/ventas/crear.php
   │   │   ├─> Body: {comprador_id, vendedor_id, estado}
   │   │   └─> Response: {id_venta: X}
   │   │
   │   ├─> Step 3: Add Products (loop)
   │   │   ├─> For each cart item:
   │   │   ├─> POST /api/ventas/agregarProducto.php
   │   │   └─> Body: {venta_id, producto_id, cantidad}
   │   │
   │   ├─> Step 4: Confirm Sale
   │   │   ├─> PUT /api/ventas/confirmar.php
   │   │   ├─> Body: {venta_id, metodo_pago, cliente}
   │   │   └─> Backend REDUCES STOCK in inventario table
   │   │
   │   ├─> Step 5: Save to Reports
   │   │   ├─> Creates ventaLocal object
   │   │   ├─> Reads localStorage('minisuper_ventas')
   │   │   ├─> Appends new sale
   │   │   └─> Saves to localStorage('minisuper_ventas')
   │   │
   │   ├─> Step 6: Show Ticket
   │   │   ├─> mostrarTicket(ventaId, ventaLocal)
   │   │   ├─> Creates modal with green styling
   │   │   └─> Displays receipt with all details
   │   │
   │   └─> Step 7: Empty Cart
   │       ├─> carrito.vaciar()
   │       ├─> Clears localStorage('carrito')
   │       └─> Updates UI
   │
   └─> Purchase Complete! ✅

6️⃣ VERIFY REPORTS (Web_Administracion/reports.html)
   │
   └─> reports.js → cargarReporteRango()
       ├─> Fetches from backend: GET /api/ventas/listar.php
       ├─> Reads from localStorage('minisuper_ventas')
       ├─> Merges both data sources (avoids duplicates)
       └─> Displays unified sales report

┌─────────────────────────────────────────────────────────────────────┐
│                         DATA STRUCTURES                              │
└─────────────────────────────────────────────────────────────────────┘

localStorage('carrito') Format:
{
  items: [
    {
      producto: {
        id: "123",
        nombre: "Leche",
        precio: 2.50,
        categoria: "Lácteos",
        imagen: "url...",
        stock: 100
      },
      cantidad: 2,
      subtotal: 5.00
    }
  ],
  total: 5.00,
  contadorItems: 2
}

LinkedList in Memory (script_cart.js):
ListaCarrito {
  cabeza: NodoCarrito {
    producto: {...},
    cantidad: 2,
    siguiente: NodoCarrito | null
  },
  total: 5.00,
  contadorItems: 2
}

localStorage('minisuper_ventas') Format:
[
  {
    id_venta: 42,
    fecha: "2025-01-15T10:30:00.000Z",
    cliente: "Juan Pérez",
    metodo_pago: "Tarjeta",
    total: 15.50,
    estado: "confirmada",
    fuente: "e-commerce",
    productos: [
      {
        nombre_producto: "Leche",
        cantidad: 2,
        precio_unitario: 2.50,
        subtotal: 5.00
      }
    ]
  }
]

┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND INTEGRATION                          │
└─────────────────────────────────────────────────────────────────────┘

API Base: http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com

Endpoints Used:
├─> POST /api/auth/login.php
│   └─> Authenticates user, returns user object
│
├─> GET /api/productos/listar.php
│   └─> Returns all products with stock
│
├─> POST /api/ventas/crear.php
│   ├─> Creates new sale record
│   └─> Returns: {id_venta: X}
│
├─> POST /api/ventas/agregarProducto.php
│   ├─> Adds product to sale
│   └─> Creates venta_detalle record
│
└─> PUT /api/ventas/confirmar.php
    ├─> Confirms sale
    ├─> Updates sale status to 'confirmada'
    └─> REDUCES STOCK in inventario table (automatic)

Database Tables:
├─> usuario (users)
├─> venta (sales)
├─> venta_detalle (sale items)
├─> producto (products)
└─> inventario (inventory/stock)

┌─────────────────────────────────────────────────────────────────────┐
│                         FILES INVOLVED                               │
└─────────────────────────────────────────────────────────────────────┘

Web-Ecommerce/
├─> html/
│   ├─> login.html           → User authentication
│   ├─> principal.html       → Product catalog
│   └─> cart.html            → Shopping cart & checkout
│
└─> jss/
    ├─> auth.js              → AuthManager class
    ├─> api.js               → Backend API wrapper
    ├─> script_products.js   → Product display & add to cart
    └─> script_cart.js       → Cart logic & purchase flow ⭐

Web_Administracion/
├─> reports.html             → Sales reports
└─> js/
    └─> reports.js           → Report generation

┌─────────────────────────────────────────────────────────────────────┐
│                         KEY FEATURES                                 │
└─────────────────────────────────────────────────────────────────────┘

✅ Authentication Required for Purchases
✅ Stock Validation Before Adding
✅ LinkedList Data Structure for Cart
✅ Persistent Cart (localStorage)
✅ Real-time Backend Integration
✅ Automatic Stock Reduction
✅ Beautiful Ticket Modal (Green Theme)
✅ Unified Reports (Backend + localStorage)
✅ Error Handling & User Feedback
✅ Responsive UI Updates

┌─────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING                               │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: Not Logged In
└─> Alert: "Debes iniciar sesión para realizar una compra"
└─> Redirects to login.html

Scenario 2: Empty Cart
└─> Alert: "Tu carrito está vacío"

Scenario 3: Out of Stock
└─> Notification: "ProductName is out of stock!"
└─> Prevents adding to cart

Scenario 4: Backend Error
└─> Catches error in try/catch
└─> Alert: "Error al procesar la compra: [error message]"
└─> Re-enables purchase button

Scenario 5: Network Error
└─> Caught by fetchJSON in api.js
└─> Console error logged
└─> Error propagated to caller

┌─────────────────────────────────────────────────────────────────────┐
│                         CONSOLE OUTPUT                               │
└─────────────────────────────────────────────────────────────────────┘

Successful Purchase Console Logs:
🛒 Iniciando proceso de compra...
✅ Respuesta crear venta: {id_venta: 42, ...}
🆔 Venta creada con ID: 42
📦 Agregando producto: Leche
📦 Agregando producto: Pan
✅ Todos los productos agregados
✅ Venta confirmada: {success: true, ...}
💾 Venta guardada en localStorage: {id_venta: 42, ...}
```

## 🎯 Summary

The e-commerce cart system is now fully integrated with:
- ✅ Complete backend connectivity
- ✅ Authentication and authorization
- ✅ Real-time stock management
- ✅ Professional purchase flow
- ✅ Beautiful receipt generation
- ✅ Unified reporting system

All "direccionamientos" (endpoints/routes) are properly connected and functioning!
