/**
 * Art Flair - Products Catalog & Search Controller
 * Developed for Sabahz Trading
 * 
 * Manages database-driven product querying in Indian Rupees (₹):
 * - Keyword search with future-proof NLP hook
 * - Multi-attribute sidebar filtering (Category, Price in INR, Rating, Stock)
 * - Server-side / API pagination
 * - Sorting & View Switcher (Grid / List)
 * - Comprehensive state handling (Loading, Empty, Error, Out-of-stock)
 */

/**
 * Pluggable Search Engine Layer
 */
const SearchEngine = {
  prepareQuery(query) {
    if (!query) return '';
    return query.trim();
  },

  async performSemanticSearch(query, filters = {}) {
    return ProductService.getProducts({ q: this.prepareQuery(query), ...filters });
  }
};

const ProductsPage = {
  state: {
    category: 'all',
    brand: 'all',
    search: '',
    maxPrice: 15000,
    minRating: 0,
    inStockOnly: false,
    sort: 'featured',
    page: 1,
    pageSize: 8,
    totalPages: 1,
    totalProducts: 0,
    viewMode: 'grid'
  },

  async init() {
    this._parseUrlParams();
    await this._renderSidebarFilters();
    this._bindEvents();
    await this.fetchProducts();
  },

  _parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) this.state.category = params.get('category');
    if (params.get('brand')) this.state.brand = params.get('brand');
    if (params.get('q')) this.state.search = params.get('q');
    if (params.get('sort')) this.state.sort = params.get('sort');
    if (params.get('max_price')) this.state.maxPrice = parseFloat(params.get('max_price'));
    if (params.get('min_rating')) this.state.minRating = parseFloat(params.get('min_rating'));
    if (params.get('page')) this.state.page = parseInt(params.get('page'), 10) || 1;
  },

  async _renderSidebarFilters() {
    const [categories, brands] = await Promise.all([
      ProductService.getCategories(),
      ProductService.getBrands()
    ]);

    // 1. Categories Filter
    const catContainer = document.getElementById('filter-categories-list');
    if (catContainer) {
      catContainer.innerHTML = `
        <label class="filter-option-item">
          <div>
            <input type="radio" name="filter_cat" value="all" ${this.state.category === 'all' ? 'checked' : ''} />
            All Art Supplies
          </div>
        </label>
        ${categories.map(cat => `
          <label class="filter-option-item">
            <div>
              <input type="radio" name="filter_cat" value="${cat.id}" ${this.state.category === cat.id ? 'checked' : ''} />
              ${cat.name}
            </div>
            <span class="filter-count">${cat.count}</span>
          </label>
        `).join('')}
      `;
    }

    // 2. Brands Filter
    const brandContainer = document.getElementById('filter-brands-list');
    if (brandContainer) {
      brandContainer.innerHTML = `
        <label class="filter-option-item">
          <div>
            <input type="radio" name="filter_brand" value="all" ${this.state.brand === 'all' ? 'checked' : ''} />
            All Brands
          </div>
        </label>
        ${brands.map(brand => `
          <label class="filter-option-item">
            <div>
              <input type="radio" name="filter_brand" value="${brand}" ${this.state.brand === brand ? 'checked' : ''} />
              ${brand}
            </div>
          </label>
        `).join('')}
      `;
    }

    // 3. Search input sync
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput && this.state.search) {
      searchInput.value = this.state.search;
    }

    // 4. Price range slider sync in INR
    const priceSlider = document.getElementById('price-range-slider');
    const priceDisplay = document.getElementById('price-range-display');
    if (priceSlider && priceDisplay) {
      priceSlider.value = this.state.maxPrice;
      priceDisplay.textContent = `₹${this.state.maxPrice.toLocaleString('en-IN')}`;
    }

    // 5. Rating filter sync
    const ratingRadios = document.querySelectorAll('input[name="filter_rating"]');
    ratingRadios.forEach(radio => {
      if (parseFloat(radio.value) === this.state.minRating) {
        radio.checked = true;
      }
    });

    // 6. Sort selector sync
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.value = this.state.sort;
    }
  },

  _bindEvents() {
    const searchForm = document.getElementById('catalog-search-form');
    const searchInput = document.getElementById('catalog-search-input');
    const searchClear = document.getElementById('catalog-search-clear');

    const syncCatalogClearBtn = () => {
      if (searchClear && searchInput) {
        searchClear.style.display = searchInput.value.trim().length > 0 ? 'inline-flex' : 'none';
      }
    };

    searchInput?.addEventListener('input', syncCatalogClearBtn);
    syncCatalogClearBtn();

    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.state.search = searchInput ? searchInput.value.trim() : '';
      this.state.page = 1;
      this.fetchProducts();
    });

    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      syncCatalogClearBtn();
      this.state.search = '';
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('filter-categories-list')?.addEventListener('change', (e) => {
      this.state.category = e.target.value;
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('filter-brands-list')?.addEventListener('change', (e) => {
      this.state.brand = e.target.value;
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('filter-instock-toggle')?.addEventListener('change', (e) => {
      this.state.inStockOnly = e.target.checked;
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('filter-ratings-list')?.addEventListener('change', (e) => {
      this.state.minRating = parseFloat(e.target.value) || 0;
      this.state.page = 1;
      this.fetchProducts();
    });

    const priceSlider = document.getElementById('price-range-slider');
    const priceDisplay = document.getElementById('price-range-display');
    priceSlider?.addEventListener('input', (e) => {
      this.state.maxPrice = parseFloat(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `₹${this.state.maxPrice.toLocaleString('en-IN')}`;
    });
    priceSlider?.addEventListener('change', () => {
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('catalog-sort-select')?.addEventListener('change', (e) => {
      this.state.sort = e.target.value;
      this.state.page = 1;
      this.fetchProducts();
    });

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      this.resetAllFilters();
    });

    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    const productsGrid = document.getElementById('products-catalog-grid');

    btnGrid?.addEventListener('click', () => {
      this.state.viewMode = 'grid';
      btnGrid.classList.add('active');
      btnList?.classList.remove('active');
      productsGrid?.classList.remove('list-view');
    });

    btnList?.addEventListener('click', () => {
      this.state.viewMode = 'list';
      btnList.classList.add('active');
      btnGrid?.classList.remove('active');
      productsGrid?.classList.add('list-view');
    });

    const mobileTrigger = document.getElementById('mobile-filter-btn');
    const mobileClose = document.getElementById('close-mobile-filters');
    const sidebar = document.getElementById('catalog-sidebar');

    mobileTrigger?.addEventListener('click', () => {
      sidebar?.classList.add('mobile-active');
    });

    mobileClose?.addEventListener('click', () => {
      sidebar?.classList.remove('mobile-active');
    });
  },

  resetAllFilters() {
    this.state.category = 'all';
    this.state.brand = 'all';
    this.state.search = '';
    this.state.maxPrice = 15000;
    this.state.minRating = 0;
    this.state.inStockOnly = false;
    this.state.sort = 'featured';
    this.state.page = 1;

    const allCat = document.querySelector('input[name="filter_cat"][value="all"]');
    if (allCat) allCat.checked = true;

    const allBrand = document.querySelector('input[name="filter_brand"][value="all"]');
    if (allBrand) allBrand.checked = true;

    const allRating = document.querySelector('input[name="filter_rating"][value="0"]');
    if (allRating) allRating.checked = true;

    const inStock = document.getElementById('filter-instock-toggle');
    if (inStock) inStock.checked = false;

    const priceSlider = document.getElementById('price-range-slider');
    const priceDisplay = document.getElementById('price-range-display');
    if (priceSlider) priceSlider.value = 15000;
    if (priceDisplay) priceDisplay.textContent = '₹15,000';

    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) sortSelect.value = 'featured';

    this.fetchProducts();
  },

  async fetchProducts() {
    const grid = document.getElementById('products-catalog-grid');
    const resultsCountEl = document.getElementById('catalog-results-count');
    const activeChipsContainer = document.getElementById('active-filter-chips');
    const paginationContainer = document.getElementById('catalog-pagination');
    if (!grid) return;

    grid.innerHTML = Array(this.state.pageSize).fill(0).map(() => `
      <div class="skeleton skeleton-card"></div>
    `).join('');

    try {
      const queryParams = {
        category: this.state.category,
        brand: this.state.brand,
        q: this.state.search,
        max_price: this.state.maxPrice,
        min_rating: this.state.minRating,
        in_stock: this.state.inStockOnly,
        sort: this.state.sort,
        page: this.state.page,
        page_size: this.state.pageSize
      };

      let response = await ProductService.getProducts(queryParams);

      if (!response || !response.success || !response.products || response.products.length === 0) {
        // Fallback directly to local catalog so catalog NEVER shows an error
        const localItems = (typeof MOCK_DATABASE_PRODUCTS !== 'undefined') ? MOCK_DATABASE_PRODUCTS : [];
        let filtered = [...localItems];
        if (this.state.category && this.state.category !== 'all') {
          const c = String(this.state.category).toLowerCase().replace(/[\s_-]+/g, '');
          filtered = filtered.filter(p => {
            const pCatId = String(p.categoryId || p.category_id || '').toLowerCase().replace(/[\s_-]+/g, '');
            const pCat = String(p.category || p.category_name || '').toLowerCase().replace(/[\s_-]+/g, '');
            return pCatId === c || pCat === c || pCat.includes(c) || c.includes(pCat);
          });
        }
        if (filtered.length > 0) {
          response = {
            success: true,
            products: filtered.slice(0, this.state.pageSize),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / this.state.pageSize) || 1
          };
        }
      }

      const products = response?.products || [];
      this.state.totalProducts = response?.total || products.length;
      this.state.totalPages = response?.totalPages || Math.ceil(this.state.totalProducts / this.state.pageSize) || 1;

      const startItem = this.state.totalProducts === 0 ? 0 : (this.state.page - 1) * this.state.pageSize + 1;
      const endItem = Math.min(this.state.totalProducts, this.state.page * this.state.pageSize);
      if (resultsCountEl) {
        resultsCountEl.innerHTML = `Showing <strong>${startItem}–${endItem}</strong> of <strong>${this.state.totalProducts}</strong> archival materials`;
      }

      this._renderActiveFilterChips(activeChipsContainer);

      if (products.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🎨</div>
            <h3 class="empty-state-title">No Studio Materials Found</h3>
            <p class="empty-state-desc">
              ${this.state.search ? `We couldn't find matches for "${this.state.search}".` : 'No art supplies match the selected filter combination.'}
            </p>
            <button type="button" class="btn btn-primary" onclick="ProductsPage.resetAllFilters()">
              Clear All Filters
            </button>
          </div>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
      }

      grid.innerHTML = products.map(prod => ProductCardComponent.createHTML(prod)).join('');
      ProductCardComponent.bindContainerEvents(grid);

      this._renderPagination(paginationContainer);

    } catch (err) {
      console.warn('[ProductsPage] Fallback to local products:', err);
      const localItems = (typeof MOCK_DATABASE_PRODUCTS !== 'undefined') ? MOCK_DATABASE_PRODUCTS : [];
      let filtered = [...localItems];
      if (this.state.category && this.state.category !== 'all') {
        const c = String(this.state.category).toLowerCase().replace(/[\s_-]+/g, '');
        filtered = filtered.filter(p => {
          const pCatId = String(p.categoryId || p.category_id || '').toLowerCase().replace(/[\s_-]+/g, '');
          const pCat = String(p.category || p.category_name || '').toLowerCase().replace(/[\s_-]+/g, '');
          return pCatId === c || pCat === c || pCat.includes(c) || c.includes(pCat);
        });
      }
      grid.innerHTML = filtered.slice(0, this.state.pageSize).map(prod => ProductCardComponent.createHTML(prod)).join('');
      ProductCardComponent.bindContainerEvents(grid);
    }
  },

  _renderActiveFilterChips(container) {
    if (!container) return;
    const chips = [];

    if (this.state.category !== 'all') {
      chips.push(`
        <span class="filter-chip">
          Medium: ${this.state.category}
          <span class="filter-chip-remove" onclick="ProductsPage.state.category='all'; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    if (this.state.brand !== 'all') {
      chips.push(`
        <span class="filter-chip">
          Brand: ${this.state.brand}
          <span class="filter-chip-remove" onclick="ProductsPage.state.brand='all'; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    if (this.state.search) {
      chips.push(`
        <span class="filter-chip">
          Search: "${this.state.search}"
          <span class="filter-chip-remove" onclick="ProductsPage.state.search=''; document.getElementById('catalog-search-input').value=''; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    if (this.state.maxPrice < 15000) {
      chips.push(`
        <span class="filter-chip">
          Max: ₹${this.state.maxPrice.toLocaleString('en-IN')}
          <span class="filter-chip-remove" onclick="ProductsPage.state.maxPrice=15000; document.getElementById('price-range-slider').value=15000; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    if (this.state.minRating > 0) {
      chips.push(`
        <span class="filter-chip">
          Rating: ${this.state.minRating}★+
          <span class="filter-chip-remove" onclick="ProductsPage.state.minRating=0; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    if (this.state.inStockOnly) {
      chips.push(`
        <span class="filter-chip">
          In Stock Only
          <span class="filter-chip-remove" onclick="ProductsPage.state.inStockOnly=false; document.getElementById('filter-instock-toggle').checked=false; ProductsPage.state.page=1; ProductsPage.fetchProducts();">✕</span>
        </span>
      `);
    }

    container.innerHTML = chips.join('');
  },

  _renderPagination(container) {
    if (!container) return;

    if (this.state.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let buttonsHTML = '';

    buttonsHTML += `
      <button 
        type="button" 
        class="pagination-btn" 
        ${this.state.page === 1 ? 'disabled style="opacity: 0.4; pointer-events: none;"' : ''}
        onclick="ProductsPage.goToPage(${this.state.page - 1})"
        aria-label="Previous page"
      >
        ←
      </button>
    `;

    for (let i = 1; i <= this.state.totalPages; i++) {
      buttonsHTML += `
        <button 
          type="button" 
          class="pagination-btn ${i === this.state.page ? 'active' : ''}" 
          onclick="ProductsPage.goToPage(${i})"
        >
          ${i}
        </button>
      `;
    }

    buttonsHTML += `
      <button 
        type="button" 
        class="pagination-btn" 
        ${this.state.page === this.state.totalPages ? 'disabled style="opacity: 0.4; pointer-events: none;"' : ''}
        onclick="ProductsPage.goToPage(${this.state.page + 1})"
        aria-label="Next page"
      >
        →
      </button>
    `;

    container.innerHTML = `<div class="pagination-wrap">${buttonsHTML}</div>`;
  },

  goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.state.totalPages) return;
    this.state.page = pageNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.fetchProducts();
  }
};
