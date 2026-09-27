/**
 * Art Flair - Shopping Cart Controller
 * Developed for Sabahz Trading
 * 
 * 100% DATABASE-DRIVEN CART IN INDIAN RUPEES (₹):
 * - Requests authoritative cart from backend on load
 * - Submits all quantity increases/decreases, manual inputs, and deletions to API
 * - Re-renders only from backend response
 * - Supports promo codes, free shipping progress bar, and comprehensive error states
 */

const CartPage = {
  activePromoDiscount: 0,
  activePromoCode: '',
  activePromoLabel: '',

  async init() {
    this._restorePromoState();
    this._bindEvents();
    await this.renderCart();
  },

  _restorePromoState() {
    try {
      const saved = sessionStorage.getItem('artflair_promo');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code && parsed.discount > 0) {
          this.activePromoCode = parsed.code;
          this.activePromoDiscount = parsed.discount;
          this.activePromoLabel = parsed.label || `${Math.round(parsed.discount * 100)}% Off`;
        }
      }
    } catch (e) {
      console.warn('[CartPage] Failed to restore promo code from session:', e);
    }
  },

  applyPromoCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) {
      Toast.error('Please enter a promotional code.');
      return;
    }

    const featuredCode = (typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.FEATURED_CODE) ? API_CONFIG.PROMO.FEATURED_CODE.toUpperCase() : 'SABAHZ10';
    const featuredRate = (typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.DISCOUNT_RATE) ? API_CONFIG.PROMO.DISCOUNT_RATE : 0.10;
    const featuredPercent = (typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.DISCOUNT_PERCENT) ? API_CONFIG.PROMO.DISCOUNT_PERCENT : Math.round(featuredRate * 100);

    // Supported promo codes map
    const promoMap = {
      [featuredCode]: { discount: featuredRate, label: `${featuredPercent}% Off` },
      'SABAHZ10': { discount: 0.10, label: '10% Off' },
      'SABAHZ': { discount: 0.10, label: '10% Off' },
      'SAVE10': { discount: 0.10, label: '10% Off' },
      'WELCOME10': { discount: 0.10, label: '10% Off' },
      'STUDIO10': { discount: 0.10, label: '10% Off' },
      'FLAIR10': { discount: 0.10, label: '10% Off' },
      'FIRSTORDER': { discount: 0.10, label: '10% Off' },
      'NEWUSER': { discount: 0.10, label: '10% Off' },
      
      'ARTIST15': { discount: 0.15, label: '15% Off' },
      'ARTIST': { discount: 0.15, label: '15% Off' },
      'SAVE15': { discount: 0.15, label: '15% Off' },
      'STUDIO15': { discount: 0.15, label: '15% Off' },
      'SABAHZ15': { discount: 0.15, label: '15% Off' },
      'CREATIVE15': { discount: 0.15, label: '15% Off' },
      
      'MASTER20': { discount: 0.20, label: '20% Off' },
      'FLAIR20': { discount: 0.20, label: '20% Off' },
      'SAVE20': { discount: 0.20, label: '20% Off' },
      'STUDIO20': { discount: 0.20, label: '20% Off' },
      'SABAHZ20': { discount: 0.20, label: '20% Off' },
      'VIP20': { discount: 0.20, label: '20% Off' },
      
      'ARTFLAIR50': { discount: 0.50, label: '50% Off' }
    };

    if (promoMap[code]) {
      const match = promoMap[code];
      this.activePromoDiscount = match.discount;
      this.activePromoCode = code;
      this.activePromoLabel = match.label;

      try {
        sessionStorage.setItem('artflair_promo', JSON.stringify({
          code: code,
          discount: match.discount,
          label: match.label
        }));
      } catch (e) {}

      Toast.success(`Promo code ${code} applied: ${match.label}!`);
      this.renderCart();
    } else {
      Toast.error(`Invalid promo code "${code}". Try "SABAHZ10", "ARTIST15", or "MASTER20".`);
    }
  },

  removePromoCode() {
    this.activePromoDiscount = 0;
    this.activePromoCode = '';
    this.activePromoLabel = '';
    try {
      sessionStorage.removeItem('artflair_promo');
    } catch (e) {}
    Toast.info('Promotional code removed.');
    this.renderCart();
  },

  async renderCart() {
    const container = document.getElementById('cart-view-container');
    if (!container) return;

    // 1. Loading Shimmer Skeletons
    container.innerHTML = `
      <div class="cart-page-layout">
        <div>
          <div class="skeleton" style="height: 60px; border-radius: 12px; margin-bottom: 20px;"></div>
          <div class="skeleton" style="height: 280px; border-radius: 16px;"></div>
        </div>
        <div class="skeleton" style="height: 380px; border-radius: 16px;"></div>
      </div>
    `;

    try {
      // 2. Request Authoritative Cart from Backend
      const cartResponse = await CartService.getCart();

      if (!cartResponse || !cartResponse.success) {
        throw new Error(cartResponse?.message || 'Failed to retrieve database cart');
      }

      const items = await this._hydrateCartItems(cartResponse.items || []);
      const summary = cartResponse.summary || { subtotal: 0, itemCount: 0 };

      // 3. Render Empty Cart State
      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 60px 20px; max-width: 600px; margin: 40px auto; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm);">
            <div class="empty-state-icon" style="font-size: 3.5rem; margin-bottom: 16px;">🛒</div>
            <h2 class="empty-state-title" style="font-size: 1.8rem; margin-bottom: 8px;">Your Studio Cart is Empty</h2>
            <p class="empty-state-desc" style="max-width: 440px; margin: 0 auto 24px;">
              Your palette is clean and waiting for master-grade pigments, pure cotton canvases, and artisan brushes.
            </p>
            <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
              <a href="products.html" class="btn btn-primary btn-lg">Explore Art Supplies →</a>
              <a href="ai-matcher.html" class="btn btn-outline btn-lg">Launch AI Medium Advisor</a>
            </div>
          </div>
        `;
        return;
      }

      // Calculations with active promo discount in INR
      const subtotal = summary.subtotal || 0;
      const discountAmount = this.activePromoDiscount > 0 ? (subtotal * this.activePromoDiscount) : (summary.discount || 0);
      const freeShippingThreshold = API_CONFIG.SHIPPING.FREE_SHIPPING_THRESHOLD || 1499;
      const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
      const shippingFee = qualifiesForFreeShipping || subtotal === 0 ? 0 : (API_CONFIG.SHIPPING.STANDARD_SHIPPING_FEE || 149);
      const taxRate = API_CONFIG.SHIPPING.TAX_RATE || 0.12;
      const estimatedTax = (subtotal - discountAmount) * taxRate;
      const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);

      // Shipping progress calculation
      const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

      // 4. Render Cart Layout (Items Table & Summary Box)
      container.innerHTML = `
        <div class="cart-page-layout">
          <!-- Left Column: Items Table -->
          <div>
            <!-- Free Shipping Progress Indicator -->
            <div class="free-shipping-card">
              <div class="shipping-progress-text">
                <span style="font-size: 1.1rem;">🚚</span>
                ${qualifiesForFreeShipping ? `
                  <strong style="color: var(--success);">You have unlocked FREE Sabahz Priority Studio Shipping!</strong>
                ` : `
                  <span>Add <strong>₹${remainingForFreeShipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> more of archival materials for <strong>FREE Shipping</strong> (Threshold: ₹${freeShippingThreshold.toLocaleString('en-IN')}).</span>
                `}
              </div>
              <div class="shipping-progress-bar-bg">
                <div class="shipping-progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>

            <!-- Cart Table Card -->
            <div class="cart-items-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
                <h2 style="font-size: 1.3rem; margin-bottom: 0;">Studio Materials (${summary.itemCount} items)</h2>
                <button type="button" class="btn-ghost btn-sm" id="btn-clear-cart" style="color: var(--error);">
                  Clear Studio Cart
                </button>
              </div>

              <div style="overflow-x: auto;">
                <table class="cart-table">
                  <thead>
                    <tr>
                      <th style="width: 45%;">Archival Item</th>
                      <th style="width: 15%;">Unit Price</th>
                      <th style="width: 20%;">Quantity</th>
                      <th style="width: 15%;">Subtotal</th>
                      <th style="width: 5%; text-align: center;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map(item => {
                      const itemSubtotal = (item.price * item.quantity);
                      const isLowStock = item.stock && item.stock <= 10;
                      const rawImg = String(item.product_image || '').replace(/^\/+/, '');
                      const itemImg = rawImg ? `/static/images/${rawImg}` : (item.image || item.image_url);
                      const fallbackPath = `Products/${item.category_name || item.category || 'Accessories'}/${rawImg.split('/').pop()}`;
                      return `
                        <tr class="cart-item-row" data-cart-id="${item.cartItemId}">
                          <td class="cart-item-cell">
                            <div class="cart-product-info">
                              <img 
                                src="${itemImg}" 
                                alt="${item.name}" 
                                class="cart-product-img" 
                                onerror="console.error('Cart image load failed:', this.src); this.onerror=null; this.src='${fallbackPath}';"
                              />
                              <div>
                                <a href="product-details.html?id=${item.productId}" class="cart-product-title">
                                  ${item.name || item.product_name || item.productId}
                                </a>
                                <div class="cart-product-brand">${item.brand || 'Archival'} • ${item.category || 'Supplies'}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                                  SKU: <code>${item.productId}</code>
                                  ${isLowStock ? `<span style="color: var(--secondary); font-weight: 700; margin-left: 6px;">• Only ${item.stock} left in stock</span>` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td class="cart-item-cell">
                            <strong style="color: var(--text);">₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </td>

                          <td class="cart-item-cell">
                            <div class="quantity-stepper" style="max-width: 110px;">
                              <button 
                                type="button" 
                                class="stepper-btn" 
                                data-action="decrease-qty" 
                                data-cart-id="${item.cartItemId}" 
                                data-current-qty="${item.quantity}"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <input 
                                type="number" 
                                class="stepper-input cart-qty-input" 
                                data-cart-id="${item.cartItemId}" 
                                value="${item.quantity}" 
                                min="1" 
                                max="${item.stock || 99}" 
                                aria-label="Item quantity"
                              />
                              <button 
                                type="button" 
                                class="stepper-btn" 
                                data-action="increase-qty" 
                                data-cart-id="${item.cartItemId}" 
                                data-current-qty="${item.quantity}" 
                                data-max-stock="${item.stock || 99}"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td class="cart-item-cell">
                            <span class="cart-item-total">₹${itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </td>

                          <td class="cart-item-cell" style="text-align: center;">
                            <button 
                              type="button" 
                              class="btn-remove-item" 
                              data-action="remove-item" 
                              data-cart-id="${item.cartItemId}" 
                              data-name="${item.name}"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                <a href="products.html" class="btn btn-ghost" style="color: var(--primary);">
                  ← Continue Shopping
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary Box -->
          <aside class="order-summary-card" aria-label="Order Summary">
            <h3 class="summary-title">Studio Order Summary</h3>

            <div class="summary-row">
              <span>Items Subtotal (${summary.itemCount})</span>
              <span>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            ${discountAmount > 0 ? `
              <div class="summary-row" style="color: var(--success); font-weight: 700;">
                <span>Atelier Promo (${this.activePromoCode})</span>
                <span>-₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ` : ''}

            <div class="summary-row">
              <span>Sabahz Shipping</span>
              <span>${qualifiesForFreeShipping ? '<strong style="color: var(--success);">FREE</strong>' : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>

            <div class="summary-row">
              <span>Estimated GST (12%)</span>
              <span>₹${estimatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div class="summary-row total-row">
              <span>Total Investment</span>
              <span class="total-amount">₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <!-- Promo Code Section -->
            ${this.activePromoDiscount > 0 ? `
              <div class="promo-applied-badge">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.1rem;">🏷️</span>
                  <div>
                    <strong style="color: var(--success); font-size: 0.88rem;">${this.activePromoCode} (${this.activePromoLabel || (Math.round(this.activePromoDiscount * 100) + '% Off')})</strong>
                    <div style="font-size: 0.72rem; color: var(--text-secondary);">Discount applied to order</div>
                  </div>
                </div>
                <button type="button" class="btn-ghost btn-sm" id="btn-remove-promo" data-action="remove-promo" style="color: var(--error); font-weight: 600; font-size: 0.78rem; padding: 4px 8px; border-radius: 6px; cursor: pointer;">
                  Remove
                </button>
              </div>
            ` : `
              <div class="cart-promo-hint">
                <span>💡 Have a code? Try <strong class="cart-promo-pill" role="button" tabindex="0" title="Click to apply ${(typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.FEATURED_CODE) || 'SABAHZ10'}" data-apply-code="${(typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.FEATURED_CODE) || 'SABAHZ10'}">${(typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.FEATURED_CODE) || 'SABAHZ10'}</strong> for ${(typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.DISCOUNT_PERCENT) || 10}% off!</span>
              </div>
              <form id="promo-code-form" class="promo-box" onsubmit="return false;">
                <input 
                  type="text" 
                  id="promo-input" 
                  class="form-control promo-input" 
                  placeholder="Promo code (e.g. ${(typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO?.FEATURED_CODE) || 'SABAHZ10'})" 
                  autocomplete="off"
                />
                <button 
                  type="button" 
                  class="btn btn-outline" 
                  id="btn-apply-promo"
                  data-action="apply-promo"
                  style="min-width: 72px;"
                >
                  Apply
                </button>
              </form>
            `}

            <a href="checkout.html" class="btn btn-primary btn-block btn-lg" id="btn-proceed-checkout" style="font-size: 1.05rem;">
              Proceed to Secure Checkout →
            </a>

            <div style="margin-top: 20px; font-size: 0.78rem; color: var(--text-secondary); text-align: center; line-height: 1.5;">
              🔒 256-Bit Encrypted Atelier Checkout <br />
              ASTM D-4236 Certified Materials Guarantee
            </div>
          </aside>
        </div>
      `;

    } catch (err) {
      console.error('[CartPage] Error loading database cart:', err);
      // 5. Error State
      container.innerHTML = `
        <div class="empty-state" style="border-color: var(--error); max-width: 600px; margin: 40px auto;">
          <div class="empty-state-icon" style="color: var(--error);">⚠️</div>
          <h3 class="empty-state-title" style="color: var(--error);">Unable to Retrieve Cart</h3>
          <p class="empty-state-desc">
            We encountered a network issue communicating with the Sabahz Trading cart server.
          </p>
          <button type="button" class="btn btn-primary" onclick="CartPage.renderCart()">
            Retry Loading Cart
          </button>
        </div>
      `;
    }
  },

  async _hydrateCartItems(items) {
    if (!Array.isArray(items) || items.length === 0) return [];

    return Promise.all(items.map(async (item) => {
      const productId = item.productId || item.product_id || item.id;
      let product = null;
      if (productId && typeof ProductService !== 'undefined') {
        try {
          product = await ProductService.getProductById(productId);
        } catch (err) {
          console.warn('[CartPage] Could not fetch product details for', productId, err);
        }
      }

      const merged = {
        ...item,
        ...(product || {}),
        productId,
        cartItemId: item.cartItemId || item.cart_id,
        quantity: item.quantity,
        price: item.price ?? product?.price ?? 0,
        name: item.name || item.product_name || product?.name || productId,
        brand: item.brand || product?.brand,
        category: item.category || item.category_name || product?.category || product?.category_name,
        stock: item.stock ?? product?.stock,
        image: item.image || product?.image,
        image_url: item.image_url || product?.image_url,
        category_image_path: item.category_image_path || product?.category_image_path,
        product_image: item.product_image || product?.product_image
      };

      return merged;
    }));
  },

  _bindEvents() {
    document.addEventListener('click', async (e) => {
      // 1. Increase Quantity
      const incBtn = e.target.closest('[data-action="increase-qty"]');
      if (incBtn) {
        const cartId = incBtn.dataset.cartId;
        const currentQty = parseInt(incBtn.dataset.currentQty, 10) || 1;
        const maxStock = parseInt(incBtn.dataset.maxStock, 10) || 99;

        if (currentQty >= maxStock) {
          Toast.error(`Only ${maxStock} units currently available in studio inventory.`);
          return;
        }

        incBtn.disabled = true;
        try {
          await CartService.updateQuantity(cartId, currentQty + 1);
          await this.renderCart();
        } catch (err) {
          Toast.error(err.message || 'Could not update quantity');
          incBtn.disabled = false;
        }
        return;
      }

      // 2. Decrease Quantity
      const decBtn = e.target.closest('[data-action="decrease-qty"]');
      if (decBtn) {
        const cartId = decBtn.dataset.cartId;
        const currentQty = parseInt(decBtn.dataset.currentQty, 10) || 1;

        if (currentQty <= 1) {
          if (confirm('Remove this item from your studio cart?')) {
            decBtn.disabled = true;
            try {
              await CartService.removeItem(cartId);
              Toast.info('Item removed from cart.');
              await this.renderCart();
            } catch (err) {
              Toast.error(err.message || 'Error removing item');
              decBtn.disabled = false;
            }
          }
          return;
        }

        decBtn.disabled = true;
        try {
          await CartService.updateQuantity(cartId, currentQty - 1);
          await this.renderCart();
        } catch (err) {
          Toast.error(err.message || 'Could not update quantity');
          decBtn.disabled = false;
        }
        return;
      }

      // 3. Remove Item
      const removeBtn = e.target.closest('[data-action="remove-item"]');
      if (removeBtn) {
        const cartId = removeBtn.dataset.cartId;
        const itemName = removeBtn.dataset.name || 'Item';
        removeBtn.disabled = true;

        try {
          await CartService.removeItem(cartId);
          Toast.info(`Removed "${itemName}" from your cart.`);
          await this.renderCart();
        } catch (err) {
          Toast.error(err.message || 'Could not remove item');
          removeBtn.disabled = false;
        }
        return;
      }

      // 4. Clear Entire Cart
      if (e.target.id === 'btn-clear-cart') {
        if (confirm('Are you sure you want to clear your entire studio cart?')) {
          try {
            await CartService.clearCart();
            Toast.info('Studio cart cleared.');
            this.activePromoDiscount = 0;
            this.activePromoCode = '';
            this.activePromoLabel = '';
            try { sessionStorage.removeItem('artflair_promo'); } catch (e) {}
            await this.renderCart();
          } catch (err) {
            Toast.error(err.message || 'Could not clear cart');
          }
        }
      }

      // 5. Apply Promo Code Pill Click (from hint)
      const applyCodePill = e.target.closest('[data-apply-code]');
      if (applyCodePill) {
        e.preventDefault();
        const code = applyCodePill.dataset.applyCode;
        if (code) {
          const input = document.getElementById('promo-input');
          if (input) input.value = code;
          this.applyPromoCode(code);
        }
        return;
      }

      // 6. Apply Promo Code Button Click
      const applyPromoBtn = e.target.closest('[data-action="apply-promo"]') || (e.target.id === 'btn-apply-promo' ? e.target : null);
      if (applyPromoBtn) {
        e.preventDefault();
        const input = document.getElementById('promo-input');
        this.applyPromoCode(input?.value);
        return;
      }

      // 7. Remove Promo Code Button Click
      const removePromoBtn = e.target.closest('[data-action="remove-promo"]') || (e.target.id === 'btn-remove-promo' ? e.target : null);
      if (removePromoBtn) {
        e.preventDefault();
        this.removePromoCode();
        return;
      }
    });

    // Manual Quantity Input Changes
    document.addEventListener('change', async (e) => {
      if (e.target.classList.contains('cart-qty-input')) {
        const cartId = e.target.dataset.cartId;
        const newQty = parseInt(e.target.value, 10);
        const maxStock = parseInt(e.target.max, 10) || 99;

        if (isNaN(newQty) || newQty <= 0) {
          Toast.error('Please enter a valid quantity of 1 or more.');
          await this.renderCart();
          return;
        }

        if (newQty > maxStock) {
          Toast.error(`Maximum available stock is ${maxStock}. Setting quantity to ${maxStock}.`);
          e.target.value = maxStock;
        }

        try {
          await CartService.updateQuantity(cartId, Math.min(newQty, maxStock));
          await this.renderCart();
        } catch (err) {
          Toast.error(err.message || 'Error updating item quantity');
          await this.renderCart();
        }
      }
    });

    // Promo Code Form Submit / Enter Key
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'promo-code-form') {
        e.preventDefault();
        const input = document.getElementById('promo-input');
        this.applyPromoCode(input?.value);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'promo-input') {
        e.preventDefault();
        this.applyPromoCode(e.target.value);
      }
    });
  }
};
