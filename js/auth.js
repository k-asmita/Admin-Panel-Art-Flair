/**
 * Art Flair - Centralized Authentication Service (`auth.js`)
 * Developed for Sabahz Trading
 * 
 * Reusable Authentication Functions:
 * - loginUser()
 * - registerUser()
 * - logoutUser()
 * - getCurrentUser()
 * - isAuthenticated()
 */

/**
 * Check if the customer is currently authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  if (typeof StorageUtil === 'undefined') return false;
  return !!StorageUtil.getAuthToken();
}

/**
 * Get current authenticated user profile or guest default
 * @returns {Object} User profile object
 */
function getCurrentUser() {
  if (typeof StorageUtil === 'undefined') {
    return { name: 'Guest Artist', email: '', isGuest: true };
  }
  return StorageUtil.getUserInfo() || {
    name: 'Guest Artist',
    email: '',
    isGuest: true
  };
}

/**
 * Login user via Python backend API
 * @param {Object} credentials { email, password, rememberMe }
 * @returns {Promise<Object>} API response
 */
async function loginUser({ email, password, rememberMe = false }) {
  if (!email || !password) {
    throw new Error('Please enter both your studio email/username and password.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) && !email.includes('@')) {
    throw new Error('Please enter a valid studio email address.');
  }

  try {
    const response = await ApiClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
      email: email.trim(),
      password,
      remember_me: rememberMe
    });

    if (response && response.success) {
      const token = response.token || response.accessToken || ('auth_token_' + Date.now());
      const user = response.user || {
        id: response.userId || 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: response.name || email.split('@')[0],
        email: email.trim(),
        isGuest: false
      };

      StorageUtil.setAuthToken(token);
      StorageUtil.setUserInfo(user);

      window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
      return { success: true, user, token };
    }

    throw new Error(response?.message || 'Invalid email or password. Please verify your studio credentials.');
  } catch (error) {
    console.error('[auth.js] loginUser error:', error);
    throw error;
  }
}

/**
 * Register a new artist atelier account via Python backend API
 * @param {Object} userData { name, email, password, confirmPassword }
 * @returns {Promise<Object>} API response
 */
async function registerUser({ name, email, password, confirmPassword }) {
  if (!name || !name.trim()) {
    throw new Error('Please provide your artist or atelier name.');
  }

  if (!email || !email.trim()) {
    throw new Error('Please provide your studio email address.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error('Please provide a valid email format.');
  }

  if (!password || password.length < 8) {
    throw new Error('Password must contain at least 8 characters for studio security.');
  }

  if (password !== confirmPassword) {
    throw new Error('Password confirmation does not match the entered password.');
  }

  try {
    const response = await ApiClient.post(API_CONFIG.ENDPOINTS.REGISTER, {
      name: name.trim(),
      email: email.trim(),
      password
    });

    if (response && response.success) {
      const token = response.token || ('auth_token_' + Date.now());
      const user = response.user || {
        id: response.userId || 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: name.trim(),
        email: email.trim(),
        isGuest: false
      };

      StorageUtil.setAuthToken(token);
      StorageUtil.setUserInfo(user);

      window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
      return { success: true, user, token };
    }

    throw new Error(response?.message || 'Registration failed. The email address may already be in use.');
  } catch (error) {
    console.error('[auth.js] registerUser error:', error);
    throw error;
  }
}

/**
 * Log out user, clear token, and isolate all user data
 * @returns {Promise<Object>}
 */
async function logoutUser() {
  try {
    try {
      await ApiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {});
    } catch (e) {
      // Non-blocking
    }

    if (typeof StorageUtil !== 'undefined') {
      StorageUtil.clearUserSession();
    } else {
      localStorage.clear();
      sessionStorage.clear();
    }

    window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
    return { success: true };
  } catch (error) {
    console.error('[auth.js] logoutUser error:', error);
    if (typeof StorageUtil !== 'undefined') StorageUtil.clearUserSession();
    return { success: true };
  }
}

/**
 * Request password recovery code / link
 * @param {string} email
 * @returns {Promise<Object>}
 */
async function forgotPassword(email) {
  if (!email || !email.trim()) {
    throw new Error('Please enter your registered studio email address.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()) && !email.includes('@')) {
    throw new Error('Please enter a valid studio email address.');
  }

  try {
    const endpoint = (API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.FORGOT_PASSWORD) || '/auth/forgot-password';
    const response = await ApiClient.post(endpoint, {
      email: email.trim().toLowerCase()
    });

    if (response && response.success) {
      return response;
    }
    throw new Error(response?.message || 'Could not process password recovery. Please verify your email.');
  } catch (error) {
    console.error('[auth.js] forgotPassword error:', error);
    throw error;
  }
}

/**
 * Reset password with new password
 * @param {Object} data { email, newPassword, resetCode }
 * @returns {Promise<Object>}
 */
async function resetPassword({ email, newPassword, resetCode }) {
  if (!email || !email.trim()) {
    throw new Error('Please enter your studio email address.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must contain at least 8 characters.');
  }

  try {
    const endpoint = (API_CONFIG.ENDPOINTS && API_CONFIG.ENDPOINTS.RESET_PASSWORD) || '/auth/reset-password';
    const response = await ApiClient.post(endpoint, {
      email: email.trim().toLowerCase(),
      password: newPassword,
      newPassword: newPassword,
      resetCode
    });

    if (response && response.success) {
      return response;
    }
    throw new Error(response?.message || 'Failed to reset password. Please try again.');
  } catch (error) {
    console.error('[auth.js] resetPassword error:', error);
    throw error;
  }
}

// Global namespace exports
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.forgotPassword = forgotPassword;
window.resetPassword = resetPassword;

window.AuthService = {
  login: (email, password, rememberMe) => loginUser({ email, password, rememberMe }),
  register: (data) => registerUser(data),
  logout: () => logoutUser(),
  getCurrentUser: () => getCurrentUser(),
  isAuthenticated: () => isAuthenticated(),
  forgotPassword: (email) => forgotPassword(email),
  resetPassword: (data) => resetPassword(data)
};

