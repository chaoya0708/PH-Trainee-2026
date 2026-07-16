/**
 * VIMEI Knowledge Tracker - Core Application Logic v2
 * ====================================================
 * Roles: admin | trainee | guest
 * Data:  api.js (demo localStorage or live Google Sheets)
 * Auth:  auth.js (PIN-based, sessionStorage)
 * i18n:  i18n.js (en / zh / tg)
 */

// ── State ──────────────────────────────────────────────────────────
const todayObj = new Date();
const todayStr = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0');

const state = {
  activeTab:          'dashboard',
  activeLanguage:     ['en', 'zh'].includes(localStorage.getItem('vimei_lang')) ? localStorage.getItem('vimei_lang') : 'en',
  activeTheme:        localStorage.getItem('vimei_theme') || 'light',
  selectedTraineeId:  'diane',
  selectedDate:       todayStr,
  viewDate:           todayStr,
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
  return; // DISABLED: Data is already in Google Sheets
  if (CONFIG.DEMO_MODE) return;
  if (localStorage.getItem('synced_schedules_jairuz_v1')) return;
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
  localStorage.setItem('synced_schedules_jairuz_v1', 'true');
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
    
    // Stop at 5 weeks (35 days) if the entire 6th week is in the next month
    if (i === 35 && temp.getMonth() !== month) {
      break;
    }
    
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
  const isMonthView = state.calendarView === 'month';
  const targetDateObj = new Date(state.viewDate);
  if (isMonthView) {
    targetDateObj.setMonth(targetDateObj.getMonth() + direction);
  } else {
    targetDateObj.setDate(targetDateObj.getDate() + (direction * 7));
  }
  const yyyy = targetDateObj.getFullYear();
  const mm = String(targetDateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDateObj.getDate()).padStart(2, '0');
  state.viewDate = `${yyyy}-${mm}-${dd}`;
  renderDashboard();
};

window.selectViewTrainee = function(traineeId) {
  state.selectedTraineeId = traineeId;
  renderAll(); // Re-render the whole view since we're switching global trainee
};

window.selectCalDate = function(dateStr) {
  state.selectedDate = dateStr;
  renderDashboard();
};

window.openEditSchedule = function() {
  state.editingSchedule = true;
  renderDashboard();
};

window.cancelEditSchedule = function() {
  state.editingSchedule = false;
  renderDashboard();
};

window.saveSchedule = async function(traineeId, dateStr) {
  const dept = document.getElementById('editDept').value;
  const objective = document.getElementById('editObj').value;
  
  showLoading();
  try {
    await Api.updateSchedule(traineeId, dateStr, dept, objective);
    if (!state.schedules[traineeId]) state.schedules[traineeId] = {};
    state.schedules[traineeId][dateStr] = { dept, objective };
    state.editingSchedule = false;
    renderDashboard();
  } catch (err) {
    alert(t('submitError') || 'Submit Error');
  } finally {
    hideLoading();
  }
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

    let cellContent = isOutOfMonth ? '' : `<span class="cal-date">${dateStr}</span>`;
    
    if (dept) {
        cellContent += `<span class="cal-dept-tag" style="background:${dept.color}">${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}</span>`;
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
        <div style="font-size:12px; font-weight:700; color:var(--primary); margin-bottom:8px;">
          ${state.selectedDate}
        </div>
        <h4>${t('rotationDept')}: ${state.activeLanguage === 'zh' ? selectedDept.nameZh : selectedDept.name}</h4>
        <p>${selectedEntry.objective}</p>
      </div>
      ${user.role === 'admin' ? `<button class="btn btn-outline btn-sm" onclick="window.openEditSchedule()">${state.activeLanguage === 'zh' ? '編輯' : 'Edit'}</button>` : ''}
    </div>
  ` : `
    <div class="schedule-detail">
      <div class="sched-content" style="flex:1;">
        <div style="font-size:12px; font-weight:700; color:var(--primary); margin-bottom:8px;">
          ${state.selectedDate}
        </div>
        <h4>${t('rotationDept')}</h4><p>${t('noSchedule')}</p>
      </div>
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

function setupMainEventListeners() {
  // Nav links
  [['navDashboard','dashboard'],['navForm','form'],['navMilestones','milestones'],['navReview','review'],['navAnalytics','analytics']]
    .forEach(([id, tab]) => {
      const el = $(id);
      if (el) el.addEventListener('click', e => { e.preventDefault(); switchTab(tab); });
    });

  // Language
  const langSel = $('langSelector');
  if (langSel) langSel.addEventListener('change', e => changeLanguage(e.target.value));

  // Theme
  const themeBtn = $('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Logout
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    Auth.logout();
    location.reload();
  });

  // Mobile sidebar
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar      = document.querySelector('.sidebar');
  const overlay      = document.querySelector('.sidebar-overlay');
  if (mobileToggle) mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  });
  if (overlay) overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  // Set lang selector to current language
  if (langSel) langSel.value = state.activeLanguage;
}

function calcOverallProgress(traineeId) {
  const depts = Object.keys(CONFIG.DEPARTMENTS);
  const sum = depts.reduce((acc, d) =>
    acc + calculateMilestoneProgress(state.observations, traineeId, d), 0);
  return Math.round(sum / depts.length);
}

function renderMilestones() {
  const user      = Auth.getCurrentUser();
  const container = $('sectionMilestones');

  let selectorHtml = '';
  if (user.role === 'admin' || user.role === 'executive') {
    selectorHtml = `
      <div class="glass-card">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">${t('viewingTrainee')}</p>
        <div class="trainee-tabs">
          ${CONFIG.TRAINEES.map(tr => `
            <button class="trainee-tab-btn ${state.selectedTraineeId === tr.id ? 'active' : ''}"
              onclick="window.selectViewTrainee('${tr.id}'); window.renderMilestonesView();">
              ${tr.avatar ? tr.avatar + ' ' : ''}${tr.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const viewId  = user.role === 'trainee' ? user.id : state.selectedTraineeId;
  const overall = calcOverallProgress(viewId);

    const chartsToRender = [];

    const deptCards = Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday').map(dept => {
      const pct   = calculateMilestoneProgress(state.observations, viewId, dept.id);
      const deptObs = state.observations.filter(o => o.traineeId === viewId && o.department === dept.id);
      const c1 = deptObs.length > 0;
      const c2 = deptObs.some(o => o.rating > 0);
      const c3 = deptObs.some(o => o.rating >= 3);
      const c4 = deptObs.some(o => o.rating >= 4 && o.status === 'reviewed');

      const ci = (done, label) => `
        <li class="criteria-item ${done ? 'done' : ''}">
          <i class="${done ? 'fas fa-check-circle' : 'far fa-circle'}" style="font-size:11px;"></i>
          ${label}
        </li>`;

      const assessment = (state.assessments || []).find(a => a.traineeId === viewId && a.department === dept.id);
      let assessmentHtml = '';
      if (assessment) {
        const chartId = 'radar-' + dept.id;
        chartsToRender.push({
          id: chartId,
          data: [assessment.competency1, assessment.competency2, assessment.competency3, assessment.competency4, assessment.competency5 || 3],
          labels: [
            t('lblCompetency1').split(' ')[0], 
            t('lblCompetency2').split(' ')[0], 
            t('lblCompetency3').split(' ')[0], 
            t('lblCompetency4').split(' ')[0], 
            t('lblCompetency5').split(' ')[0]
          ],
          color: dept.color
        });

        assessmentHtml = `
          <div class="assessment-card" style="margin-top:14px;padding:12px;background:rgba(234,88,12,0.04);border:1px solid rgba(234,88,12,0.15);border-radius:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--primary);letter-spacing:0.5px;">${t('lblAssessGrade')}</span>
              <span class="badge" style="background:var(--primary);color:#fff;font-weight:800;font-size:12px;padding:3px 8px;border-radius:6px;">${assessment.grade}</span>
            </div>
            
            <div style="margin-bottom:12px;">
              <canvas id="${chartId}" style="width:100%;max-height:180px;"></canvas>
            </div>
            
            <div style="font-size:11px;line-height:1.4;border-top:1px dashed var(--card-border);padding-top:8px;">
              <p style="font-style:italic;color:var(--text-primary);">${assessment.comments}</p>
              <p style="font-size:9px;color:var(--text-muted);text-align:right;margin-top:6px;">— ${t('lblAssessedBy')}: ${assessment.assessor}</p>
            </div>
          </div>
        `;
      } else {
        assessmentHtml = `
          <div class="assessment-card" style="margin-top:14px;padding:8px 12px;background:rgba(0,0,0,0.02);border:1px dashed var(--card-border);border-radius:10px;text-align:center;font-size:11px;color:var(--text-muted);">
            ${t('lblAwaitingAssessment')}
          </div>
        `;
      }

      return `
        <div class="dept-milestone-card">
          <div class="dept-milestone-header">
            <div class="dept-milestone-title" style="color:${dept.color}">${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}</div>
            <span class="dept-milestone-pct">${pct}%</span>
          </div>
          <div class="progress-bar" style="height:6px;"><div class="progress-fill" style="width:${pct}%;background:${dept.color};"></div></div>
          <ul class="criteria-list">
            ${ci(c1, t('criteria1'))}
            ${ci(c2, t('criteria2'))}
            ${ci(c3, t('criteria3'))}
            ${ci(c4, t('criteria4'))}
          </ul>
          ${assessmentHtml}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${selectorHtml}
      <div class="glass-card">
        <div class="card-header">
          <h3>${t('milestoneTitle')}</h3>
          <span style="font-size:22px;font-weight:800;color:var(--primary);">${overall}%</span>
        </div>
        <div class="progress-bar" style="height:18px;margin-bottom:14px;">
          <div class="progress-fill" style="width:${overall}%;"></div>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">${t('milestoneSubTitle')}</p>
      </div>
      <div class="grid-4">${deptCards}</div>
    `;

    // Render charts
    chartsToRender.forEach(chartConfig => {
      const ctx = document.getElementById(chartConfig.id);
      if (ctx) {
        new Chart(ctx, {
          type: 'radar',
          data: {
            labels: chartConfig.labels,
            datasets: [{
              label: 'Score',
              data: chartConfig.data,
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              borderColor: '#f97316',
              pointBackgroundColor: '#ea580c',
              borderWidth: 1.5,
              pointRadius: 2
            }]
          },
          options: {
            scales: {
              r: {
                min: 0,
                max: 5,
                ticks: { display: false, stepSize: 1 },
                pointLabels: { font: { size: 9 }, color: '#94a3b8' },
                grid: { color: 'rgba(0,0,0,0.05)' },
                angleLines: { color: 'rgba(0,0,0,0.05)' }
              }
            },
            plugins: {
              legend: { display: false }
            },
            maintainAspectRatio: false
          }
        });
      }
    });
}

window.renderMilestonesView = renderMilestones;

// ══════════════════════════════════════════════════════════════════
// 4. REVIEW & FEEDBACK
// ══════════════════════════════════════════════════════════════════

let _filterTrainee = 'all';
let _filterDept    = 'all';

function renderReview() {
  const user      = Auth.getCurrentUser();
  const container = $('sectionReview');

  // Filter controls
  let filterHtml = `<div class="glass-card"><div class="filter-bar">`;

  if (user.role === 'admin') {
    // Trainee filter
    const traineeOpts = `<option value="all">${t('allTrainees')}</option>` +
      CONFIG.TRAINEES.map(tr => `<option value="${tr.id}" ${_filterTrainee === tr.id ? 'selected' : ''}>${tr.name}</option>`).join('');
    filterHtml += `
      <label>${t('filterLabel')}</label>
      <select class="form-control" style="width:auto;" onchange="window.setFilterTrainee(this.value)">${traineeOpts}</select>
    `;
  }

  // Dept filter
  const deptOpts = `<option value="all">${t('allDepts')}</option>` +
    Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday').map(d =>
      `<option value="${d.id}" ${_filterDept === d.id ? 'selected' : ''}>${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
    ).join('');
  filterHtml += `
      <select class="form-control" style="width:auto;" onchange="window.setFilterDept(this.value)">${deptOpts}</select>
    </div></div>`;

  // Filter observations
  let obs = [...state.observations].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  if (_filterTrainee !== 'all') obs = obs.filter(o => o.traineeId === _filterTrainee);
  if (_filterDept    !== 'all') obs = obs.filter(o => o.department === _filterDept);

  let feedHtml = obs.length === 0
    ? `<div class="glass-card" style="text-align:center;padding:40px;color:var(--text-secondary);">
        ${t('noObservations')}
       </div>`
    : obs.map(o => buildFeedItem(o, user)).join('');

  let assessFormHtml = '';
  if (user.role === 'admin' || user.role === 'guest') {
    const traineeAssessOpts = CONFIG.TRAINEES.map(tr => `<option value="${tr.id}">${tr.name}</option>`).join('');
    const deptAssessOpts = Object.values(CONFIG.DEPARTMENTS).filter(d => d.id !== 'holiday').map(d =>
      `<option value="${d.id}">${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
    ).join('');

    assessFormHtml = `
      <div class="glass-card" style="margin-top:20px;margin-bottom:20px;">
        <div class="card-header" style="border-bottom:1px solid var(--card-border);padding-bottom:12px;margin-bottom:16px;">
          <h3 style="font-size:16px;font-family:var(--font-title);">${t('assessSectionTitle')}</h3>
          <p style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${t('assessSectionDesc')}</p>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>${t('lblTraineeToAssess')}</label>
            <select class="form-control" id="assessTraineeId">${traineeAssessOpts}</select>
          </div>
          <div class="form-group">
            <label>${t('lblDeptToAssess')}</label>
            <select class="form-control" id="assessDept">${deptAssessOpts}</select>
          </div>
        </div>
        <div class="grid-2" style="margin-top:10px;">
          <div class="form-group">
            <label>${t('lblGrade')}</label>
            <select class="form-control" id="assessGrade">
              <option value="A+">A+ (9 - 10分 / 卓越 Excellent)</option>
              <option value="A" selected>A (8 - 8.9分 / 優良 Good)</option>
              <option value="B">B (7 - 7.9分 / 甲等 Satisfactory)</option>
              <option value="C">C (6 - 6.9分 / 合格 Pass)</option>
              <option value="D">D (6分以下 / 不合格 Needs Improvement)</option>
            </select>
          </div>
          <div class="form-group">
            <!-- Space align -->
          </div>
        </div>
        
        <div style="margin-top:14px;background:rgba(255,255,255,0.02);padding:14px;border-radius:12px;border:1px solid var(--card-border);">
          <h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;letter-spacing:0.5px;">核心能力評估 / Core Competencies</h4>
          <div class="grid-2" style="gap:14px 20px;">
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency1')}</label>
              <div class="rating-stars" id="assessStars-comp1" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fas fa-star active' : 'far fa-star'}" onclick="window.setAssessRating('comp1',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency2')}</label>
              <div class="rating-stars" id="assessStars-comp2" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fas fa-star active' : 'far fa-star'}" onclick="window.setAssessRating('comp2',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency3')}</label>
              <div class="rating-stars" id="assessStars-comp3" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fas fa-star active' : 'far fa-star'}" onclick="window.setAssessRating('comp3',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency4')}</label>
              <div class="rating-stars" id="assessStars-comp4" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fas fa-star active' : 'far fa-star'}" onclick="window.setAssessRating('comp4',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency5')}</label>
              <div class="rating-stars" id="assessStars-comp5" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fas fa-star active' : 'far fa-star'}" onclick="window.setAssessRating('comp5',${n})"></i>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top:14px;">
          <label>${t('lblAssessComments')}</label>
          <textarea class="form-control" id="assessComments" rows="3" placeholder="請輸入本輪調站別之考核總評語... / Enter overall assessment comments..."></textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:14px;">
          <button class="btn btn-primary" onclick="window.submitStationAssessment()">${t('btnSubmitAssess')}</button>
        </div>
      </div>
    `;
  }


  container.innerHTML = `
    <div class="card-header" style="margin:0 0 4px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('reviewTitle')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${t('reviewSubTitle')}</p></div>
    </div>
    ${filterHtml}
    ${assessFormHtml}
    <div class="feed">${feedHtml}</div>
  `;
}

window.setAssessRating = function(compKey, stars) {
  if (!state.pendingAssessRatings) {
    state.pendingAssessRatings = { comp1: 3, comp2: 3, comp3: 3, comp4: 3, comp5: 3 };
  }
  state.pendingAssessRatings[compKey] = stars;
  const container = $('assessStars-' + compKey);
  if (!container) return;
  container.querySelectorAll('i').forEach((el, i) => {
    el.className = i < stars ? 'fas fa-star active' : 'far fa-star';
  });
};

window.submitStationAssessment = async function() {
  const traineeId = $('assessTraineeId').value;
  const dept = $('assessDept').value;
  const grade = $('assessGrade').value;
  const comments = $('assessComments').value;

  const ratings = state.pendingAssessRatings || { comp1: 3, comp2: 3, comp3: 3, comp4: 3, comp5: 3 };
  const comp1 = ratings.comp1 || 3;
  const comp2 = ratings.comp2 || 3;
  const comp3 = ratings.comp3 || 3;
  const comp4 = ratings.comp4 || 3;
  const comp5 = ratings.comp5 || 3;

  const user = Auth.getCurrentUser();
  const assessor = user.name;

  if (!comments.trim()) {
    showToast('請輸入考核總評語 / Please enter overall assessment comments.', 'error');
    return;
  }

  showLoading();
  try {
    const res = await Api.submitAssessment(traineeId, dept, grade, comp1, comp2, comp3, comp4, comp5, comments, assessor);
    if (res.success) {
      showToast(t('assessSuccess'), 'success');
      $('assessComments').value = '';
      state.assessments = await Api.getAssessments();
      renderReview();
    } else {
      showToast('Submit failed.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

function buildFeedItem(obs, user) {
  const traineeConf = CONFIG.TRAINEES.find(t => t.id === obs.traineeId) || {};
  const dept        = CONFIG.DEPARTMENTS[obs.department] || {};
  const isReviewed  = obs.status === 'reviewed';
  const badge       = isReviewed
    ? `<span class="badge badge-reviewed">✓ ${t('statusReviewed')}</span>`
    : `<span class="badge badge-pending">⏳ ${t('statusPending')}</span>`;

  // Existing mentor feedback block
  let feedbackBlock = '';
  if (obs.mentorComment) {
    const stars = '★'.repeat(obs.rating) + '☆'.repeat(5 - obs.rating);
    feedbackBlock = `
      <div class="comment-bubble">
        <div class="comment-bubble-header">
          <span>👑 ${obs.mentorName}</span>
          <span class="comment-bubble-time">${obs.feedbackAt}</span>
        </div>
        <div style="color:var(--secondary);margin-bottom:3px;">${stars}</div>
        <p class="comment-bubble-text">${obs.mentorComment}</p>
      </div>
    `;
  }

  // Guest comments block
  let guestBlock = '';
  if (obs.guestComments && obs.guestComments.length > 0) {
    guestBlock = `
      <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:6px;">${t('guestNotesTitle')}</p>
      ${obs.guestComments.map(g => `
        <div class="comment-bubble guest-bubble">
          <div class="comment-bubble-header"><span>👀 Guest</span><span class="comment-bubble-time">${g.submittedAt}</span></div>
          <p class="comment-bubble-text">${g.comment}</p>
        </div>
      `).join('')}
    `;
  }

  // Action area
  let actionHtml = '';

  if (user.role === 'admin' && !isReviewed) {
    actionHtml = `
      <div class="review-box">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${t('submitFeedbackBtn')}</p>
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-secondary);">${t('ratingLabel')}</label>
          <div class="rating-stars" id="stars-${obs.id}">
            ${[1,2,3,4,5].map(n => `<i class="far fa-star" onclick="window.setRating('${obs.id}',${n})"></i>`).join('')}
          </div>
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <textarea class="form-control" id="feedback-${obs.id}" rows="2" placeholder="${t('feedbackLabel')}..."></textarea>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.submitFeedback('${obs.id}')">
          ${t('submitFeedbackBtn')}
        </button>
      </div>
    `;
  }

  if (user.role === 'guest') {
    actionHtml = `
      <div class="review-box">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${t('guestCommentLabel')}</p>
        <div class="form-group" style="margin-bottom:8px;">
          <textarea class="form-control" id="gcomment-${obs.id}" rows="2" placeholder="${t('phGuestComment')}"></textarea>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.submitGuestComment('${obs.id}')">
          ${t('submitGuestBtn')}
        </button>
      </div>
    `;
  }

  return `
    <div class="feed-item">
      <div class="feed-header">
        <div class="feed-trainee">
          <div class="user-avatar">${traineeConf.avatar || '👤'}</div>
          <div class="feed-trainee-meta">
            <h4>${obs.traineeName}</h4>
            <p>${obs.date} · <span style="color:${dept.color}">${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}</span></p>
          </div>
        </div>
        ${badge}
      </div>

      <div style="margin-bottom:12px;">
        <div class="obs-block"><h5>${t('lblKeyObs')}</h5><p>${obs.keyObservation}</p></div>
      </div>

      ${obs.attachmentUrl ? `
        <div class="obs-block">
          <img src="${obs.attachmentUrl}" class="obs-photo" alt="Attachment" onerror="this.style.display='none'">
        </div>` : ''}

      ${feedbackBlock}
      ${guestBlock}
      ${actionHtml}
    </div>
  `;
}

window.setFilterTrainee = function(val) { _filterTrainee = val; renderReview(); };
window.setFilterDept    = function(val) { _filterDept    = val; renderReview(); };

window.setRating = function(obsId, stars) {
  state.pendingRatings[obsId] = stars;
  const container = $('stars-' + obsId);
  if (!container) return;
  container.querySelectorAll('i').forEach((el, i) => {
    el.className = i < stars ? 'fas fa-star active' : 'far fa-star';
  });
};

window.submitFeedback = async function(obsId) {
  const rating  = state.pendingRatings[obsId] || 0;
  const comment = ($('feedback-' + obsId) || {}).value || '';
  if (!rating) { showToast(t('ratingRequired'), 'error'); return; }

  const user = Auth.getCurrentUser();
  showLoading();
  try {
    await Api.submitFeedback(obsId, comment, user.name, rating);
    state.observations = await Api.getAllObservations();
    showToast(t('feedbackSuccess'), 'success');
    renderReview();
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.submitGuestComment = async function(obsId) {
  const comment = ($('gcomment-' + obsId) || {}).value?.trim();
  if (!comment) return;

  showLoading();
  try {
    await Api.submitGuestComment(obsId, comment);
    state.observations = await Api.getAllObservations();
    showToast(t('guestSuccess'), 'success');
    renderReview();
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

// ══════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════════════════════════

function setupMainEventListeners() {
  // Nav links
  [['navDashboard','dashboard'],['navForm','form'],['navMilestones','milestones'],['navReview','review'],['navAnalytics','analytics']]
    .forEach(([id, tab]) => {
      const el = $(id);
      if (el) el.addEventListener('click', e => { e.preventDefault(); switchTab(tab); });
    });

  // Language
  const langSel = $('langSelector');
  if (langSel) langSel.addEventListener('change', e => changeLanguage(e.target.value));

  // Theme
  const themeBtn = $('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Logout
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    Auth.logout();
    location.reload();
  });

  // Mobile sidebar
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar      = document.querySelector('.sidebar');
  const overlay      = document.querySelector('.sidebar-overlay');
  if (mobileToggle) mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  });
  if (overlay) overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  // Set lang selector to current language
  if (langSel) langSel.value = state.activeLanguage;
}

// ══════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════

let _toastTimer;
function showToast(message, type = 'primary') {
  const el = $('toastNotification');
  if (!el) return;
  el.querySelector('.toast-text').textContent = message;
  el.className = 'toast' + (type === 'success' ? ' toast-success' : '');
  el.querySelector('i').className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── Utilities ──────────────────────────────────────────────────────
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ══════════════════════════════════════════════════════════════════
// 5. ANALYTICS & EXPORTS
// ══════════════════════════════════════════════════════════════════

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
