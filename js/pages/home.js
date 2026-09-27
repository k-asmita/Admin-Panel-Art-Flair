/**
 * Art Flair - Homepage Dynamic Controller
 * Developed for Sabahz Trading
 * 
 * Fetches dynamic data from API and generates interactive components.
 * Adheres strictly to the database-driven architecture.
 */

const HomePage = {
  async init() {
    this.initHeroShowcase();
    await Promise.all([
      this.loadCategories(),
      this.loadFeaturedProducts(),
      this.loadAiRecommendations()
    ]);
  },

  /**
   * SECTION 1 — CREATIVE HERO SHOWCASE CONTROLLER
   * Handles smooth auto-transitions, in-slide dots & continuous auto-scrolling
   */
  initHeroShowcase() {
    const slider = document.getElementById('hero-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero-slide');
    const dots = slider.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    const INTERVAL_MS = 3500; // Auto-scroll every 3.5 seconds

    const goToSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startTimer = () => {
      stopTimer();
      autoPlayTimer = setInterval(nextSlide, INTERVAL_MS);
    };

    const stopTimer = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => { 
        nextSlide(); 
        startTimer(); 
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => { 
        prevSlide(); 
        startTimer(); 
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startTimer();
      });
    });

    // Start auto-scroll immediately
    goToSlide(0);
    startTimer();
  },

  /**
   * SECTION 2 — PRODUCT CATEGORIES
   * Fetches category entities dynamically from API
   */
  async loadCategories() {
    const container = document.getElementById('home-categories-grid');
    if (!container) return;

    // Loading Shimmer Skeletons
    container.innerHTML = Array(6).fill(0).map(() => `
      <div class="skeleton" style="height: 150px; border-radius: 16px;"></div>
    `).join('');

    try {
      const categories = await ProductService.getCategories();
      if (!categories || categories.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎨</div>
            <h3 class="empty-state-title">No Categories Found</h3>
            <p class="empty-state-desc">Categories are currently being configured in the database.</p>
          </div>
        `;
        return;
      }

      // Map SVG icons for 10 standard categories
      const iconMap = {
        'accessories': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M18 11l-4-4"/><path d="m15 4 4.5 4.5"/></svg>',
        'brushes': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>',
        'calligraphy': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
        'canvas': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 9 18 0"/><path d="m9 21 0-18"/></svg>',
        'drawing-media': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
        'easels': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16"/><path d="M7 22 12 3l5 19"/><path d="M6 14h12"/></svg>',
        'painting-medium': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
        'paints': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>',
        'paper-pads': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>',
        'pen-markers': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 2 4 4-12 12H6v-4L18 2z"/><path d="m15 5 4 4"/></svg>'
      };

      container.innerHTML = categories.map(cat => `
        <a href="shop.html?category=${cat.id}" class="category-card" title="Browse ${cat.name}">
          <div class="category-icon-wrapper">
            ${iconMap[cat.id] || iconMap['oil-painting']}
          </div>
          <div class="category-name">${cat.name.split('&')[0]}</div>
        </a>
      `).join('');

    } catch (err) {
      console.error('[HomePage] Error loading categories:', err);
      container.innerHTML = `
        <div class="alert alert-error" style="grid-column: 1 / -1;">
          Unable to fetch categories from the Sabahz API server.
        </div>
      `;
    }
  },

  /**
   * SECTION 3 — FEATURED PRODUCTS
   * Requests products dynamically from the API and generates product cards
   */
  async loadFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;

    // Loading Skeletons
    grid.innerHTML = Array(4).fill(0).map(() => `
      <div class="skeleton skeleton-card"></div>
    `).join('');

    try {
      let products = await ProductService.getFeaturedProducts();

      if (!products || products.length === 0) {
        products = (typeof MOCK_DATABASE_PRODUCTS !== 'undefined') ? MOCK_DATABASE_PRODUCTS.slice(0, 8) : [];
      }

      if (!products || products.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3 class="empty-state-title">No Featured Supplies</h3>
            <p class="empty-state-desc">Featured studio materials will appear here once tagged in inventory.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(prod => ProductCardComponent.createHTML(prod)).join('');
      ProductCardComponent.bindContainerEvents(grid);

    } catch (err) {
      console.warn('[HomePage] Fallback to local products folder catalog:', err);
      const fallbackProducts = (typeof MOCK_DATABASE_PRODUCTS !== 'undefined') ? MOCK_DATABASE_PRODUCTS.slice(0, 8) : [];
      grid.innerHTML = fallbackProducts.map(prod => ProductCardComponent.createHTML(prod)).join('');
      ProductCardComponent.bindContainerEvents(grid);
    }
  },

  /**
   * SECTION 4 — AI RECOMMENDATIONS ("Recommended For You")
   * Uses the centralized RecommendationEngine to query backend ML results.
   */
  async loadAiRecommendations() {
    const container = document.getElementById('ai-recommendations-container') || document.getElementById('home-recommendations-container');
    if (!container) return;

    if (typeof RecommendationEngine !== 'undefined') {
      await RecommendationEngine.render(container, {
        title: 'Recommended For You',
        columns: 4,
        showBadge: true
      });
    }
  }
};
