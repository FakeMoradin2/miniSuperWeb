// jss/auth.js - Manejo centralizado de autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        console.log('🔄 AuthManager initialized:', { 
            isAuthenticated: this.isAuthenticated, 
            user: this.currentUser 
        });
    }

    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            
            if (userData && token && isLoggedIn === 'true') {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                console.log('✅ User loaded from storage:', this.currentUser);
            } else {
                console.log('ℹ️ No user found in storage');
                this.clearStorage();
            }
        } catch (error) {
            console.error('❌ Error loading user from storage:', error);
            this.logout();
        }
    }

    clearStorage() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('carrito');
    }

    checkAuthentication() {
        const token = localStorage.getItem('token');
        const isAuth = this.isAuthenticated && this.currentUser && token;
        console.log('🔐 Authentication check:', isAuth);
        return isAuth;
    }

    getUser() {
        return this.currentUser;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    hasRole(requiredRole) {
        const userRole = this.getRole();
        return userRole && userRole.toLowerCase() === requiredRole.toLowerCase();
    }

    hasAnyRole(requiredRoles) {
        const userRole = this.getRole();
        return userRole && requiredRoles.some(role => 
            userRole.toLowerCase() === role.toLowerCase()
        );
    }

    login(userData, token) {
        try {
            // Validar datos del usuario
            if (!userData || !token) {
                throw new Error('Datos de usuario o token inválidos');
            }

            this.currentUser = userData;
            this.isAuthenticated = true;
            
            // Guardar en localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('✅ User logged in:', userData);
            return true;
        } catch (error) {
            console.error('❌ Login error:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        console.log('🚪 Logging out user:', this.currentUser);
        this.currentUser = null;
        this.isAuthenticated = false;
        this.clearStorage();
        
        // Redirigir al login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }

    async logoutWithAPI() {
        try {
            // Llamar al API para cerrar sesión en el servidor
            if (this.getToken()) {
                await window.api.auth.logout();
            }
        } catch (error) {
            console.error('❌ Error calling logout API:', error);
            // Continuar con el logout local aunque falle el API
        } finally {
            // Siempre hacer logout local
            this.logout();
        }
    }

    requireAuth(requiredRoles = []) {
        console.log('🔒 Require auth check for roles:', requiredRoles);
        
        if (!this.checkAuthentication()) {
            console.log('❌ Not authenticated, redirecting to login');
            this.redirectToLogin();
            return false;
        }

        if (requiredRoles.length > 0 && !this.hasAnyRole(requiredRoles)) {
            console.log('❌ Insufficient permissions, redirecting');
            this.redirectToUnauthorized();
            return false;
        }

        console.log('✅ Access granted');
        return true;
    }

    redirectToLogin() {
        console.log('🔀 Redirecting to login');
        window.location.href = 'login.html';
    }

    redirectToUnauthorized() {
        console.warn('⚠️ Unauthorized access attempt by user:', this.currentUser);
        showError('No tienes permisos para acceder a esta página.');
        this.redirectToHome();
    }

    redirectToHome() {
        const role = this.getRole();
        console.log('🏠 Redirecting to home for role:', role);
        this.redirectByRole(role);
    }

    redirectByRole(role) {
        const roleLower = role ? role.toLowerCase() : 'cliente';
        console.log('🎯 Redirecting by role:', roleLower);
        console.log('📍 Current URL:', window.location.href);
        
        const routes = {
            'admin': 'dashboard.html',
            'cajero': 'pos.html',
        };

        const targetRoute = routes[roleLower] || routes['cliente'];
        
        console.log('🎯 Target route:', targetRoute);
        
        // Prevenir redirección innecesaria si ya está en la página correcta
        const currentPath = window.location.pathname;
        if (!currentPath.includes(targetRoute)) {
            console.log('🔄 Performing redirect to:', targetRoute);
            setTimeout(() => {
                window.location.href = targetRoute;
            }, 100);
        } else {
            console.log('ℹ️ Already on correct page, no redirect needed');
        }
    }

    // Método para procesar la respuesta del login del API
    processLoginResponse(apiResponse) {
        if (!apiResponse.success || !apiResponse.usuario || !apiResponse.token) {
            throw new Error('Respuesta del servidor inválida');
        }

        const userData = {
            id: apiResponse.usuario.id,
            phone: apiResponse.usuario.telefono,
            role: apiResponse.usuario.rol,
            name: apiResponse.usuario.nombre_usuario,
            email: apiResponse.usuario.email || ''
        };

        return {
            userData: userData,
            token: apiResponse.token
        };
    }

    // Validar sesión en cada carga de página
    validateSession() {
        if (!this.checkAuthentication()) {
            console.log('🕒 Session expired or invalid');
            this.logout();
            return false;
        }
        return true;
    }

    // Crear botón de cerrar sesión dinámicamente
    createLogoutButton(container = 'body') {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutButton';
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = `
            <span>🚪 Cerrar Sesión</span>
            <span class="logout-loading" style="display: none;">Cerrando...</span>
        `;
        
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const buttonText = logoutBtn.querySelector('span:first-child');
            const loadingText = logoutBtn.querySelector('.logout-loading');
            
            buttonText.style.display = 'none';
            loadingText.style.display = 'inline';
            logoutBtn.disabled = true;
            
            try {
                await this.logoutWithAPI();
            } catch (error) {
                console.error('Error during logout:', error);
                // Forzar logout local si hay error
                this.logout();
            }
        });

        const target = document.querySelector(container);
        if (target) {
            target.appendChild(logoutBtn);
        }
        
        return logoutBtn;
    }

    // Mostrar información del usuario
    createUserInfo(container = 'body') {
        if (!this.currentUser) return null;
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-details">
                <strong>👤 ${this.currentUser.name}</strong>
                <span>(${this.currentUser.role})</span>
                <small>📞 ${this.currentUser.phone}</small>
            </div>
        `;
        
        const target = document.querySelector(container);
        if (target) {
            target.appendChild(userInfo);
        }
        
        return userInfo;
    }
}

// Instancia global con manejo de errores
console.log('🔄 Initializing AuthManager...');
try {
    window.authManager = new AuthManager();
    
    // Validar sesión al cargar la página (excepto en login)
    if (!window.location.href.includes('login.html')) {
        setTimeout(() => {
            window.authManager.validateSession();
        }, 100);
    }
} catch (error) {
    console.error('💥 Error initializing AuthManager:', error);
    // Forzar logout en caso de error crítico
    localStorage.clear();
}