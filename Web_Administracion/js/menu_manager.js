// js/menu-manager.js - Gestión dinámica del menú lateral
class MenuManager {
    static init() {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                MenuManager.setupMenuByRole();
            }, 200);
        });
    }
    
    static setupMenuByRole() {
        if (!window.authManager || !window.authManager.checkAuthentication()) {
            return;
        }
        
        const userRole = window.authManager.getRole();
        console.log('📋 Setting up menu for role:', userRole);
        
        // Agregar botón de logout si no existe
        MenuManager.addLogoutButton();
        
        // Configurar menú según el rol
        if (userRole === 'cajero') {
            MenuManager.setupCajeroMenu();
        } else if (userRole === 'admin') {
            MenuManager.setupAdminMenu();
        }
    }
    
    static addLogoutButton() {
        if (!document.getElementById('logoutBtn')) {
            const sidebarList = document.querySelector('.sidebar ul');
            if (sidebarList) {
                const li = document.createElement('li');
                li.className = 'logout-item';
                li.innerHTML = '<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i><span>Cerrar Sesión</span></a>';
                sidebarList.appendChild(li);
                
                // Agregar event listener al botón de logout
                document.getElementById('logoutBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                        window.authManager.logout();
                    }
                });
            }
        }
    }
    
    static setupCajeroMenu() {
        console.log('👨‍💼 Setting up CAJERO menu');
        
        // Solo mostrar POS y Logout
        const allMenuItems = document.querySelectorAll('.sidebar ul li');
        allMenuItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href === 'pos.html' || item.classList.contains('logout-item')) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
        
        console.log('✅ Cajero menu setup complete - only POS visible');
    }
    
    static setupAdminMenu() {
        console.log('👑 Setting up ADMIN menu');
        // Mostrar todo para admin
        const allMenuItems = document.querySelectorAll('.sidebar ul li');
        allMenuItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}

// Inicializar gestor de menú
MenuManager.init();