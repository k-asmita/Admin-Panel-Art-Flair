/* ==============================================================================
   Art Flair - Sabahz Trading | Admin Storage Helper
   ============================================================================== */

const StorageService = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.warn('StorageService.get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('StorageService.set error:', e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('StorageService.remove error:', e);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('StorageService.clear error:', e);
    }
  }
};
