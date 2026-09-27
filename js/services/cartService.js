/**
 * Art Flair - Database-Driven Cart Service
 * Sabahz Trading
 * 
 * Communicates with backend cart endpoints to manage the persistent customer/session cart.
 * Emits 'cart:updated' global event so header counter, cart drawer, and cart page update in sync.
 */

const CartService = {
  // Fetch cart items and totals from the database
  async getCart() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.GET_CART);
      if (response && response.success) {
        this._notifyCartUpdate(response);
        return response;
      }
      return { success: false, items: [], summary: { itemCount: 0, total: 0 } };
    } catch (error) {
      console.error('[CartService] Error fetching cart:', error);
      return { success: false, items: [], summary: { itemCount: 0, total: 0 } };
    }
  },

  // Add a product item to the backend cart
  async addToCart(productId, quantity = 1) {
    try {
      const response = await ApiClient.post(API_CONFIG.ENDPOINTS.ADD_TO_CART, {
        productId,
        quantity: parseInt(quantity, 10) || 1
      });

      if (response && response.success) {
        // Refresh full cart state
        await this.getCart();
        return response;
      }
      throw new Error(response.message || 'Failed to add item to cart');
    } catch (error) {
      console.error('[CartService] Error adding to cart:', error);
      throw error;
    }
  },

  // Update item quantity in database
  async updateQuantity(cartItemId, newQuantity) {
    try {
      const qty = parseInt(newQuantity, 10);
      if (qty <= 0) {
        return this.removeItem(cartItemId);
      }

      const response = await ApiClient.put(API_CONFIG.ENDPOINTS.UPDATE_CART_ITEM(cartItemId), {
        quantity: qty
      });

      if (response && response.success) {
        await this.getCart();
        return response;
      }
      throw new Error(response.message || 'Failed to update quantity');
    } catch (error) {
      console.error('[CartService] Error updating quantity:', error);
      throw error;
    }
  },

  // Delete item from database cart
  async removeItem(cartItemId) {
    try {
      const response = await ApiClient.delete(API_CONFIG.ENDPOINTS.REMOVE_CART_ITEM(cartItemId));
      if (response && response.success) {
        await this.getCart();
        return response;
      }
      throw new Error(response?.message || 'Failed to remove item');
    } catch (error) {
      console.error('[CartService] Error removing item:', error);
      throw error;
    }
  },

  // Alias for removeFromCart
  async removeFromCart(cartItemId) {
    return this.removeItem(cartItemId);
  },

  // Clear entire database cart
  async clearCart() {
    try {
      const response = await ApiClient.post(API_CONFIG.ENDPOINTS.CLEAR_CART, {});
      if (response && response.success) {
        await this.getCart();
        return response;
      }
      throw new Error(response?.message || 'Failed to clear cart');
    } catch (error) {
      console.error('[CartService] Error clearing cart:', error);
      throw error;
    }
  },

  // Broadcast cart update event to whole DOM
  _notifyCartUpdate(cartData) {
    window.dispatchEvent(new CustomEvent('cart:updated', {
      detail: cartData
    }));
    if (typeof HeaderComponent !== 'undefined' && typeof HeaderComponent.updateCartBadge === 'function') {
      HeaderComponent.updateCartBadge();
    }
  }
};

window.CartService = CartService;
