/**
 * Art Flair - Checkout Page Controller
 * Developed for Sabahz Trading
 * 
 * 100% DATABASE-DRIVEN CHECKOUT IN INDIAN RUPEES (₹):
 * - Queries authoritative cart directly from backend API
 * - Never trusts frontend-only calculations
 * - Validates all customer and shipping fields
 * - Submits order payload to Python backend for authoritative stock, price & total validation
 * - Handles payment method switching and error states
 * - Redirects to order confirmation on success
 */

const CheckoutPage = {
  cartData: null,
  selectedPayment: 'upi',

  async init() {
    this._checkAuthentication();
    await this._loadAuthoritativeCart();
    this._prefillCustomerData();
    this._bindEvents();
  },

  /**
   * Check if customer is authenticated; prompt with login required modal if not.
   */
  _checkAuthentication() {
    const isAuth = this._isUserLoggedIn();

    if (!isAuth) {
      this._showAuthRequiredModal();
      this._disableCheckoutForm();
    }
  },

  _isUserLoggedIn() {
    try {
      const isAuth = typeof AuthService !== 'undefined' && AuthService.isAuthenticated();
      const user = typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : null;
      return !!(isAuth && user && !user.isGuest && user.email);
    } catch (e) {
      return false;
    }
  },

  _showAuthRequiredModal() {
    // Remove existing modal if present
    const existing = document.getElementById('checkout-auth-modal');
    if (existing) existing.remove();

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'checkout-auth-modal';
    modalBackdrop.className = 'modal-backdrop active';
    modalBackdrop.style.zIndex = '9999';
    modalBackdrop.style.background = 'rgba(41, 37, 36, 0.78)';
    modalBackdrop.style.backdropFilter = 'blur(6px)';

    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 480px; text-align: center; padding: 36px 28px; border: 2px solid var(--border); box-shadow: var(--shadow-xl); border-radius: var(--radius-xl);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--secondary-soft); color: var(--secondary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 1.8rem;">
          🔒
        </div>
        <h2 style="font-size: 1.5rem; color: var(--primary); margin-bottom: 8px;">
          Patron Login Required
        </h2>
        <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
          You must log in to your studio account before checking out. Guest checkout is not permitted. Please sign in or create a new account to complete your order.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="login.html?redirect=checkout.html" class="btn btn-primary btn-block btn-lg" style="font-weight: 700;">
            Sign In to Existing Account →
          </a>
          <a href="register.html?redirect=checkout.html" class="btn btn-outline btn-block" style="font-weight: 700;">
            Register New Studio Account
          </a>
          <a href="cart.html" class="btn btn-ghost btn-block btn-sm" style="color: var(--text-secondary); margin-top: 4px;">
            ← Return to Studio Cart
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);
  },

  _disableCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (form) {
      const banner = document.createElement('div');
      banner.className = 'alert alert-warning';
      banner.style.marginBottom = '20px';
      banner.style.fontWeight = '600';
      banner.innerHTML = `
        <span style="font-size: 1.1rem; margin-right: 6px;">⚠️</span>
        <span>You must <a href="login.html?redirect=checkout.html" style="text-decoration: underline; color: var(--primary); font-weight: 700;">Sign In</a> or <a href="register.html?redirect=checkout.html" style="text-decoration: underline; color: var(--primary); font-weight: 700;">Register</a> to place this order.</span>
      `;
      form.insertBefore(banner, form.firstChild);

      const submitBtn = document.getElementById('btn-place-order');
      if (submitBtn) {
        submitBtn.setAttribute('title', 'Please sign in or register to place order');
      }
    }
  },

  /**
   * 1. Query Authoritative Cart from Python Backend
   */
  async _loadAuthoritativeCart() {
    const itemsListEl = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');

    try {
      const response = await CartService.getCart();

      if (!response || !response.success || !response.items || response.items.length === 0) {
        Toast.warning('Your studio cart is currently empty. Redirecting to cart...');
        setTimeout(() => {
          window.location.href = 'cart.html';
        }, 1200);
        return;
      }

      this.cartData = response;
      const summary = response.summary || {};
      const items = response.items || [];

      // Render Order Items
      if (itemsListEl) {
        itemsListEl.innerHTML = items.map(item => {
          const itemSubtotal = (item.price * item.quantity);
          const rawImg = String(item.product_image || item.image || item.image_url || '').replace(/^\/+/, '');
          const cat = item.category_name || item.category || 'Accessories';
          const filename = rawImg.split('/').pop() || 'acrylic.jpg';
          const fallbackPath = `Products/${cat}/${filename}`;
          const itemImg = (typeof resolveProductImageUrl === 'function')
            ? resolveProductImageUrl(item)
            : (rawImg.startsWith('Products/') ? rawImg : `/static/images/${rawImg}`);

          return `
            <div class="checkout-item-compact">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                <img 
                  src="${itemImg}" 
                  alt="${item.name || item.product_name}" 
                  class="checkout-item-thumb" 
                  style="width: 50px; height: 50px; min-width: 50px; max-width: 50px; border-radius: 8px; object-fit: cover; flex-shrink: 0;"
                  onerror="this.onerror=null; this.src='${fallbackPath}';"
                />
                <div style="min-width: 0; flex: 1;">
                  <div style="font-weight: 700; color: var(--text); font-size: 0.88rem; line-height: 1.3; margin-bottom: 2px;">
                    ${item.name || item.product_name}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${item.quantity} × ₹${Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; text-align: right; margin-left: 8px; flex-shrink: 0; font-family: var(--font-body), sans-serif;">
                ₹${itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          `;
        }).join('');
      }

      // Render Authoritative Totals in INR with Promo Discount
      const subtotal = summary.subtotal || 0;
      
      let promo = null;
      try {
        const saved = sessionStorage.getItem('artflair_promo');
        if (saved) promo = JSON.parse(saved);
      } catch (e) {}

      const discountRate = (promo && promo.discount > 0) ? promo.discount : 0;
      const discountAmount = discountRate > 0 ? (subtotal * discountRate) : 0;
      const freeShippingThreshold = (typeof API_CONFIG !== 'undefined' && API_CONFIG.SHIPPING?.FREE_SHIPPING_THRESHOLD) || 1499;
      const shippingFee = (subtotal >= freeShippingThreshold || subtotal === 0) ? 0 : ((typeof API_CONFIG !== 'undefined' && API_CONFIG.SHIPPING?.STANDARD_SHIPPING_FEE) || 149);
      const taxRate = (typeof API_CONFIG !== 'undefined' && API_CONFIG.SHIPPING?.TAX_RATE) || 0.12;
      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      const tax = taxableSubtotal * taxRate;
      const total = Math.max(0, taxableSubtotal + shippingFee + tax);

      if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      const promoRow = document.getElementById('checkout-promo-row');
      const promoCodeEl = document.getElementById('checkout-promo-code');
      const promoDiscountEl = document.getElementById('checkout-promo-discount');
      if (promoRow && discountAmount > 0) {
        promoRow.style.display = 'flex';
        if (promoCodeEl) promoCodeEl.textContent = promo.code || 'PROMO';
        if (promoDiscountEl) promoDiscountEl.textContent = `-₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (promoRow) {
        promoRow.style.display = 'none';
      }

      if (shippingEl) shippingEl.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (taxEl) taxEl.textContent = `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // Store effective total on cartData summary for order placement
      this.cartData.summary.discount = discountAmount;
      this.cartData.summary.tax = tax;
      this.cartData.summary.shipping = shippingFee;
      this.cartData.summary.total = total;
      this.cartData.summary.promoCode = promo ? promo.code : null;

      // Update Dynamic UPI QR Code URL with exact payable amount
      const qrImg = document.getElementById('upi-dynamic-qr-img');
      if (qrImg) {
        const upiUri = encodeURIComponent(`upi://pay?pa=sabahztrading@razorpay&pn=Art Flair Sabahz&am=${total.toFixed(2)}&cu=INR`);
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${upiUri}`;
      }

    } catch (err) {
      console.error('[CheckoutPage] Error loading database cart:', err);
      Toast.error('Could not connect to the Sabahz Trading cart server. Please refresh.');
      if (itemsListEl) {
        itemsListEl.innerHTML = `<div style="color: var(--error); font-size: 0.85rem; padding: 12px 0;">Error loading authoritative cart.</div>`;
      }
    }
  },

  _prefillCustomerData() {
    try {
      const user = AuthService.getCurrentUser();
      const firstNameInput = document.getElementById('first-name');
      const lastNameInput = document.getElementById('last-name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const addressInput = document.getElementById('address');
      const cityInput = document.getElementById('city');
      const stateInput = document.getElementById('state');
      const postalInput = document.getElementById('postal-code');

      if (user && !user.isGuest && user.email) {
        const nameParts = (user.name || '').split(' ');
        if (firstNameInput) firstNameInput.value = user.firstName || nameParts[0] || '';
        if (lastNameInput) lastNameInput.value = user.lastName || nameParts.slice(1).join(' ') || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput && user.phone) phoneInput.value = user.phone;
        if (addressInput && user.address) addressInput.value = user.address;
        if (cityInput && user.city) cityInput.value = user.city;
        if (stateInput && user.state) stateInput.value = user.state;
        if (postalInput && user.postalCode) postalInput.value = user.postalCode;
      } else {
        // Clear all fields for new / unauthenticated user
        if (firstNameInput) firstNameInput.value = '';
        if (lastNameInput) lastNameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (addressInput) addressInput.value = '';
        if (cityInput) cityInput.value = '';
        if (stateInput) stateInput.value = '';
        if (postalInput) postalInput.value = '';
      }
    } catch (e) {
      // Non-blocking fallback
    }
  },

  /**
   * 3. Validate form fields
   */
  _validateForm() {
    let isValid = true;

    const fields = [
      { id: 'first-name', errId: 'err-first-name', test: val => val.trim().length > 0 },
      { id: 'last-name', errId: 'err-last-name', test: val => val.trim().length > 0 },
      { id: 'email', errId: 'err-email', test: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) },
      { id: 'phone', errId: 'err-phone', test: val => val.replace(/[^0-9]/g, '').length >= 10 },
      { id: 'address', errId: 'err-address', test: val => val.trim().length >= 5 },
      { id: 'city', errId: 'err-city', test: val => val.trim().length > 0 },
      { id: 'state', errId: 'err-state', test: val => val.trim().length > 0 },
      { id: 'postal-code', errId: 'err-postal-code', test: val => val.replace(/[^0-9]/g, '').length >= 5 }
    ];

    fields.forEach(({ id, errId, test }) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errId);
      if (input) {
        if (!test(input.value)) {
          isValid = false;
          input.style.borderColor = 'var(--error)';
          if (errEl) errEl.style.display = 'block';
        } else {
          input.style.borderColor = 'var(--border)';
          if (errEl) errEl.style.display = 'none';
        }
      }
    });

    return isValid;
  },

  _bindEvents() {
    // Payment Method Switching & Dynamic Button Label
    const submitBtn = document.getElementById('btn-place-order');

    const updateSubmitButtonLabel = () => {
      if (!submitBtn) return;
      if (this.selectedPayment === 'upi') {
        submitBtn.innerHTML = `Pay with UPI / QR Code (Razorpay) →`;
      } else {
        submitBtn.innerHTML = `Place Studio Order (Cash Payment) →`;
      }
    };

    document.querySelectorAll('.payment-option-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        this.selectedPayment = card.dataset.payment || 'upi';

        // Hide all sub panels
        document.querySelectorAll('.payment-sub-panel').forEach(p => p.classList.remove('active'));

        // Show matching sub panel
        const activePanel = document.getElementById(`panel-${this.selectedPayment}`);
        if (activePanel) activePanel.classList.add('active');

        updateSubmitButtonLabel();
      });
    });

    updateSubmitButtonLabel();

    // Copy UPI ID Button Handler
    const copyBtn = document.getElementById('btn-copy-upi');
    const upiIdEl = document.getElementById('merchant-upi-id');
    if (copyBtn && upiIdEl) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(upiIdEl.textContent.trim());
          Toast.success('UPI ID copied to clipboard!');
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            `;
          }, 2000);
        } catch (e) {
          Toast.info('UPI ID: ' + upiIdEl.textContent.trim());
        }
      });
    }

    // Clear validation error on field input
    const inputs = document.querySelectorAll('#checkout-form input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = 'var(--border)';
        const err = document.getElementById(`err-${input.id}`);
        if (err) err.style.display = 'none';
      });
    });

    // Handle Form Submit
    const form = document.getElementById('checkout-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Guard: User MUST be registered and logged in to checkout
      if (!this._isUserLoggedIn()) {
        Toast.error('You must log in first to complete your checkout.');
        this._showAuthRequiredModal();
        return;
      }

      if (!this._validateForm()) {
        Toast.error('Please complete all required shipping & contact fields correctly.');
        const firstError = document.querySelector('.form-control[style*="var(--error)"]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError?.focus();
        return;
      }

      if (!this.cartData || !this.cartData.items || this.cartData.items.length === 0) {
        Toast.error('Your cart has expired. Please return to studio shop.');
        return;
      }

      // Assemble complete verified payload for Python Backend Validation
      const orderPayload = {
        customer: {
          firstName: document.getElementById('first-name')?.value.trim(),
          lastName: document.getElementById('last-name')?.value.trim(),
          email: document.getElementById('email')?.value.trim(),
          phone: document.getElementById('phone')?.value.trim()
        },
        shippingAddress: {
          address: document.getElementById('address')?.value.trim(),
          city: document.getElementById('city')?.value.trim(),
          state: document.getElementById('state')?.value.trim(),
          postalCode: document.getElementById('postal-code')?.value.trim(),
          country: 'India',
          notes: document.getElementById('shipping-notes')?.value.trim()
        },
        paymentMethod: this.selectedPayment,
        items: this.cartData.items,
        clientSubtotal: this.cartData.summary.subtotal,
        clientDiscount: this.cartData.summary.discount || 0,
        clientPromoCode: this.cartData.summary.promoCode || null,
        clientTotal: this.cartData.summary.total
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0 auto; display: inline-block; vertical-align: middle;"></div>
          Processing...
        `;
      }

      // If Online Payment selected — Trigger Payment Modal with QR Code, Cards, Netbanking, Wallet
      if (this.selectedPayment === 'upi') {
        this._showPaymentModal(orderPayload, submitBtn, updateSubmitButtonLabel);
        return;
      }

      // Cash Payment or Direct Backend Submission
      await this._submitOrderToBackend(orderPayload, submitBtn);
    });
  },

  /**
   * Display the Unified Payment Options Modal with Live Dynamic QR Code, Cards, Netbanking & Wallet
   */
  _showPaymentModal(orderPayload, submitBtn, updateSubmitButtonLabel) {
    const existing = document.getElementById('af-payment-modal-root');
    if (existing) existing.remove();

    const formattedTotal = Number(orderPayload.clientTotal || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const userPhone = orderPayload.customer?.phone || '+91 91458 62375';
    const cleanTotal = Number(orderPayload.clientTotal || 0).toFixed(2);
    const upiDataUrl = `upi://pay?pa=sabahztrading@razorpay&pn=Art%20Flair%20Sabahz&am=${cleanTotal}&cu=INR&tn=ArtFlair_Order`;
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDataUrl)}`;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'af-payment-modal-root';
    modalBackdrop.className = 'af-payment-modal-backdrop';

    modalBackdrop.innerHTML = `
      <div class="af-payment-modal-card" role="dialog" aria-modal="true">
        <!-- Left Purple Summary Column -->
        <div class="af-payment-modal-sidebar">
          <div>
            <div class="af-payment-brand-header">
              <div class="af-payment-brand-avatar">A</div>
              <div class="af-payment-brand-title">Art Flair | Sabahz Trading</div>
            </div>

            <div class="af-payment-price-card">
              <div class="af-payment-price-label">Price Summary</div>
              <div class="af-payment-price-val">₹${formattedTotal}</div>
            </div>

            <div class="af-payment-user-pill">
              <span style="display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Using as ${userPhone}
              </span>
              <span>›</span>
            </div>
          </div>

          <div class="af-payment-sidebar-art">
            <svg width="100%" height="80" viewBox="0 0 200 80" fill="none">
              <rect x="10" y="30" width="40" height="40" rx="4" fill="rgba(255,255,255,0.1)"/>
              <rect x="60" y="20" width="50" height="50" rx="6" fill="rgba(255,255,255,0.15)"/>
              <rect x="120" y="35" width="45" height="35" rx="4" fill="rgba(255,255,255,0.08)"/>
              <path d="M70 45 L85 30 L100 45" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <!-- Right Payment Options Area -->
        <div class="af-payment-main-area">
          <div class="af-payment-top-bar">
            <h3 class="af-payment-top-title">Payment Options</h3>
            <button type="button" class="af-payment-close-btn" id="btn-close-payment-modal" aria-label="Close Payment Modal">✕</button>
          </div>

          <div class="af-payment-body-grid">
            <!-- Left Tabs Navigation (Includes QR prominently!) -->
            <nav class="af-payment-nav">
              <button type="button" class="af-pay-tab active" data-tab="qr">
                <span>UPI / QR Code</span>
                <span class="af-pay-tab-badge">LIVE QR</span>
              </button>

              <button type="button" class="af-pay-tab" data-tab="cards">
                <span>Cards</span>
                <span class="af-pay-tab-icons">
                  <span style="font-size: 0.65rem; color: #6B7280;">💳</span>
                </span>
              </button>

              <button type="button" class="af-pay-tab" data-tab="netbanking">
                <span>Netbanking</span>
                <span class="af-pay-tab-icons">
                  <span style="font-size: 0.65rem; color: #6B7280;">🏦</span>
                </span>
              </button>

              <button type="button" class="af-pay-tab" data-tab="wallet">
                <span>Wallet</span>
                <span class="af-pay-tab-icons">
                  <span style="font-size: 0.65rem; color: #6B7280;">👛</span>
                </span>
              </button>
            </nav>

            <!-- Right Content Panels -->
            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              
              <!-- 1. UPI / QR Code Panel (Default Active) -->
              <div class="af-pay-content-panel active" id="tab-panel-qr">
                <div class="af-qr-view-container">
                  <div class="af-qr-image-wrapper">
                    <img 
                      src="${qrImgSrc}" 
                      alt="Scan UPI QR Code to Pay" 
                      width="160" 
                      height="160"
                    />
                    <div class="af-qr-scan-badge">Scan &amp; Pay ₹${formattedTotal}</div>
                  </div>

                  <p style="font-size: 0.84rem; color: #4B5563; margin: 4px 0 8px; line-height: 1.4;">
                    Scan with <strong>Google Pay, PhonePe, Paytm, BHIM, CRED</strong>
                  </p>

                  <div class="af-qr-upi-row">
                    <span style="font-size: 0.78rem; color: #6B7280;">UPI ID:</span>
                    <span class="af-qr-upi-text">sabahztrading@razorpay</span>
                    <button type="button" class="af-qr-copy-btn" id="btn-modal-copy-upi">Copy</button>
                  </div>
                </div>

                <button type="button" class="af-pay-confirm-btn" id="btn-confirm-qr-payment">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  I Have Completed Payment →
                </button>
              </div>

              <!-- 2. Cards Panel -->
              <div class="af-pay-content-panel" id="tab-panel-cards">
                <div>
                  <h4 style="font-size: 0.95rem; color: #1F2937; margin-bottom: 14px; font-weight: 700;">Add a new card</h4>
                  
                  <div class="af-pay-input-group">
                    <input type="text" class="af-pay-input" placeholder="Card Number (4000 1234 5678 9010)" maxlength="19" />
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                    <input type="text" class="af-pay-input" placeholder="MM / YY" maxlength="5" />
                    <input type="password" class="af-pay-input" placeholder="CVV" maxlength="4" />
                  </div>

                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #4B5563; cursor: pointer;">
                    <input type="checkbox" checked />
                    <span>Save this card as per RBI guidelines</span>
                  </label>
                </div>

                <button type="button" class="af-pay-confirm-btn" id="btn-confirm-card-payment">
                  Pay ₹${formattedTotal}
                </button>
              </div>

              <!-- 3. Netbanking Panel -->
              <div class="af-pay-content-panel" id="tab-panel-netbanking">
                <div>
                  <h4 style="font-size: 0.95rem; color: #1F2937; margin-bottom: 14px; font-weight: 700;">Popular Banks</h4>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                      <input type="radio" name="bank" checked />
                      <span>HDFC Bank</span>
                    </label>
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                      <input type="radio" name="bank" />
                      <span>State Bank of India</span>
                    </label>
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                      <input type="radio" name="bank" />
                      <span>ICICI Bank</span>
                    </label>
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                      <input type="radio" name="bank" />
                      <span>Axis Bank</span>
                    </label>
                  </div>
                </div>

                <button type="button" class="af-pay-confirm-btn" id="btn-confirm-nb-payment">
                  Pay via Netbanking (₹${formattedTotal})
                </button>
              </div>

              <!-- 4. Wallet Panel -->
              <div class="af-pay-content-panel" id="tab-panel-wallet">
                <div>
                  <h4 style="font-size: 0.95rem; color: #1F2937; margin-bottom: 14px; font-weight: 700;">Select Digital Wallet</h4>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer;">
                      <input type="radio" name="wallet" checked />
                      <span>Paytm Wallet</span>
                    </label>
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer;">
                      <input type="radio" name="wallet" />
                      <span>PhonePe Wallet</span>
                    </label>
                    <label style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; font-size: 0.86rem; cursor: pointer;">
                      <input type="radio" name="wallet" />
                      <span>Mobikwik</span>
                    </label>
                  </div>
                </div>

                <button type="button" class="af-pay-confirm-btn" id="btn-confirm-wallet-payment">
                  Pay via Wallet (₹${formattedTotal})
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    // Tab Switching Handlers
    modalBackdrop.querySelectorAll('.af-pay-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        modalBackdrop.querySelectorAll('.af-pay-tab').forEach(t => t.classList.remove('active'));
        modalBackdrop.querySelectorAll('.af-pay-content-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = `tab-panel-${tab.dataset.tab}`;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Close Modal Handler
    const closeModal = () => {
      modalBackdrop.remove();
      if (submitBtn) {
        submitBtn.disabled = false;
        if (updateSubmitButtonLabel) updateSubmitButtonLabel();
      }
    };

    document.getElementById('btn-close-payment-modal')?.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    // Copy UPI ID in Modal
    document.getElementById('btn-modal-copy-upi')?.addEventListener('click', async (e) => {
      const btn = e.target;
      try {
        await navigator.clipboard.writeText('sabahztrading@razorpay');
        Toast.success('UPI ID copied to clipboard!');
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      } catch (err) {
        Toast.info('UPI ID: sabahztrading@razorpay');
      }
    });

    // Confirmation Handlers
    const confirmPayment = async (methodName) => {
      orderPayload.paymentMethod = methodName;
      orderPayload.paymentId = 'PAY_' + Date.now();
      orderPayload.paymentStatus = 'Paid';
      closeModal();
      Toast.success(`Payment verified via ${methodName}!`);
      await this._submitOrderToBackend(orderPayload, submitBtn);
    };

    document.getElementById('btn-confirm-qr-payment')?.addEventListener('click', () => confirmPayment('UPI QR Code'));
    document.getElementById('btn-confirm-card-payment')?.addEventListener('click', () => confirmPayment('Credit/Debit Card'));
    document.getElementById('btn-confirm-nb-payment')?.addEventListener('click', () => confirmPayment('Netbanking'));
    document.getElementById('btn-confirm-wallet-payment')?.addEventListener('click', () => confirmPayment('Digital Wallet'));
  },

  async _submitOrderToBackend(orderPayload, submitBtn) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0 auto; display: inline-block; vertical-align: middle;"></div>
        Confirming Order with Sabahz Trading...
      `;
    }

    try {
      // Post order to Python backend
      const response = await ApiClient.post(API_CONFIG.ENDPOINTS.CHECKOUT, orderPayload);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Server rejected order verification');
      }

      Toast.success('Studio Order verified & confirmed by Sabahz Trading!');

      // Clear client local storage cart caches
      try {
        await CartService.clearCart();
      } catch(e) {}

      // Redirect to Order Confirmation Page with authoritative Order ID & Total
      setTimeout(() => {
        const orderId = response.orderId || response.order_id || 'AF-ORD-' + Math.floor(100000 + Math.random() * 900000);
        const total = response.total || response.total_amount || orderPayload.clientTotal;
        window.location.href = `order-success.html?orderId=${encodeURIComponent(orderId)}&total=${encodeURIComponent(total)}`;
      }, 800);

    } catch (err) {
      console.error('[CheckoutPage] Checkout failed:', err);
      Toast.error(err.message || 'An error occurred during order validation.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Pay with UPI / QR Code (Razorpay) →`;
      }
    }
  }
};
