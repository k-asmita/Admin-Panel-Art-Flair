/**
 * Art Flair - Profile Controller
 * Developed for Sabahz Trading
 * 
 * Manages customer atelier profile retrieval and updates:
 * - Fetches profile from backend API
 * - Validates and submits profile edits
 * - Synchronizes layout headers and sidebars
 * - Secure logout functionality
 */

const ProfilePage = {
  profileData: null,

  async init() {
    this._bindEvents();
    await this.fetchProfile();
    this.renderRecommendations();
  },

  async renderRecommendations() {
    if (typeof RecommendationEngine !== 'undefined') {
      await RecommendationEngine.render('profile-recommendations-container', {
        title: 'Recommended For Your Studio Practice',
        columns: 3,
        showBadge: true
      });
    }
  },

  async fetchProfile() {
    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) saveBtn.disabled = true;

    try {
      // 1. Fetch Profile from Backend
      const res = await ApiClient.get(API_CONFIG.ENDPOINTS.USER_PROFILE);

      if (!res || !res.success || !res.user) {
        throw new Error(res?.message || 'Could not fetch profile from server');
      }

      this.profileData = res.user;
      this._populateForm(this.profileData);
      this._updateSidebar(this.profileData);

    } catch (err) {
      console.error('[ProfilePage] Error loading profile:', err);
      Toast.error('Could not connect to the profile database. Showing cached details.');
      const cachedUser = AuthService.getCurrentUser();
      if (cachedUser) {
        this._populateForm(cachedUser);
        this._updateSidebar(cachedUser);
      }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  },

  _populateForm(user) {
    const nameInput = document.getElementById('profile-name-input');
    const emailInput = document.getElementById('profile-email-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const disciplineInput = document.getElementById('profile-discipline-input');
    const addressInput = document.getElementById('profile-address-input');
    const cityInput = document.getElementById('profile-city-input');
    const stateInput = document.getElementById('profile-state-input');
    const postalInput = document.getElementById('profile-postal-input');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (disciplineInput) disciplineInput.value = user.artDiscipline || 'Oil Realism & Watercolors';
    if (addressInput) addressInput.value = user.address || '';
    if (cityInput) cityInput.value = user.city || '';
    if (stateInput) stateInput.value = user.state || '';
    if (postalInput) postalInput.value = user.postalCode || '';
  },

  _updateSidebar(user) {
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const emailEl = document.getElementById('sidebar-user-email');
    const tierEl = document.getElementById('sidebar-user-tier');

    if (avatarEl) avatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name || 'Artist Patron';
    if (emailEl) emailEl.textContent = user.email || 'artist@studio.com';
    if (tierEl && user.tier) tierEl.textContent = user.tier;
  },

  _bindEvents() {
    // Form Submit for Profile Update
    const form = document.getElementById('profile-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Changes to Database...';
      }

      const payload = {
        name: document.getElementById('profile-name-input')?.value.trim(),
        email: document.getElementById('profile-email-input')?.value.trim(),
        phone: document.getElementById('profile-phone-input')?.value.trim(),
        artDiscipline: document.getElementById('profile-discipline-input')?.value.trim(),
        address: document.getElementById('profile-address-input')?.value.trim(),
        city: document.getElementById('profile-city-input')?.value.trim(),
        state: document.getElementById('profile-state-input')?.value.trim(),
        postalCode: document.getElementById('profile-postal-input')?.value.trim()
      };

      try {
        const res = await ApiClient.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, payload);

        if (!res || !res.success) {
          throw new Error(res?.message || 'Server rejected profile update');
        }

        Toast.success('Studio profile updated successfully!');
        this.profileData = res.user || payload;
        this._updateSidebar(this.profileData);

        // Re-render header to reflect updated name/email
        if (typeof HeaderComponent !== 'undefined') {
          await HeaderComponent.render();
        }

      } catch (err) {
        console.error('[ProfilePage] Update error:', err);
        Toast.error(err.message || 'Error updating profile');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Studio Profile Changes';
        }
      }
    });

    // Sidebar Logout
    document.getElementById('btn-sidebar-logout')?.addEventListener('click', async () => {
      await AuthService.logout();
      Toast.info('Signed out of Art Flair Studio.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    });
  }
};
