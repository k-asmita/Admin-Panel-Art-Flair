/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Configuration & API Endpoints
   ============================================================================== */

const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5000/api',
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
  },
  TAX: {
    DEFAULT_GST_RATE: 0.12,
    DEFAULT_GST_LABEL: '12% GST on Fine Art Supplies',
    // TODO: Confirm the correct rate for each product category with an accountant or the GST portal following late 2025 slab restructuring.
    CATEGORY_GST_RATES: {
      'paints': 0.12,
      'brushes': 0.12,
      'canvas': 0.12,
      'drawing-media': 0.12,
      'drawing media': 0.12,
      'easels': 0.12,
      'painting-medium': 0.12,
      'painting medium': 0.12,
      'paper-pads': 0.12,
      'paper & pads': 0.12,
      'pen-markers': 0.12,
      'pen & markers': 0.12,
      'accessories': 0.12,
      'calligraphy': 0.12
    },
    getRate(category) {
      if (!category) return this.DEFAULT_GST_RATE;
      const key = String(category).toLowerCase().trim();
      return this.CATEGORY_GST_RATES[key] ?? this.DEFAULT_GST_RATE;
    },
    getFormattedRate(category) {
      const rate = this.getRate(category);
      const percentage = Math.round(rate * 100);
      return `${percentage}% GST on Fine Art Supplies`;
    }
  },
  SHIPPING: {
    FREE_SHIPPING_THRESHOLD: 1499,
    STANDARD_SHIPPING_FEE: 149,
    TAX_RATE: 0.12
  }
};

