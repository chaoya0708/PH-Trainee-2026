import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Update loadAllData
if 'Api.getMentorNotes()' not in content:
    # Trainee block
    old_trainee = """      const [obs, sched, asm] = await Promise.all([
        Api.getObservationsForTrainee(user.id),
        Api.getScheduleForTrainee(user.id),
        Api.getAssessments()
      ]);
      state.observations = obs;
      state.schedules = { [user.id]: sched };
      state.assessments = asm;"""
      
    # General block
    old_general = """      const [obs, sched, asm] = await Promise.all([
        Api.getAllObservations(),
        Api.getAllSchedules(),
        Api.getAssessments()
      ]);
      state.observations = obs;
      state.schedules = sched;
      state.assessments = asm;"""
      
    new_general = """      const [obs, sched, asm, notes] = await Promise.all([
        Api.getAllObservations(),
        Api.getAllSchedules(),
        Api.getAssessments(),
        user.role === 'admin' ? Api.getMentorNotes() : Promise.resolve([])
      ]);
      state.observations = obs;
      state.schedules = sched;
      state.assessments = asm;
      state.mentorNotes = notes || [];"""
      
    content = content.replace(old_general, new_general)

# 2. Update updateTopBar
if "$('liInsights').style.display" not in content:
    old_topbar = "$('liAnalytics').style.display  = (isMentor || isGuest || isExecutive) ? 'block' : 'none';"
    new_topbar = "$('liInsights').style.display   = (isMentor) ? 'block' : 'none';\n  " + old_topbar
    content = content.replace(old_topbar, new_topbar)

# 3. Update switchTab/renderCurrentTab
if "else if (state.activeTab === 'insights') renderInsights();" not in content:
    content = content.replace("else if (state.activeTab === 'analytics')  renderAnalytics();", "else if (state.activeTab === 'analytics')  renderAnalytics();\n  else if (state.activeTab === 'insights')   renderInsights();")

# 4. Add renderInsights and actions
if "function renderInsights()" not in content:
    code = """
// ══════════════════════════════════════════════════════════════════
// MENTOR INSIGHTS
// ══════════════════════════════════════════════════════════════════

window.toggleNoteTag = function(tag) {
  if (!state.selectedNoteTags) state.selectedNoteTags = [];
  const idx = state.selectedNoteTags.indexOf(tag);
  if (idx > -1) state.selectedNoteTags.splice(idx, 1);
  else state.selectedNoteTags.push(tag);
  renderInsights();
};

window.submitMentorNote = async function() {
  const content = $('insightContent').value;
  if (!content.trim()) {
    showToast('Please enter note content.', 'error');
    return;
  }
  const traineeId = $('insightTrainee').value;
  const tags = state.selectedNoteTags || [];
  
  showLoading();
  try {
    const res = await Api.submitMentorNote(traineeId, content, tags);
    if (res.success) {
      showToast('Note saved successfully!', 'success');
      state.selectedNoteTags = [];
      state.mentorNotes = await Api.getMentorNotes();
      renderInsights();
    } else {
      showToast('Failed to save note.', 'error');
    }
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    hideLoading();
  }
};

window.deleteMentorNote = async function(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  showLoading();
  try {
    const res = await Api.deleteMentorNote(id);
    if (res.success) {
      state.mentorNotes = state.mentorNotes.filter(n => n.id !== id);
      renderInsights();
    }
  } finally {
    hideLoading();
  }
};

function renderInsights() {
  const container = $('insightsContainer');
  if (!container) return;
  
  const user = Auth.getCurrentUser();
  if (user.role !== 'admin') {
    container.innerHTML = `<div class="empty-state">Access Denied.</div>`;
    return;
  }

  const tags = state.activeLanguage === 'zh' 
    ? ['邏輯清晰', '批判性思考', '主動發現問題', '表達待加強', '需增加實作', '團隊協作佳']
    : ['Clear Logic', 'Critical Thinking', 'Proactive', 'Needs Better Expression', 'Needs Hands-on', 'Good Teamwork'];
    
  if (!state.selectedNoteTags) state.selectedNoteTags = [];
  
  let traineesHtml = `<option value="general">${state.activeLanguage === 'zh' ? '總體觀察 (General)' : 'General Observation'}</option>`;
  Object.values(CONFIG.TRAINEES).forEach(tr => {
    traineesHtml += `<option value="${tr.id}">${tr.name}</option>`;
  });
  
  const tagsHtml = tags.map(tag => {
    const isSelected = state.selectedNoteTags.includes(tag);
    return `<button class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-sm" style="border-radius:20px; padding:4px 12px; font-size:11px;" onclick="window.toggleNoteTag('${tag}')">${tag}</button>`;
  }).join('');
  
  // Render feed
  let feedHtml = '';
  if (!state.mentorNotes || state.mentorNotes.length === 0) {
    feedHtml = `<div class="empty-state" style="margin-top:20px;"><i class="fi fi-rr-box"></i><p>${state.activeLanguage==='zh'?'尚無觀察紀錄':'No insights recorded yet.'}</p></div>`;
  } else {
    feedHtml = state.mentorNotes.map(n => {
      const tName = n.traineeId === 'general' ? (state.activeLanguage==='zh'?'總體觀察':'General') : (CONFIG.TRAINEES.find(t=>t.id===n.traineeId)?.name || n.traineeId);
      const tagBadges = (n.tags || []).map(t => `<span style="background:var(--primary);color:#fff;font-size:10px;padding:2px 8px;border-radius:12px;margin-right:6px;">${t}</span>`).join('');
      return `
        <div class="glass-card" style="margin-bottom:16px; padding:16px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed var(--card-border); padding-bottom:8px;">
            <div style="font-weight:700; color:var(--primary); font-size:14px;"><i class="fi fi-rr-user"></i> ${tName}</div>
            <div style="font-size:11px; color:var(--text-muted);">${formatTaipeiTime(n.createdAt, state.activeLanguage)}</div>
          </div>
          <div style="margin-bottom:12px;">${tagBadges}</div>
          <div style="font-size:13px; line-height:1.6; color:var(--text-primary); white-space:pre-wrap;">${n.content}</div>
          <button class="btn btn-outline btn-sm" style="position:absolute; bottom:12px; right:16px; color:#ef4444; border-color:rgba(239,68,68,0.3); padding:4px 8px;" onclick="window.deleteMentorNote('${n.id}')"><i class="fi fi-rr-trash"></i></button>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div class="glass-card" style="margin-bottom: 24px; padding: 20px;">
      <h3 style="font-size:14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;"><i class="fi fi-rr-edit"></i> ${state.activeLanguage==='zh'?'新增觀察紀錄':'New Insight Note'}</h3>
      <div class="form-group">
        <select id="insightTrainee" class="form-control">${traineesHtml}</select>
      </div>
      <div class="form-group">
        <textarea id="insightContent" class="form-control" rows="4" placeholder="${t('placeholderNote')}"></textarea>
      </div>
      <div style="margin-bottom:16px; display:flex; flex-wrap:wrap; gap:8px;">
        ${tagsHtml}
      </div>
      <div style="text-align:right;">
        <button class="btn btn-primary" onclick="window.submitMentorNote()"><i class="fi fi-rr-disk"></i> ${t('btnSaveNote')}</button>
      </div>
    </div>
    
    <div style="margin-top:30px;">
      <h3 style="font-size:16px; margin-bottom:16px; display:flex; align-items:center; gap:8px;"><i class="fi fi-rr-time-past"></i> ${state.activeLanguage==='zh'?'歷史紀錄':'History'}</h3>
      ${feedHtml}
    </div>
  `;
}
"""
    content = content + code

with open('js/app.js', 'w') as f:
    f.write(content)
