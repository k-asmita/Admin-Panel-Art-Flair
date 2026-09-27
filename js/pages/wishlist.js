/**
 * Art Flair - Wishlist Page Controller
 * Developed for Sabahz Trading
 * 
 * 100% DATABASE-DRIVEN WISHLIST IN INDIAN RUPEES (₹):
 * - Requests customer wishlist items from backend on load
 * - Submits Add to Cart and Remove from Wishlist requests to API
 * - Re-renders and synchronizes in real time with backend response
 * - Supports loading, empty, error, and populated card grid states
 */

const WishlistPage = {
  items: [],

  async init() {
    this._bindEvents();
    await this.renderWishlist();
  },

  async renderWishlist() {
    const container = document.getElementById('wishlist-view-container');
    const countBadge = document.getElementById('wishlist-total-count');
    if (!container) return;

    // 1. Loading Skeleton State
    container.innerHTML = `
      <div class="wishlist-grid">
        <div class="skeleton" style="height: 380px; border-radius: var(--radius-lg);"></div>
        <div class="skeleton" style="height: 380px; border-radius: var(--radius-lg);"></div>
        <div class="skeleton" style="height: 380px; border-radius: var(--radius-lg);"></div>
      </div>
    `;

    try {
      // 2. Request Authoritative Wishlist from Backend/Database
      const res = await WishlistService.getWishlist();
      
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to retrieve database wishlist');
      }

      this.items = res.items || [];

      // Update badge counter
      if (countBadge) {
        countBadge.textContent = `${this.items.length} ${this.items.length === 1 ? 'Material' : 'Materials'}`;
      }

      // 3. Render Empty Wishlist State
      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding: 60px 20px; max-width: 620px; margin: 40px auto; background: var(--card); border: 1px dashed var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm);">
            <div class="empty-state-icon" style="font-size: 3.5rem; margin-bottom: 16px;">✨</div>
            <h2 class="empty-state-title" style="font-size: 1.8rem; margin-bottom: 8px; color: var(--primary);">Your Studio Wishlist is Empty</h2>
            <p class="empty-state-desc" style="max-width: 460px; margin: 0 auto 24px; color: var(--text-secondary);">
              Save your preferred single-pigment oils, cotton rag blocks, and sable brushes here for future creative projects.
            </p>
            <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
              <a href="shop.html" class="btn btn-primary btn-lg">Explore Studio Catalog →</a>
              <a href="ai-matcher.html" class="btn btn-outline btn-lg">Launch AI Medium Advisor</a>
            </div>
          </div>
        `;
        return;
      }

      // 4. Render Populated Wishlist Cards Grid
      container.innerHTML = `
        <div class="wishlist-grid">
          ${this.items.map(item => {
            const discountedPrice = item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price;
            
            // Stock Indicator
            let stockClass = 'stock-in';
            let stockText = 'In Stock';
            if (item.stock === 0) {
              stockClass = 'stock-out';
              stockText = 'Out of Stock';
            } else if (item.stock <= 10) {
              stockClass = 'stock-low';
              stockText = `Low Stock: Only ${item.stock} left`;
            }

            return `
              <article class="wishlist-item-card" data-product-id="${item.id}">
                <div class="wishlist-card-media">
                  <img 
                    src="${item.image || item.image_url || `Products/${item.category || item.category_name || 'Accessories'}/${(item.product_image ? item.product_image.split('/').pop() : '') || (item.image ? item.image.split('/').pop() : '')}`}" 
                    alt="${item.name}" 
                    class="wishlist-img" 
                    loading="lazy" 
                    onerror="this.onerror=null; this.src='Products/${item.category || item.category_name || 'Accessories'}/${(item.product_image ? item.product_image.split('/').pop() : '') || (item.image ? item.image.split('/').pop() : '')}';"
                  />
                  <button 
                    type="button" 
                    class="wishlist-remove-btn" 
                    data-action="remove-wishlist" 
                    data-id="${item.id}" 
                    data-name="${item.name}" 
                    title="Remove from Wishlist"
                    aria-label="Remove ${item.name} from Wishlist"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div class="wishlist-card-content">
                  <div class="wishlist-card-meta">${item.brand || 'Archival'} • ${item.category || 'Supplies'}</div>
                  <h3 class="wishlist-card-title">
                    <a href="product-details.html?id=${item.id}" style="color: inherit; text-decoration: none;">
                      ${item.name}
                    </a>
                  </h3>

                  <div class="wishlist-card-pricing">
                    <span class="wishlist-price-current">₹${discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    ${item.discount > 0 ? `
                      <span class="wishlist-price-original">₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    ` : ''}
                  </div>

                  <div style="margin-bottom: 12px;">
                    <span class="stock-indicator ${stockClass}">${stockText}</span>
                  </div>

                  <div class="wishlist-card-actions">
                    <button 
                      type="button" 
                      class="btn btn-primary btn-sm" 
                      data-action="add-to-cart" 
                      data-id="${item.id}" 
                      data-name="${item.name}"
                      ${item.stock === 0 ? 'disabled' : ''}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      ${item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <a href="product-details.html?id=${item.id}" class="btn btn-outline btn-sm">
                      View Details
                    </a>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `;

    } catch (err) {
      console.error('[WishlistPage] Error fetching database wishlist:', err);
      // 5. Error State
      container.innerHTML = `
        <div class="empty-state" style="border-color: var(--error); max-width: 600px; margin: 40px auto;">
          <div class="empty-state-icon" style="color: var(--error);">⚠️</div>
          <h3 class="empty-state-title" style="color: var(--error);">Unable to Load Wishlist</h3>
          <p class="empty-state-desc">
            We encountered a network error connecting to the Sabahz Trading customer database.
          </p>
          <button type="button" class="btn btn-primary" onclick="WishlistPage.renderWishlist()">
            Retry Connection
          </button>
        </div>
      `;
    }
  },

  _bindEvents() {
    document.addEventListener('click', async (e) => {
      // 1. Remove from Wishlist action
      const removeBtn = e.target.closest('[data-action="remove-wishlist"]');
      if (removeBtn) {
        const productId = removeBtn.dataset.id;
        const productName = removeBtn.dataset.name || 'Product';
        removeBtn.disabled = true;

        try {
          await WishlistService.removeFromWishlist(productId);
          Toast.info(`Removed "${productName}" from your Studio Wishlist.`);
          await this.renderWishlist();
        } catch (err) {
          Toast.error(err.message || 'Error removing item from wishlist');
          removeBtn.disabled = false;
        }
        return;
      }

      // 2. Add to Cart from Wishlist
      const addCartBtn = e.target.closest('[data-action="add-to-cart"]');
      if (addCartBtn) {
        const productId = addCartBtn.dataset.id;
        const productName = addCartBtn.dataset.name || 'Product';
        addCartBtn.disabled = true;
        addCartBtn.textContent = 'Adding...';

        try {
          await CartService.addToCart(productId, 1);
          Toast.success(`Added "${productName}" to your Studio Cart!`);
        } catch (err) {
          Toast.error(err.message || 'Could not add item to cart');
        } finally {
          addCartBtn.disabled = false;
          addCartBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add to Cart
          `;
        }
      }
    });
  }
};
