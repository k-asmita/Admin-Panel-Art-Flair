/**
 * Art Flair - Interactive Quick Cart Drawer Component
 * Developed for Sabahz Trading
 * 
 * Displays the slide-out product cart with real images from the local Products folder.
 */

const CartDrawerComponent = {
  drawerEl: null,
  overlayEl: null,

  init() {
    if (this.drawerEl && this.overlayEl) return;

    let overlay = document.getElementById('global-cart-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-cart-drawer-overlay';
      overlay.className = 'cart-drawer-overlay';
      document.body.appendChild(overlay);
    }
    this.overlayEl = overlay;

    let drawer = document.getElementById('global-cart-drawer');
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'global-cart-drawer';
      drawer.className = 'cart-drawer';
      drawer.setAttribute('aria-label', 'Shopping Cart Drawer');
      drawer.innerHTML = `
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span>Studio Cart (<span id="cart-drawer-count">0</span>)</span>
          </div>
          <button type="button" class="cart-drawer-close" id="cart-drawer-close-btn" aria-label="Close Cart">✕</button>
        </div>

        <div class="cart-drawer-shipping-notice" id="cart-drawer-shipping-notice">
          <span>🚚 Complimentary studio shipping on orders over ₹1,499</span>
        </div>

        <div class="cart-drawer-body" id="cart-drawer-items-list">
          <div class="spinner"></div>
        </div>

        <div class="cart-drawer-footer" id="cart-drawer-footer-sec">
          <div class="cart-drawer-subtotal-row">
            <span>Subtotal</span>
            <span class="cart-drawer-subtotal-val" id="cart-drawer-subtotal-display">₹0.00</span>
          </div>
          <div class="cart-drawer-buttons">
            <a href="cart.html" class="btn btn-outline-secondary" id="cart-drawer-view-full-btn" style="text-align: center;">
              View Full Cart
            </a>
            <a href="checkout.html" class="btn btn-primary" id="cart-drawer-checkout-btn" style="text-align: center;">
              Checkout
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(drawer);
    }
    this.drawerEl = drawer;

    // Event listeners
    this.overlayEl.addEventListener('click', () => this.close());
    document.getElementById('cart-drawer-close-btn')?.addEventListener('click', () => this.close());
    
    // Keydown escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawerEl.classList.contains('open')) {
        this.close();
      }
    });

    // Delegated click listener on drawer for remove & steppers
    this.drawerEl.addEventListener('click', async (e) => {
      const removeBtn = e.target.closest('[data-action="cart-drawer-remove"]');
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const cartId = removeBtn.dataset.cartId;
        await this.removeItem(cartId);
        return;
      }

      const decBtn = e.target.closest('[data-action="cart-drawer-dec"]');
      if (decBtn) {
        e.preventDefault();
        e.stopPropagation();
        const cartId = decBtn.dataset.cartId;
        const currentQty = parseInt(decBtn.dataset.qty, 10) || 1;
        await this.changeQuantity(cartId, currentQty - 1);
        return;
      }

      const incBtn = e.target.closest('[data-action="cart-drawer-inc"]');
      if (incBtn) {
        e.preventDefault();
        e.stopPropagation();
        const cartId = incBtn.dataset.cartId;
        const currentQty = parseInt(incBtn.dataset.qty, 10) || 1;
        await this.changeQuantity(cartId, currentQty + 1);
        return;
      }
    });
  },

  async open() {
    this.init();
    this.overlayEl.classList.add('open');
    this.drawerEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    await this.renderItems();
  },

  close() {
    if (this.drawerEl) this.drawerEl.classList.remove('open');
    if (this.overlayEl) this.overlayEl.classList.remove('open');
    document.body.style.overflow = '';
  },

  async renderItems() {
    const listEl = document.getElementById('cart-drawer-items-list');
    const countEl = document.getElementById('cart-drawer-count');
    const subtotalEl = document.getElementById('cart-drawer-subtotal-display');
    const footerEl = document.getElementById('cart-drawer-footer-sec');
    const shippingEl = document.getElementById('cart-drawer-shipping-notice');

    if (!listEl) return;

    try {
      const cartData = await CartService.getCart();
      const items = cartData.items || [];
      const totalCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const subtotal = cartData.summary?.subtotal || items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

      if (countEl) countEl.textContent = totalCount;
      if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Update free shipping threshold notice
      if (shippingEl) {
        if (subtotal >= 1499) {
          shippingEl.innerHTML = `<span>🎉 You have qualified for <strong>Complimentary Studio Shipping</strong>!</span>`;
          shippingEl.style.background = 'var(--success-soft)';
          shippingEl.style.color = 'var(--success-dark)';
        } else {
          const remaining = (1499 - subtotal).toFixed(2);
          shippingEl.innerHTML = `<span>Add <strong>₹${Number(remaining).toLocaleString('en-IN')}</strong> more for Complimentary Studio Shipping!</span>`;
          shippingEl.style.background = 'var(--primary-soft)';
          shippingEl.style.color = 'var(--primary)';
        }
      }

      if (items.length === 0) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 40px 10px; color: var(--text-secondary);">
            <div style="font-size: 2.5rem; margin-bottom: 12px; color: var(--text-muted);">🎨</div>
            <h4 style="font-size: 1.1rem; color: var(--text); margin-bottom: 6px;">Your studio cart is empty</h4>
            <p style="font-size: 0.82rem; margin-bottom: 20px;">Explore our curated pure pigments, Belgian linen, and master supplies.</p>
            <a href="shop.html" class="btn btn-primary btn-sm" onclick="CartDrawerComponent.close()">
              Explore Supplies
            </a>
          </div>
        `;
        if (footerEl) footerEl.style.display = 'none';
        return;
      }

      if (footerEl) footerEl.style.display = 'block';

      listEl.innerHTML = items.map(item => {
        const rawImg = String(item.product_image || item.image || item.image_url || '').replace(/^\/+/, '');
        const cat = item.category_name || item.category || 'Accessories';
        const filename = rawImg.split('/').pop() || 'acrylic.jpg';
        const fallbackPath = `Products/${cat}/${filename}`;
        const itemImg = (typeof resolveProductImageUrl === 'function') 
          ? resolveProductImageUrl(item) 
          : (rawImg.startsWith('Products/') ? rawImg : `/static/images/${rawImg}`);
        const itemId = item.cartItemId || item.cart_id || item.productId || item.product_id || item.id;
        const itemPrice = Number(item.price || 0);

        return `
          <div class="cart-drawer-item" data-cart-id="${itemId}">
            <img 
              src="${itemImg}" 
              alt="${item.name || item.product_name}" 
              class="cart-drawer-item-img"
              onerror="this.onerror=null; this.src='${fallbackPath}';"
            />
            <div class="cart-drawer-item-info">
              <a href="product-details.html?id=${item.productId || item.product_id || item.id}" class="cart-drawer-item-title">
                ${item.name || item.product_name}
              </a>
              <div class="cart-drawer-item-meta">
                ${item.brand || 'Artisan'} • ${item.category || 'Fine Art'}
              </div>
              <div class="cart-drawer-item-price">
                ₹${itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div class="cart-drawer-item-actions">
              <button 
                type="button" 
                class="cart-drawer-remove-btn" 
                data-action="cart-drawer-remove"
                data-cart-id="${itemId}"
                title="Remove Item"
                aria-label="Remove item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
              <div class="cart-drawer-stepper">
                <button 
                  type="button" 
                  class="cart-drawer-stepper-btn" 
                  data-action="cart-drawer-dec"
                  data-cart-id="${itemId}"
                  data-qty="${item.quantity}"
                >-</button>
                <span class="cart-drawer-stepper-val">${item.quantity}</span>
                <button 
                  type="button" 
                  class="cart-drawer-stepper-btn" 
                  data-action="cart-drawer-inc"
                  data-cart-id="${itemId}"
                  data-qty="${item.quantity}"
                >+</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

    } catch (e) {
      console.error('Error rendering cart drawer:', e);
      listEl.innerHTML = '<div style="padding: 20px; color: var(--error);">Failed to load cart items.</div>';
    }
  },

  async changeQuantity(cartItemId, newQty) {
    if (!cartItemId) return;
    if (newQty <= 0) {
      return this.removeItem(cartItemId);
    }
    try {
      await CartService.updateQuantity(cartItemId, newQty);
      await this.renderItems();
      if (typeof HeaderComponent !== 'undefined' && typeof HeaderComponent.updateCartBadge === 'function') {
        HeaderComponent.updateCartBadge();
      }
      if (typeof CartPage !== 'undefined' && typeof CartPage.renderCart === 'function') {
        CartPage.renderCart();
      }
    } catch (e) {
      console.error('[CartDrawerComponent] Error updating quantity:', e);
      Toast.error('Could not update quantity');
    }
  },

  async removeItem(cartItemId) {
    if (!cartItemId) return;
    try {
      await CartService.removeItem(cartItemId);
      Toast.info('Item removed from cart');
      await this.renderItems();
      if (typeof HeaderComponent !== 'undefined' && typeof HeaderComponent.updateCartBadge === 'function') {
        HeaderComponent.updateCartBadge();
      }
      if (typeof CartPage !== 'undefined' && typeof CartPage.renderCart === 'function') {
        CartPage.renderCart();
      }
    } catch (e) {
      console.error('[CartDrawerComponent] Error removing item:', e);
      Toast.error('Could not remove item');
    }
  }
};

// Global accessor
window.CartDrawerComponent = CartDrawerComponent;

