/**
 * VIMEI Knowledge Tracker - Core Application Logic v2
 * ====================================================
 * Roles: admin | trainee | guest
 * Data:  api.js (demo localStorage or live Google Sheets)
 * Auth:  auth.js (PIN-based, sessionStorage)
 * i18n:  i18n.js (en / zh / tg)
 */

// ── State ──────────────────────────────────────────────────────────
const state = {
  activeTab:          'dashboard',
  activeLanguage:     ['en', 'zh'].includes(localStorage.getItem('vimei_lang')) ? localStorage.getItem('vimei_lang') : 'en',
  activeTheme:        localStorage.getItem('vimei_theme') || 'light',
  selectedTraineeId:  'diane',
  selectedDate:       '2026-07-14',
  viewDate:           '2026-07-14',
  calendarView:       'month',
  observations:       [],
  schedules:          {},
  pendingRatings:     {},
  pendingAssessRatings: { comp1: 3, comp2: 3, comp3: 3, comp4: 3 },
  assessments:        [],
  editingSchedule:    false       // true when inline schedule form is open
};

// ── Convenience ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const t = key => window.VimeiI18n.t(key);

// ── Motivational Slogans ──
function initLoginSlogans() {
  const sloganEl = $('loginSloganText');
  if (!sloganEl) return;

  const slogan = { zh: "以好奇心觀察現場，以行動力實踐變革。", en: "Observe with Curiosity, Act with Boldness." };
  const lang = state.activeLanguage || 'en';
  sloganEl.innerHTML = `${lang === 'zh' ? slogan.zh : slogan.en}`;
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  window._appLang = state.activeLanguage;
  applyTheme();

  Api.init(); // seed demo data if needed
  initLoginSlogans(); // initialize slogans rotation

  if (Auth.isLoggedIn()) {
    await enterApp();
  } else {
    showLoginScreen();
  }
});

// ══════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════

let _loginRole     = null;
let _loginTraineeId = null;

function showLoginScreen() {
  $('loginScreen').style.display = 'flex';
  $('mainApp').style.display     = 'none';
  renderLoginRoleStep();
}

function renderLoginRoleStep() {
  _loginRole      = null;
  _loginTraineeId = null;

  $('loginStepRole').style.display        = 'flex';
  $('loginStepAdmin').style.display       = 'none';
  $('loginStepTraineeName').style.display = 'none';
  $('loginStepTraineePin').style.display  = 'none';
  $('loginStepGuest').style.display       = 'none';
  $('loginStepExecutive').style.display   = 'none';
}

window.selectLoginRole = function(role) {
  _loginRole = role;
  $('loginStepRole').style.display = 'none';

  if (role === 'admin') {
    $('loginStepAdmin').style.display = 'flex';
    $('adminPinInput').value = '';
    $('loginError1').style.display = 'none';
    setTimeout(() => $('adminPinInput').focus(), 50);

  } else if (role === 'trainee') {
    // Populate trainee name grid
    const grid = $('traineeNameGrid');
    grid.innerHTML = CONFIG.TRAINEES.map(tr => `
      <button class="trainee-name-btn" onclick="selectLoginTrainee('${tr.id}')">
        ${tr.avatar ? `<span class="tnb-avatar">${tr.avatar}</span>` : ''}
        <div>
          <div class="tnb-name">${tr.name}</div>
          ${tr.bio ? `<div class="tnb-bio">${tr.bio}</div>` : ''}
        </div>
      </button>
    `).join('');
    $('loginStepTraineeName').style.display = 'flex';

  } else if (role === 'guest') {
    $('loginStepGuest').style.display = 'flex';
    $('guestCodeInput').value = '';
    $('loginError3').style.display = 'none';
    setTimeout(() => $('guestCodeInput').focus(), 50);

  } else if (role === 'executive') {
    $('loginStepExecutive').style.display = 'flex';
    $('executiveCodeInput').value = '';
    $('loginError4').style.display = 'none';
    setTimeout(() => $('executiveCodeInput').focus(), 50);
  }
};

window.selectLoginTrainee = function(traineeId) {
  _loginTraineeId = traineeId;
  const tr = CONFIG.TRAINEES.find(t => t.id === traineeId);
  $('loginStepTraineeName').style.display = 'none';
  $('loginUserPreview').innerHTML = `
    ${tr.avatar ? `<span>${tr.avatar}</span>` : ''}
    <div><strong>${tr.name}</strong><p>${t('loginTraineePin')}</p></div>
  `;
  $('traineePinInput').value = '';
  $('loginError2').style.display = 'none';
  $('loginStepTraineePin').style.display = 'flex';
  setTimeout(() => $('traineePinInput').focus(), 50);
};

window.backToRoleSelect   = renderLoginRoleStep;
window.backToTraineeName  = function() {
  $('loginStepTraineePin').style.display = 'none';
  $('loginStepTraineeName').style.display = 'flex';
};

window.handleLogin = async function() {
  let credential = '';
  let errorEl    = null;

  if (_loginRole === 'admin') {
    credential = $('adminPinInput').value;
    errorEl    = $('loginError1');
  } else if (_loginRole === 'trainee') {
    credential = $('traineePinInput').value;
    errorEl    = $('loginError2');
  } else if (_loginRole === 'guest') {
    credential = $('guestCodeInput').value.trim();
    errorEl    = $('loginError3');
  } else if (_loginRole === 'executive') {
    credential = $('executiveCodeInput').value.trim();
    errorEl    = $('loginError4');
  }

  const ok = Auth.login(_loginRole, _loginTraineeId || _loginRole, credential);

  if (ok) {
    await enterApp();
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent   = t('loginError');
    }
  }
};

window.changeLanguageLogin = function(lang) {
  state.activeLanguage = lang;
  window._appLang = lang;
  localStorage.setItem('vimei_lang', lang);
};

// ══════════════════════════════════════════════════════════════════
// MAIN APP ENTRY
// ══════════════════════════════════════════════════════════════════

window.autoSyncSchedules = async function() {
  if (CONFIG.DEMO_MODE) return;
  if (localStorage.getItem('synced_schedules_mark_v1')) return;
  const user = Auth.getCurrentUser();
  if (user.role !== 'admin') return;

  showLoading();
  const msg = document.createElement('div');
  msg.style.cssText = "position:fixed;bottom:20px;left:20px;background:#ea580c;color:#fff;padding:12px 24px;border-radius:12px;z-index:9999;font-weight:700;box-shadow:0 4px 12px rgba(234,88,12,0.3);";
  msg.id = 'syncMsg';
  document.body.appendChild(msg);

  const schedules = CONFIG.DEFAULT_SCHEDULES;
  let total = 0;
  for (let t in schedules) total += Object.keys(schedules[t]).length;
  let done = 0;

  for (const traineeId of ['diane', 'mark', 'jairuz']) {
    for (const [date, val] of Object.entries(schedules[traineeId])) {
      msg.innerText = `🔄 系統正在為您自動上傳新版行事曆到資料庫... (${done}/${total})`;
      try {
        await Api.updateSchedule(traineeId, date, val.dept, val.objective);
      } catch(e) {}
      done++;
    }
  }
  localStorage.setItem('synced_schedules_mark_v1', 'true');
  msg.innerText = '✅ 行事曆自動上傳完成！請重新整理網頁！';
  setTimeout(() => msg.remove(), 6000);
  hideLoading();
  location.reload();
};

async function enterApp() {
  await window.autoSyncSchedules();
  const user = Auth.getCurrentUser();

  // For trainees, always view their own data
  if (user.role === 'trainee') {
    state.selectedTraineeId = user.id;
  }

  $('loginScreen').style.display = 'none';
  $('mainApp').style.display     = 'flex';

  updateTopBar(user);
  updateSidebarProfile(user);
  translateSidebar();
  applyTheme();

  // Show demo mode banner if applicable
  if (CONFIG.DEMO_MODE) {
    $('demoBanner').style.display = 'flex';
  }

  // Everyone lands on the dashboard schedule by default
  state.activeTab = 'dashboard';

  setupMainEventListeners();
  await loadAllData();
  switchTab(state.activeTab, false);
}

// ── Top bar ───────────────────────────────────────────────────────
function updateTopBar(user) {
  $('currentUserAvatar').textContent = user.avatar;
  $('currentUserName').textContent   = user.name;

  // Show/hide nav items based on role
  const isTrainee   = user.role === 'trainee';
  const isMentor    = user.role === 'admin';
  const isGuest     = user.role === 'guest';
  const isExecutive = user.role === 'executive';

  $('liDashboard').style.display  = 'block'; // Show dashboard schedule to all roles
  $('liForm').style.display       = isTrainee ? 'block' : 'none';
  $('liMilestones').style.display = (isTrainee || isMentor || isExecutive) ? 'block' : 'none';
  $('liReview').style.display     = (isMentor || isGuest || isExecutive) ? 'block' : 'none';
  $('liAnalytics').style.display  = (isMentor || isGuest || isExecutive) ? 'block' : 'none';
}

// ── Sidebar profile ───────────────────────────────────────────────
function updateSidebarProfile(user) {
  $('sidebarAvatar').textContent = user.avatar;
  $('sidebarName').textContent   = user.name;
  $('sidebarBio').textContent    = user.bio;

  const roleLabels = {
    admin:     t('roleMentorName'),
    trainee:   t('roleTraineeName'),
    guest:     t('roleAssessorName'),
    executive: t('roleExecutiveName')
  };
  $('sidebarRole').textContent = roleLabels[user.role] || user.role;
}

// ══════════════════════════════════════════════════════════════════
// THEME & LANGUAGE
// ══════════════════════════════════════════════════════════════════

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.activeTheme);
  const icon = $('themeToggle') && $('themeToggle').querySelector('i');
  if (icon) icon.className = state.activeTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function toggleTheme() {
  state.activeTheme = state.activeTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vimei_theme', state.activeTheme);
  applyTheme();
}

function translateSidebar() {
  const map = {
    'navDashboard': 'tabDashboard',
    'navForm':      'tabForm',
    'navMilestones':'tabMilestones',
    'navReview':    'tabReview',
    'navAnalytics': 'tabAnalytics'
  };
  for (const [id, key] of Object.entries(map)) {
    const el = $(id);
    if (el) {
      const span = el.querySelector('span');
      if (span) span.textContent = t(key);
    }
  }
}

function changeLanguage(lang) {
  state.activeLanguage = lang;
  window._appLang = lang;
  localStorage.setItem('vimei_lang', lang);
  translateSidebar();
  renderCurrentTab();
  updateSidebarProfile(Auth.getCurrentUser());
}

// ══════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════

function switchTab(tabName, reload = true) {
  state.activeTab = tabName;

  document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
  const activeNav = $('li' + cap(tabName));
  if (activeNav) activeNav.classList.add('active');

  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  const sec = $('section' + cap(tabName));
  if (sec) sec.classList.add('active');

  // Close mobile sidebar
  document.querySelector('.sidebar').classList.remove('mobile-open');
  document.querySelector('.sidebar-overlay').classList.remove('active');

  if (reload) renderCurrentTab();
}

function renderCurrentTab() {
  if      (state.activeTab === 'dashboard')  renderDashboard();
  else if (state.activeTab === 'form')       renderForm();
  else if (state.activeTab === 'milestones') renderMilestones();
  else if (state.activeTab === 'review')     renderReview();
  else if (state.activeTab === 'analytics')  renderAnalytics();
}

// ══════════════════════════════════════════════════════════════════
// DATA LOADING
// ══════════════════════════════════════════════════════════════════

async function loadAllData() {
  showLoading();
  try {
    const user = Auth.getCurrentUser();

    if (user.role === 'trainee') {
      const [obs, sched, asm] = await Promise.all([
        Api.getObservationsForTrainee(user.id),
        Api.getScheduleForTrainee(user.id),
        Api.getAssessments()
      ]);
      state.observations = obs;
      state.schedules = { [user.id]: sched };
      state.assessments = asm;
    } else {
      const [obs, sched, asm] = await Promise.all([
        Api.getAllObservations(),
        Api.getAllSchedules(),
        Api.getAssessments()
      ]);
      state.observations = obs;
      state.schedules = sched;
      state.assessments = asm;
    }
  } catch (err) {
    console.error('Data load error:', err);
    showToast('Error loading data. Check console.', 'error');
  } finally {
    hideLoading();
    renderCurrentTab();
  }
}

function showLoading() { $('loadingOverlay').style.display = 'flex'; }
function hideLoading()  { $('loadingOverlay').style.display = 'none'; }

// ══════════════════════════════════════════════════════════════════
// 1. DASHBOARD
// ══════════════════════════════════════════════════════════════════

function getWeekDays(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const temp = new Date(monday);
    temp.setDate(monday.getDate() + i);
    const yyyy = temp.getFullYear();
    const mm = String(temp.getMonth() + 1).padStart(2, '0');
    const dd = String(temp.getDate()).padStart(2, '0');
    week.push(`${yyyy}-${mm}-${dd}`);
  }
  return week;
}


function getCalendarMonthDays(dateStr) {
  const targetDate = new Date(dateStr);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  let dayOfWeek = firstDayOfMonth.getDay(); 
  
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = new Date(year, month, 1 + diff);
  
  const days = [];
  for (let i = 0; i < 42; i++) {
    const temp = new Date(startDate);
    temp.setDate(startDate.getDate() + i);
    const yyyy = temp.getFullYear();
    const mm = String(temp.getMonth() + 1).padStart(2, '0');
    const dd = String(temp.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

window.toggleCalendarView = function(view) {
  state.calendarView = view;
  renderDashboard();
};

window.navigateCalendar = function(direction) {
  const d = new Date(state.viewDate || state.selectedDate);
  if (state.calendarView === 'month') {
    d.setMonth(d.getMonth() + direction);
  } else {
    d.setDate(d.getDate() + (direction * 7));
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  state.viewDate = `${yyyy}-${mm}-${dd}`;
  renderDashboard();
};

function renderDashboard() {
  const user    = Auth.getCurrentUser();
  const container = $('sectionDashboard');

  if (!state.viewDate) state.viewDate = state.selectedDate;
  const isMonthView = state.calendarView === 'month';
  const targetDateStr = state.viewDate;
  const targetDateObj = new Date(targetDateStr);

  // Trainee selector (admin only)
  let traineeSelectorHtml = '';
  if (user.role === 'admin' || user.role === 'guest' || user.role === 'executive') {
    traineeSelectorHtml = `
      <div class="glass-card">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">${t('viewingTrainee')}</p>
        <div class="trainee-tabs">
          ${CONFIG.TRAINEES.map(tr => `
            <button class="trainee-tab-btn ${state.selectedTraineeId === tr.id ? 'active' : ''}"
              onclick="window.selectViewTrainee('${tr.id}')">
              ${tr.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const viewId  = user.role === 'trainee' ? user.id : state.selectedTraineeId;
  const viewUser = CONFIG.TRAINEES.find(t => t.id === viewId) || CONFIG.ADMIN;
  const sched   = (state.schedules[viewId]) || {};

  const days = isMonthView ? getCalendarMonthDays(targetDateStr) : getWeekDays(targetDateStr);
  const dayNames = {
    en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    zh: ['週一','週二','週三','週四','週五','週六','週日']
  }[state.activeLanguage] || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const calHeaders = dayNames.map((d, index) => {
    const isWeekend = index === 5 || index === 6 ? 'weekend' : '';
    return `<div class="cal-head-day ${isWeekend}">${d}</div>`;
  }).join('');

  const calCells = days.map((day, index) => {
    const entry  = sched[day];
    const dept   = entry && CONFIG.DEPARTMENTS[entry.dept];
    const active = state.selectedDate === day ? 'active' : '';
    const dayOfWeek = index % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 ? 'weekend' : '';
    
    const parsedDate = new Date(day);
    const isOutOfMonth = isMonthView && parsedDate.getMonth() !== targetDateObj.getMonth() ? 'out-of-month' : '';
    
    const dateNum = parsedDate.getDate();
    let dateStr = `${dateNum}`;
    
    if (!isMonthView) {
        const monthName = parsedDate.toLocaleString(state.activeLanguage === 'zh' ? 'zh-TW' : 'en-US', { month: 'short' });
        dateStr = state.activeLanguage === 'zh' ? `${monthName}${dateNum}日` : `${dateNum} ${monthName}`;
    } else if (dateNum === 1) {
        const monthName = parsedDate.toLocaleString(state.activeLanguage === 'zh' ? 'zh-TW' : 'en-US', { month: 'short' });
        dateStr = state.activeLanguage === 'zh' ? `${monthName}${dateNum}日` : `${dateNum} ${monthName}`;
    }

    let cellContent = `<span class="cal-date">${dateStr}</span>`;
    
    if (dept) {
        if (isMonthView) {
            cellContent += `<div class="cal-dot-container">
                              <span class="cal-dot" style="background:${dept.color}" title="${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}"></span>
                            </div>`;
        } else {
            cellContent += `<span class="cal-dept-tag" style="background:${dept.color}">${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}</span>`;
        }
    }
    
    return `
      <div class="cal-cell ${isMonthView ? 'month-cell' : 'week-cell'} ${active} ${isWeekend} ${isOutOfMonth}" onclick="window.selectCalDate('${day}')">
        ${cellContent}
      </div>
    `;
  }).join('');

  const monthTitleName = targetDateObj.toLocaleString(state.activeLanguage === 'zh' ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' });
  const weekTitleName = state.activeLanguage === 'zh' ? `排程 - ${monthTitleName}` : `Schedule - ${monthTitleName}`;
  const calTitle = isMonthView ? monthTitleName : weekTitleName;
  
  const calToggleHtml = `
    <div class="calendar-controls">
        <div class="calendar-nav">
            <button class="calendar-nav-btn" onclick="window.navigateCalendar(-1)"><i class="fas fa-chevron-left"></i></button>
            <div class="calendar-title">${calTitle}</div>
            <button class="calendar-nav-btn" onclick="window.navigateCalendar(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-toggle">
            <button class="cal-toggle-btn ${isMonthView ? 'active' : ''}" onclick="window.toggleCalendarView('month')">${state.activeLanguage === 'zh' ? '月曆' : 'Month'}</button>
            <button class="cal-toggle-btn ${!isMonthView ? 'active' : ''}" onclick="window.toggleCalendarView('week')">${state.activeLanguage === 'zh' ? '週曆' : 'Week'}</button>
        </div>
    </div>
  `;

  const selectedEntry = sched[state.selectedDate];
  const selectedDept  = (selectedEntry && CONFIG.DEPARTMENTS[selectedEntry.dept]) || { name: 'Unknown', nameZh: '未指定', icon: '', color: '#888' };

  // ── Inline schedule edit form ──
  const deptDropdown = Object.values(CONFIG.DEPARTMENTS).map(d =>
    `<option value="${d.id}" ${selectedEntry && selectedEntry.dept === d.id ? 'selected' : ''}>${d.nameZh} / ${d.name}</option>`
  ).join('');

  const inlineEditForm = `
    <div class="schedule-edit-form">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <strong style="font-size:14px;">${state.selectedDate} ${state.activeLanguage === 'zh' ? '排程設定' : 'Schedule Setting'}</strong>
      </div>
      <div class="form-group">
        <label>${state.activeLanguage === 'zh' ? '輪調部門' : 'Department'}</label>
        <select class="form-control" id="editDept">${deptDropdown}</select>
      </div>
      <div class="form-group">
        <label>${state.activeLanguage === 'zh' ? '學習目標' : 'Learning Objective'}</label>
        <textarea class="form-control" id="editObjective" rows="3"
          placeholder="${state.activeLanguage === 'zh' ? '輸入今日學習目標...' : "Enter today's learning objective..."}">${selectedEntry ? selectedEntry.objective : ''}</textarea>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="window.saveSchedule('${viewId}','${state.selectedDate}')">
          ${state.activeLanguage === 'zh' ? '儲存' : 'Save'}
        </button>
        <button class="btn btn-outline btn-sm" onclick="window.cancelEditSchedule()">
          ${state.activeLanguage === 'zh' ? '取消' : 'Cancel'}
        </button>
      </div>
    </div>
  `;

  const detailHtml = state.editingSchedule && user.role === 'admin'
    ? inlineEditForm
    : selectedEntry ? `
    <div class="schedule-detail">
      <div class="sched-content" style="flex:1;">
        <h4>${t('rotationDept')}: ${state.activeLanguage === 'zh' ? selectedDept.nameZh : selectedDept.name}</h4>
        <p>${selectedEntry.objective}</p>
      </div>
      ${user.role === 'admin' ? `<button class="btn btn-outline btn-sm" onclick="window.openEditSchedule()">${state.activeLanguage === 'zh' ? '編輯' : 'Edit'}</button>` : ''}
    </div>
  ` : `
    <div class="schedule-detail">
      <div class="sched-content" style="flex:1;"><h4>${t('rotationDept')}</h4><p>${t('noSchedule')}</p></div>
      ${user.role === 'admin' ? `<button class="btn btn-primary btn-sm" onclick="window.openEditSchedule()">${t('addScheduleBtn')}</button>` : ''}
    </div>
  `;

  const overallPct = calcOverallProgress(viewId);

  container.innerHTML = `
    ${traineeSelectorHtml}
    
    <div class="glass-card" style="width:100%;margin-bottom:20px;">
      <div class="card-header" style="flex-direction: column; align-items: stretch; gap: 12px; margin-bottom: 16px; border-bottom: none; padding-bottom: 0;">
        ${calToggleHtml}
      </div>
      
      <div class="calendar-view">
        <div class="calendar-header">${calHeaders}</div>
        <div class="calendar-body">${calCells}</div>
      </div>
      
      ${detailHtml}
    </div>

    <!-- Progress Card -->
    <div class="glass-card" style="width:100%;">
      <div class="card-header">
        <h3>${t('milestoneProgress')}</h3>
        <span style="font-size:18px;font-weight:700;color:var(--primary);">${overallPct}%</span>
      </div>
      <div class="progress-row">
        ${Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday').map(d => {
          const pct = calculateMilestoneProgress(state.observations, viewId, d.id);
          const assessment = (state.assessments || []).find(a => a.traineeId === viewId && a.department === d.id);
          const hasAssessment = !!assessment;
          let barColor = pct === 100 ? d.color : 'var(--primary)';
          let extraBadge = '';
          
          if (hasAssessment) {
            barColor = 'var(--warning)'; 
            extraBadge = `<span style="font-size:10px;background:rgba(245,158,11,0.15);color:var(--warning);padding:2px 6px;border-radius:4px;margin-left:6px;border:1px solid rgba(245,158,11,0.3);">${t('lblAssessGrade')}: ${assessment.grade}</span>`;
          }

          return `
            <div style="margin-bottom:12px;">
              <div class="progress-label">
                <span>${state.activeLanguage === 'zh' ? d.nameZh : d.name} ${extraBadge}</span>
                <span style="color:var(--text-secondary);">${pct}%</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${barColor};"></div></div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderAnalytics() {
  const container = $('sectionAnalytics');
  if (!container) return;

  const trainees = CONFIG.TRAINEES;
  const depts = Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday');

  // 1. KPI Calculations
  const totalObs = state.observations.length;
  
  const reviewedObs = state.observations.filter(o => o.rating > 0);
  const avgRating = reviewedObs.length > 0 
    ? (reviewedObs.reduce((sum, o) => sum + o.rating, 0) / reviewedObs.length).toFixed(1) 
    : '0.0';

  let totalProgressSum = 0;
  trainees.forEach(t => {
    totalProgressSum += calcOverallProgress(t.id);
  });
  const programProgress = trainees.length > 0 ? Math.round(totalProgressSum / trainees.length) : 0;

  // 2. Trainee Leaderboard Rows
  const leaderboardRows = trainees.map(tr => {
    const progress = calcOverallProgress(tr.id);
    const traineeObs = state.observations.filter(o => o.traineeId === tr.id);
    const ratedObs = traineeObs.filter(o => o.rating > 0);
    const trAvgRating = ratedObs.length > 0 
      ? (ratedObs.reduce((sum, o) => sum + o.rating, 0) / ratedObs.length).toFixed(1) 
      : '0.0';

    // Department completion detailed badges
    const deptBadges = depts.map(d => {
      const pct = calculateMilestoneProgress(state.observations, tr.id, d.id);
      const assessment = (state.assessments || []).find(a => a.traineeId === tr.id && a.department === d.id);
      
      const deptName = state.activeLanguage === 'zh' ? (d.shortZh || d.nameZh) : (d.shortEn || d.name);
      let badgeStyle = `background:rgba(255,255,255,0.03);color:var(--text-muted);`;
      let text = `${deptName}: ${pct}%`;
      if (assessment) {
        text = `${deptName}: ${pct}% (${assessment.grade})`;
        badgeStyle = `background:rgba(234,88,12,0.12);color:var(--primary);border:1px solid rgba(234,88,12,0.25);font-weight:700;`;
      } else if (pct === 100) {
        badgeStyle = `background:${d.color}20;color:${d.color};border:1px solid ${d.color}40;`;
      } else if (pct > 0) {
        badgeStyle = `background:rgba(249,115,22,0.1);color:#f97316;border:1px solid rgba(249,115,22,0.2);`;
      }
      return `<span class="analytics-dept-badge" style="${badgeStyle}" title="${state.activeLanguage === 'zh' ? d.nameZh : d.name}: ${pct}%${assessment ? ' - ' + t('lblAssessGrade') + ': ' + assessment.grade : ''}">${text}</span>`;
    }).join(' ');

    return `
      <tr>
        <td><strong>${tr.name}</strong></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="progress-bar" style="width:80px;height:8px;margin-bottom:0;"><div class="progress-fill" style="width:${progress}%;"></div></div>
            <strong>${progress}%</strong>
          </div>
        </td>
        <td><strong style="color:var(--warning);">${trAvgRating}</strong></td>
        <td>${traineeObs.length}</td>
        <td><div style="display:flex;flex-wrap:wrap;gap:6px;">${deptBadges}</div></td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="glass-card">
      <div class="card-header" style="justify-content:space-between;flex-wrap:wrap;gap:14px;">
        <div>
          <h3>${t('analyticsTitle')}</h3>
          <p style="color:var(--text-secondary);font-size:12px;margin-top:4px;">${t('analyticsSubTitle')}</p>
        </div>
        <div class="btn-export-group">
          <button class="btn btn-export" onclick="exportTraineeSummary()">${t('btnExportSummary')}</button>
          <button class="btn btn-export btn-export-secondary" onclick="exportObservationLogs()">${t('btnExportLogs')}</button>
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid-3" style="margin-top:20px;">
      <div class="analytics-metric-card">
        <span class="analytics-metric-label">${t('kpiTotalSubmissions')}</span>
        <div class="analytics-metric-value">${totalObs}</div>
      </div>
      <div class="analytics-metric-card">
        <span class="analytics-metric-label">${t('kpiAvgRating')}</span>
        <div class="analytics-metric-value" style="color:var(--warning);">${avgRating}</div>
      </div>
      <div class="analytics-metric-card">
        <span class="analytics-metric-label">${t('kpiProgramProgress')}</span>
        <div class="analytics-metric-value" style="color:#10b981;">${programProgress}%</div>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="glass-card" style="margin-top:20px;">
      <div class="table-responsive">
        <table class="analytics-table">
          <thead>
            <tr>
              <th>${t('tblHeaderName')}</th>
              <th>${t('tblHeaderProgress')}</th>
              <th>${t('tblHeaderAvgRating')}</th>
              <th>${t('tblHeaderSubmissions')}</th>
              <th>${t('rotationDept')}</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboardRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function downloadCSV(csvContent, fileName) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.exportTraineeSummary = function() {
  const trainees = CONFIG.TRAINEES;
  const depts = Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday');
  
  // CSV Headers
  let csv = "Trainee Name,Milestone Completion %,Average Star Rating,Total Logs Submitted";
  depts.forEach(d => {
    csv += `,${d.name} Progress %,${d.name} Grade`;
  });
  csv += "\n";

  // Data rows
  trainees.forEach(tr => {
    const progress = calcOverallProgress(tr.id);
    const traineeObs = state.observations.filter(o => o.traineeId === tr.id);
    const ratedObs = traineeObs.filter(o => o.rating > 0);
    const trAvgRating = ratedObs.length > 0 
      ? (ratedObs.reduce((sum, o) => sum + o.rating, 0) / ratedObs.length).toFixed(1) 
      : '0.0';
    
    csv += `"${tr.name}",${progress}%,${trAvgRating},${traineeObs.length}`;
    
    depts.forEach(d => {
      const pct = calculateMilestoneProgress(state.observations, tr.id, d.id);
      const assessment = (state.assessments || []).find(a => a.traineeId === tr.id && a.department === d.id);
      const gradeStr = assessment ? assessment.grade : 'N/A';
      csv += `,${pct}%,${gradeStr}`;
    });
    csv += "\n";
  });

  downloadCSV(csv, "Trainee_Summary_Report.csv");
  showToast("Summary CSV Downloaded Successfully!", "success");
};

window.exportObservationLogs = function() {
  const obsList = state.observations;
  
  let csv = "Observation ID,Trainee ID,Trainee Name,Date,Department Key,Department Name,Key Observation,Actionable Idea,Photo/Report URL,Submitted At,Status,Mentor Name,Mentor Feedback,Feedback At,Performance Rating\n";

  obsList.forEach(obs => {
    const dept = CONFIG.DEPARTMENTS[obs.department] || {};
    const deptName = dept.name || obs.department;
    
    // Clean strings of double quotes and line breaks
    const cleanStr = str => {
      if (!str) return '';
      return str.replace(/"/g, '""').replace(/\n/g, ' ');
    };

    csv += `"${cleanStr(obs.id)}",` +
           `"${cleanStr(obs.traineeId)}",` +
           `"${cleanStr(obs.traineeName)}",` +
           `"${cleanStr(obs.date)}",` +
           `"${cleanStr(obs.department)}",` +
           `"${cleanStr(deptName)}",` +
           `"${cleanStr(obs.keyObservation)}",` +
           `"${cleanStr(obs.actionableIdea)}",` +
           `"${cleanStr(obs.attachmentUrl)}",` +
           `"${cleanStr(obs.submittedAt)}",` +
           `"${cleanStr(obs.status)}",` +
           `"${cleanStr(obs.mentorName)}",` +
           `"${cleanStr(obs.mentorComment)}",` +
           `"${cleanStr(obs.feedbackAt)}",` +
           `${obs.rating || 0}\n`;
  });

  downloadCSV(csv, "Trainee_Field_Observation_Logs.csv");
  showToast("Observations CSV Downloaded Successfully!", "success");
};
