/**
 * Art Flair - Authentication Service Layer
 * Developed for Sabahz Trading
 */

const AuthService = {
  isAuthenticated() {
    if (typeof isAuthenticated === 'function') {
      return isAuthenticated();
    }
    if (typeof StorageUtil !== 'undefined') {
      return !!StorageUtil.getAuthToken();
    }
    return false;
  },

  getCurrentUser() {
    if (typeof getCurrentUser === 'function') {
      return getCurrentUser();
    }
    if (typeof StorageUtil !== 'undefined') {
      return StorageUtil.getUserInfo() || { name: 'Guest Artist', email: '', isGuest: true };
    }
    return { name: 'Guest Artist', email: '', isGuest: true };
  },

  login(email, password, rememberMe) {
    if (typeof loginUser === 'function') {
      return loginUser({ email, password, rememberMe });
    }
    throw new Error('Auth engine initializing...');
  },

  register(data) {
    if (typeof registerUser === 'function') {
      return registerUser(data);
    }
    throw new Error('Auth engine initializing...');
  },

  logout() {
    if (typeof logoutUser === 'function') {
      return logoutUser();
    }
    if (typeof StorageUtil !== 'undefined') {
      StorageUtil.setAuthToken(null);
      StorageUtil.setUserInfo(null);
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
    }
    return Promise.resolve({ success: true });
  }
};

window.AuthService = AuthService;
