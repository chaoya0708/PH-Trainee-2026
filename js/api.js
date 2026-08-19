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
  const LS_OBS = 'vimei2_observations';
  const LS_SCHED = 'vimei2_schedules';
  const LS_GCOMMENT = 'vimei2_guest_comments';
  const LS_ASSESS = 'vimei2_assessments';
  const LS_MENTOR_NOTES = 'vimei2_mentor_notes';
  const LS_RESOURCES = 'vimei2_resources';

  // ----- Default demo seed data -----
  function seedDemoData() {
    if (!localStorage.getItem(LS_OBS)) {
      const seed = [
        {
          id: 'obs-seed-1',
          traineeId: 'diane',
          traineeName: 'Diane',
          date: '2026-07-13',
          department: 'yushan_prep',
          keyObservation: 'The vegetable washing sector has a minor bottleneck during peak hours. Workers frequently cross paths when carrying sanitized crates due to a narrow layout. The 5S signage is clear but the physical flow has not been redesigned to match it.',
          actionableIdea: 'Propose an L-shaped crate flow in the VIMEI Philippines plant. Bilingual (English + Tagalog) floor markings would guide local staff more effectively than signage alone.',
          attachmentUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
          submittedAt: '2026-07-13T09:15:00Z',
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0
        },
        {
          id: 'obs-seed-2',
          traineeId: 'mark',
          traineeName: 'Mark',
          date: '2026-07-13',
          department: 'yushan_prep',
          keyObservation: 'The automatic dicer machine runs at 80% capacity because the raw material feeding rate fluctuates. A lot of idle time is caused by waiting for manually trimmed vegetables from upstream.',
          actionableIdea: 'Introduce a gravity-assisted staging chute above the feeder. Clear visual buffer threshold signage (bilingual) will help Filipino operators respond faster without needing supervisor intervention.',
          attachmentUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
          submittedAt: '2026-07-13T10:00:00Z',
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0
        },
        {
          id: 'obs-seed-3',
          traineeId: 'jairuz',
          traineeName: 'Jairuz',
          date: '2026-07-13',
          department: 'cmf_qc',
          keyObservation: 'Metal detector test sticks are stored in an unlocked generic cabinet instead of a dedicated verification kit with controlled access. This is a potential HACCP deviation risk.',
          actionableIdea: 'Create a shadow board for test sticks with a digital keypad lock. Only QA-certified personnel should hold the PIN. Label the board in both English and Tagalog for clarity.',
          attachmentUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
          submittedAt: '2026-07-13T11:30:00Z',
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0
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

    if (!localStorage.getItem(LS_MENTOR_NOTES)) {
      localStorage.setItem(LS_MENTOR_NOTES, JSON.stringify([]));
    }

    if (!localStorage.getItem(LS_RESOURCES)) {
      localStorage.setItem(LS_RESOURCES, JSON.stringify([]));
    }
  }

  // ----- Demo helpers -----
  function lsGet(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function lsGetObj(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
  function lsSave(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function nowIso() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const p = {};
    parts.forEach(part => p[part.type] = part.value);
    const hour = p.hour === '24' ? '00' : p.hour;
    return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}+08:00`;
  }

  function nowStr() {
    return nowIso().replace('T', ' ').substring(0, 16);
  }

  // ----- Firebase Initialization -----
  let db = null;
  let storage = null;
  if (!CONFIG.DEMO_MODE && CONFIG.FIREBASE_CONFIG) {
    if (!firebase.apps.length) {
      firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
    }
    db = firebase.firestore();
    storage = firebase.storage();
  }

  async function fbGet(col, forceFetch = true) {
    const cacheKey = 'vimei_fb_v2_' + col;
    const timeKey = cacheKey + '_time';
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(timeKey);
    const now = Date.now();
    
    // If cache is less than 5 minutes old, don't force fetch
    if (forceFetch && cachedTime && (now - parseInt(cachedTime) < 5 * 60 * 1000)) {
      forceFetch = false;
    }

    if (!forceFetch && cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }

    const fetchPromise = db.collection(col).get().then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const oldStr = localStorage.getItem(cacheKey);
      const newStr = JSON.stringify(data);
      if (oldStr !== newStr) {
        localStorage.setItem(cacheKey, newStr);
        localStorage.setItem(timeKey, now.toString());
        window.dispatchEvent(new CustomEvent('fb_data_updated'));
      }
      return data;
    });
    
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return await fetchPromise;
  }

  async function fbGetWhere(col, field, val, forceFetch = true) {
    const cacheKey = `vimei_fb_v2_${col}_${field}_${val}`;
    const timeKey = cacheKey + '_time';
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(timeKey);
    const now = Date.now();

    if (forceFetch && cachedTime && (now - parseInt(cachedTime) < 5 * 60 * 1000)) {
      forceFetch = false;
    }

    if (!forceFetch && cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }

    const fetchPromise = db.collection(col).where(field, '==', val).get().then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const oldStr = localStorage.getItem(cacheKey);
      const newStr = JSON.stringify(data);
      if (oldStr !== newStr) {
        localStorage.setItem(cacheKey, newStr);
        localStorage.setItem(timeKey, now.toString());
        window.dispatchEvent(new CustomEvent('fb_data_updated'));
      }
      return data;
    });

    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return await fetchPromise;
  }

  function invalidateCache(col) {
    const prefix = 'vimei_fb_v2_' + col;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }

  async function callScript(params) {
    if (!db) throw new Error('Firebase not initialized.');
    const { action, ...data } = params;
    const nowStrIso = nowIso();

    switch (action) {
      case 'getAllObservations': return await fbGet('observations', data.forceFetch);
      case 'getObservations': return await fbGetWhere('observations', 'traineeId', data.traineeId, data.forceFetch);
      
      case 'getAllGuestComments': return await fbGet('guest_comments', data.forceFetch);
      case 'getGuestComments': {
        const obs = await fbGetWhere('observations', 'traineeId', data.traineeId, data.forceFetch);
        const obsIds = obs.map(o => o.id);
        const allComments = await fbGet('guest_comments', data.forceFetch);
        return allComments.filter(c => obsIds.includes(c.obsId));
      }

      case 'submitObservation': {
        const docRef = await db.collection('observations').add({
          ...data,
          submittedAt: nowStrIso,
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0
        });
        invalidateCache('observations');
        return { success: true, id: docRef.id };
      }
      
      case 'updateObservation': {
        await db.collection('observations').doc(data.id).update(data.data);
        invalidateCache('observations');
        return { success: true };
      }

      case 'deleteObservation': {
        await db.collection('observations').doc(data.id).delete();
        invalidateCache('observations');
        return { success: true };
      }

      case 'submitFeedback': {
        await db.collection('observations').doc(data.obsId).update({
          mentorComment: data.mentorComment,
          mentorName: data.mentorName,
          rating: data.rating,
          status: 'reviewed',
          feedbackAt: nowStrIso
        });
        invalidateCache('observations');
        return { success: true };
      }

      case 'submitGuestComment': {
        const docRef = await db.collection('guest_comments').add({
          obsId: data.obsId,
          comment: data.comment,
          guestName: data.guestName,
          guestDept: data.guestDept,
          createdAt: nowStrIso
        });
        invalidateCache('guest_comments');
        return { success: true, id: docRef.id };
      }

      case 'getAllSchedules': {
        const scheds = await fbGet('schedules', data.forceFetch);
        const result = {};
        for (const s of scheds) {
          if (!result[s.traineeId]) result[s.traineeId] = {};
          result[s.traineeId][s.date] = { dept: s.dept, objective: s.objective };
        }
        return result;
      }
      
      case 'getSchedules': {
        const scheds = await fbGetWhere('schedules', 'traineeId', data.traineeId, data.forceFetch);
        const result = {};
        for (const s of scheds) {
          result[s.date] = { dept: s.dept, objective: s.objective };
        }
        return result;
      }

      case 'updateSchedule': {
        const snap = await db.collection('schedules')
          .where('traineeId', '==', data.traineeId)
          .where('date', '==', data.date)
          .get();
        if (snap.empty) {
          await db.collection('schedules').add({ traineeId: data.traineeId, date: data.date, dept: data.dept, objective: data.objective });
        } else {
          await db.collection('schedules').doc(snap.docs[0].id).update({ dept: data.dept, objective: data.objective });
        }
        invalidateCache('schedules');
        return { success: true };
      }

      case 'getMentorNotes': return await fbGet('mentor_notes', data.forceFetch);

      case 'submitMentorNote': {
        const docRef = await db.collection('mentor_notes').add({ traineeId: data.traineeId, content: data.content, tags: data.tags, createdAt: nowStrIso });
        invalidateCache('mentor_notes');
        return { success: true, id: docRef.id };
      }

      case 'deleteMentorNote': {
        await db.collection('mentor_notes').doc(data.id).delete();
        invalidateCache('mentor_notes');
        return { success: true };
      }

      case 'getAssessments': return await fbGet('assessments', data.forceFetch);

      case 'submitAssessment': {
        const docRef = await db.collection('assessments').add({
          traineeId: data.traineeId, assessorName: data.assessorName, department: data.department, date: data.date,
          ratings: data.ratings, comment: data.comment, targetWeek: data.targetWeek || '', attachmentUrl: data.attachmentUrl || '',
          visibleToTrainee: false, createdAt: nowStrIso
        });
        invalidateCache('assessments');
        return { success: true, id: docRef.id };
      }

      case 'updateAssessment': {
        await db.collection('assessments').doc(data.id).update(data.data);
        invalidateCache('assessments');
        return { success: true };
      }

      case 'deleteAssessment': {
        await db.collection('assessments').doc(data.id).delete();
        invalidateCache('assessments');
        return { success: true };
      }

      case 'updateAssessmentVisibility': {
        await db.collection('assessments').doc(data.id).update({ visibleToTrainee: data.visible });
        invalidateCache('assessments');
        return { success: true };
      }

      case 'getAllResources': return await fbGet('resources', data.forceFetch);

      case 'submitResource': {
        const docRef = await db.collection('resources').add({ ...data, createdAt: nowStrIso });
        invalidateCache('resources');
        return { success: true, id: docRef.id };
      }

      case 'deleteResource': {
        await db.collection('resources').doc(data.id).delete();
        invalidateCache('resources');
        return { success: true };
      }

      case 'uploadFile': {
        const gasUrl = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec';
        let base64String = data.base64;
        
        if (data.file) {
          base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(data.file);
          });
        }
        
        window.dispatchEvent(new CustomEvent('upload_progress', { detail: '10' }));
        const payload = JSON.stringify({
          action: 'uploadFile',
          base64: base64String,
          mimeType: data.mimeType || (data.file ? data.file.type : 'application/octet-stream'),
          filename: data.filename || (data.file ? data.file.name : 'upload.bin'),
          folderName: data.folderName || 'MA_Program_Uploads'
        });
        window.dispatchEvent(new CustomEvent('upload_progress', { detail: '50' }));
        
        const res = await fetch(gasUrl, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'text/plain' }
        });
        window.dispatchEvent(new CustomEvent('upload_progress', { detail: '90' }));
        
        const text = await res.text();
        let jsonRes;
        try {
          jsonRes = JSON.parse(text);
        } catch(e) {
          throw new Error('Invalid JSON from server');
        }
        
        if (jsonRes.success) {
          window.dispatchEvent(new CustomEvent('upload_progress', { detail: '100' }));
          return { success: true, url: jsonRes.url };
        } else {
          throw new Error(jsonRes.error || 'Upload failed');
        }
      }

      case 'getInitData': {
        const ff = data.forceFetch !== false;
        const [obs, gcomments, scheds, assess, res] = await Promise.all([
          data.role === 'trainee' ? callScript({ action: 'getObservations', traineeId: data.traineeId, forceFetch: ff }) : callScript({ action: 'getAllObservations', forceFetch: ff }),
          data.role === 'trainee' ? callScript({ action: 'getGuestComments', traineeId: data.traineeId, forceFetch: ff }) : callScript({ action: 'getAllGuestComments', forceFetch: ff }),
          data.role === 'trainee' ? callScript({ action: 'getSchedules', traineeId: data.traineeId, forceFetch: ff }) : callScript({ action: 'getAllSchedules', forceFetch: ff }),
          callScript({ action: 'getAssessments', forceFetch: ff }),
          callScript({ action: 'getAllResources', forceFetch: ff })
        ]);
        return {
          observations: obs,
          guestComments: gcomments,
          schedules: scheds,
          assessments: assess,
          resources: res
        };
      }
      default: throw new Error('Unknown action: ' + action);
    }
  }

  async function callScriptGet(action, params = {}) {
    return callScript({ action, ...params });
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
        const obs = lsGet(LS_OBS);
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
        guestComments: (Array.isArray(gcomments) ? gcomments : []).filter(g => g.obsId === o.id)
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
          id: 'obs-' + Date.now(),
          traineeId: data.traineeId,
          traineeName: data.traineeName,
          date: data.date,
          department: data.department,
          keyObservation: data.keyObservation,
          actionableIdea: data.actionableIdea,
          attachmentUrl: data.attachmentUrl || (data.fileData ? data.fileData.base64 : ''),
          submittedAt: nowIso(),
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0,
          selfRating: data.selfRating || 0,
          targetWeek: data.targetWeek || '',
          guestComments: []
        };
        obs.unshift(newObs);
        lsSave(LS_OBS, obs);
        return { success: true, id: newObs.id };
      }
      return callScript({ action: 'submitObservation', ...data });
    },

    async updateObservation(id, data) {
      if (CONFIG.DEMO_MODE) {
        const obs = lsGet(LS_OBS);
        const idx = obs.findIndex(o => o.id === id);
        if (idx !== -1) {
          obs[idx] = { ...obs[idx], ...data };
          lsSave(LS_OBS, obs);
        }
        return { success: true };
      }
      return callScript({ action: 'updateObservation', id, data });
    },

    async deleteObservation(id) {
      if (CONFIG.DEMO_MODE) {
        let obs = lsGet(LS_OBS);
        obs = obs.filter(o => o.id !== id);
        lsSave(LS_OBS, obs);
        return { success: true };
      }
      return callScript({ action: 'deleteObservation', id });
    },

    async submitFeedback(obsId, mentorComment, mentorName, rating) {
      if (CONFIG.DEMO_MODE) {
        const obs = lsGet(LS_OBS);
        const idx = obs.findIndex(o => o.id === obsId);
        if (idx === -1) return { error: 'Not found' };
        obs[idx].status = 'reviewed';
        obs[idx].mentorComment = mentorComment;
        obs[idx].mentorName = mentorName;
        obs[idx].feedbackAt = nowStr();
        obs[idx].rating = rating;
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
      if (!res) return {};

      const allSchedules = {};
      for (const traineeId in res) {
        const traineeData = res[traineeId];
        const normalized = {};
        for (const dStr in traineeData) {
          let key = dStr;
          const parts = dStr.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{4})/);
          if (parts) {
            const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
            const yyyy = parts[3];
            const mm = String(monthMap[parts[1]]).padStart(2, '0');
            const dd = String(parts[2]).padStart(2, '0');
            key = `${yyyy}-${mm}-${dd}`;
          } else {
            const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
            const d = new Date(cleanStr);
            if (!isNaN(d)) {
              key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            }
          }
          normalized[key] = traineeData[dStr];
        }
        allSchedules[traineeId] = normalized;
      }
      return allSchedules;
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
        let key = dStr;
        const parts = dStr.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{4})/);
        if (parts) {
          const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
          const yyyy = parts[3];
          const mm = String(monthMap[parts[1]]).padStart(2, '0');
          const dd = String(parts[2]).padStart(2, '0');
          key = `${yyyy}-${mm}-${dd}`;
        } else {
          const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
          const d = new Date(cleanStr);
          if (!isNaN(d)) {
            key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
          }
        }
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


    async getMentorNotes() {
      // Always use localStorage for private mentor notes for now
      return lsGet(LS_MENTOR_NOTES) || [];
    },

    async submitMentorNote(traineeId, content, tags) {
      const record = {
        id: 'mn-' + Date.now(),
        traineeId,
        content,
        tags: tags || [],
        createdAt: nowStr()
      };
      // Always use localStorage for private mentor notes for now
      let list = lsGet(LS_MENTOR_NOTES) || [];
      list.unshift(record);
      lsSave(LS_MENTOR_NOTES, list);
      return { success: true, record };
    },

    async deleteMentorNote(id) {
      let list = lsGet(LS_MENTOR_NOTES) || [];
      list = list.filter(n => n.id !== id);
      lsSave(LS_MENTOR_NOTES, list);
      return { success: true };
    },
    async getAssessments() {
      if (CONFIG.DEMO_MODE) return lsGet(LS_ASSESS);
      const data = await callScriptGet('getAssessments');
      // Normalize visibleToTrainee in case the Google Sheet header is empty ("") or missing
      if (Array.isArray(data)) {
        data.forEach(d => {
          if (d.visibleToTrainee === undefined) {
            // Fallbacks for the 12th column which might not have a header
            if (d[''] !== undefined) d.visibleToTrainee = (d[''] === true || d[''] === 'true' || d[''] === 'TRUE');
            else d.visibleToTrainee = false;
          } else {
            d.visibleToTrainee = (d.visibleToTrainee === true || d.visibleToTrainee === 'true' || d.visibleToTrainee === 'TRUE');
          }
        });
      }
      return data;
    },

    async submitAssessment(traineeId, department, grade, competency1, competency2, competency3, competency4, competency5, comments, assessor, attachmentUrl = '') {
      const record = {
        id: 'asm-' + Date.now(),
        traineeId,
        department,
        grade,
        competency1: Number(competency1),
        competency2: Number(competency2),
        competency3: Number(competency3),
        competency4: Number(competency4),
        competency5: Number(competency5),
        comments,
        assessor,
        attachmentUrl,
        assessedAt: nowStr()
      };

      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_ASSESS);
        const filtered = list.filter(a => !(a.traineeId === traineeId && a.department === department));
        record.visibleToTrainee = false;
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
        competency5,
        comments,
        assessor,
        attachmentUrl,
        visibleToTrainee: false
      });
    },

    async uploadFile(base64OrFile, mimeType, filename, folderName) {
      if (CONFIG.DEMO_MODE) {
        return new Promise(resolve => setTimeout(() => resolve({ success: true, url: 'https://example.com/mock-file.pdf' }), 1000));
      }
      
      if (base64OrFile instanceof File || base64OrFile instanceof Blob) {
        return callScript({
          action: 'uploadFile',
          file: base64OrFile,
          mimeType: mimeType || base64OrFile.type,
          filename: filename || base64OrFile.name,
          folderName
        });
      }
      
      return callScript({
        action: 'uploadFile',
        base64: base64OrFile,
        mimeType,
        filename,
        folderName
      });
    },

    async updateAssessment(id, data) {
      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_ASSESS);
        const idx = list.findIndex(a => a.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data };
          lsSave(LS_ASSESS, list);
        }
        return { success: true };
      }
      return callScript({ action: 'updateAssessment', id, data });
    },

    async deleteAssessment(id) {
      if (CONFIG.DEMO_MODE) {
        let list = lsGet(LS_ASSESS);
        list = list.filter(a => a.id !== id);
        lsSave(LS_ASSESS, list);
        return { success: true };
      }
      return callScript({ action: 'deleteAssessment', id });
    },

    async updateAssessmentVisibility(id, visibleToTrainee) {
      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_ASSESS);
        const idx = list.findIndex(a => a.id === id);
        if (idx !== -1) {
          list[idx].visibleToTrainee = visibleToTrainee;
          lsSave(LS_ASSESS, list);
        }
        return { success: true };
      }
      return callScript({
        action: 'updateAssessmentVisibility',
        id,
        visibleToTrainee
      });
    },


    
    async getInitData(role, traineeId, forceFetch = true) {
      if (CONFIG.DEMO_MODE) {
        const obs = lsGet(LS_OBS) || [];
        const gcomments = lsGet(LS_GCOMMENT) || [];
        const obsWithComments = obs.map(o => ({
          ...o,
          guestComments: gcomments.filter(g => g.obsId === o.id)
        }));
        
        if (role === 'trainee') {
          return {
            observations: obsWithComments.filter(o => o.traineeId === traineeId),
            schedules: { [traineeId]: (lsGet(LS_SCHED) || {})[traineeId] || {} },
            assessments: lsGet(LS_ASSESS) || [],
            resources: lsGet(LS_RESOURCES) || []
          };
        } else {
          return {
            observations: obsWithComments,
            schedules: lsGet(LS_SCHED) || {},
            assessments: lsGet(LS_ASSESS) || [],
            resources: lsGet(LS_RESOURCES) || []
          };
        }
      }
      
      const data = await callScriptGet('getInitData', { role, traineeId, forceFetch });
      
      // Normalize schedules
      if (data.schedules) {
        if (role === 'trainee') {
          const normalized = {};
          for (const dStr in data.schedules) {
            let key = dStr;
            const parts = dStr.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{4})/);
            if (parts) {
              const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
              const yyyy = parts[3];
              const mm = String(monthMap[parts[1]]).padStart(2, '0');
              const dd = String(parts[2]).padStart(2, '0');
              key = `${yyyy}-${mm}-${dd}`;
            } else {
              const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
              const d = new Date(cleanStr);
              if (!isNaN(d)) {
                key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
              }
            }
            normalized[key] = data.schedules[dStr];
          }
          data.schedules = normalized;
        } else {
          const allSchedules = {};
          for (const tId in data.schedules) {
            const traineeData = data.schedules[tId];
            const normalized = {};
            for (const dStr in traineeData) {
              let key = dStr;
              const parts = dStr.match(/([a-zA-Z]{3}) (\d{1,2}) (\d{4})/);
              if (parts) {
                const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
                const yyyy = parts[3];
                const mm = String(monthMap[parts[1]]).padStart(2, '0');
                const dd = String(parts[2]).padStart(2, '0');
                key = `${yyyy}-${mm}-${dd}`;
              } else {
                const cleanStr = dStr.replace(/\(.*?\)/g, '').trim();
                const d = new Date(cleanStr);
                if (!isNaN(d)) {
                  key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                }
              }
              normalized[key] = traineeData[dStr];
            }
            allSchedules[tId] = normalized;
          }
          data.schedules = allSchedules;
        }
      }
      
      // Normalize observations with guestComments
      if (data.observations) {
        const gcomments = data.guestComments || [];
        data.observations = data.observations.map(o => ({
          ...o,
          guestComments: (Array.isArray(gcomments) ? gcomments : []).filter(g => g.obsId === o.id)
        }));
      }
      
      // Normalize assessments
      if (Array.isArray(data.assessments)) {
        data.assessments.forEach(d => {
          if (d.visibleToTrainee === undefined) {
            if (d[''] !== undefined) d.visibleToTrainee = (d[''] === true || d[''] === 'true' || d[''] === 'TRUE');
            else d.visibleToTrainee = false;
          } else {
            d.visibleToTrainee = (d.visibleToTrainee === true || d.visibleToTrainee === 'true' || d.visibleToTrainee === 'TRUE');
          }
        });
      }
      
      return data;
    },

    async getAllResources() {
      if (CONFIG.DEMO_MODE) return lsGet(LS_RESOURCES);
      return callScriptGet('getAllResources');
    },

    async submitResource(data) {
      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_RESOURCES);
        const record = {
          id: 'res-' + Date.now(),
          title: data.title,
          category: data.category,
          url: data.url,
          uploadedBy: data.uploadedBy,
          uploadedAt: nowStr()
        };
        list.push(record);
        lsSave(LS_RESOURCES, list);
        return { success: true, id: record.id };
      }
      return callScript({ action: 'submitResource', ...data });
    },

    async deleteResource(id) {
      if (CONFIG.DEMO_MODE) {
        let list = lsGet(LS_RESOURCES);
        list = list.filter(r => r.id !== id);
        lsSave(LS_RESOURCES, list);
        return { success: true };
      }
      return callScript({ action: 'deleteResource', id });
    }

  };

})();
