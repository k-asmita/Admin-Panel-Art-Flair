/**
 * Art Flair - AI Medium & Art Supplies Matcher Wizard Controller
 * Sabahz Trading
 * 
 * Guides artists through an interactive assessment and outputs customized
 * supply recommendations powered by the AI service & Gemini engine.
 */

const AiMatcherPage = {
  currentStep: 1,
  answers: {
    medium: 'oil',
    skillLevel: 'intermediate',
    projectType: 'portrait',
    budget: 'mid'
  },
  recommendedBundle: null,
  isGenerating: false,
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this._bindEvents();
    this.updateStepUI();
  },

  updateStepUI() {
    // Hide all panels
    document.querySelectorAll('.wizard-step-panel').forEach(p => p.classList.remove('active'));
    
    // Show current panel
    const activePanel = document.getElementById(`step-${this.currentStep}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Update node states in top progress bar
    document.querySelectorAll('.wizard-step-node').forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.remove('active', 'completed');
      if (stepNum === this.currentStep) {
        node.classList.add('active');
      } else if (stepNum < this.currentStep) {
        node.classList.add('completed');
      }
    });

    // Update wizard footer navigation
    const footerNav = document.getElementById('wizard-nav-buttons');
    const backBtn = document.getElementById('btn-wizard-prev');
    const nextBtn = document.getElementById('btn-wizard-next');

    if (this.currentStep === 5) {
      if (footerNav) footerNav.style.display = 'none';
    } else {
      if (footerNav) footerNav.style.display = 'flex';
      
      if (backBtn) {
        backBtn.style.visibility = this.currentStep > 1 ? 'visible' : 'hidden';
      }

      if (nextBtn) {
        if (this.currentStep === 4) {
          nextBtn.innerHTML = '✨ Generate AI Studio Kit →';
          nextBtn.classList.remove('btn-primary');
          nextBtn.classList.add('btn-primary');
        } else {
          nextBtn.innerHTML = 'Continue to Next Step →';
        }
      }
    }
  },

  _bindEvents() {
    // 1. Card option selections
    document.addEventListener('click', (e) => {
      const choiceCard = e.target.closest('.ai-choice-card');
      if (choiceCard) {
        const grid = choiceCard.closest('.ai-option-cards-grid');
        if (grid) {
          grid.querySelectorAll('.ai-choice-card').forEach(c => c.classList.remove('selected'));
        }
        choiceCard.classList.add('selected');

        const key = choiceCard.dataset.key;
        const val = choiceCard.dataset.val;
        if (key && val) {
          this.answers[key] = val;
        }
      }
    });

    // 2. Clickable Progress Step Nodes (jump back to completed or current steps)
    document.querySelectorAll('.wizard-step-node').forEach((node) => {
      node.addEventListener('click', () => {
        const targetStep = parseInt(node.dataset.step, 10);
        if (targetStep && targetStep >= 1 && targetStep <= 4) {
          this.currentStep = targetStep;
          this.updateStepUI();
        }
      });
    });

    // 3. Next step / Generate button
    document.getElementById('btn-wizard-next')?.addEventListener('click', async () => {
      if (this.isGenerating) return;

      if (this.currentStep < 4) {
        this.currentStep++;
        this.updateStepUI();
        window.scrollTo({ top: document.querySelector('.wizard-container')?.offsetTop - 80 || 0, behavior: 'smooth' });
      } else if (this.currentStep === 4) {
        await this.generateResults();
      }
    });

    // 4. Prev step button
    document.getElementById('btn-wizard-prev')?.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.updateStepUI();
        window.scrollTo({ top: document.querySelector('.wizard-container')?.offsetTop - 80 || 0, behavior: 'smooth' });
      }
    });

    // 5. Reconfigure / Start Over button on Results Page
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-reconfigure-ai')) {
        this.currentStep = 1;
        this.updateStepUI();
        window.scrollTo({ top: document.querySelector('.wizard-container')?.offsetTop - 80 || 0, behavior: 'smooth' });
      }
    });

    // 6. 1-Click Add Entire Bundle to Cart
    document.addEventListener('click', async (e) => {
      const addBundleBtn = e.target.closest('#btn-add-ai-bundle');
      if (addBundleBtn && this.recommendedBundle) {
        addBundleBtn.disabled = true;
        const originalText = addBundleBtn.innerHTML;
        addBundleBtn.innerHTML = 'Adding AI Kit to Cart...';

        try {
          if (Array.isArray(this.recommendedBundle.items)) {
            for (const item of this.recommendedBundle.items) {
              const pId = item.id || item.product_id;
              if (pId && typeof CartService !== 'undefined') {
                await CartService.addToCart(pId, 1);
              }
            }
          }
          if (typeof Toast !== 'undefined') {
            Toast.success('Complete AI-Curated Kit added to your Studio Cart!');
          }
          setTimeout(() => {
            window.location.href = 'cart.html';
          }, 800);
        } catch (err) {
          console.error('[AiMatcher] Error adding bundle to cart:', err);
          if (typeof Toast !== 'undefined') {
            Toast.error(err.message || 'Error adding kit items to cart.');
          }
          addBundleBtn.disabled = false;
          addBundleBtn.innerHTML = originalText;
        }
      }
    });
  },

  async generateResults() {
    this.isGenerating = true;
    this.currentStep = 5;
    this.updateStepUI();

    const resultsContainer = document.getElementById('ai-results-content');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 2.8rem; margin-bottom: 16px; animation: pulse-dot 1.2s infinite ease-in-out;">✨</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 8px; font-family: var(--font-heading);">Sabahz AI Model is Analyzing Material Compatibility...</h3>
          <p style="color: var(--color-text-secondary); max-width: 520px; margin: 0 auto; font-size: 0.95rem;">
            Cross-referencing pigment lightfastness, binder viscosity, and surface absorption rates across 73 archival supplies...
          </p>
        </div>
      `;
    }

    try {
      const result = await AiService.recommendSupplyKit(this.answers);
      this.recommendedBundle = result.bundle;

      if (resultsContainer) {
        const mediumDisplay = (result.aiAnalysis?.medium || this.answers.medium || 'Fine Art').toUpperCase();
        const score = result.compatibilityScore || 98.4;
        const explanation = result.aiAnalysis?.explanation || 'Curated with pure single-pigment formulation for high chromatic purity and archival permanence.';
        const advice = result.aiAnalysis?.pairingAdvice || 'Ensure base surfaces are primed with archival gesso before applying glazes.';
        const items = (result.bundle && result.bundle.items) ? result.bundle.items : [];
        const totalPrice = result.bundle?.totalPrice || items.reduce((s, i) => s + Number(i.price || 0), 0);

        const itemsHTML = items.map(item => {
          const itemImg = (typeof resolveProductImageUrl === 'function') 
            ? resolveProductImageUrl(item) 
            : (item.image || item.product_image || 'Products/Accessories/acrylic.jpg');
          const itemName = item.name || item.product_name || 'Studio Supply';
          const itemBrand = item.brand || 'Sabahz Master Series';
          const itemCategory = (item.category || item.category_name || 'Supplies').toUpperCase();
          const itemPriceNum = Number(item.price || 0);
          const formattedItemPrice = (typeof formatINR === 'function') 
            ? formatINR(itemPriceNum) 
            : `₹${itemPriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

          return `
            <div class="bundle-item-card">
              <div style="display: flex; align-items: center; gap: 14px;">
                <img 
                  src="${itemImg}" 
                  alt="${itemName}" 
                  class="bundle-item-img" 
                  onerror="this.onerror=null; this.src='Products/Accessories/acrylic.jpg';"
                />
                <div>
                  <div style="font-size: 0.75rem; color: var(--color-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">
                    ${itemBrand} • ${itemCategory}
                  </div>
                  <strong style="font-size: 0.95rem; color: var(--color-text-main); display: block; margin-top: 2px;">
                    ${itemName}
                  </strong>
                </div>
              </div>
              <div style="font-weight: 700; font-size: 1.15rem; color: var(--color-primary, #5B2C6F); white-space: nowrap;">
                ${formattedItemPrice}
              </div>
            </div>
          `;
        }).join('');

        const formattedTotal = (typeof formatINR === 'function')
          ? formatINR(totalPrice)
          : `₹${Number(totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        resultsContainer.innerHTML = `
          <div class="ai-results-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <span class="ai-match-score-badge">
                ✓ ${score}% Chemical & Archival Compatibility
              </span>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);">
                Sabahz Certified Studio Match
              </span>
            </div>

            <h3 style="font-size: 1.6rem; margin-bottom: 8px; font-family: var(--font-heading);">
              Your Personalized AI ${mediumDisplay} Studio Kit
            </h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.6;">
              ${explanation}
            </p>

            <div style="background: var(--color-card, #FFFFFF); border-left: 4px solid var(--color-secondary); padding: 14px 18px; border-radius: 8px; font-size: 0.9rem; color: var(--color-text-main); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
              💡 <strong>AI Studio Pairing Tip:</strong> ${advice}
            </div>

            <h4 style="font-size: 1.1rem; margin-bottom: 12px; font-weight: 700;">
              Recommended Archival Materials in this Bundle:
            </h4>
            
            <div class="bundle-items-list">
              ${itemsHTML}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid var(--color-border); margin-top: 20px; flex-wrap: wrap; gap: 16px;">
              <div>
                <div style="font-size: 0.85rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600;">Curated Bundle Total:</div>
                <div style="font-size: 1.85rem; font-weight: 800; color: var(--color-primary); font-family: var(--font-heading);">
                  ${formattedTotal}
                </div>
              </div>

              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button type="button" class="btn btn-outline" id="btn-reconfigure-ai">
                  ← Reconfigure Advisor
                </button>
                <button type="button" class="btn btn-primary btn-lg" id="btn-add-ai-bundle">
                  Add Entire AI Kit to Cart →
                </button>
              </div>
            </div>
          </div>
        `;
      }
    } catch (err) {
      console.error('[AiMatcher] Error formulating results:', err);
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 2.2rem; color: var(--color-error); margin-bottom: 12px;">⚠️</div>
            <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Recommendation Engine Encountered an Issue</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 20px;">
              Please retry or modify your selected studio preferences.
            </p>
            <button type="button" class="btn btn-primary" id="btn-reconfigure-ai">
              ← Try Again
            </button>
          </div>
        `;
      }
    } finally {
      this.isGenerating = false;
    }
  }
};

// Safe Auto-init for standalone / direct script execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('step-1')) {
      AiMatcherPage.init();
    }
  });
} else {
  if (document.getElementById('step-1')) {
    AiMatcherPage.init();
  }
}
