# E-commerce Cart Integration - Test & Verification Guide

## ✅ Implementation Summary

### Changes Made

1. **script_cart.js - Complete Purchase Flow**
   - Added authentication validation before purchase
   - Integrated with backend API:
     - `crear.php` - Creates sale
     - `agregarProducto.php` - Adds products to sale
     - `confirmar.php` - Confirms sale and reduces stock
   - Saves sale to localStorage for reports
   - Shows styled ticket modal after purchase
   - Empties cart after successful purchase

2. **script_cart.js - Ticket Modal**
   - Created `mostrarTicket()` function with e-commerce color palette (#10B981 green)
   - Displays sale details: folio, date, customer, payment method
   - Lists all purchased products with quantities and subtotals
   - Shows total amount paid
   - Professional styling with animations

3. **cart.html - Script Dependencies**
   - Added `api.js` for backend API calls
   - Added `auth.js` for authentication management
   - Proper script loading order: api.js → auth.js → script_cart.js

4. **CSS Animations**
   - Added fadeIn, slideDown, slideIn, slideOut animations
   - Smooth modal transitions

### Data Flow

#### Adding Products (principal.html)
```
script_products.js
  → agregarAlCarritoDesdePrincipal()
  → Saves to localStorage as: {items: [], total: 0, contadorItems: 0}
  → Each item: {producto: {...}, cantidad: 1, subtotal: precio}
```

#### Loading Cart (cart.html)
```
script_cart.js
  → cargarDesdeLocalStorage()
  → Reads from localStorage
  → Rebuilds LinkedList from saved items
  → Calls renderizarCarrito() to display
```

#### Purchase Flow (cart.html)
```
1. User clicks "Continue Purchase" button
2. Validates authentication (redirects to login if not logged in)
3. Creates sale: POST /api/ventas/crear.php
   - Body: {comprador_id, vendedor_id, estado: 'pendiente'}
   - Response: {id_venta: X}
4. Adds each product: POST /api/ventas/agregarProducto.php
   - Body: {venta_id, producto_id, cantidad}
   - Loops through all cart items
5. Confirms sale: PUT /api/ventas/confirmar.php
   - Body: {venta_id, metodo_pago, cliente}
   - Backend AUTOMATICALLY reduces stock in inventario table
6. Saves to localStorage for reports
7. Shows ticket modal
8. Empties cart
```

## 🧪 Testing Checklist

### Prerequisites
- Backend must be running at: http://backendminisuper-env.eba-mfmvebct.us-east-2.elasticbeanstalk.com
- CORS must be configured on backend endpoints
- Database must have valid usuario with ID for login
- Products must exist in backend with available stock

### Test 1: Add Products to Cart
1. Open `principal.html`
2. Click "Add to Cart" on any product
3. Verify notification appears: "ProductName added to cart!"
4. Verify cart count updates in header
5. **Expected**: Cart counter increments, notification shows

### Test 2: View Cart
1. Click "Cart" link in header
2. Navigate to `cart.html`
3. **Expected**: 
   - All added products appear
   - Quantities are correct
   - Subtotals calculated correctly
   - Total amount displayed

### Test 3: Cart Operations
1. In `cart.html`, click "+" to increase quantity
2. Click "-" to decrease quantity
3. Click "🗑️" to remove product
4. Click "Empty Cart" to clear all
5. **Expected**: All operations update cart and totals correctly

### Test 4: Purchase Without Login
1. Clear localStorage or logout if logged in
2. In `cart.html` with products, click "Continue Purchase"
3. **Expected**: Alert "Debes iniciar sesión para realizar una compra"
4. **Expected**: Redirects to `login.html`

### Test 5: Complete Purchase Flow
1. Login to the system at `login.html`
2. Add products to cart from `principal.html`
3. Go to `cart.html`
4. Click "Continue Purchase"
5. **Expected**:
   - Button text changes to "Procesando..."
   - Button becomes disabled
   - Console logs show:
     - "🛒 Iniciando proceso de compra..."
     - "✅ Respuesta crear venta: {...}"
     - "🆔 Venta creada con ID: X"
     - "📦 Agregando producto: ProductName" (for each product)
     - "✅ Todos los productos agregados"
     - "✅ Venta confirmada: {...}"
     - "💾 Venta guardada en localStorage: {...}"
   - Ticket modal appears with:
     - Green header (#10B981)
     - Sale folio number
     - Date and time
     - Customer name
     - Payment method
     - Product list with quantities and prices
     - Total amount
   - Cart becomes empty
   - Cart count returns to 0

### Test 6: Verify Stock Reduction
1. Before purchase, note product stock in backend
2. Complete a purchase with specific quantity
3. Check backend database or inventory page
4. **Expected**: Stock reduced by purchased quantity

### Test 7: Verify Sale in Reports
1. Complete a purchase from e-commerce
2. Open `reports.html` in Web_Administracion
3. **Expected**: Sale appears in reports with:
   - Correct folio
   - Date/time
   - Customer name
   - Products list
   - Total amount
   - Status: "confirmada"

## 🔍 Debugging

### Check Browser Console
Look for these messages:
- `🛒 Iniciando proceso de compra...` - Purchase started
- `✅ Respuesta crear venta:` - Sale created successfully
- `🆔 Venta creada con ID: X` - Sale ID obtained
- `📦 Agregando producto:` - Products being added
- `✅ Venta confirmada:` - Sale confirmed
- `💾 Venta guardada en localStorage` - Saved to reports

### Common Issues

**Cart not showing products**
- Check localStorage key: `carrito`
- Verify format: `{items: [...], total: X, contadorItems: X}`
- Check console for cargarDesdeLocalStorage() errors

**Purchase fails**
- Verify user is logged in: `AuthManager.isLoggedIn()`
- Check user object: `AuthManager.getCurrentUser()`
- Verify backend CORS: Check Network tab for CORS errors
- Check backend endpoints are responding

**Stock not reducing**
- This is backend responsibility
- Backend `confirmar.php` should handle stock reduction
- Check backend database directly
- Verify venta_detalle records were created

**Ticket not showing**
- Check if modal exists in DOM
- Verify CSS animations loaded
- Check console for JavaScript errors
- Ensure modal z-index is high (10000)

## 📊 Verification Endpoints

### Check Sale Created
```javascript
// In browser console
const sales = await window.api.ventas.listar();
console.log(sales);
```

### Check Specific Sale
```javascript
// Replace X with sale ID
const sale = await window.api.ventas.obtenerPorId(X);
console.log(sale);
```

### Check localStorage
```javascript
// View cart
console.log(JSON.parse(localStorage.getItem('carrito')));

// View saved sales
console.log(JSON.parse(localStorage.getItem('minisuper_ventas')));

// View auth
console.log(localStorage.getItem('isLoggedIn'));
console.log(JSON.parse(localStorage.getItem('user')));
```

## 🎯 Expected Behavior Summary

1. **Add to Cart**: Products save to localStorage, counter updates
2. **View Cart**: LinkedList loads from localStorage, displays correctly
3. **Purchase Without Auth**: Redirects to login page
4. **Purchase With Auth**: 
   - Creates sale on backend
   - Adds all products
   - Confirms sale
   - Backend reduces stock
   - Shows beautiful ticket
   - Empties cart
   - Saves to localStorage for reports
5. **Reports**: Sale appears in unified reports system

## 🔗 Key Files

- `Web-Ecommerce/html/principal.html` - Product catalog
- `Web-Ecommerce/html/cart.html` - Shopping cart
- `Web-Ecommerce/jss/script_products.js` - Add to cart logic
- `Web-Ecommerce/jss/script_cart.js` - Cart and purchase logic
- `Web-Ecommerce/jss/api.js` - Backend API integration
- `Web-Ecommerce/jss/auth.js` - Authentication management
- `Web_Administracion/reports.html` - Sales reports

## 🎨 Styling

Ticket modal uses e-commerce color palette:
- Primary green: `#10B981`
- Darker green: `#059669`
- Background: `#f9fafb`
- Text: `#1f2937`, `#6b7280`
- Rounded corners: `8px`, `12px`
- Smooth animations: fadeIn, slideDown

## 📝 Notes

- Backend `confirmar.php` handles stock reduction automatically
- No frontend code needed for inventory updates
- Sales saved to localStorage for offline reporting
- Backend sales also stored in database
- Reports system merges both data sources
- Authentication required for all purchases
- Cart uses LinkedList data structure for practice
- localStorage format compatible between scripts
