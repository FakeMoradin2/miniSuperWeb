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
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            
            if (userData && isLoggedIn === 'true') {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                console.log('✅ User loaded from storage:', this.currentUser);
            } else {
                console.log('ℹ️ No user found in storage');
            }
        } catch (error) {
            console.error('❌ Error loading user from storage:', error);
            this.logout();
        }
    }

    checkAuthentication() {
        const isAuth = this.isAuthenticated && this.currentUser;
        console.log('🔐 Authentication check:', isAuth);
        return isAuth;
    }

    getUser() {
        return this.currentUser;
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

    login(userData) {
        try {
            this.currentUser = userData;
            this.isAuthenticated = true;
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log('✅ User logged in:', userData);
            return true;
        } catch (error) {
            console.error('❌ Login error:', error);
            return false;
        }
    }

    logout() {
        console.log('🚪 Logging out user:', this.currentUser);
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('carrito');
        
        // Redirigir al login
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
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
        alert('You do not have permission to access this page.');
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
        
        switch(roleLower) {
            case 'admin':
                window.location.href = '../admin/dashboard.html';
                break;
            case 'cajero':
                window.location.href = '../cajero/pos.html';
                break;
            case 'cliente':
            default:
                window.location.href = 'principal.html';
                break;
        }
    }
}

// Instancia global
console.log('🔄 Initializing AuthManager...');
window.authManager = new AuthManager();