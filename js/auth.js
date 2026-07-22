/**
 * VIMEI Knowledge Tracker - Authentication Module
 * =================================================
 * Handles PIN-based login and session management via sessionStorage.
 * Session is cleared automatically when the browser tab is closed.
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
  login(role, identifier, credential) {
    let user = null;

    if (role === 'admin') {
      if (credential === CONFIG.ADMIN_PIN) {
        user = {
          role:   'admin',
          id:     'admin',
          name:   CONFIG.ADMIN.name,
          avatar: CONFIG.ADMIN.avatar,
          bio:    CONFIG.ADMIN.bio
        };
      }
    }

    else if (role === 'trainee') {
      const trainee = CONFIG.TRAINEES.find(t => t.id === identifier);
      // Allow login if credential matches trainee pin OR the admin master pin
      if (trainee && (credential === trainee.pin || credential === CONFIG.ADMIN_PIN)) {
        user = {
          role:   'trainee',
          id:     trainee.id,
          name:   trainee.name,
          avatar: trainee.avatar,
          bio:    trainee.bio
        };
      }
    }

    else if (role === 'guest') {
      const deptConfig = CONFIG.DEPARTMENTS[identifier];
      // Allow login if credential matches department pin OR the admin master pin
      if (deptConfig && (credential === deptConfig.pin || credential === CONFIG.ADMIN_PIN)) {
        user = {
          role:   'guest',
          id:     'guest',
          departmentId: identifier, // Save selected department
          name:   window.VimeiI18n ? window.VimeiI18n.t('roleAssessorName') : '輪調主管/同仁',
          avatar: '',
          bio:    ''
        };
      }
    }

    else if (role === 'executive') {
      if (credential === CONFIG.EXECUTIVE_CODE || credential === CONFIG.ADMIN_PIN) {
        user = {
          role:   'executive',
          id:     'executive',
          name:   window.VimeiI18n ? window.VimeiI18n.t('roleExecutiveName') : '高階決策主管',
          avatar: '',
          bio:    ''
        };
      }
    }

    if (user) {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  },

  /** Remove current session */
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  /** Get current logged-in user object, or null */
  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
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
        user.name = (window.VimeiI18n ? window.VimeiI18n.t('roleAssessorName') : '輪調主管/同仁') + (deptName ? ` (${deptName})` : '');
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

  /** Quick check: is anyone logged in? */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

};
