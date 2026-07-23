import sys
import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Update updateNavVisibility
content = content.replace(
    "$('liMilestones').style.display = (isTrainee || isMentor || isExecutive || isGuest) ? 'block' : 'none';",
    "$('liMilestones').style.display = (isTrainee || isMentor || isExecutive || isGuest) ? 'block' : 'none';\n  $('liJournals').style.display   = (isTrainee || isMentor || isExecutive || isGuest) ? 'block' : 'none';"
)

# 2. Update translateSidebar
content = content.replace(
    "'navMilestones':'tabMilestones',",
    "'navMilestones':'tabMilestones',\n    'navJournals':  'tabJournals',"
)

# 3. Update renderCurrentTab
content = content.replace(
    "else if (state.activeTab === 'milestones') renderMilestones();",
    "else if (state.activeTab === 'milestones') renderMilestones();\n  else if (state.activeTab === 'journals')   renderJournals();"
)

# 4. Update setupMainEventListeners
content = content.replace(
    "['navMilestones','milestones'],['navReview','review']",
    "['navMilestones','milestones'],['navJournals','journals'],['navReview','review']"
)

# 5. Add renderJournals function before renderReview
journals_code = """
// ══════════════════════════════════════════════════════════════════
// 3.5. JOURNALS
// ══════════════════════════════════════════════════════════════════
function renderJournals() {
  const user = Auth.getCurrentUser();
  const container = $('sectionJournals');
  
  if (!state.activeJournalTraineeId) {
    state.activeJournalTraineeId = CONFIG.TRAINEES[0].id;
  }

  // Enforce guest department filter
  const isGuest = user.role === 'guest';
  if (isGuest) {
    _filterDept = user.departmentId;
  }

  // Trainee Tabs
  let tabsHtml = '';
  if (user.role === 'admin' || user.role === 'executive') {
    tabsHtml = `
      <div style="display:flex; gap:10px; margin-bottom:20px; overflow-x:auto;">
        ${CONFIG.TRAINEES.map(tr => `
          <button class="btn ${state.activeJournalTraineeId === tr.id ? 'btn-primary' : 'btn-outline'}" 
                  onclick="state.activeJournalTraineeId='${tr.id}'; window.renderJournals();"
                  style="flex:1; white-space:nowrap; border-radius:12px; padding:12px; font-size:16px;">
            ${tr.avatar ? tr.avatar : '🎓'} ${tr.name}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Dept filter
  let filterHtml = `<div class="glass-card" style="margin-bottom:20px; padding: 12px 20px;"><div class="filter-bar" style="border:none;padding:0;">`;
  let deptOpts = '';
  if (isGuest) {
    const d = CONFIG.DEPARTMENTS[user.departmentId];
    deptOpts = `<option value="${user.departmentId}" selected>${state.activeLanguage === 'zh' ? (d.nameZh || d.name) : d.name}</option>`;
  } else {
    deptOpts = `<option value="all">${t('allDepts')}</option>` +
      Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly).map(d =>
        `<option value="${d.id}" ${_filterDept === d.id ? 'selected' : ''}>${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
      ).join('');
  }
  filterHtml += `
      <label>${t('filterLabel')}</label>
      <select class="form-control" style="width:auto;" onchange="window.setFilterDeptForJournals(this.value)" ${isGuest ? 'disabled' : ''}>${deptOpts}</select>
    </div></div>`;

  // Filter observations
  let obs = [...state.observations].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
  if (user.role === 'trainee') {
    obs = obs.filter(o => o.traineeId === user.id);
  } else {
    obs = obs.filter(o => o.traineeId === state.activeJournalTraineeId);
  }
  
  if (_filterDept !== 'all') obs = obs.filter(o => o.department === _filterDept);

  let feedHtml = obs.length === 0
    ? `<div class="glass-card" style="text-align:center;padding:40px;color:var(--text-secondary);">
        ${t('noObservations')}
       </div>`
    : obs.map(o => buildFeedItem(o, user)).join('');

  container.innerHTML = `
    <div class="card-header" style="margin:0 0 10px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('tabJournals')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${state.activeLanguage === 'zh' ? '查看並審閱國際生每週的現場觀察與心得。' : 'Review trainees weekly observations and feedback.'}</p></div>
    </div>
    ${tabsHtml}
    ${filterHtml}
    <div class="feed">${feedHtml}</div>
  `;
}

window.setFilterDeptForJournals = function(val) { _filterDept = val; renderJournals(); };

"""

content = content.replace(
    "let _filterTrainee = 'all';",
    journals_code + "let _filterTrainee = 'all';"
)

# 6. Remove observation logic from renderReview
# Specifically, remove the trainee filter and obs mapping.
content = re.sub(
    r"// Filter observations\n  let obs = \[\.\.\.state\.observations\]\.sort.*?(?=let assessFormHtml = '';)",
    "",
    content,
    flags=re.DOTALL
)

# Also remove trainee filter dropdown from renderReview because renderReview now only shows assessFormHtml
content = re.sub(
    r"if \(user\.role === 'admin'\) \{\n\s+// Trainee filter.*?\n\s+\}\n\n\s+// Dept filter",
    "// Dept filter",
    content,
    flags=re.DOTALL
)

# Remove the trainee toggle button logic from renderReview's innerHTML
content = content.replace(
    "${filterHtml}\n    ${assessFormHtml}\n    <div class=\"feed\">${feedHtml}</div>",
    "${assessFormHtml}"
)

# 7. Update smartNudgeHtml to point to 'journals' instead of 'review'
content = content.replace(
    "<div class=\"smart-nudge-item info\" onclick=\"window.switchTab('review')\" style=\"cursor:pointer;\">",
    "<div class=\"smart-nudge-item info\" onclick=\"window.switchTab('journals')\" style=\"cursor:pointer;\">"
)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied.")
