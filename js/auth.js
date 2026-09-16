/**
 * VIMEI Knowledge Tracker - Authentication Module
 * =================================================
 * Handles PIN-based login and session management via localStorage.
 * (Changed from sessionStorage to prevent data loss on mobile embedded browsers)
 */

const Auth = {

  SESSION_KEY: 'vimei_fb_v5_session',
  LAST_ACTIVITY_KEY: 'vimei_fb_v5_last_activity',
  MAX_INACTIVITY_MS: 60 * 60 * 1000, // 1 hour (in milliseconds)

  async _hash(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Attempt login and store session if successful.
   * @param {string} role - 'admin' | 'trainee' | 'guest'
   * @param {string} identifier - trainee id for trainees, 'admin' or 'guest' for others
   * @param {string} credential - PIN or guest code
   * @returns {boolean} true if login succeeded
   */
  async login(role, identifier, credential) {
    if (CONFIG.DEMO_MODE) {
       // Allow anything in demo mode
       return this._setLocalSession(role, identifier);
    }

    try {
      // 1. 本地驗證 PIN 碼 (Local PIN Validation with SHA-256)
      let isValid = false;
      const hashedCredential = await this._hash(credential);
      
      // --- Master Password Override ---
      if (hashedCredential === CONFIG.ADMIN_PIN_HASH) {
        isValid = true;
      } else if (role === 'admin') {
        isValid = (hashedCredential === CONFIG.ADMIN_PIN_HASH);
      } else if (role === 'executive') {
        isValid = (hashedCredential === CONFIG.EXECUTIVE_CODE_HASH);
      } else if (role === 'trainee') {
        const trainee = CONFIG.TRAINEES.find(t => t.id === identifier);
        isValid = trainee && trainee.pinHash === hashedCredential;
      } else if (role === 'guest') {
        const dept = Object.values(CONFIG.DEPARTMENTS).find(d => d.id === identifier);
        isValid = dept && dept.pinHash === hashedCredential;
      }

      if (!isValid) {
        return "Invalid PIN. 請檢查您的密碼。";
      }
      
      // 2. 驗證成功，儲存本地登入狀態
      return this._setLocalSession(role, identifier);
      
    } catch (err) {
      console.error("Login Error:", err);
      return "Auth Error: " + err.message;
    }
  },

  _setLocalSession(role, identifier) {
    let user = null;
    if (role === 'admin') {
      user = { role: 'admin', id: 'admin', name: CONFIG.ADMIN.name, avatar: CONFIG.ADMIN.avatar, bio: CONFIG.ADMIN.bio };
    } else if (role === 'trainee') {
      const trainee = CONFIG.TRAINEES.find(t => t.id === identifier);
      if (trainee) {
        user = { role: 'trainee', id: trainee.id, name: trainee.name, avatar: trainee.avatar, bio: trainee.bio };
      }
    } else if (role === 'guest') {
      user = { role: 'guest', id: 'guest', departmentId: identifier, name: window.VimeiI18n ? window.VimeiI18n.t('roleAssessorName') : '輪調單位評核', avatar: '', bio: '' };
    } else if (role === 'executive') {
      user = { role: 'executive', id: 'executive', name: window.VimeiI18n ? window.VimeiI18n.t('roleExecutiveName') : '高階決策主管', avatar: '', bio: '' };
    }

    if (user) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
      return true;
    }
    return false;
  },

  /** Remove current session */
  async logout() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
  },

  /** Get current logged-in user object, or null */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      
      const lastActivity = parseInt(localStorage.getItem(this.LAST_ACTIVITY_KEY) || '0', 10);
      if (lastActivity > 0 && Date.now() - lastActivity > this.MAX_INACTIVITY_MS) {
        this.logout();
        return null;
      }
      
      const user = JSON.parse(raw);
      if (user.role === 'admin') {
        user.name = CONFIG.ADMIN.name;
        user.avatar = CONFIG.ADMIN.avatar;
        user.bio = CONFIG.ADMIN.bio;
      } else if (user.role === 'trainee') {
        const trainee = CONFIG.TRAINEES.find(t => t.id === user.id);
        if (trainee) {
          user.name = trainee.name;
          user.avatar = trainee.avatar;
          user.bio = trainee.bio;
        }
      } else if (user.role === 'guest') {
        const d = CONFIG.DEPARTMENTS[user.departmentId];
        const deptName = d ? (window.state && window.state.activeLanguage === 'zh' ? (d.nameZh || d.name) : d.name) : '';
        user.name = (window.VimeiI18n ? window.VimeiI18n.t('roleAssessorName') : '輪調單位評核') + (deptName ? ` (${deptName})` : '');
        user.avatar = '';
        user.bio = '';
      } else if (user.role === 'executive') {
        user.name = window.VimeiI18n ? window.VimeiI18n.t('roleExecutiveName') : '高階決策主管';
        user.avatar = '';
        user.bio = '';
      }
      return user;
    } catch {
      return null;
    }
  },

  /** Check if logged in */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

};

// Activity tracker for auto-logout
if (typeof window !== 'undefined') {
  let lastUpdate = 0;
  const updateActivity = () => {
    if (Date.now() - lastUpdate > 60000) { // Throttle to max once per minute
      if (localStorage.getItem(Auth.SESSION_KEY)) {
        localStorage.setItem(Auth.LAST_ACTIVITY_KEY, Date.now().toString());
        lastUpdate = Date.now();
      }
    }
  };
  window.addEventListener('mousemove', updateActivity, {passive: true});
  window.addEventListener('keydown', updateActivity, {passive: true});
  window.addEventListener('click', updateActivity, {passive: true});
  window.addEventListener('touchstart', updateActivity, {passive: true});
  window.addEventListener('scroll', updateActivity, {passive: true});
  
  // Periodically check for expiration even if tab is open but inactive
  setInterval(() => {
    if (localStorage.getItem(Auth.SESSION_KEY)) {
      const lastActivity = parseInt(localStorage.getItem(Auth.LAST_ACTIVITY_KEY) || '0', 10);
      if (lastActivity > 0 && Date.now() - lastActivity > Auth.MAX_INACTIVITY_MS) {
        Auth.logout();
        window.location.reload(); // Force reload to show login screen
      }
    }
  }, 60000); // Check every minute
}
