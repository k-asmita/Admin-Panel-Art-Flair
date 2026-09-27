/**
 * Art Flair - Main Application Entry Point
 * Developed for Sabahz Trading
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Render dynamic global layout components
    if (typeof HeaderComponent !== 'undefined') {
      await HeaderComponent.render();
    }
    if (typeof FooterComponent !== 'undefined') {
      FooterComponent.render();
    }
    if (typeof Toast !== 'undefined') {
      Toast.init();
    }
    if (typeof ModalComponent !== 'undefined') {
      ModalComponent.init();
    }
  } catch (layoutError) {
    console.error('[Art Flair] Error rendering layout shell:', layoutError);
  }

  // 2. Initialize page-specific controller based on route
  const path = window.location.pathname.toLowerCase();

  try {
    if (path.includes('products.html') || path.includes('shop.html')) {
      if (typeof ProductsPage !== 'undefined') {
        ProductsPage.init();
      } else if (typeof ShopPage !== 'undefined') {
        ShopPage.init();
      }
    } else if (path.includes('product-detail.html') || path.includes('product-details.html')) {
      if (typeof ProductDetailPage !== 'undefined') {
        ProductDetailPage.init();
      }
    } else if (path.includes('cart.html')) {
      if (typeof CartPage !== 'undefined') {
        CartPage.init();
      }
    } else if (path.includes('wishlist.html')) {
      if (typeof WishlistPage !== 'undefined') {
        WishlistPage.init();
      }
    } else if (path.includes('checkout.html')) {
      if (typeof CheckoutPage !== 'undefined') {
        CheckoutPage.init();
      }
    } else if (path.includes('order-success.html')) {
      if (typeof OrderSuccessPage !== 'undefined') {
        OrderSuccessPage.init();
      }
    } else if (path.includes('ai-matcher.html')) {
      if (typeof AiMatcherPage !== 'undefined') {
        AiMatcherPage.init();
      }
    } else if (path.includes('orders.html')) {
      if (typeof OrdersPage !== 'undefined') {
        OrdersPage.init();
      }
    } else if (path.includes('profile.html')) {
      if (typeof ProfilePage !== 'undefined') {
        ProfilePage.init();
      }
    } else if (typeof HomePage !== 'undefined') {
      HomePage.init();
    }
  } catch (pageError) {
    console.error('[Art Flair] Error initializing page controller:', pageError);
  }
});
