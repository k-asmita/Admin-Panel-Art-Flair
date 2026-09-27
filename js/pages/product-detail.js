/**
 * Art Flair - Product Detail Controller
 * Developed for Sabahz Trading
 * 
 * Manages single product lifecycle:
 * - Reads product ID from URL query param (?id=...)
 * - Requests dynamic product data from backend API
 * - Interactive multi-thumbnail gallery
 * - Real-time stock status & quantity selector
 * - Add to Cart (database-driven) & Wishlist toggle
 * - Dynamic Specifications table
 * - Related Products section from API
 * - AI Recommendations ("You May Also Like" & AI Medium Pairing)
 */

const ProductDetailPage = {
  currentProduct: null,
  quantity: 1,

  async init() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || 'AF-OIL-001'; // Default fallback item
    this._bindEvents();
    await this.loadProduct(productId);
  },

  async loadProduct(productId) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    // 1. Loading State (Shimmer Skeleton Structure)
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <div class="skeleton" style="height: 460px; border-radius: 16px; margin-bottom: 16px;"></div>
          <div style="display: flex; gap: 12px;">
            <div class="skeleton" style="width: 72px; height: 72px; border-radius: 8px;"></div>
            <div class="skeleton" style="width: 72px; height: 72px; border-radius: 8px;"></div>
            <div class="skeleton" style="width: 72px; height: 72px; border-radius: 8px;"></div>
          </div>
        </div>
        <div>
          <div class="skeleton skeleton-text" style="width: 25%; margin-bottom: 12px;"></div>
          <div class="skeleton skeleton-text" style="width: 85%; height: 36px; margin-bottom: 16px;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; height: 24px; margin-bottom: 24px;"></div>
          <div class="skeleton" style="height: 70px; border-radius: 12px; margin-bottom: 24px;"></div>
          <div class="skeleton skeleton-text" style="width: 100%;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 75%; margin-bottom: 24px;"></div>
          <div class="skeleton" style="height: 52px; border-radius: 12px; width: 60%;"></div>
        </div>
      </div>
    `;

    try {
      // 2. Fetch Product Data from Backend API
      const product = await ProductService.getProductById(productId);

      if (!product) {
        // API Error / Not Found State
        container.innerHTML = `
          <div class="empty-state" style="margin: 40px auto; max-width: 600px;">
            <div class="empty-state-icon" style="color: var(--error);">📦</div>
            <h2 class="empty-state-title">Art Supply Not Found</h2>
            <p class="empty-state-desc">
              The requested material (ID: <code>${productId}</code>) could not be retrieved from the Sabahz Trading inventory database.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="products.html" class="btn btn-primary">Browse All Supplies</a>
              <a href="index.html" class="btn btn-outline">Return Home</a>
            </div>
          </div>
        `;
        return;
      }

      this.currentProduct = product;
      document.title = `${product.name} | Art Flair - Sabahz Trading`;

      // Price & Discount Calculation
      const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
      const cat = product.category_name || product.category || product.categoryId || 'Accessories';
      const dirName = (typeof resolveProductCategoryDir === 'function') ? resolveProductCategoryDir(cat) : cat;
      const rawImage = String(product.product_image || product.image || product.image_url || '').replace(/^\/+/, '');
      const fileName = rawImage.split('/').pop().split('\\').pop() || 'acrylic.jpg';
      const directProductsPath = `Products/${dirName}/${fileName}`;
      const mainImgSrc = (typeof resolveProductImageUrl === 'function') ? resolveProductImageUrl(product) : directProductsPath;
      const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [mainImgSrc];
      const isWishlisted = StorageUtil.isWishlisted(product.id);

      // Stock Status Logic
      let stockClass = 'stock-in';
      let stockText = `In Stock (${product.stock} units available for Sabahz dispatch)`;
      if (product.stock === 0) {
        stockClass = 'stock-out';
        stockText = 'Currently Out of Stock';
      } else if (product.stock <= 10) {
        stockClass = 'stock-low';
        stockText = `Low Stock: Only ${product.stock} units remaining`;
      }

      // Rating Stars
      const fullStars = Math.floor(product.rating || 5);
      const starString = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

      // Specifications Rows
      const specsRows = Object.entries(product.specifications || {}).map(([key, val]) => `
        <tr>
          <th>${key}</th>
          <td>${val}</td>
        </tr>
      `).join('');

      // 3. Render Product Detail DOM
      container.innerHTML = `
        <!-- Breadcrumb Navigation -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a>
          <span class="breadcrumb-separator">/</span>
          <a href="products.html">Shop</a>
          <span class="breadcrumb-separator">/</span>
          <a href="products.html?category=${product.categoryId}">${product.category}</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${product.name}</span>
        </nav>

        <!-- Main Product Grid -->
        <div class="product-detail-layout">
          <!-- Gallery Column -->
          <div class="product-gallery-sticky">
            <div class="gallery-main-display">
              <img 
                src="${mainImgSrc}" 
                alt="${product.name}" 
                id="main-product-image" 
                class="gallery-main-img" 
                loading="eager"
                onerror="this.onerror=null; this.src='${directProductsPath}';"
              />
            </div>
            <div class="gallery-thumbnails-row">
              ${galleryImages.map((img, idx) => `
                <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" data-index="${idx}" tabindex="0" role="button" aria-label="Thumbnail ${idx + 1}">
                  <img src="${img}" alt="${product.name} Thumbnail ${idx + 1}" onerror="this.onerror=null; this.src='${directProductsPath}';" />
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Product Info & Actions Column -->
          <div class="product-info-column">
            <div class="product-header-meta">
              <a href="products.html?brand=${encodeURIComponent(product.brand)}" class="product-brand-link">${product.brand}</a>
              <span>•</span>
              <span style="font-size: 0.85rem; color: var(--text-secondary);">${product.category}</span>
            </div>

            <h1 class="product-page-title">${product.name}</h1>

            <div class="product-reviews-summary">
              <span class="rating-stars">${starString}</span>
              <strong style="color: var(--text);">${product.rating}</strong>
              <span style="color: var(--text-secondary);">(${product.reviewsCount} Master Reviews)</span>
              ${product.aiTag ? `<span class="badge badge-ai" style="margin-left: 8px;">✨ ${product.aiTag}</span>` : ''}
            </div>

            <!-- Pricing Box -->
            <div class="product-pricing-box">
              <span class="price-main-tag">${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</span>
            </div>

            <p class="product-short-desc">${product.description}</p>

            <!-- Stock Status & SKU Card -->
            <div class="stock-availability-card">
              <div class="stock-indicator ${stockClass}">
                ${stockText}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">
                SKU: <code style="font-family: var(--font-mono); font-weight: 600;">${product.id}</code>
              </div>
            </div>

            <!-- Quantity & Cart Actions -->
            <div class="purchase-action-group">
              <div class="quantity-stepper">
                <button type="button" class="stepper-btn" id="btn-qty-minus" aria-label="Decrease quantity">−</button>
                <input type="number" id="detail-qty-input" class="stepper-input" value="1" min="1" max="${product.stock || 1}" aria-label="Quantity" />
                <button type="button" class="stepper-btn" id="btn-qty-plus" aria-label="Increase quantity">+</button>
              </div>

              <button 
                type="button" 
                class="btn btn-primary btn-add-detail" 
                id="btn-add-to-cart-detail"
                ${product.stock === 0 ? 'disabled' : ''}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                ${product.stock === 0 ? 'Out of Stock' : 'Add to Studio Cart'}
              </button>

              <button 
                type="button" 
                class="card-action-btn ${isWishlisted ? 'active' : ''}" 
                id="btn-detail-wishlist" 
                style="width: 48px; height: 48px; border-radius: var(--radius-md);" 
                title="Save to Wishlist"
                aria-label="Wishlist"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            <!-- AI Medium Compatibility Assistant Card -->
            <div class="ai-advisor-card" id="ai-recommendation-box">
              <div class="ai-advisor-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
                </svg>
                <span class="ai-advisor-title">AI Medium Compatibility Assistant</span>
              </div>
              <p class="ai-advisor-desc" id="ai-advisor-explanation">
                Analyzing chemical compatibility, pigment permanence, and optimal ground supports...
              </p>
              <div class="ai-pairs-list" id="ai-pairs-container">
                <div class="skeleton skeleton-text" style="height: 38px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specifications & Archival Tabs -->
        <div class="product-tabs-wrapper">
          <div class="tabs-nav-bar">
            <button class="tab-nav-btn active" data-tab="specs">Specifications & Medium Details</button>
            <button class="tab-nav-btn" data-tab="archival">Archival & Permanence Standards</button>
            <button class="tab-nav-btn" data-tab="shipping">Sabahz Dispatch & Handling</button>
          </div>

          <div class="tab-pane active" id="tab-specs">
            <table class="specs-table">
              <tbody>${specsRows}</tbody>
            </table>
          </div>

          <div class="tab-pane" id="tab-archival">
            <p>
              All Art Flair materials distributed via Sabahz Trading undergo rigorous ASTM D-4236 toxicity testing and lightfastness evaluation. Pigments rated ASTM I or II guarantee resistance to fading under direct museum illumination for over 100 years.
            </p>
          </div>

          <div class="tab-pane" id="tab-shipping">
            <p>
              Items are packaged using shock-absorbent, climate-regulated materials to protect liquid emulsions, cold-pressed paper edges, and natural hair brushes during transit. Orders placed before 3:00 PM EST receive same-day priority dispatch.
            </p>
          </div>
        </div>

        <!-- Related Products Section -->
        <section style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border);" aria-label="Related Products">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
            <div>
              <div class="section-kicker">Studio Recommendations</div>
              <h2 style="font-size: 1.8rem; margin-bottom: 4px;">Frequently Paired & Related Supplies</h2>
              <p style="margin-bottom: 0;">Complementary materials curated for this medium.</p>
            </div>
            <a href="products.html?category=${product.categoryId}" class="btn btn-outline btn-sm">View More in ${product.category} →</a>
          </div>

          <div class="products-showcase-grid grid grid-cols-4 gap-lg" id="related-products-grid">
            <div class="skeleton" style="height: 360px; border-radius: 12px;"></div>
            <div class="skeleton" style="height: 360px; border-radius: 12px;"></div>
            <div class="skeleton" style="height: 360px; border-radius: 12px;"></div>
            <div class="skeleton" style="height: 360px; border-radius: 12px;"></div>
          </div>
        </section>

        <!-- AI "Recommended For You" Section -->
        <section style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border);" aria-label="You May Also Like">
          <div class="section-header">
            <div class="section-kicker" style="background: linear-gradient(135deg, var(--primary-soft), var(--accent-soft)); color: var(--primary);">
              ✨ AI Personalized Studio Picks
            </div>
            <h2 class="section-title">You May Also Like</h2>
            <p class="section-subtitle">Intelligently matched to complement your active creative workflow.</p>
          </div>

          <div id="ai-product-recommendations-container">
            <div class="products-showcase-grid" id="ai-personalized-grid">
              <div class="skeleton skeleton-card"></div>
              <div class="skeleton skeleton-card"></div>
              <div class="skeleton skeleton-card"></div>
              <div class="skeleton skeleton-card"></div>
            </div>
          </div>
        </section>
      `;

      // 4. Load AI Complementary Pairings
      await this.loadAiRecommendations(productId);

      // 5. Load Related Products from API
      await this.loadRelatedProducts(product.categoryId, productId);

      // 6. Load "You May Also Like" AI Recommendations
      await this.loadYouMayAlsoLike();

    } catch (err) {
      console.error('[ProductDetailPage] Error rendering product detail:', err);
      container.innerHTML = `
        <div class="alert alert-error" style="margin: 40px auto; max-width: 600px;">
          Failed to load product data from server. Please try refreshing.
        </div>
      `;
    }
  },

  async loadAiRecommendations(productId) {
    const aiExplanation = document.getElementById('ai-advisor-explanation');
    const aiPairsContainer = document.getElementById('ai-pairs-container');

    try {
      const res = await ProductService.getAiRecommendations(productId);
      if (aiExplanation && res.aiInsight) {
        aiExplanation.textContent = res.aiInsight;
      }

      if (aiPairsContainer && res.recommendations) {
        aiPairsContainer.innerHTML = res.recommendations.map(item => `
          <div class="ai-pair-item">
            <img src="${item.image}" alt="${item.name}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" />
            <div style="flex: 1;">
              <strong>${item.name}</strong>
              <div style="color: var(--text-secondary);">₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <button 
              type="button" 
              class="btn btn-primary btn-sm" 
              onclick="CartService.addToCart('${item.id}', 1).then(() => Toast.success('Paired item added to Studio Cart!'))"
            >
              Add Pair
            </button>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error(err);
    }
  },

  async loadRelatedProducts(categoryId, currentProductId) {
    const grid = document.getElementById('related-products-grid');
    if (!grid) return;

    try {
      const res = await ProductService.getProducts({ category: categoryId, page_size: 4 });
      const products = (res.products || []).filter(p => p.id !== currentProductId).slice(0, 4);

      if (products.length === 0) {
        const fallbackRes = await ProductService.getProducts({ page_size: 4 });
        const fallbackProducts = (fallbackRes.products || []).filter(p => p.id !== currentProductId).slice(0, 4);
        grid.innerHTML = fallbackProducts.map(prod => ProductCardComponent.createHTML(prod)).join('');
      } else {
        grid.innerHTML = products.map(prod => ProductCardComponent.createHTML(prod)).join('');
      }

      ProductCardComponent.bindContainerEvents(grid);
    } catch (err) {
      console.error('Error loading related products:', err);
    }
  },

  async loadYouMayAlsoLike() {
    const container = document.getElementById('ai-product-recommendations-container');
    if (!container) return;

    if (typeof RecommendationEngine !== 'undefined') {
      await RecommendationEngine.render(container, {
        title: 'You May Also Like',
        productId: this.currentProduct?.id || null,
        columns: 4,
        showBadge: true
      });
    }
  },

  _bindEvents() {
    // Gallery Thumbnail Switching
    document.addEventListener('click', (e) => {
      const thumb = e.target.closest('.gallery-thumb-item');
      if (thumb && this.currentProduct) {
        const gallery = this.currentProduct.gallery && this.currentProduct.gallery.length > 0 
          ? this.currentProduct.gallery 
          : [this.currentProduct.image];
        const index = parseInt(thumb.dataset.index, 10);
        const mainImg = document.getElementById('main-product-image');
        if (mainImg && gallery[index]) {
          mainImg.src = gallery[index];
          document.querySelectorAll('.gallery-thumb-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        }
      }
    });

    // Quantity Stepper
    document.addEventListener('click', (e) => {
      const input = document.getElementById('detail-qty-input');
      if (!input) return;

      if (e.target.id === 'btn-qty-minus') {
        const val = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
        input.value = val;
        this.quantity = val;
      } else if (e.target.id === 'btn-qty-plus') {
        const maxStock = this.currentProduct?.stock || 99;
        const val = Math.min(maxStock, (parseInt(input.value, 10) || 1) + 1);
        input.value = val;
        this.quantity = val;
      }
    });

    // Add to Cart
    document.addEventListener('click', async (e) => {
      if (e.target.closest('#btn-add-to-cart-detail') && this.currentProduct) {
        const qtyInput = document.getElementById('detail-qty-input');
        const qty = parseInt(qtyInput?.value, 10) || 1;
        const btn = document.getElementById('btn-add-to-cart-detail');

        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Adding to Cart...';
        }

        try {
          await CartService.addToCart(this.currentProduct.id, qty);
          Toast.success(`Added ${qty} × ${this.currentProduct.name} to Studio Cart!`);
          if (typeof CartDrawerComponent !== 'undefined') {
            CartDrawerComponent.open();
          }
        } catch (err) {
          Toast.error(err.message || 'Error updating cart');
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add to Studio Cart
            `;
          }
        }
      }

      // Add to Wishlist Toggle
      if (e.target.closest('#btn-detail-wishlist') && this.currentProduct) {
        const btn = e.target.closest('#btn-detail-wishlist');
        const currentlyActive = btn.classList.contains('active');
        
        try {
          if (typeof WishlistService !== 'undefined') {
            if (currentlyActive) {
              await WishlistService.removeFromWishlist(this.currentProduct.id);
              btn.classList.remove('active');
              const svg = btn.querySelector('svg');
              if (svg) svg.setAttribute('fill', 'none');
              Toast.info('Removed from your Studio Wishlist');
            } else {
              await WishlistService.addToWishlist(this.currentProduct.id);
              btn.classList.add('active');
              const svg = btn.querySelector('svg');
              if (svg) svg.setAttribute('fill', 'currentColor');
              Toast.success('Saved to your Studio Wishlist!');
            }
          } else {
            const added = StorageUtil.toggleWishlist(this.currentProduct.id);
            btn.classList.toggle('active', added);
            const svg = btn.querySelector('svg');
            if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
            Toast.info(added ? 'Saved to your Studio Wishlist' : 'Removed from Wishlist');
          }
        } catch(err) {
          Toast.error(err.message || 'Error updating wishlist');
        }
      }
    });

    // Tabs Switching
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-nav-btn');
      if (tabBtn) {
        const tabKey = tabBtn.dataset.tab;
        document.querySelectorAll('.tab-nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        tabBtn.classList.add('active');
        document.getElementById(`tab-${tabKey}`)?.classList.add('active');
      }
    });
  }
};
