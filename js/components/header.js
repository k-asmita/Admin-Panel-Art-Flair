/**
 * Art Flair - Global Navigation & Header Component
 * Developed for Sabahz Trading
 * Semantic HTML5, CSS3, & Vanilla JavaScript ES6+
 */

const HeaderComponent = {
  categoriesCache: [],

  async render() {
    const headerContainer = document.getElementById('site-header-container');
    if (!headerContainer) return;

    // Detect active page for navbar highlight
    const path = window.location.pathname.toLowerCase();
    const isHome = path.endsWith('index.html') || path.endsWith('/') || path === '';
    const isShop = path.includes('shop.html') || path.includes('products.html') || path.includes('product-detail');
    const isAiMatcher = path.includes('ai-matcher.html');
    const isCart = path.includes('cart.html');
    const isWishlist = path.includes('wishlist.html');

    // Fetch categories dynamically for dropdown & mobile drawer
    try {
      this.categoriesCache = await ProductService.getCategories();
    } catch (e) {
      this.categoriesCache = [];
    }

    // Determine current user authentication state
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    const userInitials = currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'AP';

    // Build User Auth HTML for Desktop
    let authNavDesktopHTML = '';
    if (isAuthenticated && !currentUser?.isGuest) {
      authNavDesktopHTML = `
        <div class="user-auth-menu" id="user-auth-menu">
          <button type="button" class="btn-user-profile" id="btn-user-dropdown-toggle" aria-haspopup="true" aria-expanded="false">
            <span class="user-avatar-circle">${userInitials}</span>
            <span>${currentUser.name.split(' ')[0]}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${currentUser.name}</div>
              <div class="user-dropdown-email">${currentUser.email}</div>
            </div>
            <a href="profile.html" class="user-dropdown-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Atelier Profile & Settings
            </a>
            <a href="orders.html" class="user-dropdown-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              My Studio Orders
            </a>
            <a href="wishlist.html" class="user-dropdown-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Saved Wishlist
            </a>
            <a href="cart.html" class="user-dropdown-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              Active Studio Cart
            </a>
            <a href="ai-matcher.html" class="user-dropdown-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
              </svg>
              AI Supply Matcher
            </a>
            ${currentUser?.role === 'admin' ? `
            <a href="admin/dashboard.html" class="user-dropdown-link" style="color: #74348E; font-weight: 700;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
              Admin Atelier Portal
            </a>
            ` : ''}
            <button type="button" class="user-dropdown-link logout-link btn-block" id="btn-desktop-logout" style="text-align: left; cursor: pointer;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out of Studio
            </button>
          </div>
        </div>
      `;
    } else {
      authNavDesktopHTML = `
        <a href="login.html" class="btn btn-outline btn-sm" title="Sign In or Register">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Sign In / Register
        </a>
      `;
    }

    // Categories Dropdown HTML
    const categoriesDropdownHTML = this.categoriesCache.map(cat => `
      <a href="shop.html?category=${cat.id}" class="nav-dropdown-link">
        <span>${cat.name}</span>
        <span class="nav-dropdown-count">${cat.count}</span>
      </a>
    `).join('');

    // Categories Mobile Accordion HTML
    const categoriesMobileHTML = this.categoriesCache.map(cat => `
      <a href="shop.html?category=${cat.id}" class="mobile-sub-link">
        • ${cat.name} (${cat.count})
      </a>
    `).join('');

    // Promotional Banner Constants from shared config
    const promoConfig = (typeof API_CONFIG !== 'undefined' && API_CONFIG.PROMO) ? API_CONFIG.PROMO : { FEATURED_CODE: 'SABAHZ10', DISCOUNT_PERCENT: 10 };
    const promoCode = promoConfig.FEATURED_CODE || 'SABAHZ10';
    const promoPercent = promoConfig.DISCOUNT_PERCENT || 10;
    const isAnnouncementDismissed = sessionStorage.getItem('artflair_announcement_dismissed') === 'true';

    headerContainer.innerHTML = `
      <!-- Top Promotional Announcement Bar -->
      <div class="top-announcement-bar ${isAnnouncementDismissed ? 'is-hidden' : ''}" id="top-announcement-bar" role="region" aria-label="Special Promotion">
        <div class="container announcement-content">
          <div class="announcement-text">
            <span>🎉</span>
            <span>Use code <strong class="announcement-code-pill" title="Click to copy code" data-copy-code="${promoCode}">${promoCode}</strong> for ${promoPercent}% off your first order!</span>
          </div>
          <button type="button" class="announcement-close-btn" id="btn-close-announcement" aria-label="Dismiss Announcement">✕</button>
        </div>
      </div>

      <!-- Main Header -->
      <header class="site-header" id="main-header">
        <div class="container">
          <div class="header-main">
            <!-- Brand Logo -->
            <a href="index.html" class="brand-logo" title="Art Flair - Sabahz Trading">
              <div class="brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m12 19 7-7 3 3-7 7-3-3z"/>
                  <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="m2 2 7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </div>
              <div class="brand-text">
                <span class="brand-title">Art<span>Flair</span></span>
                <span class="brand-subtitle">Sabahz Trading</span>
              </div>
            </a>

            <!-- Search Autocomplete Bar with Clear Button & Direct API Dispatch -->
            <div class="header-search">
              <form class="search-form" id="header-search-form" action="shop.html" method="GET">
                <input 
                  type="text" 
                  name="q" 
                  id="header-search-input" 
                  class="search-input" 
                  placeholder="Search pure pigments, Belgian linen, sable brushes..." 
                  autocomplete="off"
                />
                <button type="button" class="search-clear-btn" id="header-search-clear" aria-label="Clear Search Input">✕</button>
                <button type="submit" class="search-btn" id="header-search-submit" aria-label="Submit Search">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
              </form>
              <div class="search-results-dropdown" id="search-results-dropdown"></div>
            </div>

            <!-- Header Action Tools (Wishlist, Cart, Auth, Mobile Toggle) -->
            <div class="header-actions">
              <!-- AI Matcher Pill -->
              <a href="ai-matcher.html" class="btn-ai-matcher-pill" title="Launch AI Medium & Supplies Matcher">
                AI Advisor
              </a>

              <!-- Wishlist Icon -->
              <a href="wishlist.html" class="header-action-btn" id="header-wishlist-btn" title="Saved Studio Wishlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span class="badge-counter" id="wishlist-counter-badge" style="display: none;">0</span>
              </a>

              <!-- Database-Driven Cart Icon -->
              <a href="cart.html" class="header-action-btn" id="header-cart-btn" title="View Database Shopping Cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                <span class="badge-counter" id="cart-counter-badge" style="display: none;">0</span>
              </a>

              <!-- Auth State Section -->
              <div id="header-auth-container">
                ${authNavDesktopHTML}
              </div>

              <!-- Hamburger Mobile Toggle -->
              <button class="mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle Mobile Navigation">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" x2="20" y1="12" y2="12"/>
                  <line x1="4" x2="20" y1="6" y2="6"/>
                  <line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Global Horizontal Navigation Bar (Desktop) -->
        <nav class="site-nav" id="main-nav">
          <div class="container">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a>
              </li>
              <li class="nav-item">
                <a href="shop.html" class="nav-link ${isShop ? 'active' : ''}">All Supplies</a>
              </li>
              <li class="nav-item">
                <span class="nav-link" tabindex="0" role="button" aria-haspopup="true">
                  Fine Art Categories
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </span>
                <div class="nav-dropdown">
                  ${categoriesDropdownHTML}
                </div>
              </li>
              <li class="nav-item">
                <a href="shop.html?category=paints" class="nav-link">Paints</a>
              </li>
              <li class="nav-item">
                <a href="shop.html?category=brushes" class="nav-link">Brushes</a>
              </li>
              <li class="nav-item">
                <a href="shop.html?category=canvas" class="nav-link">Canvas</a>
              </li>
              <li class="nav-item">
                <a href="shop.html?category=drawing-media" class="nav-link">Drawing Media</a>
              </li>
              <li class="nav-item">
                <a href="shop.html?category=calligraphy" class="nav-link">Calligraphy</a>
              </li>
              <li class="nav-item">
                <a href="ai-matcher.html" class="nav-link highlight ${isAiMatcher ? 'active' : ''}">
                  AI Advisor
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <!-- Responsive Mobile Drawer Navigation -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay"></div>
      <aside class="mobile-drawer" id="mobile-drawer" aria-label="Mobile Navigation Menu">
        <div class="mobile-drawer-header">
          <div class="brand-logo">
            <div class="brand-icon" style="width: 34px; height: 34px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m12 19 7-7 3 3-7 7-3-3z"/>
                <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title" style="font-size: 1.2rem;">Art<span>Flair</span></span>
              <span class="brand-subtitle" style="font-size: 0.6rem;">Sabahz Trading</span>
            </div>
          </div>
          <button class="mobile-drawer-close" id="mobile-drawer-close" aria-label="Close Mobile Menu">✕</button>
        </div>

        <div class="mobile-drawer-body">
          <div class="mobile-nav-links">
            <a href="index.html" class="mobile-nav-link ${isHome ? 'active' : ''}">
              <span>🏠 Home</span>
            </a>
            <a href="shop.html" class="mobile-nav-link ${isShop ? 'active' : ''}">
              <span>🎨 All Studio Supplies</span>
            </a>

            <!-- Mobile Categories Accordion -->
            <div>
              <div class="mobile-nav-link" id="mobile-categories-toggle" style="cursor: pointer;">
                <span>📚 Categories</span>
                <span id="mobile-cat-arrow">▼</span>
              </div>
              <div class="mobile-sub-accordion" id="mobile-categories-accordion">
                ${categoriesMobileHTML}
              </div>
            </div>

            <a href="ai-matcher.html" class="mobile-nav-link ${isAiMatcher ? 'active' : ''}" style="color: var(--color-primary); font-weight: 700;">
              <span>AI Medium Matcher</span>
            </a>
            <a href="wishlist.html" class="mobile-nav-link">
              <span>❤️ Saved Wishlist</span>
              <span class="badge badge-powder-blue" id="mobile-wishlist-badge">0 saved</span>
            </a>
            <a href="cart.html" class="mobile-nav-link ${isCart ? 'active' : ''}">
              <span>🛒 Studio Cart</span>
              <span class="badge badge-terracotta" id="mobile-cart-badge">0 items</span>
            </a>
          </div>
        </div>

        <!-- Mobile Drawer Auth Footer -->
        <div class="mobile-drawer-footer" id="mobile-drawer-auth-footer">
          ${isAuthenticated && !currentUser?.isGuest ? `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <strong style="font-size: 0.9rem; color: var(--color-text-main);">${currentUser.name}</strong>
                <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${currentUser.email}</div>
              </div>
            </div>
            <button type="button" class="btn btn-outline-secondary btn-block btn-sm" id="btn-mobile-logout">
              Sign Out of Studio
            </button>
          ` : `
            <a href="login.html" class="btn btn-primary btn-block">
              Artist Sign In / Register
            </a>
          `}
        </div>
      </aside>
    `;

    this._bindEvents();
    this._initCartCounter();
    this._initWishlistCounter();
  },

  _bindEvents() {
    // Top Announcement Bar Dismissal
    const announcementBar = document.getElementById('top-announcement-bar');
    const closeAnnouncementBtn = document.getElementById('btn-close-announcement');
    closeAnnouncementBtn?.addEventListener('click', () => {
      announcementBar?.classList.add('is-hidden');
      try {
        sessionStorage.setItem('artflair_announcement_dismissed', 'true');
      } catch (e) {}
    });

    // Copy Promo Code on Click
    document.addEventListener('click', (e) => {
      const copyPill = e.target.closest('[data-copy-code]');
      if (copyPill) {
        const codeToCopy = copyPill.dataset.copyCode;
        if (codeToCopy) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(codeToCopy).then(() => {
              if (typeof Toast !== 'undefined') {
                Toast.success(`Promo code "${codeToCopy}" copied!`);
              }
            }).catch(() => {
              if (typeof Toast !== 'undefined') {
                Toast.info(`Promo code: ${codeToCopy}`);
              }
            });
          } else if (typeof Toast !== 'undefined') {
            Toast.info(`Promo code: ${codeToCopy}`);
          }
        }
      }
    });

    // Header background elevation on scroll
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    // User Profile Dropdown Toggle
    const profileBtn = document.getElementById('btn-user-dropdown-toggle');
    const profileMenu = document.getElementById('user-dropdown-menu');

    profileBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!profileMenu?.contains(e.target) && e.target !== profileBtn) {
        profileMenu?.classList.remove('active');
      }
    });

    // Logout actions
    const handleLogout = async () => {
      await AuthService.logout();
      Toast.info('You have signed out of Art Flair Studio.');
      // Re-render header to refresh auth state seamlessly
      await HeaderComponent.render();
    };

    document.getElementById('btn-desktop-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-mobile-logout')?.addEventListener('click', handleLogout);

    // Mobile Drawer Open / Close
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileOverlay = document.getElementById('mobile-drawer-overlay');
    const mobileClose = document.getElementById('mobile-drawer-close');

    const openDrawer = () => {
      mobileDrawer?.classList.add('open');
      mobileOverlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      mobileDrawer?.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    };

    mobileBtn?.addEventListener('click', openDrawer);
    mobileClose?.addEventListener('click', closeDrawer);
    mobileOverlay?.addEventListener('click', closeDrawer);

    // Mobile Categories Accordion Toggle
    const catToggle = document.getElementById('mobile-categories-toggle');
    const catAccordion = document.getElementById('mobile-categories-accordion');
    const catArrow = document.getElementById('mobile-cat-arrow');

    catToggle?.addEventListener('click', () => {
      const isOpen = catAccordion?.classList.toggle('open');
      if (catArrow) catArrow.textContent = isOpen ? '▲' : '▼';
    });

    // Search Module Integration (Input, Clear Button, Loading Spinner, Suggestions Dropdown)
    const searchInput = document.getElementById('header-search-input');
    const searchForm = document.getElementById('header-search-form');
    const searchClear = document.getElementById('header-search-clear');
    const searchDropdown = document.getElementById('search-results-dropdown');
    const searchSubmit = document.getElementById('header-search-submit');

    if (typeof SearchModule !== 'undefined' && searchInput) {
      SearchModule.attach({
        inputEl: searchInput,
        formEl: searchForm,
        clearBtnEl: searchClear,
        dropdownEl: searchDropdown,
        submitBtnEl: searchSubmit
      });
    }

    // Quick Cart Drawer Trigger on Header Cart Button
    const headerCartBtn = document.getElementById('header-cart-btn');
    if (headerCartBtn && !window.location.pathname.toLowerCase().includes('cart.html')) {
      headerCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof CartDrawerComponent !== 'undefined') {
          CartDrawerComponent.open();
        } else {
          window.location.href = 'cart.html';
        }
      });
    }

    // Re-render header when auth status changes globally
    window.addEventListener('auth:changed', () => {
      this.render();
    });
  },

  async _initCartCounter() {
    const badge = document.getElementById('cart-counter-badge');
    const mobileBadge = document.getElementById('mobile-cart-badge');

    const updateBadgeUI = (count) => {
      const itemCount = parseInt(count, 10) || 0;
      if (badge) {
        badge.textContent = itemCount;
        badge.style.display = itemCount > 0 ? 'flex' : 'none';
      }
      if (mobileBadge) {
        mobileBadge.textContent = `${itemCount} items`;
      }
    };

    // Listen to real-time cart update events
    window.addEventListener('cart:updated', (e) => {
      const summary = e.detail?.summary;
      const count = summary?.itemCount ?? 0;
      updateBadgeUI(count);
    });

    // Initial database cart count fetch for customer/session
    try {
      const cartData = await CartService.getCart();
      if (cartData && cartData.summary) {
        updateBadgeUI(cartData.summary.itemCount);
      }
    } catch (e) {
      console.warn('Could not initialize cart counter:', e);
    }
  },

  async _initWishlistCounter() {
    const badge = document.getElementById('wishlist-counter-badge');
    const mobileBadge = document.getElementById('mobile-wishlist-badge');

    const updateWishlistUI = (count) => {
      const listCount = typeof count === 'number' ? count : StorageUtil.getWishlist().length;
      if (badge) {
        badge.textContent = listCount;
        badge.style.display = listCount > 0 ? 'flex' : 'none';
      }
      if (mobileBadge) {
        mobileBadge.textContent = `${listCount} saved`;
      }
    };

    window.addEventListener('wishlist:updated', (e) => {
      const count = e.detail?.count;
      updateWishlistUI(count);
    });

    try {
      if (typeof WishlistService !== 'undefined') {
        const res = await WishlistService.getWishlist();
        if (res && res.success) {
          updateWishlistUI(res.count || res.items?.length || 0);
        }
      } else {
        updateWishlistUI();
      }
    } catch(e) {
      updateWishlistUI();
    }
  }
};
