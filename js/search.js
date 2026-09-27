/**
 * Art Flair - Search Module & Engine
 * Developed for Sabahz Trading
 * 
 * CORE SEARCH CAPABILITIES:
 * - Standard keyword, product name, brand, category, and specifications search
 * - Direct communication with Python backend API (GET /search and GET /search/suggestions)
 * - Complete Search UI: input, search button, clear button (✕), results dropdown, result count, loading spinner, and empty states
 * 
 * FUTURE NLP SUPPORT ARCHITECTURE:
 * - Designed with a pluggable query provider layer ('standard-keyword' vs future 'nlp-semantic')
 * - Does NOT execute fake NLP locally
 * - Does NOT misrepresent keyword search as AI
 * - Ready to accept semantic tokens, intent filters, and vector results when backend NLP is enabled
 */

const SearchModule = {
  // Current active backend provider: 'standard-keyword'
  provider: 'standard-keyword',
  debounceTime: 220,
  activeRequests: new Map(),

  /**
   * 1. Query Python Backend Search Endpoint
   * @param {string} query - Keyword or phrase
   * @param {Object} options - { page, pageSize, category, sort }
   */
  async executeSearch(query, options = {}) {
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return {
        success: true,
        query: '',
        total: 0,
        results: [],
        provider: this.provider,
        isSemantic: false
      };
    }

    try {
      const params = {
        q: cleanQuery,
        ...(options || {})
      };

      const endpoint = API_CONFIG.ENDPOINTS.SEARCH || API_CONFIG.ENDPOINTS.PRODUCTS;
      const response = await ApiClient.get(endpoint, params);

      if (!response || !response.success) {
        throw new Error(response?.message || 'Search service did not return results');
      }

      const results = response.results || response.products || [];
      const total = response.total !== undefined ? response.total : results.length;

      return {
        success: true,
        query: cleanQuery,
        total,
        provider: response.provider || this.provider,
        isSemantic: !!response.isSemantic,
        results
      };
    } catch (err) {
      console.warn('[SearchModule] Backend search failed:', err);
      return {
        success: false,
        query: cleanQuery,
        total: 0,
        results: [],
        error: err.message,
        provider: this.provider
      };
    }
  },

  /**
   * 2. Autocomplete Quick Suggestions
   */
  async getSuggestions(query) {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    try {
      const endpoint = API_CONFIG.ENDPOINTS.SEARCH_SUGGESTIONS || `${API_CONFIG.ENDPOINTS.PRODUCTS}?q=${encodeURIComponent(cleanQuery)}&page_size=5`;
      const response = await ApiClient.get(endpoint, { q: cleanQuery });
      
      if (response && response.suggestions) {
        return response.suggestions;
      } else if (response && response.products) {
        return response.products.slice(0, 5).map(p => ({
          type: 'product',
          text: p.name,
          id: p.id,
          brand: p.brand,
          category: p.category,
          price: p.price,
          discount: p.discount,
          image: p.image
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  /**
   * 3. Initialize an Interactive Search Bar with Input, Search Button, Clear Button & Dropdown
   * @param {Object} elements - { inputEl, formEl, clearBtnEl, dropdownEl, submitBtnEl }
   * @param {Object} callbacks - { onSelect, onSearchSubmit }
   */
  attach(elements, callbacks = {}) {
    const { inputEl, formEl, clearBtnEl, dropdownEl, submitBtnEl } = elements;
    if (!inputEl) return;

    let debounceTimer = null;

    // Helper: update clear button visibility
    const syncClearBtn = () => {
      if (clearBtnEl) {
        clearBtnEl.style.display = inputEl.value.trim().length > 0 ? 'inline-flex' : 'none';
      }
    };

    // Helper: close dropdown
    const closeDropdown = () => {
      if (dropdownEl) {
        dropdownEl.classList.remove('active');
        dropdownEl.innerHTML = '';
      }
    };

    // Helper: show loading in dropdown
    const showLoading = () => {
      if (dropdownEl) {
        dropdownEl.innerHTML = `
          <div class="search-loading-state" style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            <span>Searching archival catalog...</span>
          </div>
        `;
        dropdownEl.classList.add('active');
      }
    };

    // Helper: render suggestions dropdown
    const renderSuggestions = (query, suggestions, totalCount) => {
      if (!dropdownEl) return;

      if (!suggestions || suggestions.length === 0) {
        dropdownEl.innerHTML = `
          <div class="search-no-results" style="padding: 20px 16px; text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 4px;">🔍</div>
            <strong style="color: var(--primary); font-size: 0.9rem; display: block; margin-bottom: 4px;">
              No materials found for "${query}"
            </strong>
            <p style="color: var(--text-secondary); font-size: 0.78rem; margin: 0 auto; max-width: 280px; line-height: 1.4;">
              Try checking pigment spelling, searching by brand (e.g. <em>Winsor & Newton</em>), or browsing our 10 product categories.
            </p>
          </div>
        `;
        dropdownEl.classList.add('active');
        return;
      }

      dropdownEl.innerHTML = `
        <div class="search-suggestions-header" style="padding: 8px 14px; font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; background: var(--bg-alt); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between;">
          <span>Search Results (${suggestions.length})</span>
          <span>Keyword Match</span>
        </div>
        <div class="search-suggestions-list">
          ${suggestions.map(item => {
            if (item.type === 'category') {
              return `
                <a href="shop.html?category=${item.id}" class="search-result-item search-category-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; text-decoration: none; border-bottom: 1px solid var(--border-light);">
                  <span style="font-size: 1.1rem;">📚</span>
                  <div>
                    <strong style="color: var(--primary); font-size: 0.88rem;">Category: ${item.text}</strong>
                    <div style="font-size: 0.74rem; color: var(--text-secondary);">Browse all supplies in ${item.text}</div>
                  </div>
                </a>
              `;
            }

            const discountedPrice = item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price;
            return `
              <a href="product-details.html?id=${item.id}" class="search-result-item" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; text-decoration: none; border-bottom: 1px solid var(--border-light);">
                <img 
                  src="${item.image || `Products/${item.category || 'Accessories'}/${(item.image ? item.image.split('/').pop() : 'clay-tools.webp')}`}" 
                  alt="${item.text || item.name}" 
                  style="width: 42px; height: 42px; border-radius: 6px; object-fit: cover; background: var(--bg-alt); border: 1px solid var(--border-light); flex-shrink: 0;"
                  onerror="this.onerror=null; this.src='Products/Accessories/clay-tools.webp';"
                />
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 700; font-size: 0.86rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.text || item.name}
                  </div>
                  <div style="font-size: 0.74rem; color: var(--text-secondary);">
                    <span>${item.brand || 'Art Flair'}</span> • <span>${item.category || 'Supplies'}</span>
                  </div>
                </div>
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary); flex-shrink: 0;">
                  ₹${discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </a>
            `;
          }).join('')}
        </div>
        <div style="padding: 8px 14px; text-align: center; background: var(--card); border-top: 1px solid var(--border-light);">
          <a href="shop.html?q=${encodeURIComponent(query)}" style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-decoration: none;">
            View All Catalog Matches for "${query}" →
          </a>
        </div>
      `;
      dropdownEl.classList.add('active');
    };

    // Event: Input typing
    inputEl.addEventListener('input', (e) => {
      const q = e.target.value;
      syncClearBtn();
      clearTimeout(debounceTimer);

      if (q.trim().length < 2) {
        closeDropdown();
        return;
      }

      showLoading();

      debounceTimer = setTimeout(async () => {
        const suggestions = await this.getSuggestions(q);
        renderSuggestions(q.trim(), suggestions);
      }, this.debounceTime);
    });

    // Event: Clear Button click
    if (clearBtnEl) {
      clearBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        inputEl.value = '';
        inputEl.focus();
        syncClearBtn();
        closeDropdown();
        if (callbacks.onClear) callbacks.onClear();
      });
    }

    // Event: Form submit
    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        const q = inputEl.value.trim();
        if (callbacks.onSearchSubmit) {
          e.preventDefault();
          callbacks.onSearchSubmit(q);
        }
      });
    }

    // Event: Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl?.contains(e.target) && !clearBtnEl?.contains(e.target)) {
        closeDropdown();
      }
    });

    // Event: Keyboard Escape
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    // Initial clear button state
    syncClearBtn();
  }
};

// Backwards compatibility shorthand
const SearchService = SearchModule;
