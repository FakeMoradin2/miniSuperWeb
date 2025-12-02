// js/role-protection.js - Protección global de rutas + Ocultar menú
class RoleProtection {
    static init() {
        document.addEventListener('DOMContentLoaded', function() {
            // Esperar a que authManager esté listo
            setTimeout(() => {
                const currentPage = window.location.pathname.split('/').pop();
                console.log('🛡️ Role protection checking:', currentPage);
                
                // Páginas que requieren autenticación
                const protectedPages = [
                    'dashboard.html', 'inventory.html', 'reports.html', 
                    'customers.html', 'proveedores.html', 'categoria.html',
                    'signup_workers.html', 'pos.html'
                ];
                
                if (protectedPages.includes(currentPage)) {
                    console.log('🛡️ Page is protected, checking access...');
                    
                    // Verificar autenticación primero
                    if (!window.authManager.checkAuthentication()) {
                        window.authManager.redirectToLogin();
                        return;
                    }
                    
                    // Verificar acceso a la página específica por rol
                    const role = window.authManager.getRole();
                    const roleLower = role ? role.toLowerCase() : '';
                    const accessMap = {
                        admin: new Set(['dashboard.html','inventory.html','reports.html','customers.html','proveedores.html','categoria.html','signup_workers.html','pos.html']),
                        cajero: new Set(['pos.html'])
                    };
                    const allowed = accessMap[roleLower] || new Set();
                    if (!allowed.has(currentPage)) {
                        console.warn('⛔ Page not allowed for role:', roleLower, currentPage);
                        window.authManager.redirectToUnauthorized();
                        return;
                    }
                    
                    console.log('✅ Access granted to protected page');
                }
                
                // OCULTAR OPCIONES DEL MENÚ SEGÚN EL ROL
                RoleProtection.hideMenuItems();
            }, 100);
        });
    }
    
    static hideMenuItems() {
        const userRole = window.authManager.getRole();
        console.log('🎯 Hiding menu items for role:', userRole);
        
        if (userRole === 'cajero') {
            // Ocultar todas las opciones excepto POS y Logout
            const items = document.querySelectorAll('.sidebar ul li');
            items.forEach(item => {
                const link = item.querySelector('a');
                const isPos = link && link.getAttribute('href') === 'pos.html';
                const isLogout = item.classList.contains('logout-item');
                item.style.display = (isPos || isLogout) ? 'block' : 'none';
            });
            console.log('📱 Menu hidden for cajero - only POS visible');
        }
    }
}

// Inicializar protección
RoleProtection.init();