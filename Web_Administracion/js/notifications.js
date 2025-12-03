/**
 * Sistema de Notificaciones Personalizado
 * Reemplaza los alerts del sistema con notificaciones bonitas
 */

(function() {
  'use strict';

  // Crear contenedor de notificaciones si no existe
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  /**
   * Muestra una notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duración en ms (0 = no se cierra automáticamente)
   */
  function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Iconos según el tipo
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    // Títulos según el tipo
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };

    // Limpiar mensaje de errores técnicos
    let cleanMessage = message;
    if (type === 'error') {
      // Remover información técnica como puertos, URLs, etc.
      cleanMessage = cleanMessage
        .replace(/http[s]?:\/\/[^\s]+/g, '')
        .replace(/:\d+/g, '')
        .replace(/Error al conectar con el servidor[^.]*/g, 'Error de conexión')
        .replace(/SQLSTATE\[.*?\]/g, '')
        .replace(/Column not found.*?in 'field list'/g, 'Error en la base de datos')
        .replace(/Unknown column.*?in 'field list'/g, 'Error en la base de datos')
        .replace(/Error desconocido/g, 'Ocurrió un error inesperado')
        .replace(/Error during login/g, 'Error al iniciar sesión')
        .replace(/Login failed/g, 'Error al iniciar sesión')
        .trim();
      
      // Si el mensaje quedó vacío, usar uno genérico
      if (!cleanMessage) {
        cleanMessage = 'Ocurrió un error. Por favor, intenta nuevamente.';
      }
    }

    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-content">
        <div class="notification-title">${titles[type] || titles.info}</div>
        <div class="notification-message">${cleanMessage}</div>
      </div>
      <button class="notification-close" aria-label="Cerrar">×</button>
    `;

    // Agregar al contenedor
    container.appendChild(notification);

    // Función para cerrar
    const closeNotification = () => {
      notification.classList.add('hiding');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    };

    // Event listeners
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', closeNotification);

    // Cerrar automáticamente después de duration
    if (duration > 0) {
      setTimeout(closeNotification, duration);
    }

    return notification;
  }

  // Exponer funciones globales
  window.showNotification = showNotification;
  window.showSuccess = (message, duration) => showNotification(message, 'success', duration);
  window.showError = (message, duration) => showNotification(message, 'error', duration);
  window.showWarning = (message, duration) => showNotification(message, 'warning', duration);
  window.showInfo = (message, duration) => showNotification(message, 'info', duration);

  // Reemplazar alert nativo (opcional, para compatibilidad)
  const originalAlert = window.alert;
  window.alert = function(message) {
    // Detectar tipo de mensaje
    let type = 'info';
    if (message.includes('Error') || message.includes('error')) {
      type = 'error';
    } else if (message.includes('✓') || message.includes('correctamente') || message.includes('exitosamente')) {
      type = 'success';
    } else if (message.includes('Por favor') || message.includes('Debe')) {
      type = 'warning';
    }
    showNotification(message, type, 5000);
  };

})();

