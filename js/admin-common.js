/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Common Layout & UI Controller
   ============================================================================== */

const AdminAuth = {
  isAuthenticated() {
    const token = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const user = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_USER);
    return !!(token || user);
  },

  getUser() {
    return StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_USER) || {
      name: 'Sabahz Curator',
      email: 'admin@artflair.in',
      role: 'Master Atelier Administrator'
    };
  },

  async login(email, password, remember = true) {
    // In production, hits API_CONFIG.ENDPOINTS.ADMIN_LOGIN
    const mockUser = {
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: 'Master Administrator'
    };
    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(2);

    StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN, mockToken);
    StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_USER, mockUser);
    return { success: true, token: mockToken, user: mockUser };
  },

  logout() {
    StorageService.remove(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    StorageService.remove(API_CONFIG.STORAGE_KEYS.ADMIN_USER);
    window.location.href = 'login.html';
  },

  showRestrictionModal() {
    AdminToast.show('Please provide valid administrator credentials.', 'error');
  }
};

const AdminToast = {
  getContainer() {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-toast-container';
      container.className = 'admin-toast-container';
      document.body.appendChild(container);
    }
    return container;
  },

  show(message, type = 'success', duration = 3500) {
    const container = this.getContainer();
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span style="flex: 1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

const AdminLayout = {
  navItems: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', url: 'dashboard.html' },
    { id: 'products', label: 'Catalog Products', icon: '🎨', url: 'products.html' },
    { id: 'orders', label: 'Studio Orders', icon: '📦', url: 'orders.html' },
    { id: 'inventory', label: 'Inventory & Stock', icon: '🏷️', url: 'inventory.html' },
    { id: 'customers', label: 'Patron Directory', icon: '👥', url: 'customers.html' },
    { id: 'analytics', label: 'Store Analytics', icon: '📈', url: 'analytics.html' }
  ],

  render(activePageId = 'dashboard') {
    const container = document.getElementById('admin-sidebar-container');
    if (!container) return;

    const user = AdminAuth.getUser();

    const navLinksHtml = this.navItems.map(item => {
      const isActive = item.id === activePageId ? 'active' : '';
      return `
        <li>
          <a href="${item.url}" class="admin-sidebar-link ${isActive}">
            <span class="admin-sidebar-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        </li>
      `;
    }).join('');

    container.innerHTML = `
      <aside class="admin-sidebar" id="admin-sidebar">
        <!-- Brand Logo Header -->
        <a href="dashboard.html" class="admin-sidebar-brand">
          <div class="admin-sidebar-logo">AF</div>
          <div class="admin-sidebar-brand-text">
            <span class="admin-sidebar-brand-title">Art Flair</span>
            <span class="admin-sidebar-brand-sub">Sabahz Atelier</span>
          </div>
        </a>

        <!-- Navigation Menu -->
        <ul class="admin-sidebar-nav">
          <li class="admin-sidebar-section-label">Operations</li>
          ${navLinksHtml}
        </ul>

        <!-- Footer User Profile & Logout -->
        <div class="admin-sidebar-footer">
          <div class="admin-sidebar-user">
            <div class="admin-sidebar-avatar">${(user.name || 'A').substring(0, 1).toUpperCase()}</div>
            <div class="admin-sidebar-user-info">
              <div class="admin-sidebar-user-name">${user.name || 'Sabahz Admin'}</div>
              <div class="admin-sidebar-user-role">${user.email || 'admin@artflair.in'}</div>
            </div>
            <button type="button" class="admin-sidebar-logout-btn" id="btn-admin-logout" title="Sign Out of Atelier">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    `;

    // Logout listener
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you wish to sign out of the Admin Atelier?')) {
          AdminAuth.logout();
        }
      });
    }

    // Insert Mobile Hamburger Toggle Button in Header if not already present
    const headerLeft = document.querySelector('.admin-header-left');
    if (headerLeft && !document.getElementById('btn-mobile-sidebar-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'btn-mobile-sidebar-toggle';
      toggleBtn.className = 'admin-mobile-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle sidebar navigation');
      toggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      headerLeft.prepend(toggleBtn);

      toggleBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) sidebar.classList.toggle('open');
      });
    }
  }
};
