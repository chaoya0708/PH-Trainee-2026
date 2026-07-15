/**
 * VIMEI Knowledge Tracker - Data API Layer
 * =========================================
 * DEMO_MODE = true  → reads/writes localStorage  (no setup needed)
 * DEMO_MODE = false → reads/writes Google Sheets via Apps Script
 *
 * All methods return Promises so the app can use async/await uniformly.
 */

const Api = (() => {

  // ----- localStorage keys (Demo mode) -----
  const LS_OBS      = 'vimei2_observations';
  const LS_SCHED    = 'vimei2_schedules';
  const LS_GCOMMENT = 'vimei2_guest_comments';
  const LS_ASSESS   = 'vimei2_assessments';

  // ----- Default demo seed data -----
  function seedDemoData() {
    if (!localStorage.getItem(LS_OBS)) {
      const seed = [
        {
          id: 'obs-seed-1',
          traineeId:      'diane',
          traineeName:    'Diane',
          date:           '2026-07-13',
          department:     'yushan_prep',
          keyObservation: 'The vegetable washing sector has a minor bottleneck during peak hours. Workers frequently cross paths when carrying sanitized crates due to a narrow layout. The 5S signage is clear but the physical flow has not been redesigned to match it.',
          actionableIdea: 'Propose an L-shaped crate flow in the VIMEI Philippines plant. Bilingual (English + Tagalog) floor markings would guide local staff more effectively than signage alone.',
          attachmentUrl:  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
          submittedAt:    '2026-07-13T09:15:00Z',
          status:         'pending',
          mentorComment:  '',
          mentorName:     '',
          feedbackAt:     '',
          rating:         0
        },
        {
          id: 'obs-seed-2',
          traineeId:      'mark',
          traineeName:    'Mark',
          date:           '2026-07-13',
          department:     'yushan_prep',
          keyObservation: 'The automatic dicer machine runs at 80% capacity because the raw material feeding rate fluctuates. A lot of idle time is caused by waiting for manually trimmed vegetables from upstream.',
          actionableIdea: 'Introduce a gravity-assisted staging chute above the feeder. Clear visual buffer threshold signage (bilingual) will help Filipino operators respond faster without needing supervisor intervention.',
          attachmentUrl:  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
          submittedAt:    '2026-07-13T10:00:00Z',
          status:         'pending',
          mentorComment:  '',
          mentorName:     '',
          feedbackAt:     '',
          rating:         0
        },
        {
          id: 'obs-seed-3',
          traineeId:      'jairuz',
          traineeName:    'Jairuz',
          date:           '2026-07-13',
          department:     'cmf_qc',
          keyObservation: 'Metal detector test sticks are stored in an unlocked generic cabinet instead of a dedicated verification kit with controlled access. This is a potential HACCP deviation risk.',
          actionableIdea: 'Create a shadow board for test sticks with a digital keypad lock. Only QA-certified personnel should hold the PIN. Label the board in both English and Tagalog for clarity.',
          attachmentUrl:  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
          submittedAt:    '2026-07-13T11:30:00Z',
          status:         'pending',
          mentorComment:  '',
          mentorName:     '',
          feedbackAt:     '',
          rating:         0
        }
      ];
      localStorage.setItem(LS_OBS, JSON.stringify(seed));
    }

    if (!localStorage.getItem(LS_SCHED)) {
      localStorage.setItem(LS_SCHED, JSON.stringify(CONFIG.DEFAULT_SCHEDULES));
    }

    if (!localStorage.getItem(LS_GCOMMENT)) {
      localStorage.setItem(LS_GCOMMENT, JSON.stringify([]));
    }

    if (!localStorage.getItem(LS_ASSESS)) {
      localStorage.setItem(LS_ASSESS, JSON.stringify([]));
    }
  }

  // ----- Demo helpers -----
  function lsGet(key)       { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function lsGetObj(key)    { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
  function lsSave(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function nowIso() { return new Date().toISOString(); }
  function nowStr() { return new Date().toISOString().replace('T', ' ').substring(0, 16); }

  // ----- Apps Script fetch wrapper -----
  async function callScript(params) {
    const url = CONFIG.APPS_SCRIPT_URL;
    if (!url || url === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured. Check config.js');
    }
    const res = await fetch(url, {
      method:  'POST',
      body:    JSON.stringify(params),
      headers: { 'Content-Type': 'text/plain' } // avoids CORS preflight
    });
    return res.json();
  }

  async function callScriptGet(action, params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return res.json();
  }

  // =============================================================
  // Public API
  // =============================================================
  return {

    /** Initialize demo data if needed */
    init() {
      if (CONFIG.DEMO_MODE) {
        seedDemoData();
        try {
          const raw = localStorage.getItem(LS_SCHED);
          if (raw && raw.includes('"cmf_rd"')) {
            const migrated = raw.replace(/"cmf_rd"/g, '"cmf_rd_chinese"');
            localStorage.setItem(LS_SCHED, migrated);
          }
        } catch (err) {
          console.error('Migration error:', err);
        }
      }
    },

    // ---- Observations ----

    async getAllObservations() {
      if (CONFIG.DEMO_MODE) {
        const obs      = lsGet(LS_OBS);
        const gcomments = lsGet(LS_GCOMMENT);
        // Attach guest comments to each observation
        return obs.map(o => ({
          ...o,
          guestComments: gcomments.filter(g => g.obsId === o.id)
        }));
      }
      const [obs, gcomments] = await Promise.all([
        callScriptGet('getAllObservations'),
        callScriptGet('getAllGuestComments')
      ]);
      return obs.map(o => ({
        ...o,
        guestComments: (gcomments || []).filter(g => g.obsId === o.id)
      }));
    },

    async getObservationsForTrainee(traineeId) {
      if (CONFIG.DEMO_MODE) {
        const all = lsGet(LS_OBS);
        const gcomments = lsGet(LS_GCOMMENT);
        return all
          .filter(o => o.traineeId === traineeId)
          .map(o => ({ ...o, guestComments: gcomments.filter(g => g.obsId === o.id) }));
      }
      const [obs, gcomments] = await Promise.all([
        callScriptGet('getObservations', { traineeId }),
        callScriptGet('getGuestComments', { traineeId })
      ]);
      return obs.map(o => ({ ...o, guestComments: (gcomments || []).filter(g => g.obsId === o.id) }));
    },

    async submitObservation(data) {
      if (CONFIG.DEMO_MODE) {
        const obs = lsGet(LS_OBS);
        const newObs = {
          id:             'obs-' + Date.now(),
          traineeId:      data.traineeId,
          traineeName:    data.traineeName,
          date:           data.date,
          department:     data.department,
          keyObservation: data.keyObservation,
          actionableIdea: data.actionableIdea,
          attachmentUrl:  data.attachmentUrl || '',
          submittedAt:    nowIso(),
          status:         'pending',
          mentorComment:  '',
          mentorName:     '',
          feedbackAt:     '',
          rating:         0,
          guestComments:  []
        };
        obs.unshift(newObs);
        lsSave(LS_OBS, obs);
        return { success: true, id: newObs.id };
      }
      return callScript({ action: 'submitObservation', ...data });
    },

    async submitFeedback(obsId, mentorComment, mentorName, rating) {
      if (CONFIG.DEMO_MODE) {
        const obs = lsGet(LS_OBS);
        const idx = obs.findIndex(o => o.id === obsId);
        if (idx === -1) return { error: 'Not found' };
        obs[idx].status        = 'reviewed';
        obs[idx].mentorComment = mentorComment;
        obs[idx].mentorName    = mentorName;
        obs[idx].feedbackAt    = nowStr();
        obs[idx].rating        = rating;
        lsSave(LS_OBS, obs);
        return { success: true };
      }
      return callScript({ action: 'submitFeedback', obsId, mentorComment, mentorName, rating });
    },

    async submitGuestComment(obsId, comment) {
      if (CONFIG.DEMO_MODE) {
        const gcomments = lsGet(LS_GCOMMENT);
        gcomments.push({ id: 'gc-' + Date.now(), obsId, comment, submittedAt: nowStr() });
        lsSave(LS_GCOMMENT, gcomments);
        return { success: true };
      }
      return callScript({ action: 'submitGuestComment', obsId, comment });
    },

    // ---- Schedules ----

    async getAllSchedules() {
      if (CONFIG.DEMO_MODE) return lsGetObj(LS_SCHED);
      const res = await callScriptGet('getAllSchedules');
      const normalized = {};
      for (const t in res) {
        normalized[t] = {};
        for (const dStr in res[t]) {
          const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
          const d = new Date(cleanStr);
          const key = isNaN(d) ? dStr : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          normalized[t][key] = res[t][dStr];
        }
      }
      return normalized;
    },

    async getScheduleForTrainee(traineeId) {
      if (CONFIG.DEMO_MODE) {
        const all = lsGetObj(LS_SCHED);
        return all[traineeId] || {};
      }
      const res = await callScriptGet('getSchedules', { traineeId });
      if (!res) return {};
      const normalized = {};
      for (const dStr in res) {
        const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
        const d = new Date(cleanStr);
        const key = isNaN(d) ? dStr : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        normalized[key] = res[dStr];
      }
      return normalized;
    },

    async updateSchedule(traineeId, date, dept, objective) {
      if (CONFIG.DEMO_MODE) {
        const all = lsGetObj(LS_SCHED);
        if (!all[traineeId]) all[traineeId] = {};
        all[traineeId][date] = { dept, objective };
        lsSave(LS_SCHED, all);
        return { success: true };
      }
      return callScript({ action: 'updateSchedule', traineeId, date, dept, objective });
    },

    // ---- Assessments ----

    async getAssessments() {
      if (CONFIG.DEMO_MODE) return lsGet(LS_ASSESS);
      return callScriptGet('getAssessments');
    },

    async submitAssessment(traineeId, department, grade, competency1, competency2, competency3, competency4, comments, assessor) {
      const record = {
        id: 'asm-' + Date.now(),
        traineeId,
        department,
        grade,
        competency1: Number(competency1),
        competency2: Number(competency2),
        competency3: Number(competency3),
        competency4: Number(competency4),
        comments,
        assessor,
        assessedAt: nowStr()
      };

      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_ASSESS);
        const filtered = list.filter(a => !(a.traineeId === traineeId && a.department === department));
        filtered.push(record);
        lsSave(LS_ASSESS, filtered);
        return { success: true, record };
      }
      return callScript({
        action: 'submitAssessment',
        traineeId,
        department,
        grade,
        competency1,
        competency2,
        competency3,
        competency4,
        comments,
        assessor
      });
    }

  };

})();
