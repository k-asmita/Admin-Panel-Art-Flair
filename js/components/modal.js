/**
 * Art Flair - Modal & Dialog Component
 * Sabahz Trading
 */

const ModalComponent = {
  backdrop: null,

  init() {
    if (!this.backdrop) {
      let el = document.getElementById('global-modal-backdrop');
      if (!el) {
        el = document.createElement('div');
        el.id = 'global-modal-backdrop';
        el.className = 'modal-backdrop';
        el.innerHTML = `
          <div class="modal-card" id="global-modal-card">
            <button class="modal-close-btn" id="modal-close-trigger" aria-label="Close dialog">✕</button>
            <div id="global-modal-content"></div>
          </div>
        `;
        document.body.appendChild(el);

        // Bind close triggers
        el.addEventListener('click', (e) => {
          if (e.target === el) this.close();
        });
        document.getElementById('modal-close-trigger')?.addEventListener('click', () => this.close());
      }
      this.backdrop = el;
    }
  },

  async openQuickView(productId) {
    this.init();
    const content = document.getElementById('global-modal-content');
    if (content) {
      content.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <div class="skeleton" style="height: 200px; margin-bottom: 20px;"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
          <div class="skeleton skeleton-text" style="width: 40%;"></div>
        </div>
      `;
    }
    this.backdrop.classList.add('active');

    try {
      const product = await ProductService.getProductById(productId);
      if (!product) {
        if (content) content.innerHTML = '<div style="padding: 24px;">Product details could not be loaded.</div>';
        return;
      }

      const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

      if (content) {
        content.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; padding: 28px;">
            <div>
              <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 12px; aspect-ratio: 1/1; object-fit: cover;" />
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-secondary); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                ${product.brand} • ${product.category}
              </div>
              <h3 style="font-size: 1.3rem; margin-bottom: 12px;">${product.name}</h3>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary); margin-bottom: 12px;">
                ₹${discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                ${product.discount > 0 ? `<span style="font-size: 0.9rem; color: var(--color-text-muted); text-decoration: line-through; margin-left: 8px;">₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>` : ''}
              </div>
              <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 16px;">
                ${product.description}
              </p>
              <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  onclick="CartService.addToCart('${product.id}', 1).then(() => { Toast.success('Added to cart!'); ModalComponent.close(); });"
                >
                  Add to Cart
                </button>
                <a href="product-details.html?id=${product.id}" class="btn btn-outline">Full Specifications & AI Insights</a>
              </div>
            </div>
          </div>
        `;
      }
    } catch (err) {
      console.error(err);
    }
  },

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove('active');
    }
  }
};
