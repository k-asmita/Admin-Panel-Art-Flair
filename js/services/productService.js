/**
 * Art Flair - Product Service Layer
 * Sabahz Trading
 * 
 * Fetches dynamic products, categories, specifications, and AI recommendations.
 * Zero hardcoded product DOM elements.
 */

const ProductService = {
  // Fetch filtered and sorted products
  async getProducts(filterParams = {}) {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS, filterParams);
      if (response && response.success) {
        return response;
      }
      return { success: false, products: [], total: 0 };
    } catch (error) {
      console.error('[ProductService] Error fetching products:', error);
      return { success: false, products: [], total: 0 };
    }
  },

  // Fetch single product detail by ID
  async getProductById(productId) {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(productId));
      if (response && response.success) {
        return response.product;
      }
      return null;
    } catch (error) {
      console.error(`[ProductService] Error fetching product ${productId}:`, error);
      return null;
    }
  },

  // Fetch featured products for homepage
  async getFeaturedProducts() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.FEATURED_PRODUCTS);
      return response && response.success ? response.products : [];
    } catch (error) {
      console.error('[ProductService] Error fetching featured products:', error);
      return [];
    }
  },

  // Fetch best selling supplies
  async getBestSellers() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.BEST_SELLERS);
      return response && response.success ? response.products : [];
    } catch (error) {
      console.error('[ProductService] Error fetching best sellers:', error);
      return [];
    }
  },

  // Fetch all product categories
  async getCategories() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.CATEGORIES);
      return response && response.success ? response.categories : [];
    } catch (error) {
      console.error('[ProductService] Error fetching categories:', error);
      return [];
    }
  },

  // Fetch available brands
  async getBrands() {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.BRANDS);
      return response && response.success ? response.brands : [];
    } catch (error) {
      console.error('[ProductService] Error fetching brands:', error);
      return [];
    }
  },

  // Fetch AI-powered paired recommendations for product detail view
  async getAiRecommendations(productId) {
    try {
      const response = await ApiClient.get(API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS(productId));
      return response && response.success ? response : { recommendations: [], aiInsight: '' };
    } catch (error) {
      console.error(`[ProductService] Error fetching AI recommendations for ${productId}:`, error);
      return { recommendations: [], aiInsight: '' };
    }
  }
};
