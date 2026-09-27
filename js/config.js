/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Configuration & API Endpoints
   ============================================================================== */

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    ADMIN_LOGIN: '/admin/login',
    ADMIN_STATS: '/admin/stats',
    ADMIN_PRODUCTS: '/admin/products',
    PRODUCTS: '/admin/products',
    ADMIN_PRODUCT_DETAIL: (id) => `/admin/products/${id}`,
    ADMIN_ORDERS: '/admin/orders',
    ORDERS: '/admin/orders',
    ADMIN_CUSTOMERS: '/admin/customers',
    CUSTOMERS: '/admin/customers',
    ADMIN_INVENTORY: '/admin/inventory',
    INVENTORY: '/admin/inventory',
    ADMIN_ANALYTICS: '/admin/analytics',
    ANALYTICS: '/admin/analytics',
    ADMIN_UPLOAD_IMAGE: '/admin/upload',
    UPLOAD_IMAGE: '/admin/upload'
  },
  STORAGE_KEYS: {
    ADMIN_TOKEN: 'art_flair_admin_token',
    ADMIN_USER: 'art_flair_admin_user',
    LOCAL_PRODUCTS: 'art_flair_products_cache'
  }
};
