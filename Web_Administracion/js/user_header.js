// js/user_header.js - Render logged-in user info in admin header
(function(){
  function capitalize(word){
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : '';
  }
  function getInitials(name){
    if (!name) return 'US';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2){
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    const s = parts[0];
    const a = s[0] || 'U';
    const b = s[1] || 'S';
    return (a + b).toUpperCase();
  }
  function render(){
    if (!window.authManager || !window.authManager.checkAuthentication()) return;
    const user = window.authManager.getUser();
    const container = document.querySelector('.header-top .user') || document.querySelector('.user');
    if (!container || !user) return;
    const name = user.name || user.username || 'Usuario';
    const role = capitalize(user.role || '');
    const initials = getInitials(name);
    container.innerHTML = `
      <div class="avatar">${initials}</div>
      <div>
        <div style="font-weight:700">${capitalize(name)}</div>
        <div style="color:var(--gray);font-size:.9rem">${role}</div>
      </div>
    `;
  }
  document.addEventListener('DOMContentLoaded', function(){
    // give authManager a moment to initialize
    setTimeout(render, 150);
  });
})();
