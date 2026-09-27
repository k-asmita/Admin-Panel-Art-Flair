/**
 * Art Flair - Global Reusable Footer Component
 * Developed for Sabahz Trading
 * Semantic HTML5, CSS3, & Vanilla JavaScript ES6+
 */

const FooterComponent = {
  render() {
    const footerContainer = document.getElementById('site-footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            <!-- 1. Brand & Business Description -->
            <div class="footer-brand">
              <a href="index.html" class="brand-logo" title="Art Flair - Sabahz Trading">
                <div class="brand-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="m12 19 7-7 3 3-7 7-3-3z"/>
                    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  </svg>
                </div>
                <div class="brand-text">
                  <span class="brand-title">Art<span style="color: var(--secondary);">Flair</span></span>
                  <span class="brand-subtitle" style="color: #A8A29E;">Sabahz Trading</span>
                </div>
              </a>
              <p>
                Art Flair is Sabahz Trading's AI/ML-driven fine art supplies management system, offering single-pigment paints, archival surfaces, and precision tools with intelligent medium compatibility analysis.
              </p>
              <div class="footer-badge">
                Official Supplier for Professional Fine Artists & Academies
              </div>
            </div>

            <!-- 2. Shop Links -->
            <div>
              <h4 class="footer-column-title">Studio Supplies</h4>
              <ul class="footer-links">
                <li><a href="shop.html?category=oil-painting">Artists' Oil Colours</a></li>
                <li><a href="shop.html?category=watercolors">Watercolors & Gouache</a></li>
                <li><a href="shop.html?category=acrylics">Heavy Body Acrylics</a></li>
                <li><a href="shop.html?category=paper-canvases">Linen & Cotton Paper</a></li>
                <li><a href="shop.html?category=brushes-tools">Kolinsky & Synthetic Brushes</a></li>
                <li><a href="shop.html?category=drawing-sketching">Lightfast Drawing Pencils</a></li>
              </ul>
            </div>

            <!-- 3. Customer Links -->
            <div>
              <h4 class="footer-column-title">Customer Studio</h4>
              <ul class="footer-links">
                <li><a href="login.html">My Studio Account</a></li>
                <li><a href="shop.html" onclick="Toast.info('View your recent order dispatches in your account.');">Order History & Tracking</a></li>
                <li><a href="shop.html" onclick="Toast.info('Access saved items in your Studio Wishlist.');">Studio Wishlist</a></li>
                <li><a href="ai-matcher.html">AI Medium & Kit Matcher</a></li>
                <li><a href="cart.html">Active Shopping Cart</a></li>
                <li><a href="shop.html" onclick="Toast.info('Studio gift vouchers available during seasonal dispatches.');">Studio Gift Vouchers</a></li>
              </ul>
            </div>

            <!-- 4. Support Links -->
            <div>
              <h4 class="footer-column-title">Support & Standards</h4>
              <ul class="footer-links">
                <li><a href="#help" onclick="Toast.info('24/7 Studio Concierge available for pigment inquiries.');">Help & FAQ</a></li>
                <li><a href="#shipping-policy" onclick="Toast.info('Orders over $75 receive free climate-safe studio dispatch.');">Shipping & Handling</a></li>
                <li><a href="#returns" onclick="Toast.info('30-day unopened archival materials return policy.');">Returns & Refunds</a></li>
                <li><a href="#astm-standards" onclick="Toast.info('All materials meet ASTM D-4236 and ASTM I/II lightfastness standards.');">ASTM Archival Standards</a></li>
                <li><a href="#safety-sheets" onclick="Toast.info('Material Safety Data Sheets (MSDS) available for all pigments.');">Safety Data Sheets</a></li>
              </ul>
            </div>

            <!-- 5. Contact Information -->
            <div>
              <h4 class="footer-column-title">Studio Contact</h4>
              <div class="footer-contact-list">
                <div class="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <span class="footer-contact-label">Address</span>
                    <div>Shop 1 Gulshan Apartment, Kalwa, Thane west 400605</div>
                  </div>
                </div>

                <div class="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <div>
                    <span class="footer-contact-label">Phone</span>
                    <div><a href="tel:+919769685801" style="color: inherit; text-decoration: none;">+91 9769685801</a></div>
                  </div>
                </div>

                <div class="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <div>
                    <span class="footer-contact-label">Email</span>
                    <div><a href="mailto:info@artistparadise.in" style="color: inherit; text-decoration: none;">info@artistparadise.in</a></div>
                  </div>
                </div>

                <div class="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <span class="footer-contact-label">Studio Hours</span>
                    <div>Mon – Fri: 8:00 AM – 6:00 PM EST</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Copyright, Privacy Policy, & Terms -->
          <div class="footer-bottom">
            <div>
              © 2026 <strong>Art Flair</strong> — Developed exclusively for <strong>Sabahz Trading</strong>. All Rights Reserved.
            </div>
            <div class="footer-policy-links">
              <a href="#privacy" onclick="Toast.info('Privacy Policy: Customer data is protected with 256-bit encryption.');">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" onclick="Toast.info('Terms & Conditions: All materials covered by Sabahz 30-day quality guarantee.');">Terms & Conditions</a>
              <span>•</span>
              <a href="#astm" onclick="Toast.info('ASTM D-4236 Certified Safe for Academic & Professional Studios.');">ASTM D-4236 Certified</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};
