/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Common Layout & UI Controller
   ============================================================================== */

const AdminAuth = {
  // Immutable fixed administrator credentials for Atelier Master Access
  FIXED_CREDENTIALS: {
    emails: ['admin@artflair.in', 'admin@artflair.com'],
    password: 'Admin@24' // Strictly Admin@24 only
  },

  isAuthenticated() {
    const token = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const user = StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_USER);
    if (!token || !user || !user.email) return false;
    const email = String(user.email).trim().toLowerCase();
    return this.FIXED_CREDENTIALS.emails.includes(email);
  },

  getUser() {
    return StorageService.get(API_CONFIG.STORAGE_KEYS.ADMIN_USER) || {
      name: 'Sabahz Curator',
      email: 'admin@artflair.in',
      role: 'Master Atelier Administrator'
    };
  },

  async login(email, password, remember = true) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error('Please enter both your administrator email and password.');
    }

    // STRICT CHECK: Password MUST match Admin@24 exactly. Reject immediately if different!
    const isEmailValid = this.FIXED_CREDENTIALS.emails.includes(cleanEmail);
    const isPassValid = (cleanPass === this.FIXED_CREDENTIALS.password);

    if (!isEmailValid || !isPassValid) {
      throw new Error('Invalid administrator credentials. Access restricted to authorized Atelier administrators only.');
    }

    // Attempt backend validation if API server is available
    if (typeof ApiClient !== 'undefined' && API_CONFIG && API_CONFIG.ENDPOINTS.ADMIN_LOGIN) {
      try {
        const res = await ApiClient.post(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
          email: cleanEmail,
          password: cleanPass
        });
        if (res && res.success === true) {
          const user = res.user || {
            name: 'Sabahz Curator',
            email: 'admin@artflair.in',
            role: 'Master Atelier Administrator'
          };
          const token = res.token || ('admin_jwt_' + Math.random().toString(36).substring(2));
          StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN, token);
          StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_USER, user);
          return { success: true, token, user };
        } else if (res && (res.success === false || res.error)) {
          throw new Error(res.error || 'Invalid administrator credentials. Access restricted.');
        }
      } catch (err) {
        if (err.message && (err.message.includes('Invalid') || err.message.includes('Access restricted') || err.message.includes('required'))) {
          throw err;
        }
        // If network / server error, fall through to verified local session
      }
    }

    const adminUser = {
      name: 'Sabahz Curator',
      email: 'admin@artflair.in',
      role: 'Master Atelier Administrator'
    };
    const adminToken = 'art_flair_admin_jwt_' + Math.random().toString(36).substring(2) + Date.now();

    StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_TOKEN, adminToken);
    StorageService.set(API_CONFIG.STORAGE_KEYS.ADMIN_USER, adminUser);
    return { success: true, token: adminToken, user: adminUser };
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
    
    toast.innerHTML = `
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
    { id: 'dashboard', label: 'Dashboard', icon: '', url: 'dashboard.html' },
    { id: 'products', label: 'Catalog Products', icon: '', url: 'products.html' },
    { id: 'orders', label: 'Orders', icon: '', url: 'orders.html' },
    { id: 'inventory', label: 'Inventory & Stock', icon: '', url: 'inventory.html' },
    { id: 'customers', label: 'Customer Directory', icon: '', url: 'customers.html' },
    { id: 'analytics', label: 'Analysis', icon: '', url: 'analytics.html' }
  ],

  render(activePageId = 'dashboard') {
    // SECURITY GUARD: Redirect to login immediately if session is not authenticated
    if (!AdminAuth.isAuthenticated()) {
      window.location.replace('login.html');
      throw new Error('Access denied: Authentication required.');
    }

    const container = document.getElementById('admin-sidebar-container');
    if (!container) return;

    const user = AdminAuth.getUser();

    const navLinksHtml = this.navItems.map(item => {
      const isActive = item.id === activePageId ? 'active' : '';
      const iconHtml = item.icon ? `<span class="admin-sidebar-icon">${item.icon}</span>` : '';
      return `
        <li>
          <a href="${item.url}" class="admin-sidebar-link ${isActive}">
            ${iconHtml}
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

        <!-- Database Connectivity Status Pill -->
        <div class="admin-sidebar-db-status" id="sidebar-db-status" title="Connecting to live MySQL database...">
          <span class="admin-db-indicator-dot"></span>
          <span class="admin-db-status-label" id="sidebar-db-status-label">Checking Database...</span>
        </div>

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

    // Automatically check live database status
    this.checkDbStatus();
  },

  async checkDbStatus() {
    const statusEl = document.getElementById('sidebar-db-status');
    const labelEl = document.getElementById('sidebar-db-status-label');
    if (!statusEl || !labelEl) return;

    try {
      const res = await ApiClient.get('/health');
      if (res && res.status === 'online' && res.database && res.database.connected) {
        statusEl.classList.remove('offline');
        const dbName = res.database.database || 'art_flair';
        labelEl.textContent = `MySQL: ${dbName} (Live)`;
        statusEl.title = `Connected to ${res.database.engine || 'MySQL'} at ${res.database.host}\nCatalog: ${res.table_counts?.products ?? 0} Products · ${res.table_counts?.orders ?? 0} Orders\nClick for details`;
        
        statusEl.onclick = () => {
          AdminCommon.showModal({
            title: 'Live MySQL Database Connected',
            content: `
              <div style="font-size: 0.88rem; line-height: 1.6;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px; color: #2ed573; font-weight: 600;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #2ed573;"></span>
                  Database Operational & Real-Time Synced
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Database:</td><td><strong>${dbName}</strong></td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Engine:</td><td>${res.database.engine} (v${res.database.mysql_version || '8.4'})</td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Host Server:</td><td style="word-break: break-all; font-family: monospace; font-size: 0.78rem;">${res.database.host}:${res.database.port || 12106}</td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">User Account:</td><td><code>${res.database.authenticated_user || 'avnadmin'}</code></td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Catalog Products:</td><td><strong style="color: var(--admin-terracotta);">${res.table_counts?.products ?? 0}</strong> live items</td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Customer Orders:</td><td><strong>${res.table_counts?.orders ?? 0}</strong> live orders</td></tr>
                  <tr style="border-bottom: 1px solid var(--admin-border);"><td style="padding: 7px 0; color: var(--admin-text-secondary);">Patron Accounts:</td><td><strong>${res.table_counts?.users ?? 0}</strong> patrons</td></tr>
                </table>
                <div style="text-align: right;">
                  <button type="button" class="btn-admin btn-admin-primary btn-admin-sm" onclick="AdminCommon.closeModal()">Close</button>
                </div>
              </div>
            `
          });
        };
      } else {
        throw new Error('Database unreachable');
      }
    } catch (e) {
      statusEl.classList.add('offline');
      labelEl.textContent = 'MySQL Offline (Cache Mode)';
      statusEl.title = 'Backend server unreachable. Click to view instructions.';
      statusEl.onclick = () => {
        AdminCommon.showModal({
          title: 'Backend Server Notice',
          content: `
            <div style="font-size: 0.88rem; line-height: 1.6;">
              <p style="color: var(--admin-red); font-weight: 600; margin-bottom: 10px;">Backend REST API server is currently not responding.</p>
              <p style="margin-bottom: 12px; color: var(--admin-text-secondary);">The admin panel is currently operating in offline cache mode.</p>
              <p><strong>To connect to live MySQL:</strong></p>
              <ul style="margin-left: 20px; margin-bottom: 16px;">
                <li>Start the server by double-clicking <code>start_admin.bat</code> or running <code>py app.py</code> in terminal.</li>
                <li>Make sure port 5000 is open.</li>
              </ul>
              <div style="text-align: right;">
                <button type="button" class="btn-admin btn-admin-primary btn-admin-sm" onclick="AdminCommon.closeModal()">Dismiss</button>
              </div>
            </div>
          `
        });
      };
    }
  }
};

/* ------------------------------------------------------------------------------
   Global Neutral Product Image Fallback, Modal Manager & Currency Formatter
   ------------------------------------------------------------------------------ */
const AdminCommon = {
  // Neutral artistic SVG placeholder (palette and brush) in Art Flair warm-cream palette
  PLACEHOLDER_IMAGE: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80' fill='none'%3E%3Crect width='80' height='80' rx='14' fill='%23F4EFEA'/%3E%3Cpath d='M40 18C27.85 18 18 27.85 18 40C18 47.2 21.4 53.6 26.8 57.6C28.4 58.8 30.6 57.6 30.6 55.6C30.6 54.2 31.4 52.8 32.8 52.2C34.4 51.5 36.3 52.3 37.1 53.9C38.1 56 40.5 57.4 43 57.1C53.7 55.8 62 46.8 62 35.8C62 26 52.1 18 40 18Z' fill='%23E8DEC8' stroke='%23B8A690' stroke-width='2.5' stroke-linejoin='round'/%3E%3Ccircle cx='28' cy='30' r='3.8' fill='%23C85A32'/%3E%3Ccircle cx='39' cy='27' r='3.8' fill='%23D4AF37'/%3E%3Ccircle cx='50' cy='32' r='3.8' fill='%235B7065'/%3E%3Ccircle cx='53' cy='43' r='3.8' fill='%238B5E83'/%3E%3Cellipse cx='46' cy='49' rx='3.5' ry='4.5' fill='%23F4EFEA' stroke='%23B8A690' stroke-width='1.8'/%3E%3Cpath d='M22 62L36 48' stroke='%238A6E58' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M36 48L39 45L42 48L39 51L36 48Z' fill='%23C85A32'/%3E%3C/svg%3E",

  handleImgError(img) {
    if (!img) return;
    img.onerror = null;
    img.src = this.PLACEHOLDER_IMAGE;
  },

  formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  showModal({ title, content }) {
    this.closeModal();
    const backdrop = document.createElement('div');
    backdrop.id = 'admin-common-modal-backdrop';
    backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease;';
    
    const card = document.createElement('div');
    card.style.cssText = 'background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 16px; max-width: 520px; width: 100%; box-shadow: 0 12px 40px rgba(0,0,0,0.4); padding: 24px; position: relative;';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--admin-border); padding-bottom: 12px;">
        <h3 style="margin: 0; font-family: var(--admin-font-heading); font-size: 1.15rem; color: var(--admin-text);">${title}</h3>
        <button type="button" style="background: none; border: none; font-size: 1.4rem; color: var(--admin-text-secondary); cursor: pointer; line-height: 1;" onclick="AdminCommon.closeModal()">&times;</button>
      </div>
      <div>${content}</div>
    `;
    
    backdrop.appendChild(card);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) AdminCommon.closeModal();
    };
    document.body.appendChild(backdrop);
  },

  closeModal() {
    const el = document.getElementById('admin-common-modal-backdrop');
    if (el) el.remove();
  }
};

window.handleImgError = function(img) {
  AdminCommon.handleImgError(img);
};

// Global error listener catches image loading failures across the admin panel
window.addEventListener('error', function(event) {
  if (event && event.target && event.target.tagName === 'IMG') {
    AdminCommon.handleImgError(event.target);
  }
}, true);

/* ------------------------------------------------------------------------------
   Unified Atelier Stock Evaluation & Alert Threshold Engine
   ------------------------------------------------------------------------------ */
const AdminInventory = {
  STOCK_LOW_THRESHOLD: 10,

  evaluateStock(products) {
    const list = Array.isArray(products) ? products : [];
    
    // Clearly separated tiers:
    // Out of Stock: stock == 0
    // Low Stock: 1 <= stock <= 10
    // Healthy Stock: stock > 10
    const outOfStock = list.filter(p => Number(p.stock) === 0);
    const lowStock = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= this.STOCK_LOW_THRESHOLD);
    const healthy = list.filter(p => Number(p.stock) > this.STOCK_LOW_THRESHOLD);

    // Sorted with Out of Stock FIRST, followed by Low Stock sorted ascending
    const sortedLowStock = [...lowStock].sort((a, b) => Number(a.stock) - Number(b.stock));
    const allAlerts = [...outOfStock, ...sortedLowStock];

    return {
      outOfStock,
      lowStock,
      healthy,
      allAlerts,
      outCount: outOfStock.length,
      lowCount: lowStock.length,
      healthyCount: healthy.length,
      alertCount: allAlerts.length,
      summaryText: `${lowStock.length} low stock · ${outOfStock.length} out of stock`
    };
  }
};
