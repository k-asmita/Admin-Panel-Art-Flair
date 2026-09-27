/**
 * Art Flair - Wishlist Service (Database-Driven)
 * Developed for Sabahz Trading
 * 
 * Manages customer wishlist interactions with the Python/MySQL backend.
 * Provides live synchronization, event dispatching, and state management.
 */

const WishlistService = {
  /**
   * Fetch authenticated customer's database wishlist
   */
  async getWishlist() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.GET_WISHLIST);
      if (response && response.success) {
        this._dispatchUpdate(response.items || []);
        return response;
      }
      return { success: false, items: [], message: response?.message || 'Failed to fetch wishlist' };
    } catch (error) {
      console.error('[WishlistService] Error getting wishlist from backend:', error);
      throw error;
    }
  },

  /**
   * Add a product to the customer's database wishlist
   */
  async addToWishlist(productId) {
    try {
      const response = await ApiClient.post(API_CONFIG.ENDPOINTS.ADD_TO_WISHLIST, { productId });
      if (response && response.success) {
        this._dispatchUpdate(response.items || []);
        // Also sync local storage cache for quick client-side icon states
        StorageUtil.toggleWishlist(productId);
        return response;
      }
      throw new Error(response?.message || 'Failed to add item to wishlist');
    } catch (error) {
      console.error('[WishlistService] Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Remove a product from the customer's database wishlist
   */
  async removeFromWishlist(productId) {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.REMOVE_FROM_WISHLIST(productId);
      const response = await ApiClient.delete(endpoint);
      if (response && response.success) {
        this._dispatchUpdate(response.items || []);
        // Also remove from local quick cache
        const currentCached = StorageUtil.getWishlist();
        if (currentCached.includes(productId)) {
          StorageUtil.toggleWishlist(productId);
        }
        return response;
      }
      throw new Error(response?.message || 'Failed to remove item from wishlist');
    } catch (error) {
      console.error('[WishlistService] Error removing from wishlist:', error);
      throw error;
    }
  },

  /**
   * Clear customer's entire database wishlist
   */
  async clearWishlist() {
    try {
      const response = await ApiClient.post(API_CONFIG.ENDPOINTS.CLEAR_WISHLIST, {});
      if (response && response.success) {
        this._dispatchUpdate([]);
        localStorage.removeItem(StorageUtil.KEYS.WISHLIST);
        return response;
      }
      throw new Error(response?.message || 'Failed to clear wishlist');
    } catch (error) {
      console.error('[WishlistService] Error clearing wishlist:', error);
      throw error;
    }
  },

  /**
   * Dispatch custom DOM event to synchronize Header badge & other components
   */
  _dispatchUpdate(items) {
    const count = items ? items.length : 0;
    const event = new CustomEvent('wishlist:updated', {
      detail: { count, items }
    });
    window.dispatchEvent(event);
  }
};
