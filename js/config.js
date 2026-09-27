/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Configuration & API Endpoints
   ============================================================================== */

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    ADMIN_LOGIN: '/admin/login',
    ADMIN_STATS: '/admin/stats',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    INVENTORY: '/admin/inventory',
    ANALYTICS: '/admin/analytics',
    UPLOAD_IMAGE: '/admin/upload'
  },
  STORAGE_KEYS: {
    ADMIN_TOKEN: 'art_flair_admin_token',
    ADMIN_USER: 'art_flair_admin_user',
    LOCAL_PRODUCTS: 'art_flair_products_cache'
  }
};
