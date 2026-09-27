/**
 * Art Flair - Toast Notification Engine
 * Sabahz Trading
 */

const Toast = {
  container: null,

  init() {
    if (!this.container) {
      let el = document.getElementById('toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show(message, type = 'info', duration = 3500) {
    this.init();

    const toastEl = document.createElement('div');
    toastEl.className = `toast-message toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    toastEl.innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem; line-height: 1;">${icon}</div>
      <div style="flex: 1;">${message}</div>
    `;

    this.container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('toast-hiding');
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, duration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  },

  info(message) {
    this.show(message, 'info');
  }
};
