/**
 * Art Flair - Reusable Product Card Component
 * Developed for Sabahz Trading
 * 
 * Clean, balanced, modern product card displaying:
 * - Product Image
 * - Brand • Category
 * - Product Name
 * - Rating & Reviews
 * - Single Price (₹ INR) from database
 * - 'Add to Cart' & 'View Details' buttons
 */

const ProductCardComponent = {
  createHTML(product) {
    const productId = product.product_id || product.id;
    const productName = product.product_name || product.name || 'Fine Art Material';
    const brandName = product.brand || 'Artisan Atelier';
    const categoryName = (product.category_name || product.category || 'Fine Art').toUpperCase();
    const ratingValue = product.rating || 5;
    const reviewsCount = product.reviewsCount || 12;

    // Single Price formatted strictly as Indian Currency
    const priceNumber = Number(product.price || 0);
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(priceNumber);

    // Robust Image URL resolution
    const cat = product.category_name || product.category || product.categoryId || 'Accessories';
    const dirName = (typeof resolveProductCategoryDir === 'function') 
      ? resolveProductCategoryDir(cat) 
      : cat;
    const rawImage = String(product.product_image || product.image || product.image_url || '').replace(/^\/+/, '');
    const filename = rawImage.split('/').pop().split('\\').pop() || 'acrylic.jpg';
    const fallbackPath = `Products/${dirName}/${filename}`;
    const imageSrc = (typeof resolveProductImageUrl === 'function') 
      ? resolveProductImageUrl(product) 
      : fallbackPath;

    // Rating star generation
    const fullStars = Math.floor(ratingValue);
    const starString = '★'.repeat(fullStars) + '☆'.repeat(Math.max(0, 5 - fullStars));

    return `
      <article class="product-card" data-product-id="${productId}">
        <div class="product-card-image-wrap">
          <a href="product-details.html?id=${productId}" class="product-card-img-link" aria-label="View ${productName}">
            <img 
              src="${imageSrc}" 
              alt="${productName}" 
              class="product-card-img" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='${fallbackPath}';"
            />
          </a>
        </div>

        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-card-brand">${brandName}</span>
            <span class="product-card-meta-dot">•</span>
            <span class="product-card-category">${categoryName}</span>
          </div>

          <h3 class="product-card-title">
            <a href="product-details.html?id=${productId}">
              ${productName}
            </a>
          </h3>

          <div class="product-card-rating">
            <span class="rating-stars">${starString}</span>
            <span class="rating-score">${ratingValue}</span>
            <span class="rating-count">(${reviewsCount})</span>
          </div>

          <div class="product-card-price-box">
            <span class="product-card-price">${formattedPrice}</span>
          </div>

          <div class="product-card-actions">
            <button 
              type="button" 
              class="btn btn-primary btn-sm btn-card-add" 
              data-action="add-cart" 
              data-id="${productId}"
              ${product.stock === 0 ? 'disabled' : ''}
              title="Add to studio cart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add to Cart
            </button>

            <a 
              href="product-details.html?id=${productId}" 
              class="btn btn-outline-secondary btn-sm btn-card-view" 
              title="View Product Specifications"
            >
              View Details
            </a>
          </div>
        </div>
      </article>
    `;
  },

  // Global delegation binder for all product cards in a container
  bindContainerEvents(container) {
    if (!container) return;

    container.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const productId = target.dataset.id;

      if (action === 'add-cart') {
        e.preventDefault();
        target.disabled = true;
        target.innerHTML = 'Adding...';

        try {
          await CartService.addToCart(productId, 1);
          Toast.success('Added item to your Studio Cart!');
          if (typeof CartDrawerComponent !== 'undefined' && !window.location.pathname.toLowerCase().includes('cart.html')) {
            CartDrawerComponent.open();
          }
        } catch (err) {
          Toast.error(err.message || 'Error updating cart');
        } finally {
          target.disabled = false;
          target.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add to Cart
          `;
        }
      }
    });
  },

  // Global document listener binder
  bindEvents() {
    this.bindContainerEvents(document.body);
  }
};

// Auto-bind to window
window.ProductCardComponent = ProductCardComponent;
