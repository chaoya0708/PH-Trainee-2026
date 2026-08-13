import re

with open('js/api.js', 'r') as f:
    code = f.read()

firebase_adapter = """
  // ----- Firebase Initialization -----
  let db = null;
  let storage = null;
  if (!CONFIG.DEMO_MODE && CONFIG.FIREBASE_CONFIG) {
    if (!window.firebase) {
      console.error("Firebase SDK not loaded.");
    } else {
      if (!firebase.apps.length) {
        firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      storage = firebase.storage();
    }
  }

  async function fbGet(col) {
    const snap = await db.collection(col).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function fbGetWhere(col, field, val) {
    const snap = await db.collection(col).where(field, '==', val).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function callScript(params) {
    if (!db) throw new Error('Firebase not initialized or DEMO_MODE is true.');
    const { action, ...data } = params;
    const now = nowIso();

    switch (action) {
      case 'getAllObservations': return await fbGet('observations');
      case 'getObservations': return await fbGetWhere('observations', 'traineeId', data.traineeId);
      
      case 'getAllGuestComments': return await fbGet('guest_comments');
      case 'getGuestComments': {
        // Find guest comments for the trainee's observations
        const obs = await fbGetWhere('observations', 'traineeId', data.traineeId);
        const obsIds = obs.map(o => o.id);
        const allComments = await fbGet('guest_comments');
        return allComments.filter(c => obsIds.includes(c.obsId));
      }

      case 'submitObservation': {
        const docRef = await db.collection('observations').add({
          ...data,
          submittedAt: now,
          status: 'pending',
          mentorComment: '',
          mentorName: '',
          feedbackAt: '',
          rating: 0
        });
        return { success: true, id: docRef.id };
      }
      
      case 'updateObservation': {
        await db.collection('observations').doc(data.id).update(data.data);
        return { success: true };
      }

      case 'deleteObservation': {
        await db.collection('observations').doc(data.id).delete();
        return { success: true };
      }

      case 'submitFeedback': {
        await db.collection('observations').doc(data.obsId).update({
          mentorComment: data.mentorComment,
          mentorName: data.mentorName,
          rating: data.rating,
          status: 'reviewed',
          feedbackAt: now
        });
        return { success: true };
      }

      case 'submitGuestComment': {
        const docRef = await db.collection('guest_comments').add({
          obsId: data.obsId,
          comment: data.comment,
          guestName: data.guestName,
          guestDept: data.guestDept,
          createdAt: now
        });
        return { success: true, id: docRef.id };
      }

      case 'getAllSchedules': {
        const scheds = await fbGet('schedules');
        // Group by traineeId
        const result = {};
        for (const s of scheds) {
          if (!result[s.traineeId]) result[s.traineeId] = {};
          result[s.traineeId][s.date] = { dept: s.dept, objective: s.objective };
        }
        return result;
      }
      
      case 'getSchedules': {
        const scheds = await fbGetWhere('schedules', 'traineeId', data.traineeId);
        const result = {};
        for (const s of scheds) {
          result[s.date] = { dept: s.dept, objective: s.objective };
        }
        return result;
      }

      case 'updateSchedule': {
        // Find if exists
        const snap = await db.collection('schedules')
          .where('traineeId', '==', data.traineeId)
          .where('date', '==', data.date)
          .get();
        
        if (snap.empty) {
          await db.collection('schedules').add({
            traineeId: data.traineeId,
            date: data.date,
            dept: data.dept,
            objective: data.objective
          });
        } else {
          await db.collection('schedules').doc(snap.docs[0].id).update({
            dept: data.dept,
            objective: data.objective
          });
        }
        return { success: true };
      }

      case 'getMentorNotes': return await fbGet('mentor_notes');

      case 'submitMentorNote': {
        const docRef = await db.collection('mentor_notes').add({
          traineeId: data.traineeId,
          content: data.content,
          tags: data.tags,
          createdAt: now
        });
        return { success: true, id: docRef.id };
      }

      case 'deleteMentorNote': {
        await db.collection('mentor_notes').doc(data.id).delete();
        return { success: true };
      }

      case 'getAssessments': return await fbGet('assessments');

      case 'submitAssessment': {
        const docRef = await db.collection('assessments').add({
          traineeId: data.traineeId,
          assessorName: data.assessorName,
          department: data.department,
          date: data.date,
          ratings: data.ratings,
          comment: data.comment,
          targetWeek: data.targetWeek || '',
          attachmentUrl: data.attachmentUrl || '',
          visibleToTrainee: false,
          createdAt: now
        });
        return { success: true, id: docRef.id };
      }

      case 'updateAssessment': {
        await db.collection('assessments').doc(data.id).update(data.data);
        return { success: true };
      }

      case 'deleteAssessment': {
        await db.collection('assessments').doc(data.id).delete();
        return { success: true };
      }

      case 'updateAssessmentVisibility': {
        await db.collection('assessments').doc(data.id).update({ visibleToTrainee: data.visible });
        return { success: true };
      }

      case 'getAllResources': return await fbGet('resources');

      case 'submitResource': {
        const docRef = await db.collection('resources').add({
          ...data.data,
          createdAt: now
        });
        return { success: true, id: docRef.id };
      }

      case 'deleteResource': {
        await db.collection('resources').doc(data.id).delete();
        return { success: true };
      }

      case 'uploadFile': {
        if (!storage) throw new Error('Storage not initialized');
        // data.base64, data.mimeType, data.filename
        // Convert base64 to blob
        const base64Data = data.base64.split(',')[1] || data.base64;
        const binary = atob(base64Data);
        const array = [];
        for(let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], {type: data.mimeType});
        
        const safeName = Date.now() + '_' + data.filename.replace(/[^a-zA-Z0-9.]/g, '_');
        const ref = storage.ref().child((data.folderName || 'uploads') + '/' + safeName);
        await ref.put(blob);
        const url = await ref.getDownloadURL();
        return { success: true, url };
      }

      case 'getInitData': {
        const [obs, gcomments, scheds, assess, res] = await Promise.all([
          data.role === 'trainee' ? callScript({ action: 'getObservations', traineeId: data.traineeId }) : callScript({ action: 'getAllObservations' }),
          data.role === 'trainee' ? callScript({ action: 'getGuestComments', traineeId: data.traineeId }) : callScript({ action: 'getAllGuestComments' }),
          data.role === 'trainee' ? callScript({ action: 'getSchedules', traineeId: data.traineeId }) : callScript({ action: 'getAllSchedules' }),
          callScript({ action: 'getAssessments' }),
          callScript({ action: 'getAllResources' })
        ]);
        return {
          observations: obs,
          guestComments: gcomments,
          schedules: data.role === 'trainee' ? { [data.traineeId]: scheds } : scheds,
          assessments: assess,
          resources: res
        };
      }

      default:
        throw new Error('Unknown action: ' + action);
    }
  }

  async function callScriptGet(action, params = {}) {
    return callScript({ action, ...params });
  }
"""

code = re.sub(r'// ----- Apps Script fetch wrapper -----.*?async function callScriptGet\(action, params = \{\}\) \{\s*return callScript\(\{ action, \.\.\.params \}\);\s*\}', firebase_adapter, code, flags=re.DOTALL)

with open('js/api.js', 'w') as f:
    f.write(code)

print("Migration script executed.")
