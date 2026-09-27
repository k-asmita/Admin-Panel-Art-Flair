/**
 * Art Flair - Orders Controller
 * Developed for Sabahz Trading
 * 
 * 100% DATABASE-DRIVEN ORDERS IN INDIAN RUPEES (₹):
 * - Retrieves customer's orders from backend database
 * - Status indicators: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
 * - Item lists with backend images, names, quantities & prices
 * - Receipt / Order details modal
 * - Handles loading, empty, and error states
 */

const OrdersPage = {
  allOrders: [],
  currentFilter: 'all',

  async init() {
    this._initSidebarInfo();
    this._bindEvents();
    await this.fetchOrders();
    this.renderRecommendations();
  },

  async renderRecommendations() {
    if (typeof RecommendationEngine !== 'undefined') {
      await RecommendationEngine.render('orders-recommendations-container', {
        title: 'Recommended For Your Next Studio Order',
        columns: 3,
        showBadge: true
      });
    }
  },

  _initSidebarInfo() {
    try {
      const user = AuthService.getCurrentUser();
      const avatarEl = document.getElementById('sidebar-user-avatar');
      const nameEl = document.getElementById('sidebar-user-name');
      const emailEl = document.getElementById('sidebar-user-email');

      if (user && !user.isGuest) {
        if (avatarEl) avatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = user.name || 'Artist Patron';
        if (emailEl) emailEl.textContent = user.email || 'artist@studio.com';
      }
    } catch(e) {}
  },

  async fetchOrders() {
    const container = document.getElementById('orders-view-container');
    if (!container) return;

    // 1. Loading State
    container.innerHTML = `
      <div class="skeleton" style="height: 220px; border-radius: var(--radius-xl); margin-bottom: 20px;"></div>
      <div class="skeleton" style="height: 220px; border-radius: var(--radius-xl);"></div>
    `;

    try {
      // 2. Request Authoritative Orders from Backend
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.GET_ORDERS);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to retrieve orders from database');
      }

      this.allOrders = response.orders || [];
      this.renderFilteredOrders();

    } catch (err) {
      console.error('[OrdersPage] API error fetching orders:', err);
      container.innerHTML = `
        <div class="empty-state" style="border-color: var(--error); max-width: 600px; margin: 40px auto;">
          <div class="empty-state-icon" style="color: var(--error);">⚠️</div>
          <h3 class="empty-state-title" style="color: var(--error);">Unable to Retrieve Orders</h3>
          <p class="empty-state-desc">
            We encountered a network issue communicating with the Sabahz Trading order database.
          </p>
          <button type="button" class="btn btn-primary" onclick="OrdersPage.fetchOrders()">
            Retry Connection
          </button>
        </div>
      `;
    }
  },

  renderFilteredOrders() {
    const container = document.getElementById('orders-view-container');
    if (!container) return;

    let filtered = [...this.allOrders];
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(o => o.status.toLowerCase() === this.currentFilter.toLowerCase());
    }

    // 3. Empty State
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 60px 20px; max-width: 600px; margin: 20px auto; background: var(--card); border: 1px dashed var(--border); border-radius: var(--radius-xl);">
          <div class="empty-state-icon" style="font-size: 3.5rem; margin-bottom: 16px;">📦</div>
          <h2 class="empty-state-title" style="font-size: 1.6rem; color: var(--primary);">No Orders Found</h2>
          <p class="empty-state-desc" style="max-width: 440px; margin: 0 auto 24px;">
            ${this.currentFilter !== 'all' ? `There are no orders with status "${this.currentFilter}".` : 'You have not placed any studio supply orders yet.'}
          </p>
          <a href="shop.html" class="btn btn-primary btn-lg">Explore Fine Art Supplies →</a>
        </div>
      `;
      return;
    }

    // 4. Render Order Cards
    container.innerHTML = filtered.map(order => {
      const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;
      const orderDateFormatted = new Date(order.orderDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <article class="order-card" data-order-id="${order.orderId}">
          <div class="order-card-header">
            <div>
              <div class="order-id-tag">#${order.orderId}</div>
              <div class="order-date-text">Ordered on ${orderDateFormatted} • Paid via ${order.paymentMethod || 'UPI'}</div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="status-badge ${statusClass}">${order.status}</span>
              <span class="badge badge-sage">${order.paymentStatus || 'Paid'}</span>
            </div>
          </div>

          <!-- Items in Order -->
          <div class="order-items-grid">
            ${(order.items || []).map(item => `
              <div class="order-item-row">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                  <img 
                    src="${item.image || item.image_url || `Products/${item.category || 'Accessories'}/${(item.image ? item.image.split('/').pop() : '')}`}" 
                    alt="${item.name}" 
                    style="width: 48px; height: 48px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-light);" 
                    onerror="this.onerror=null; this.src='Products/${item.category || 'Accessories'}/${(item.image ? item.image.split('/').pop() : '')}';"
                  />
                  <div style="min-width: 0;">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-qty">Qty: ${item.quantity} × ₹${(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; flex-shrink: 0;">
                  ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div>
              <span style="font-size: 0.85rem; color: var(--text-secondary);">Order Total:</span>
              <span class="order-total-display">₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div style="display: flex; gap: 8px;">
              <button 
                type="button" 
                class="btn btn-outline btn-sm" 
                onclick="OrdersPage.viewOrderDetails('${order.orderId}')"
              >
                View Archival Receipt
              </button>
              <a href="shop.html" class="btn btn-ghost btn-sm" style="color: var(--primary);">
                Reorder Supplies →
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  viewOrderDetails(orderId) {
    const order = this.allOrders.find(o => o.orderId === orderId);
    if (!order) return;

    const formattedDate = new Date(order.orderDate).toLocaleDateString('en-IN', { dateStyle: 'full' });
    const content = `
      <div style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Sabahz Trading Receipt</div>
            <strong style="font-family: var(--font-mono); font-size: 1.2rem; color: var(--primary);">${order.orderId}</strong>
          </div>
          <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">${order.status}</span>
        </div>

        <div style="margin-bottom: 16px; font-size: 0.85rem; line-height: 1.6; background: var(--bg-alt); padding: 12px; border-radius: var(--radius-md);">
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Customer:</strong> ${order.customer?.firstName || ''} ${order.customer?.lastName || ''} (${order.customer?.email || ''})</div>
          <div><strong>Delivery Address:</strong> ${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}</div>
          <div><strong>Settlement:</strong> ${order.paymentMethod || 'UPI'} • ${order.paymentStatus || 'Paid'}</div>
        </div>

        <h4 style="font-size: 1rem; margin-bottom: 10px;">Supplies Dispatched:</h4>
        <div style="margin-bottom: 16px;">
          ${(order.items || []).map(i => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 0.85rem;">
              <span>${i.name} (×${i.quantity})</span>
              <strong>₹${((i.price || 0) * (i.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--primary); padding-top: 8px;">
          <span>Total Paid</span>
          <span>₹${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    `;

    ModalComponent.open({
      title: 'Studio Order Verification',
      content
    });
  },

  _bindEvents() {
    // Status filter dropdown
    document.getElementById('orders-status-filter')?.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.renderFilteredOrders();
    });

    // Sidebar Logout
    document.getElementById('btn-sidebar-logout')?.addEventListener('click', async () => {
      await AuthService.logout();
      Toast.info('Signed out of Art Flair Studio.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    });
  }
};
