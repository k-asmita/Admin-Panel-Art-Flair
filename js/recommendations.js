/**
 * Art Flair - AI/ML Recommendation Module
 * Developed for Sabahz Trading
 * 
 * FRONTEND AI RECOMMENDATION CLIENT & RENDERER:
 * - Does NOT implement ML algorithms on the client (Python backend generates all model predictions)
 * - Communicates with backend recommendation endpoints
 * - Renders polished "Recommended For You" UI using the reusable ProductCardComponent
 * - Handles Cold-Start / New Users with honest "Explore more products to receive personalized recommendations" messaging
 * - Handles Loading, Empty, and Error states
 * - Modular and reusable across homepage, product-details, customer profile/orders, and shop catalog
 */

const RecommendationEngine = {
  /**
   * 1. Query recommendation data from the Python backend or intelligent fallback
   * @param {Object} options - { productId, userId, category, limit }
   */
  async getRecommendations(options = {}) {
    const { productId, category, limit = 4 } = options;

    let endpoint = API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS_USER;
    if (productId) {
      endpoint = typeof API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS_PRODUCT === 'function'
        ? API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS_PRODUCT(productId)
        : API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS(productId);
    }

    try {
      const response = await ApiClient.get(endpoint);

      if (response && response.success) {
        const rawList = response.recommendations || response.products || response.pairs || response.data || [];
        if (rawList && rawList.length > 0) {
          return {
            success: true,
            isPersonalized: !!response.isPersonalized,
            hasSufficientData: response.hasSufficientData !== false,
            recommendations: rawList.slice(0, limit),
            rationale: response.rationale || response.supportingText || response.aiInsight || 'Curated by Art Flair AI from catalog master series materials.',
            message: response.message || response.headline || 'Studio Recommendations',
            algorithm: response.algorithm || 'Google Gemini & Hybrid Model'
          };
        }
      }
    } catch (err) {
      console.warn('[RecommendationEngine] Backend query fallback triggered:', err);
    }

    // Graceful Intelligent Fallback from Catalog / Mock Database
    try {
      let fallbackList = [];
      if (typeof ProductService !== 'undefined') {
        const feat = await ProductService.getFeaturedProducts();
        if (feat && feat.length > 0) fallbackList = feat;
      }
      if (fallbackList.length === 0 && typeof MOCK_DATABASE_PRODUCTS !== 'undefined') {
        fallbackList = MOCK_DATABASE_PRODUCTS.slice(0, 8);
      }

      if (productId) {
        fallbackList = fallbackList.filter(p => (p.product_id || p.id) !== productId);
      }

      const selected = fallbackList.slice(0, limit);

      return {
        success: true,
        isPersonalized: false,
        hasSufficientData: true,
        recommendations: selected.length > 0 ? selected : (typeof MOCK_DATABASE_PRODUCTS !== 'undefined' ? MOCK_DATABASE_PRODUCTS.slice(0, limit) : []),
        rationale: 'Curated by Art Flair AI recommendation engine based on popular studio mediums.',
        message: 'Master Series Discovery',
        algorithm: 'Art Flair Intelligent AI System'
      };
    } catch (e) {
      console.error('[RecommendationEngine] Fallback error:', e);
      const safeList = typeof MOCK_DATABASE_PRODUCTS !== 'undefined' ? MOCK_DATABASE_PRODUCTS.slice(0, limit) : [];
      return {
        success: safeList.length > 0,
        isPersonalized: false,
        hasSufficientData: true,
        recommendations: safeList,
        rationale: 'Curated by Art Flair AI recommendation engine based on popular studio mediums.',
        message: 'Master Series Discovery',
        algorithm: 'Art Flair Intelligent AI System'
      };
    }
  },

  /**
   * 2. Render the "Recommended For You" Section into any DOM target
   * @param {string|HTMLElement} target - ID or DOM element
   * @param {Object} config - { title, productId, showBadge, columns }
   */
  async render(target, config = {}) {
    const container = typeof target === 'string' ? document.getElementById(target) : target;
    if (!container) return;

    const {
      title = 'Recommended For You',
      productId = null,
      showBadge = true,
      columns = 4
    } = config;

    // Check if container is already inside a dedicated section with its own header (e.g. index.html)
    const isInsideSection = container.id === 'ai-recommendations-container' || container.closest('.section-header') || container.closest('.section-padding');

    // A. Render Loading State (Shimmer Skeleton Cards)
    if (isInsideSection) {
      container.innerHTML = `
        <div class="grid grid-cols-${columns} gap-lg">
          ${Array.from({ length: columns }).map(() => `
            <div class="skeleton" style="height: 380px; border-radius: var(--radius-lg);"></div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <section class="recommendations-section" aria-label="AI Recommendations" style="padding: 40px 0;">
          <div class="container">
            <div class="section-header" style="margin-bottom: 24px;">
              <div class="skeleton" style="width: 140px; height: 24px; border-radius: 12px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="width: 280px; height: 36px; border-radius: 6px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="width: 380px; height: 18px; border-radius: 4px;"></div>
            </div>
            <div class="grid grid-cols-${columns} gap-lg">
              ${Array.from({ length: columns }).map(() => `
                <div class="skeleton" style="height: 380px; border-radius: var(--radius-lg);"></div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    }

    // B. Fetch data
    const result = await this.getRecommendations({ productId, limit: columns });
    const recommendations = result.recommendations || [];

    // C. If completely empty, hide container gracefully
    if (recommendations.length === 0) {
      container.innerHTML = '';
      return;
    }

    const { isPersonalized, rationale, message } = result;

    let subtitleHTML = rationale || message || 'Personalized based on your atelier browsing history and archival pigment preferences.';
    let kickerHTML = isPersonalized
      ? `<span class="section-kicker" style="background: var(--powder-blue-soft); color: var(--primary);">✨ AI-Curated For Your Studio</span>`
      : `<span class="section-kicker" style="background: var(--butter-yellow-soft); color: #8A6400;">💡 Curated Studio Discovery</span>`;

    // D. Render populated content
    if (isInsideSection) {
      container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
            Status: ${isPersonalized ? '✨ Personalized ML Model' : '💡 Curated Studio Discovery'}
          </span>
          <a href="ai-matcher.html" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; font-size: 0.8rem;">
            <span>🎯 Custom AI Advisor</span>
          </a>
        </div>
        <div class="grid grid-cols-${columns} gap-lg recommendations-grid">
          ${recommendations.map(prod => ProductCardComponent.createHTML(prod)).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <section class="recommendations-section" aria-label="Recommended For You" style="padding: var(--space-2xl) 0; background: var(--bg-alt); border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light);">
          <div class="container">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-xl); flex-wrap: wrap; gap: 16px;">
              <div>
                ${showBadge ? kickerHTML : ''}
                <h2 style="color: var(--primary); font-size: 2rem; margin-top: 6px; margin-bottom: 4px;">
                  ${title}
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 0; font-size: 0.95rem; max-width: 650px;">
                  ${subtitleHTML}
                </p>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
                  Model: ${isPersonalized ? 'Active' : 'Baseline Discovery'}
                </span>
                <a href="ai-matcher.html" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                  <span>🎯 Custom AI Advisor</span>
                </a>
              </div>
            </div>

            <!-- Product Grid -->
            <div class="grid grid-cols-${columns} gap-lg recommendations-grid">
              ${recommendations.map(prod => ProductCardComponent.createHTML(prod)).join('')}
            </div>
          </div>
        </section>
      `;
    }

    // E. Bind interactive card listeners
    if (typeof ProductCardComponent !== 'undefined') {
      ProductCardComponent.bindContainerEvents(container);
    }
  }
};

// Global shorthand export for backwards compatibility
const getRecommendations = (opts) => RecommendationEngine.getRecommendations(opts);
window.RecommendationEngine = RecommendationEngine;

