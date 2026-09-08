/**
 * VIMEI Knowledge Tracker - Authentication Module
 * =================================================
 * Handles PIN-based login and session management via localStorage.
 * (Changed from sessionStorage to prevent data loss on mobile embedded browsers)
 */

const Auth = {

  SESSION_KEY: 'vimei_v2_session',

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

    let email = '';
    let fbCredential = credential;

    if (role === 'admin') email = 'admin@vimei.com';
    else if (role === 'trainee') email = identifier + '@vimei.com';
    else if (role === 'guest') {
       email = identifier + '@vimei.com';
       if (credential.length === 4) {
          fbCredential = credential + '26';
       }
    }
    else if (role === 'executive') email = 'executive@vimei.com';

    try {
      // 1. Authenticate with Firebase
      await firebase.auth().signInWithEmailAndPassword(email, fbCredential);
      
      // 2. Set local session
      return this._setLocalSession(role, identifier);
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);
      
      // Fallback for God Mode: If admin pin is correct but firebase fails (e.g. not set up yet), allow it
      if (role === 'admin' && credential === CONFIG.ADMIN_PIN) {
         return this._setLocalSession(role, identifier);
      }
      
      return false;
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
  },

  /** Get current logged-in user object, or null */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
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
