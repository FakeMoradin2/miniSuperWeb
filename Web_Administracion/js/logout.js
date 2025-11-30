// Injects a Logout menu item (if missing) and wires click handler across Admin pages
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    try {
      const sidebarList = document.querySelector('.sidebar ul');
      if (sidebarList && !document.getElementById('logoutBtn')) {
        const li = document.createElement('li');
        li.className = 'logout-item';
        li.innerHTML = '<a href="#" id="logoutBtn" style="color:#ff6b6b;"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>';
        sidebarList.appendChild(li);
      }

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e){
          e.preventDefault();
          if (!confirm('Are you sure you want to log out?')) return;

          try {
            if (window.authManager && typeof window.authManager.logout === 'function') {
              // Prefer centralized logout if available
              window.authManager.logout();
              return;
            }
          } catch(_) {}

          // Fallback: clear common keys and redirect to login
          localStorage.removeItem('userToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          localStorage.removeItem('minisuper_user_session');
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('carrito');
          window.location.href = 'login.html';
        });
      }
    } catch(err){
      console.error('Logout wiring error:', err);
    }
  });
})();
