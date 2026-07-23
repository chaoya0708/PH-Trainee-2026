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
  sloganEl.innerHTML = "Observe with Curiosity, Grow with Initiative.";
}

// ── Init ───────────────────────────────────────────────────────────
window.initApp = async function() {
  await Auth.init();
};

window.addEventListener('DOMContentLoaded', initApp);

// Multi-file Upload List Renderers
window.updateObsFileList = function() {
  const input = document.getElementById('obsPhoto');
  const list = document.getElementById('obsFileList');
  if(!input || !list) return;
  list.innerHTML = '';
  Array.from(input.files).forEach((file, index) => {
    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    list.innerHTML += `
      <div style="display:flex; align-items:center; padding:10px 12px; background:var(--bg-body); border-radius:8px; border:1px solid var(--border-color); gap:12px;">
        <i class="fi fi-rr-document" style="color:var(--primary); font-size:18px;"></i>
        <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; color:var(--text-primary); font-weight:500;">
          ${file.name}
        </div>
        <div style="font-size:11px; color:var(--text-muted); background:var(--bg-card); padding:2px 6px; border-radius:4px;">
          ${sizeMb} MB
        </div>
      </div>
    `;
  });
};

window.updateAssessFileList = function() {
  const input = document.getElementById('assessFile');
  const list = document.getElementById('assessFileList');
  if(!input || !list) return;
  list.innerHTML = '';
  Array.from(input.files).forEach((file, index) => {
    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    list.innerHTML += `
      <div style="display:flex; align-items:center; padding:10px 12px; background:var(--bg-body); border-radius:8px; border:1px solid var(--border-color); gap:12px;">
        <i class="fi fi-rr-document" style="color:var(--primary); font-size:18px;"></i>
        <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; color:var(--text-primary); font-weight:500;">
          ${file.name}
        </div>
        <div style="font-size:11px; color:var(--text-muted); background:var(--bg-card); padding:2px 6px; border-radius:4px;">
          ${sizeMb} MB
        </div>
      </div>
    `;
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  window._appLang = state.activeLanguage || localStorage.getItem('vimei_lang') || 'en';
  state.activeLanguage = window._appLang;
  applyTheme();
  translateDOM();

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

    // Populate department select for guest
    if ($('guestDeptSelect')) {
      $('guestDeptSelect').innerHTML = Object.values(CONFIG.DEPARTMENTS)
        .filter(d => !d.isRecordOnly)
        .map(d => `<option value="${d.id}">${state.activeLanguage === 'zh' ? (d.nameZh || d.name) : d.name}</option>`)
        .join('');
    }

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
  let identifier = _loginTraineeId || _loginRole; // default

  if (_loginRole === 'admin') {
    credential = $('adminPinInput').value;
    errorEl    = $('loginError1');
  } else if (_loginRole === 'trainee') {
    credential = $('traineePinInput').value;
    errorEl    = $('loginError2');
  } else if (_loginRole === 'guest') {
    credential = $('guestCodeInput').value.trim();
    errorEl    = $('loginError3');
    identifier = $('guestDeptSelect').value; // Use department as identifier for guest
  } else if (_loginRole === 'executive') {
    credential = $('executiveCodeInput').value.trim();
    errorEl    = $('loginError4');
  }

  const ok = Auth.login(_loginRole, identifier, credential);

  if (ok) {
    // Set default language based on role on initial login
    const targetLang = (_loginRole === 'trainee') ? 'en' : 'zh';
    localStorage.setItem('vimei_lang', targetLang);
    window.location.reload();
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
  if (localStorage.getItem('synced_schedules_v2')) return;
  const user = Auth.getCurrentUser();
  if (user.role !== 'admin' && user.role !== 'executive') return;

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

  document.documentElement.lang = state.activeLanguage === 'zh' ? 'zh-TW' : 'en';
  if ($('langSelector')) $('langSelector').value = state.activeLanguage;
  
  translateDOM();

  // For trainees, always view their own data
  if (user.role === 'trainee') {
    state.selectedTraineeId = user.id;
    if ($('liReview')) $('liReview').style.display = 'none';
    if ($('liForm')) $('liForm').style.display = 'flex';
  } else {
    if ($('liForm')) $('liForm').style.display = 'none';
    if ($('liReview')) $('liReview').style.display = 'flex';
  }

  $('loginScreen').style.display = 'none';
  $('mainApp').style.display     = 'flex';

  updateTopBar(user);
  updateSidebarProfile(user);
  translateSidebar();
  applyTheme();

  // Show demo mode banner if applicable
  // Show demo mode banner if applicable
  if (CONFIG.DEMO_MODE) {
    $('demoBanner').style.display = 'flex';
  }

  updateGlobalReminder();

  // Everyone lands on the dashboard schedule by default
  state.activeTab = 'dashboard';

  setupMainEventListeners();
  await loadAllData();
  switchTab(state.activeTab, false);
}

// ── Top bar ───────────────────────────────────────────────────────
function updateTopBar(user) {
  $('currentUserAvatar').innerHTML = user.avatar || '<i class="fi fi-rr-user"></i>';
  $('currentUserName').textContent   = user.name;

  // Show/hide nav items based on role
  const isTrainee   = user.role === 'trainee';
  const isMentor    = user.role === 'admin';
  const isGuest     = user.role === 'guest';
  const isExecutive = user.role === 'executive';

  $('liDashboard').style.display  = 'block'; // Show dashboard schedule to all roles
  $('liForm').style.display       = isTrainee ? 'block' : 'none';
  $('liMilestones').style.display = (isTrainee || isMentor || isExecutive || isGuest) ? 'block' : 'none';
  $('liReview').style.display     = (isTrainee || isMentor || isGuest || isExecutive) ? 'block' : 'none';
  $('liAnalytics').style.display  = (isMentor || isGuest || isExecutive) ? 'block' : 'none';
}

// ── Sidebar profile ───────────────────────────────────────────────
function updateSidebarProfile(user) {
  $('sidebarAvatar').innerHTML = user.avatar || '<i class="fi fi-rr-user"></i>';
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
  if (icon) icon.className = state.activeTheme === 'light' ? 'fi fi-rr-moon' : 'fi fi-rr-sun';
}

function toggleTheme() {
  state.activeTheme = state.activeTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vimei_theme', state.activeTheme);
  applyTheme();
  if (state.activeTab) {
    switchTab(state.activeTab); // Re-render to update chart colors
  }
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

function updateGlobalReminder() {
  const banner = $('globalReminderBanner');
  if (!banner) return;
  const now = new Date();
  const taipeiStr = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  const taipeiNow = new Date(taipeiStr);
  const day = taipeiNow.getDay(); 
  
  let daysToAdd = 0;
  if (day === 3) {
    daysToAdd = 0;
  } else if (day < 3) {
    daysToAdd = 3 - day;
  } else {
    daysToAdd = 10 - day;
  }

  taipeiNow.setDate(taipeiNow.getDate() + daysToAdd);
  const nextWedStrZh = ` ${taipeiNow.getMonth() + 1}/${taipeiNow.getDate()}(三)`;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const nextWedStrEn = ` ${monthNames[taipeiNow.getMonth()]} ${taipeiNow.getDate()} (Wed)`;
  
  if (state.activeLanguage === 'zh') {
    banner.innerHTML = `⚠️ 提醒：請於台北時間每週三 11:59 PM 前繳交前一週的學習心得，逾期將被標記為遲交。`;
  } else {
    banner.innerHTML = `⚠️ Reminder: Please submit last week's journal by every Wednesday 11:59 PM (Taipei Time). Late submissions will be flagged.`;
  }
}

function changeLanguage(lang) {
  localStorage.setItem('vimei_lang', lang);
  window.location.reload();
}

function translateDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.placeholder) el.placeholder = t(key);
    } else {
      // Keep inner HTML structure if any (e.g. icons), by replacing text nodes safely?
      // For simplicity, directly set innerHTML.
      el.innerHTML = t(key);
    }
  });
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
  
  // Auto-jump to the trainee's next available schedule
  if (state.activeTab === 'dashboard' && state.schedules && state.schedules[traineeId]) {
    const dates = Object.keys(state.schedules[traineeId]).sort();
    if (dates.length > 0) {
      let nextDate = dates.find(d => d >= (state.selectedDate || state.viewDate));
      if (!nextDate) nextDate = dates[0];
      state.selectedDate = nextDate;
      state.viewDate = nextDate;
    }
  }

  renderCurrentTab(); // Re-render the whole view since we're switching global trainee
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

  // Pulse Check UI (Only for trainee themselves)
  let pulseCheckHtml = '';
  if (user.role === 'trainee') {
    const currentStatus = localStorage.getItem(`MA_STATUS_${user.id}`) || 'green';
    pulseCheckHtml = `
      <div class="glass-card" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--text-secondary); text-transform: uppercase;">${state.activeLanguage === 'zh' ? '本週脈搏打卡 (Weekly Pulse Check)' : 'Weekly Pulse Check'}</h3>
        <div style="display: flex; gap: 10px;">
          <button class="btn ${currentStatus === 'green' ? 'btn-primary' : 'btn-outline'}" onclick="window.setPulseCheck('green')" style="flex:1;">🟢 ${state.activeLanguage === 'zh' ? '順利推進' : 'On Track'}</button>
          <button class="btn ${currentStatus === 'yellow' ? 'btn-primary' : 'btn-outline'}" onclick="window.setPulseCheck('yellow')" style="flex:1;">🟡 ${state.activeLanguage === 'zh' ? '遇到瓶頸' : 'Facing Blocks'}</button>
          <button class="btn ${currentStatus === 'red' ? 'btn-primary' : 'btn-outline'}" onclick="window.setPulseCheck('red')" style="flex:1;">🔴 ${state.activeLanguage === 'zh' ? '需要協助' : 'Need Help'}</button>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:12px;line-height:1.6;background:rgba(255,255,255,0.02);padding:10px;border-radius:8px;border:none;">
          ${state.activeLanguage === 'zh' 
            ? '💡 <b>為什麼要打卡？</b> 透過「敏捷脈搏打卡 (Agile Pulse Check)」，能幫助導師更即時掌握您的學習狀況。建議您於<b>每週五下班前</b>點擊上方燈號，誠實反應當下狀態。若亮起黃燈或紅燈，導師將能及時為您排除困難！' 
            : '💡 <b>Why do a Pulse Check?</b> The Agile Pulse Check helps your mentor understand your learning progress. We recommend updating your status <b>every Friday before logging off</b>. This check-in allows your mentor to provide timely support if you face any roadblocks!'}
        </div>
      </div>
    `;
  }

  // IDP Checklist UI
  let idpHtml = '';
  if (user.role === 'trainee' || user.role === 'admin' || user.role === 'executive') {
    let idpGoals = [];
    try { idpGoals = JSON.parse(localStorage.getItem(`MA_IDP_${viewId}`)) || []; } catch(e) {}
    
    idpHtml = `
      <div class="glass-card" style="width:100%; margin-top:20px;">
        <div class="card-header" style="justify-content: space-between;">
          <h3>${state.activeLanguage === 'zh' ? 'IDP 個人發展目標 (Individual Development Plan)' : 'Individual Development Plan (IDP)'}</h3>
          ${user.role === 'trainee' ? `<button class="btn btn-primary btn-sm" onclick="window.addIdpGoal()">+ ${state.activeLanguage === 'zh' ? '新增目標' : 'Add Goal'}</button>` : ''}
        </div>
        <ul style="list-style: none; padding: 0; margin-top: 10px;">
          ${idpGoals.length === 0 ? `<li style="color:var(--text-muted); font-size:14px; padding:10px 0;">${state.activeLanguage === 'zh' ? '尚未設定發展目標...' : 'No goals set...'}</li>` : idpGoals.map((g, i) => `
            <li style="display:flex; align-items:center; gap:10px; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
              <input type="checkbox" ${g.done ? 'checked' : ''} ${user.role !== 'trainee' ? 'disabled' : `onchange="window.toggleIdpGoal(${i})"`} style="width:18px;height:18px;accent-color:var(--primary);">
              <span style="flex:1; font-size:14px; ${g.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${g.text}</span>
              ${user.role === 'trainee' ? `<button class="btn btn-outline btn-sm" style="padding: 2px 8px; border:none; color:var(--text-muted);" onclick="window.deleteIdpGoal(${i})"><i class="fi fi-rs-trash"></i></button>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }


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
            <button class="calendar-nav-btn" onclick="window.navigateCalendar(-1)"><i class="fi fi-rr-angle-left"></i></button>
            <div class="calendar-title">${calTitle}</div>
            <button class="calendar-nav-btn" onclick="window.navigateCalendar(1)"><i class="fi fi-rr-angle-right"></i></button>
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
    ${pulseCheckHtml}
    
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
        ${(function(){
          const traineeObj = CONFIG.TRAINEES.find(t => t.id === viewId);
          const excluded = traineeObj ? (traineeObj.excludedDepartments || []) : [];
          return Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly && !excluded.includes(d.id)).map(d => {
            const pct = calculateMilestoneProgress(state.observations, viewId, d.id);
          const assessment = (state.assessments || []).find(a => a.traineeId === viewId && a.department === d.id);
          const hasAssessment = !!assessment;
          let barColor = pct === 100 ? d.color : 'var(--primary)';
          let extraBadge = '';
          
          if (hasAssessment) {
            barColor = 'var(--warning)'; 
            extraBadge = `<span style="font-size:10px;background:rgba(245,158,11,0.15);color:var(--warning);padding:2px 6px;border-radius:4px;margin-left:6px;border:none;">${t('lblAssessGrade')}: ${assessment.grade}</span>`;
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
          }).join('');
        })()}
      </div>
    </div>
    
    ${idpHtml}
  `;
}

window.setPulseCheck = function(status) {
  const user = Auth.getCurrentUser();
  if(user.role !== 'trainee') return;
  localStorage.setItem(`MA_STATUS_${user.id}`, status);
  renderDashboard();
};

window.addIdpGoal = function() {
  const user = Auth.getCurrentUser();
  if(user.role !== 'trainee') return;
  const goal = prompt(state.activeLanguage === 'zh' ? '請輸入新的學習目標：' : 'Enter new learning goal:');
  if(goal && goal.trim()){
    let goals = [];
    try { goals = JSON.parse(localStorage.getItem(`MA_IDP_${user.id}`)) || []; } catch(e) {}
    goals.push({ text: goal.trim(), done: false });
    localStorage.setItem(`MA_IDP_${user.id}`, JSON.stringify(goals));
    renderDashboard();
  }
};

window.toggleIdpGoal = function(index) {
  const user = Auth.getCurrentUser();
  if(user.role !== 'trainee') return;
  let goals = [];
  try { goals = JSON.parse(localStorage.getItem(`MA_IDP_${user.id}`)) || []; } catch(e) {}
  if(goals[index]) {
    goals[index].done = !goals[index].done;
    localStorage.setItem(`MA_IDP_${user.id}`, JSON.stringify(goals));
    renderDashboard();
  }
};

window.deleteIdpGoal = function(index) {
  const user = Auth.getCurrentUser();
  if(user.role !== 'trainee') return;
  if(confirm(state.activeLanguage === 'zh' ? '確定要刪除這個目標嗎？' : 'Delete this goal?')) {
    let goals = [];
    try { goals = JSON.parse(localStorage.getItem(`MA_IDP_${user.id}`)) || []; } catch(e) {}
    goals.splice(index, 1);
    localStorage.setItem(`MA_IDP_${user.id}`, JSON.stringify(goals));
    renderDashboard();
  }
};

function renderAnalytics() {
  const container = $('sectionAnalytics');
  if (!container) return;

  const user = Auth.getCurrentUser();
  const isGuest = user.role === 'guest';
  const trainees = CONFIG.TRAINEES;
  let depts = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly);
  
  // Restrict guest visibility to their own department
  if (isGuest) {
    depts = depts.filter(d => d.id === user.departmentId);
  }

  // 1. KPI Calculations
  let totalObs = 0;
  let reviewedObs = [];
  
  if (isGuest) {
    const guestObs = state.observations.filter(o => o.department === user.departmentId);
    totalObs = guestObs.length;
    reviewedObs = guestObs.filter(o => o.rating > 0);
  } else {
    totalObs = state.observations.length;
    reviewedObs = state.observations.filter(o => o.rating > 0);
  }

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
    let traineeObs = state.observations.filter(o => o.traineeId === tr.id);
    if (isGuest) traineeObs = traineeObs.filter(o => o.department === user.departmentId);
    
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

    const currentStatus = localStorage.getItem(`MA_STATUS_${tr.id}`) || 'green';
    const statusEmoji = currentStatus === 'green' ? '🟢' : currentStatus === 'yellow' ? '🟡' : '🔴';

    return `
      <tr>
        <td><strong>${tr.name}</strong> <span style="font-size:12px;" title="Pulse Check">${statusEmoji}</span></td>
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
        ${!isGuest ? `
        <div class="btn-export-group">
          <button class="btn btn-export" onclick="exportTraineeSummary()">${t('btnExportSummary')}</button>
          <button class="btn btn-export btn-export-secondary" onclick="exportObservationLogs()">${t('btnExportLogs')}</button>
        </div>` : ''}
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
  const depts = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly);
  
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
           `"${cleanStr(formatTaipeiDateOnly(obs.date))}",` +
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

  // Quick switch account (Admin Only or God Mode)
  window.logoutAndSwitch = function(event, forceGodMode = false) {
    const user = Auth.getCurrentUser();
    
    // If not God Mode and not Admin, do nothing
    if (!forceGodMode && (!user || user.role !== 'admin')) return;

    // If mobile and clicking the avatar, do not show switcher
    // (Only allow title click to show switcher on mobile)
    if (!forceGodMode && window.innerWidth <= 768) {
      return;
    }

    let existing = document.getElementById('fastSwitchPopup');
    if (existing) {
      existing.remove();
      return;
    }

    const popup = document.createElement('div');
    popup.id = 'fastSwitchPopup';
    popup.style.position = 'absolute';
    popup.style.background = 'var(--bg-card)';
    popup.style.border = '1px solid var(--border-color)';
    popup.style.borderRadius = '8px';
    popup.style.padding = '8px';
    popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.gap = '4px';
    popup.style.minWidth = '160px';

    const options = [
      { r: 'admin', i: 'admin', l: '👑 Mentor (Admin)' },
      { r: 'executive', i: 'executive', l: '🏢 Management' },
      { r: 'guest', i: 'cmf_production_rende', l: '👥 Guest' },
      { r: 'trainee', i: 'diane', l: '🎓 Diane' },
      { r: 'trainee', i: 'mark', l: '🎓 Mark' },
      { r: 'trainee', i: 'jairuz', l: '🎓 Jairuz' }
    ];

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = opt.l;
      btn.style.textAlign = 'left';
      btn.style.width = '100%';
      btn.style.justifyContent = 'flex-start';
      btn.onclick = () => {
        Auth.login(opt.r, opt.i, '0000');
        const targetLang = (opt.r === 'trainee') ? 'en' : 'zh';
        localStorage.setItem('vimei_lang', targetLang);
        location.reload();
      };
      popup.appendChild(btn);
    });

    document.body.appendChild(popup);
    
    // Position
    const rect = (event && event.currentTarget) ? event.currentTarget.getBoundingClientRect() : null;
    if (rect) {
      if (rect.top > window.innerHeight / 2) {
         popup.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
         popup.style.left = rect.left + 'px';
      } else {
         popup.style.top = (rect.bottom + 8) + 'px';
         popup.style.right = (window.innerWidth - rect.right) + 'px';
      }
    } else {
      popup.style.top = '60px';
      popup.style.left = '60px';
    }

    setTimeout(() => {
       document.addEventListener('click', function closePopup(e) {
         if (popup && document.body.contains(popup) && !popup.contains(e.target)) {
           popup.remove();
           document.removeEventListener('click', closePopup);
         }
       });
    }, 50);
  };

  // Secret God Mode Trigger
  let godModeClicks = 0;
  let godModeTimer;
  const godModeHandler = (e) => {
    godModeClicks++;
    clearTimeout(godModeTimer);
    if (godModeClicks >= 3) {
      godModeClicks = 0;
      const pin = prompt("Enter Master Pin");
      if (pin === "0000") {
        window.logoutAndSwitch(e, true);
      }
    } else {
      godModeTimer = setTimeout(() => godModeClicks = 0, 500);
    }
  };

  // Attach ONLY to page title for safer tapping
  const title = document.querySelector('.page-title');
  if (title) {
    title.style.cursor = 'pointer';
    title.addEventListener('click', godModeHandler);
  }

  window.fastSwitchRole = function(role, id) {
    Auth.login(role, id, '0000');
    location.reload();
  };

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
// 2. OBSERVATION FORM
// ══════════════════════════════════════════════════════════════════

function renderForm() {
  const user      = Auth.getCurrentUser();
  if (user.role !== 'trainee') return;

  const container = $('sectionForm');
  const sched     = (state.schedules[user.id] || {})[state.selectedDate];
  const presetDept = sched ? sched.dept : 'yushan_prep';
  
  const traineeUser = Auth.getCurrentUser();
  const excludedDepts = traineeUser && traineeUser.excludedDepartments ? traineeUser.excludedDepartments : [];

  const deptOptions = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly && !excludedDepts.includes(d.id)).map(d =>
    `<option value="${d.id}" ${d.id === presetDept ? 'selected' : ''}>${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
  ).join('');

  const now = new Date();
  const taipeiStr = now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  const taipeiNow = new Date(taipeiStr);
  const day = taipeiNow.getDay(); 
  
  let daysToAdd = 0;
  if (day === 3) {
    daysToAdd = 0;
  } else if (day < 3) {
    daysToAdd = 3 - day;
  } else {
    daysToAdd = 10 - day;
  }

  taipeiNow.setDate(taipeiNow.getDate() + daysToAdd);
  const nextWedStr = `${taipeiNow.getMonth() + 1}/${taipeiNow.getDate()}`;

  const reminderZh = `⚠️ 提醒：請於(${nextWedStr}) 11:59 PM 前繳交前一週的學習心得，逾期將被標記為遲交。`;
  const reminderEn = `⚠️ Reminder: Please submit last week's journal by (${nextWedStr}) 11:59 PM. Late submissions will be flagged.`;
  const bannerText = state.activeLanguage === 'zh' ? reminderZh : reminderEn;

  container.innerHTML = `
    <div class="glass-card">
      <div class="card-header">
        <h3>${t('formTitle')}</h3>
      </div>
      <p style="color:var(--text-secondary);font-size:13px;margin-bottom:18px;">${t('formSubTitle')}</p>
      <div class="alert-info" style="background:#fff3cd; color:#856404; border:none; margin-bottom:15px; border-radius:12px; padding:12px;">
        <span style="font-weight:600;">${bannerText}</span>
      </div>
      <div class="alert-info"><span>${t('privateNotice')}</span></div>

      <form id="obsForm" onsubmit="window.submitObsForm(event)">
        <div class="form-group">
          <label>${t('lblDept')}</label>
          <select class="form-control" id="obsDept" required>${deptOptions}</select>
        </div>

        <div class="form-group">
          <label style="margin-bottom:0;">${t('lblKeyObs')}</label>
          <div id="obsKeyEditor" style="height:200px; background:var(--bg-card); border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;"></div>
        </div>

        <div class="form-group">
          <label>${state.activeLanguage === 'zh' ? '學習心得附件 (可選，支援多檔，單檔請小於20MB)' : 'Journal Attachment (Optional, Multi-file, <20MB)'}</label>
          <div id="obsFileDropZone" class="file-drop-zone" onclick="document.getElementById('obsPhoto').click()" ondragover="event.preventDefault(); this.style.borderColor='var(--primary)'; this.style.background='rgba(37,99,235,0.05)';" ondragleave="this.style.borderColor='var(--border-color)'; this.style.background='transparent';" ondrop="event.preventDefault(); this.style.borderColor='var(--border-color)'; this.style.background='transparent'; document.getElementById('obsPhoto').files = event.dataTransfer.files; window.updateObsFileList();" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s ease; margin-bottom: 8px;">
            <i class="fi fi-rr-cloud-upload" style="font-size:32px; color:var(--primary); margin-bottom:12px; display:block;"></i>
            <p style="margin:0; font-weight:600; color:var(--text-primary); font-size:14px;">${state.activeLanguage === 'zh' ? '點擊或拖曳多個檔案至此' : 'Click or Drag files here'}</p>
            <p style="margin:4px 0 0 0; font-size:12px; color:var(--text-muted);">${state.activeLanguage === 'zh' ? '支援多檔上傳 (建議 PDF)' : 'Supports multiple files (PDF recommended)'}</p>
          </div>
          <input type="file" multiple class="form-control" id="obsPhoto" style="display:none;" onchange="window.updateObsFileList()">
          <div id="obsFileList" style="display:flex; flex-direction:column; gap:8px;"></div>
          
          <div style="font-size:12px;color:#ea580c;font-weight:600;margin-top:12px;line-height:1.5;background:var(--bg-card);padding:12px;border-radius:6px;border:none;">
            ${state.activeLanguage === 'zh' 
              ? '⚠️ <b>上傳須知：</b><br>1. 建議將報告轉為 <b>PDF</b> 檔。<br>2. 檔案大小請控制在 20MB 以內。<br>3. 系統將自動把檔案上傳至中央資料夾。' 
              : '⚠️ <b>Upload Instructions:</b><br>1. PDF format is recommended.<br>2. File size must be under 20MB.<br>3. The file will be automatically uploaded to the central directory.'}
          </div>
        </div>

        <!-- 3. Self-Appraisal Feature -->
        <div class="form-group" style="background: var(--bg-card); padding: 16px; border-radius: 8px; border: none; margin-bottom: 20px;">
          <label style="font-size: 15px; color: var(--primary); margin-bottom: 8px;">${state.activeLanguage === 'zh' ? '本週表現自評 (Self-Appraisal)' : 'Self-Appraisal (Rating)'}</label>
          <div style="display:flex;gap:10px;" id="selfAppraisalStars">
            ${[1,2,3,4,5].map(v => `<i class="fi fi-rs-star star-btn" data-val="${v}" style="font-size:28px;cursor:pointer;color:#d1d5db;transition:all 0.2s;" onclick="window.setSelfRating(${v})"></i>`).join('')}
          </div>
          <input type="hidden" id="obsSelfRating" value="0">
          <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">
            ${state.activeLanguage === 'zh' ? '請為自己這週的表現打分數，幫助導師了解您的學習狀態。' : 'Rate your own performance this week to align with your mentor.'}
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px;">
          ${t('submitBtn')}
        </button>
      </form>
    </div>
  `;

  if (window.obsQuill) {
    window.obsQuill = null;
  }
  
  window.obsQuill = new Quill('#obsKeyEditor', {
    theme: 'snow',
    placeholder: t('phKeyObs'),
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }]
      ]
    }
  });
}

window.setSelfRating = function(val) {
  const ratingInput = document.getElementById('obsSelfRating');
  if(ratingInput) ratingInput.value = val;
  const stars = document.querySelectorAll('#selfAppraisalStars .star-btn');
  stars.forEach(s => {
    if (parseInt(s.dataset.val) <= val) {
      s.classList.remove('fi-rs-star');
      s.classList.add('fi-ss-star');
      s.style.color = '#f59e0b';
      s.style.transform = 'scale(1.1)';
    } else {
      s.classList.remove('fi-ss-star');
      s.classList.add('fi-rs-star');
      s.style.color = '#d1d5db';
      s.style.transform = 'scale(1)';
    }
  });
};

window.submitObsForm = async function(e) {
  e.preventDefault();
  const user = Auth.getCurrentUser();
  showLoading();
  
  try {
    let attachmentUrls = [];
    const fileInput = $('obsPhoto');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const FOLDER_ID = '1urhwEFrFRipQjP6Jd0LtR1VBRbs396UE';
        const uploadRes = await Api.uploadFile(base64, file.type, file.name, FOLDER_ID);
        if (uploadRes.success) {
          attachmentUrls.push(uploadRes.url);
        } else {
          throw new Error('File upload failed for ' + file.name);
        }
      }
    }
    const attachmentUrl = attachmentUrls.join(',');

    const nowIsoStr = new Date().toISOString();
    
    // If selectedDate exists, use it but append current time so we don't get 00:00
    let finalDate = nowIsoStr;
    if (state.selectedDate) {
      const now = new Date();
      finalDate = `${state.selectedDate}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}+08:00`;
    }

    const data = {
      traineeId:      user.id,
      traineeName:    user.name,
      date:           finalDate,
      department:     $('obsDept').value,
      keyObservation: window.obsQuill.root.innerHTML,
      actionableIdea: '',
      attachmentUrl:  attachmentUrl,
      selfRating:     parseInt($('obsSelfRating') ? $('obsSelfRating').value : 0, 10)
    };

    await Api.submitObservation(data);
    state.observations = await Api.getObservationsForTrainee(user.id);
    showToast(t('submitSuccess'), 'success');
    switchTab('dashboard');
  } catch(err) {
    showToast('Submit failed: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

// ══════════════════════════════════════════════════════════════════
// 3. MILESTONE TRACKER
// ══════════════════════════════════════════════════════════════════

function calcOverallProgress(traineeId) {
  const trainee = CONFIG.TRAINEES.find(t => t.id === traineeId);
  const excluded = trainee ? (trainee.excludedDepartments || []) : [];
  const depts = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly && !excluded.includes(d.id)).map(d => d.id);
  const sum = depts.reduce((acc, d) =>
    acc + calculateMilestoneProgress(state.observations, traineeId, d), 0);
  return Math.round(sum / depts.length);
}

function renderMilestones() {
  const user      = Auth.getCurrentUser();
  const container = $('sectionMilestones');

  let selectorHtml = '';
  if (user.role === 'admin' || user.role === 'executive' || user.role === 'guest') {
    selectorHtml = `
      <div class="glass-card">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">${t('viewingTrainee')}</p>
        <div class="trainee-tabs">
          ${CONFIG.TRAINEES.map(tr => `
            <button class="trainee-tab-btn ${state.selectedTraineeId === tr.id ? 'active' : ''}"
              onclick="window.selectViewTrainee('${tr.id}')">
              ${tr.avatar ? tr.avatar + ' ' : ''}${tr.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const viewId  = user.role === 'trainee' ? user.id : state.selectedTraineeId;
  const overall = calcOverallProgress(viewId);

  // Get Self Assessment for current month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentSelfEvalId = `self_eval_${currentMonthStr}`;
  const selfEval = (state.assessments || []).find(a => a.traineeId === viewId && a.department === currentSelfEvalId);

  let selfAssessmentHtml = '';
  if (user.role === 'trainee') {
    selfAssessmentHtml = `
      <div class="glass-card" style="margin-bottom: 20px;">
        <h3 style="font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:12px; display:flex; justify-content:space-between;">
          <span>${state.activeLanguage === 'zh' ? '🎯 自我能力覺察 (Self-Assessment)' : '🎯 Self-Assessment (Radar)'}</span>
          <button class="btn btn-primary btn-sm" onclick="window.saveSelfAssessment()">
            ${state.activeLanguage === 'zh' ? '儲存評估' : 'Save'}
          </button>
        </h3>
        <div style="background-color:rgba(16, 185, 129, 0.1); border-left:3px solid #10b981; padding:8px 12px; margin-bottom:12px; border-radius:4px; font-size:12px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
          <i class="fi fi-rr-bell-ring" style="color:#10b981;"></i>
          <span>${state.activeLanguage === 'zh' ? '<strong>溫馨提醒：</strong>請於「每個月的最後一週」完成本月份的自我覺察評分。' : '<strong>Reminder:</strong> Please complete your self-assessment during the last week of every month.'}</span>
        </div>
        <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
          ${state.activeLanguage === 'zh' ? '請為自己目前的五大核心職能進行評分 (0-5分)，此自評將與主管評分疊加，幫助您看見認知落差並促進反思。' : 'Please rate your core competencies (0-5). Your self-assessment will be overlaid with your supervisor\'s scores to visualize any perception gaps.'}
        </p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          ${[1,2,3,4,5].map(i => `
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:12px; width:100px; color:var(--text-primary);">${t('lblCompetency' + i).split(' ')[0]}</span>
              <input type="range" id="selfScoreC${i}" min="0" max="5" step="0.5" value="${selfEval ? (selfEval['competency' + i] || 3) : 0}" oninput="document.getElementById('selfScoreValC${i}').innerText = this.value" style="flex:1;">
              <span id="selfScoreValC${i}" style="font-size:12px; font-weight:bold; width:24px; text-align:right;">${selfEval ? (selfEval['competency' + i] || 3) : 0}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }


  // 計算所有已考評部門的核心職能平均分數 (Exclude self_eval)
  let sumC1 = 0, sumC2 = 0, sumC3 = 0, sumC4 = 0, sumC5 = 0;
  let count = 0;
  (state.assessments || []).forEach(a => {
    if (a.traineeId === viewId && a.department !== 'self_eval' && (user.role !== 'trainee' || a.visibleToTrainee)) {
      sumC1 += a.competency1; sumC2 += a.competency2; sumC3 += a.competency3;
      sumC4 += a.competency4; sumC5 += (a.competency5 || 3);
      count++;
    }
  });

  const chartsToRender = [];
  let trendLabels = [];
  let trendData = [];

  // 若有資料，則新增全域雷達圖設定與趨勢圖資料
  if (count > 0) {
    chartsToRender.push({
      id: 'globalRadarChart',
      data: [(sumC1/count).toFixed(1), (sumC2/count).toFixed(1), (sumC3/count).toFixed(1), (sumC4/count).toFixed(1), (sumC5/count).toFixed(1)],
      selfData: selfEval ? [selfEval.competency1, selfEval.competency2, selfEval.competency3, selfEval.competency4, selfEval.competency5 || 3] : null,
      labels: [
        t('lblCompetency1').split(' ')[0], 
        t('lblCompetency2').split(' ')[0], 
        t('lblCompetency3').split(' ')[0], 
        t('lblCompetency4').split(' ')[0], 
        t('lblCompetency5').split(' ')[0]
      ],
      color: '#0ea5e9' // 使用一個主色系
    });

    // 計算各站別平均成績供趨勢圖使用
    const sortedAssessments = (state.assessments || [])
      .filter(a => a.traineeId === viewId && a.department !== 'self_eval' && (user.role !== 'trainee' || a.visibleToTrainee))
      .sort((a, b) => new Date(a.assessedAt || 0) - new Date(b.assessedAt || 0));

    sortedAssessments.forEach(a => {
      const avg = (a.competency1 + a.competency2 + a.competency3 + a.competency4 + (a.competency5 || 3)) / 5;
      const deptName = state.activeLanguage === 'zh' ? CONFIG.DEPARTMENTS[a.department]?.nameZh : CONFIG.DEPARTMENTS[a.department]?.name;
      trendLabels.push(deptName || a.department);
      trendData.push(avg.toFixed(1));
    });
  }
  const traineeObj = CONFIG.TRAINEES.find(t => t.id === viewId);
  const excludedDepts = traineeObj ? (traineeObj.excludedDepartments || []) : [];

  const deptCards = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly && !excludedDepts.includes(d.id)).map(dept => {
      const pct   = calculateMilestoneProgress(state.observations, viewId, dept.id);
      const deptObs = state.observations.filter(o => o.traineeId === viewId && o.department === dept.id);
      const c1 = deptObs.length > 0;
      const c2 = deptObs.some(o => o.rating > 0);
      const c3 = deptObs.some(o => o.rating >= 3);
      const c4 = deptObs.some(o => o.rating >= 4 && o.status === 'reviewed');

      const ci = (done, label) => `
        <li class="criteria-item ${done ? 'done' : ''}">
          <i class="${done ? 'fi fi-rr-check-circle' : 'fi fi-rr-circle'}" style="font-size:11px;"></i>
          ${label}
        </li>`;

      const assessment = (state.assessments || []).find(a => a.traineeId === viewId && a.department === dept.id);
      let assessmentHtml = '';
      if (assessment) {
        if (user.role === 'trainee' && !assessment.visibleToTrainee) {
          assessmentHtml = `
            <div class="assessment-card" style="margin-top:14px;padding:8px 12px;background:rgba(0,0,0,0.02);border:none;border-radius:10px;text-align:center;font-size:11px;color:var(--text-muted);">
              ${state.activeLanguage === 'zh' ? '✅ 主管考核已送出 (不公開)' : '✅ Assessment Submitted (Private)'}
            </div>
          `;
        } else {
          const chartId = 'radar-' + dept.id;
          chartsToRender.push({
            id: chartId,
            data: [assessment.competency1, assessment.competency2, assessment.competency3, assessment.competency4, assessment.competency5 || 3],
            selfData: selfEval ? [selfEval.competency1, selfEval.competency2, selfEval.competency3, selfEval.competency4, selfEval.competency5 || 3] : null,
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
            <div class="assessment-card" style="margin-top:14px;padding:12px;background:rgba(234,88,12,0.04);border:none;border-radius:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--primary);letter-spacing:0.5px;">${t('lblAssessGrade')}</span>
                <span class="badge" style="background:var(--primary);color:#fff;font-weight:800;font-size:12px;padding:3px 8px;border-radius:6px;">${assessment.grade}</span>
              </div>
              
              <div style="margin-bottom:12px;">
                <canvas id="${chartId}" style="width:100%;max-height:280px;"></canvas>
              </div>
              
              <div style="font-size:13px;line-height:1.5;border-top:1px dashed var(--card-border);padding-top:10px;">
                <p style="font-style:italic;color:var(--text-primary);">${assessment.comments}</p>
                ${assessment.attachmentUrl ? `
                <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:8px;">
                  ${assessment.attachmentUrl.split(',').map((url, idx) => `
                    <a href="${url}" target="_blank" class="btn btn-secondary" style="font-size:14px; padding:8px 12px; display:inline-flex; align-items:center; gap:6px; background-color:var(--bg-highlight); color:var(--primary); font-weight:bold;">
                      <i class="fi fi-rr-clip"></i> ${state.activeLanguage === 'zh' ? '檢視附件' : 'View Attachment'} ${assessment.attachmentUrl.split(',').length > 1 ? idx + 1 : ''}
                    </a>
                  `).join('')}
                </div>
                ` : ''}
                <p style="font-size:11px;color:var(--text-muted);text-align:right;margin-top:6px;">— ${t('lblAssessedBy')}: ${assessment.assessor}</p>
              </div>
              
              ${(user.role === 'admin' || (user.role === 'guest' && user.departmentId === assessment.department)) ? `
              <div style="margin-top:10px;border-top:1px solid rgba(234,88,12,0.15);padding-top:10px;">
                ${user.role === 'admin' ? `
                <label style="font-size:11px;display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--text-secondary);margin-bottom:8px;">
                  <input type="checkbox" onchange="window.toggleAssessmentVisibility('${assessment.id}', this.checked)" ${assessment.visibleToTrainee ? 'checked' : ''} style="cursor:pointer;">
                  ${state.activeLanguage === 'zh' ? '允許學生查看此考核 (Allow Trainee to View)' : 'Allow Trainee to View'}
                </label>
                ` : ''}
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;" onclick="window.openEditAssessment('${assessment.id}')">✏️ Edit</button>
                  <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px; color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="window.deleteAssessment('${assessment.id}')">🗑️ Delete</button>
                </div>
              </div>
              ` : ''}
            </div>
          `;
        }
      } else {
        assessmentHtml = `
          <div class="assessment-card" style="margin-top:14px;padding:8px 12px;background:rgba(0,0,0,0.02);border:none;border-radius:10px;text-align:center;font-size:11px;color:var(--text-muted);">
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
      <div class="glass-card" style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; justify-content: center;">
          <div class="card-header">
            <h3>${t('milestoneTitle')}</h3>
            <span style="font-size:24px;font-weight:800;color:var(--primary);">${overall}%</span>
          </div>
          <div class="progress-bar" style="height:18px;margin-bottom:14px;">
            <div class="progress-fill" style="width:${overall}%;"></div>
          </div>
          <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;">${t('milestoneSubTitle')}</p>
        </div>
        ${count > 0 ? `
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; align-items: center; border-left: 1px dashed var(--card-border); padding-left: 20px;">
          <h4 style="font-size:14px;color:var(--text-primary);margin-bottom:10px;">${state.activeLanguage === 'zh' ? '綜合職能分析 (Overall)' : 'Overall Competency'}</h4>
          <div style="width:100%; max-width: 280px;">
            <canvas id="globalRadarChart" style="width:100%; max-height: 220px;"></canvas>
          </div>
        </div>
        <div style="flex: 1.5; min-width: 300px; display: flex; flex-direction: column; align-items: center; border-left: 1px dashed var(--card-border); padding-left: 20px;">
          <h4 style="font-size:14px;color:var(--text-primary);margin-bottom:10px;">${state.activeLanguage === 'zh' ? '成長趨勢軌跡 (Growth Trend)' : 'Growth Trend Line'}</h4>
          <div style="width:100%;">
            <canvas id="trendLineChart" style="width:100%; max-height: 220px;"></canvas>
          </div>
        </div>
        ` : ''}
      </div>
      
      ${selfAssessmentHtml}
      
      <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">${deptCards}</div>
    `;

    // Render charts
    chartsToRender.forEach(chartConfig => {
      const ctx = document.getElementById(chartConfig.id);
      if (ctx) {
        const datasets = [{
          label: state.activeLanguage === 'zh' ? '主管評核 (Supervisor)' : 'Supervisor Score',
          data: chartConfig.data,
          backgroundColor: 'rgba(249, 115, 22, 0.2)',
          borderColor: '#f97316',
          pointBackgroundColor: '#ea580c',
          borderWidth: 1.5,
          pointRadius: 2
        }];

        if (chartConfig.selfData) {
          datasets.push({
            label: state.activeLanguage === 'zh' ? '自我覺察 (Self)' : 'Self-Assessment',
            data: chartConfig.selfData,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            borderDash: [5, 5],
            pointBackgroundColor: '#10b981',
            borderWidth: 2,
            pointRadius: 2
          });
        }

        new Chart(ctx, {
          type: 'radar',
          data: {
            labels: chartConfig.labels,
            datasets: datasets
          },
          options: {
            scales: {
              r: {
                min: 0,
                max: 5,
                ticks: { display: false, stepSize: 1 },
                pointLabels: { 
                  font: { size: 16, weight: 'bold' }, 
                  color: state.activeTheme === 'dark' ? '#9ca3af' : '#64748b' 
                },
                grid: { color: state.activeTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                angleLines: { color: state.activeTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
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

    // Render Trend Line Chart if it exists
    const trendCtx = document.getElementById('trendLineChart');
    if (trendCtx) {
      // Group assessments by month (YYYY-MM)
      const monthlyData = {};
      
      const traineeAssessments = (state.assessments || []).filter(a => a.traineeId === viewId && (user.role !== 'trainee' || a.visibleToTrainee || a.department.startsWith('self_eval')));
      
      traineeAssessments.forEach(a => {
        let dateStr = a.submittedAt;
        if (!dateStr) {
          // fallback if submittedAt is missing, try to extract from self_eval_YYYY-MM
          if (a.department.startsWith('self_eval_')) {
            dateStr = a.department.replace('self_eval_', '') + '-01T00:00:00Z';
          } else {
            return;
          }
        }
        const month = dateStr.substring(0, 7); // '2026-07'
        if (!monthlyData[month]) {
          monthlyData[month] = { supSum: 0, supCount: 0, selfSum: 0, selfCount: 0 };
        }
        
        const avgScore = ((a.competency1 || 0) + (a.competency2 || 0) + (a.competency3 || 0) + (a.competency4 || 0) + (a.competency5 || 0)) / 5;
        
        if (a.department.startsWith('self_eval')) {
          monthlyData[month].selfSum += avgScore;
          monthlyData[month].selfCount += 1;
        } else {
          monthlyData[month].supSum += avgScore;
          monthlyData[month].supCount += 1;
        }
      });
      
      const sortedMonths = Object.keys(monthlyData).sort();
      const labels = sortedMonths;
      const supData = sortedMonths.map(m => monthlyData[m].supCount > 0 ? (monthlyData[m].supSum / monthlyData[m].supCount).toFixed(1) : null);
      const selfData = sortedMonths.map(m => monthlyData[m].selfCount > 0 ? (monthlyData[m].selfSum / monthlyData[m].selfCount).toFixed(1) : null);
      
      new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: state.activeLanguage === 'zh' ? '主管評核 (Supervisor)' : 'Supervisor Score',
              data: supData,
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#ea580c',
              tension: 0.3,
              fill: true,
              spanGaps: true
            },
            {
              label: state.activeLanguage === 'zh' ? '自我覺察 (Self)' : 'Self-Assessment',
              data: selfData,
              borderColor: '#10b981',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [5, 5],
              pointBackgroundColor: '#10b981',
              tension: 0.3,
              spanGaps: true
            }
          ]
        },
        options: {
          scales: {
            y: {
              min: 0, max: 5,
              grid: { color: state.activeTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              ticks: { color: state.activeTheme === 'dark' ? '#9ca3af' : '#64748b' }
            },
            x: {
              grid: { display: false },
              ticks: { color: state.activeTheme === 'dark' ? '#9ca3af' : '#64748b' }
            }
          },
          plugins: {
            legend: { 
              display: true,
              position: 'bottom',
              labels: { color: state.activeTheme === 'dark' ? '#9ca3af' : '#64748b', boxWidth: 12 }
            }
          },
          maintainAspectRatio: false
        }
      });
    }
}

window.renderMilestonesView = renderMilestones;

window.saveSelfAssessment = async function() {
  const c1 = parseFloat(document.getElementById('selfScoreC1').value);
  const c2 = parseFloat(document.getElementById('selfScoreC2').value);
  const c3 = parseFloat(document.getElementById('selfScoreC3').value);
  const c4 = parseFloat(document.getElementById('selfScoreC4').value);
  const c5 = parseFloat(document.getElementById('selfScoreC5').value);
  const user = Auth.getCurrentUser();
  if (!user || user.role !== 'trainee') return;
  
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentSelfEvalId = `self_eval_${currentMonthStr}`;
  
  const existing = (state.assessments || []).find(a => a.traineeId === user.id && a.department === currentSelfEvalId);
  const comments = state.activeLanguage === 'zh' ? '學生自我評估紀錄' : 'Trainee Self Assessment';
  
  if (existing) {
    const res = await window.db.updateAssessment(existing.id, {
      competency1: c1, competency2: c2, competency3: c3, competency4: c4, competency5: c5
    });
    if (res && (res.success || res.status === 'success')) {
      alert(state.activeLanguage === 'zh' ? '自評已更新！' : 'Self-assessment updated!');
      existing.competency1 = c1;
      existing.competency2 = c2;
      existing.competency3 = c3;
      existing.competency4 = c4;
      existing.competency5 = c5;
      renderMilestones();
    }
  } else {
    const res = await window.db.submitAssessment(
      user.id, currentSelfEvalId, 'N/A', c1, c2, c3, c4, c5, comments, user.name
    );
    if (res && (res.success || res.status === 'success')) {
      alert(state.activeLanguage === 'zh' ? '自評已儲存！' : 'Self-assessment saved!');
      window.location.reload(); 
    }
  }
};

// ══════════════════════════════════════════════════════════════════
// 4. REVIEW & FEEDBACK
// ══════════════════════════════════════════════════════════════════

let _filterTrainee = 'all';
let _filterDept    = 'all';

function renderReview() {
  const user      = Auth.getCurrentUser();
  const container = $('sectionReview');

  // Enforce guest department filter
  const isGuest = user.role === 'guest';
  if (isGuest) {
    _filterDept = user.departmentId;
  }

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
      <select class="form-control" style="width:auto;" onchange="window.setFilterDept(this.value)" ${isGuest ? 'disabled' : ''}>${deptOpts}</select>
    </div></div>`;

  // Filter observations
  let obs = [...state.observations].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  if (user.role === 'trainee') _filterTrainee = user.id;
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
    let deptAssessOpts = '';
    if (isGuest) {
      const d = CONFIG.DEPARTMENTS[user.departmentId];
      deptAssessOpts = `<option value="${user.departmentId}" selected>${state.activeLanguage === 'zh' ? (d.nameZh || d.name) : d.name}</option>`;
    } else {
      deptAssessOpts = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly).map(d =>
        `<option value="${d.id}">${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
      ).join('');
    }

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
            <select class="form-control" id="assessDept" ${isGuest ? 'disabled' : ''}>${deptAssessOpts}</select>
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
        
        <div style="margin-top:14px;background:rgba(255,255,255,0.02);padding:14px;border-radius:12px;border:none;">
          <h4 style="font-size:11px;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;letter-spacing:0.5px;">核心能力評估 / Core Competencies</h4>
          <div class="grid-2" style="gap:14px 20px;">
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency1')}</label>
              <div class="rating-stars" id="assessStars-comp1" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fi fi-ss-star active' : 'fi fi-rs-star'}" onclick="window.setAssessRating('comp1',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency2')}</label>
              <div class="rating-stars" id="assessStars-comp2" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fi fi-ss-star active' : 'fi fi-rs-star'}" onclick="window.setAssessRating('comp2',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency3')}</label>
              <div class="rating-stars" id="assessStars-comp3" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fi fi-ss-star active' : 'fi fi-rs-star'}" onclick="window.setAssessRating('comp3',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency4')}</label>
              <div class="rating-stars" id="assessStars-comp4" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fi fi-ss-star active' : 'fi fi-rs-star'}" onclick="window.setAssessRating('comp4',${n})"></i>`).join('')}
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size:11px;color:var(--text-secondary);">${t('lblCompetency5')}</label>
              <div class="rating-stars" id="assessStars-comp5" style="margin-top:4px;font-size:18px;">
                ${[1,2,3,4,5].map(n => `<i class="${n <= 3 ? 'fi fi-ss-star active' : 'fi fi-rs-star'}" onclick="window.setAssessRating('comp5',${n})"></i>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top:14px;">
          <label>${t('lblAssessComments')}</label>
          <textarea class="form-control" id="assessComments" rows="3" placeholder="請輸入本輪調站別之考核總評語... / Enter overall assessment comments..."></textarea>
        </div>
        <div class="form-group" style="margin-top:14px;">
          <label>${state.activeLanguage === 'zh' ? '考核附件 (可選，支援多檔，單檔請小於20MB)' : 'Assessment Attachment (Optional, Multi-file, <20MB)'}</label>
          <div id="assessFileDropZone" class="file-drop-zone" onclick="document.getElementById('assessFile').click()" ondragover="event.preventDefault(); this.style.borderColor='var(--primary)'; this.style.background='rgba(37,99,235,0.05)';" ondragleave="this.style.borderColor='var(--border-color)'; this.style.background='transparent';" ondrop="event.preventDefault(); this.style.borderColor='var(--border-color)'; this.style.background='transparent'; document.getElementById('assessFile').files = event.dataTransfer.files; window.updateAssessFileList();" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s ease; margin-bottom: 8px;">
            <i class="fi fi-rr-cloud-upload" style="font-size:32px; color:var(--primary); margin-bottom:12px; display:block;"></i>
            <p style="margin:0; font-weight:600; color:var(--text-primary); font-size:14px;">${state.activeLanguage === 'zh' ? '點擊或拖曳多個檔案至此' : 'Click or Drag files here'}</p>
          </div>
          <input type="file" multiple class="form-control" id="assessFile" style="display:none;" onchange="window.updateAssessFileList()">
          <div id="assessFileList" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
        <div class="form-group" style="margin-top:14px;">
          <label>${state.activeLanguage === 'zh' ? '考評者署名' : 'Assessor Signature'}</label>
          <input type="text" class="form-control" id="assessSigner" placeholder="${state.activeLanguage === 'zh' ? '請輸入考評主管姓名...' : 'Enter assessor name...'}">
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:14px;">
          <button class="btn btn-primary" onclick="window.submitStationAssessment()">${t('btnSubmitAssess')}</button>
        </div>
      </div>
    `;
  }


  // --- Smart Nudges (Action Center) ---
  let smartNudgeHtml = '';
  if (user.role === 'admin') {
    let pendingObsCount = 0;
    state.observations.forEach(o => {
      if (o.status === 'pending') pendingObsCount++;
    });
    let totalExpected = 0;
    CONFIG.TRAINEES.forEach(t => {
      const ex = t.excludedDepartments || [];
      totalExpected += Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly && !ex.includes(d.id)).length;
    });
    
    // Ignore self_eval when counting pending assessments
    const assessmentCount = (state.assessments || []).filter(a => !a.department.startsWith('self_eval')).length;
    let pendingAssessCount = totalExpected - assessmentCount;
    if (pendingAssessCount < 0) pendingAssessCount = 0;

    if (pendingObsCount > 0) {
      smartNudgeHtml += `
        <div class="smart-nudge-item info" onclick="window.switchTab('review')" style="cursor:pointer;">
          <div class="icon-circle" style="color:#2563eb;background:rgba(37,99,235,0.1);">
            <i class="fi fi-rr-bell"></i>
          </div>
          <div class="nudge-text">
            <strong>${state.activeLanguage === 'zh' ? '待評閱週記' : 'Pending Journals'}</strong>
            <span>${state.activeLanguage === 'zh' ? `尚有 ${pendingObsCount} 筆學生週記等待評閱` : `${pendingObsCount} journals waiting for review.`}</span>
          </div>
        </div>
      `;
    }
    
    if (pendingAssessCount > 0) {
      smartNudgeHtml += `
        <div class="smart-nudge-item alert" onclick="window.switchTab('milestones')" style="cursor:pointer;">
          <div class="icon-circle" style="color:#dc2626;background:rgba(220,38,38,0.1);">
            <i class="fi fi-rr-triangle-warning"></i>
          </div>
          <div class="nudge-text">
            <strong>${state.activeLanguage === 'zh' ? '未填寫考核' : 'Pending Assessments'}</strong>
            <span>${state.activeLanguage === 'zh' ? `尚有 ${pendingAssessCount} 筆輪調考核需要填寫` : `${pendingAssessCount} assessments waiting.`}</span>
          </div>
        </div>
      `;
    }

    if (smartNudgeHtml !== '') {
      smartNudgeHtml = `
        <div style="background:var(--bg-card);border:none;border-radius:8px;padding:12px;margin-bottom:20px;">
          <div class="smart-nudge-header" style="font-weight:700;margin-bottom:10px;"><i class="fi fi-rr-bolt"></i> ${state.activeLanguage === 'zh' ? '智慧提醒中心' : 'Smart Action Center'}</div>
          <div class="smart-nudge-list" style="display:flex; gap:10px;">
            ${smartNudgeHtml}
          </div>
        </div>
      `;
    }
  }


  container.innerHTML = `
    ${smartNudgeHtml}
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
    el.className = i < stars ? 'fi fi-ss-star active' : 'fi fi-rs-star';
  });
};

window.submitStationAssessment = async function() {
  const traineeId = $('assessTraineeId').value;
  const dept = $('assessDept').value;
  const grade = $('assessGrade').value;
  const comments = $('assessComments').value;
  const explicitSigner = $('assessSigner') ? $('assessSigner').value.trim() : '';

  const ratings = state.pendingAssessRatings || { comp1: 3, comp2: 3, comp3: 3, comp4: 3, comp5: 3 };
  const comp1 = ratings.comp1 || 3;
  const comp2 = ratings.comp2 || 3;
  const comp3 = ratings.comp3 || 3;
  const comp4 = ratings.comp4 || 3;
  const comp5 = ratings.comp5 || 3;

  const user = Auth.getCurrentUser();
  const assessor = explicitSigner;

  if (!assessor) {
    showToast('請輸入考評者署名 / Please enter assessor signature.', 'error');
    return;
  }

  if (!comments.trim()) {
    showToast('請輸入考核總評語 / Please enter overall assessment comments.', 'error');
    return;
  }

  showLoading();
  try {
    let attachmentUrls = [];
    const fileInput = $('assessFile');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        const file = fileInput.files[i];
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const FOLDER_ID = '1RaGvfMc_15uRQw8tLtDZT7Bk2hRZe9IT';
        const uploadRes = await Api.uploadFile(base64, file.type, file.name, FOLDER_ID);
        if (uploadRes.success) {
          attachmentUrls.push(uploadRes.url);
        } else {
          throw new Error('File upload failed for ' + file.name);
        }
      }
    }
    const attachmentUrl = attachmentUrls.join(',');

    const res = await Api.submitAssessment(traineeId, dept, grade, comp1, comp2, comp3, comp4, comp5, comments, assessor, attachmentUrl);
    if (res.success) {
      showToast(t('assessSuccess'), 'success');
      $('assessComments').value = '';
      if ($('assessFile')) $('assessFile').value = '';
      state.assessments = await Api.getAssessments();
      
      // Select the trainee that was just assessed and switch to Milestones tab
      state.selectedTraineeId = traineeId;
      switchTab('milestones');
    } else {
      showToast('Submit failed.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.toggleAssessmentVisibility = async function(id, visible) {
  showLoading();
  try {
    const res = await Api.updateAssessmentVisibility(id, visible);
    if (res.success) {
      showToast(state.activeLanguage === 'zh' ? '設定已更新' : 'Settings updated', 'success');
      state.assessments = await Api.getAssessments();
      renderMilestones();
    } else {
      showToast('Failed to update visibility.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

function formatTaipeiTime(isoString, lang) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { 
    timeZone: 'Asia/Taipei', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  };
  return date.toLocaleString(lang === 'zh' ? 'zh-TW' : 'en-US', options);
}

function formatTaipeiDateOnly(isoString) {
  if (!isoString) return '';
  if (!isoString.includes('T')) return isoString;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
  const p = {};
  parts.forEach(part => p[part.type] = part.value);
  return `${p.year}-${p.month}-${p.day}`;
}

function buildFeedItem(obs, user) {
  const traineeConf = CONFIG.TRAINEES.find(t => t.id === obs.traineeId) || {};
  const dept        = CONFIG.DEPARTMENTS[obs.department] || {};
  
  let isLateStr = '';
  if (obs.date) {
    const submitted = new Date(obs.date);
    if (!isNaN(submitted.getTime())) {
      // Calculate Taipei time day
      const taipeiTime = new Date(submitted.getTime() + 8 * 60 * 60 * 1000);
      const day = taipeiTime.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      
      // If submitted on Thursday (4), Friday (5), Saturday (6), or Sunday (0), mark as late.
      if (day === 0 || day > 3) {
        isLateStr = `<span class="badge" style="background-color:#ef4444;margin-left:8px;">${state.activeLanguage === 'zh' ? '遲交 (Late)' : 'Late'}</span>`;
      }
    }
  }

  const isReviewed  = obs.status === 'reviewed';
  const badge       = (isReviewed
    ? `<span class="badge badge-reviewed">✓ ${t('statusReviewed')}</span>`
    : `<span class="badge badge-pending">⏳ ${t('statusPending')}</span>`) + isLateStr;

  // Existing mentor feedback block
  let feedbackBlock = '';
  if (obs.mentorComment) {
    feedbackBlock = `
      <div class="comment-bubble">
        <div class="comment-bubble-header">
          <span>👑 ${obs.mentorName}</span>
          <span class="comment-bubble-time">${formatTaipeiTime(obs.feedbackAt, state.activeLanguage)}</span>
        </div>
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
          <div class="comment-bubble-header"><span>👀 Guest</span><span class="comment-bubble-time">${formatTaipeiTime(g.submittedAt, state.activeLanguage)}</span></div>
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
        <div class="form-group" style="margin-bottom:8px; margin-top:8px;">
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
            <p>
              ${formatTaipeiDateOnly(obs.submittedAt || obs.date)} · <span style="color:${dept.color}; font-weight: 600;">${state.activeLanguage === 'zh' ? dept.nameZh : dept.name}</span><br>
              <span style="font-size:11px;color:var(--text-muted);">${t('lblSubmittedAt')}: ${formatTaipeiTime(obs.submittedAt || obs.date, state.activeLanguage)}</span>
              ${obs.selfRating ? `<br><span style="font-size:12px;color:#f59e0b;font-weight:700;margin-top:4px;display:inline-block;">${state.activeLanguage === 'zh' ? '自我評分' : 'Self-Appraisal'}: ${obs.selfRating} / 5 <i class="fi fi-ss-star"></i></span>` : ''}
            </p>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <div>${badge}</div>
          ${user.role === 'admin' ? `
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px;" onclick="window.openEditObservation('${obs.id}')">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10px; color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="window.deleteObservation('${obs.id}')">🗑️ Delete</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <div class="obs-block"><h5>${t('lblKeyObs')}</h5><div class="quill-content">${obs.keyObservation}</div></div>
      </div>

      ${obs.attachmentUrl ? `
        <div class="obs-block">
          <h5>${state.activeLanguage === 'zh' ? '照片或報告檔案連結' : 'Attachment Link'}</h5>
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:8px;">
            ${obs.attachmentUrl.split(',').map((url, idx) => `
              <button onclick="window.open('${url}', '_blank')" class="btn btn-outline" style="color:var(--primary); border-color:var(--primary); padding: 8px 16px; font-size: 14px; border-width: 2px; font-weight: 600;">
                <i class="fi fi-rr-arrow-up-right-from-square" style="margin-right:8px; font-weight:bold;"></i> ${state.activeLanguage === 'zh' ? '點擊檢視附件內容' : 'View Attachment'} ${obs.attachmentUrl.split(',').length > 1 ? `(${idx + 1})` : ''}
              </button>
            `).join('')}
          </div>
        </div>` : ''}

      ${feedbackBlock}
      ${guestBlock}
      ${actionHtml}
      
      <div style="display:flex; gap:8px; margin-top:12px; border-top:1px solid var(--border-color); padding-top:12px;">
        ${((user.role === 'trainee' && obs.traineeId === user.id && !isReviewed) || user.role === 'admin') 
          ? `<button class="btn btn-secondary" onclick="openEditObservation('${obs.id}')" style="flex:1;"><i class="fi fi-rr-pencil"></i> ${state.activeLanguage === 'zh' ? '編輯' : 'Edit'}</button>` 
          : ''}
        ${(user.role === 'admin' && !isReviewed) 
          ? `<button class="btn btn-secondary" onclick="lockObservation('${obs.id}')" style="flex:1; color:#ea580c; border-color:#ea580c;"><i class="fi fi-rr-lock"></i> ${state.activeLanguage === 'zh' ? '鎖定' : 'Lock'}</button>` 
          : ''}
        ${(user.role === 'admin') 
          ? `<button class="btn btn-secondary" onclick="deleteObservation('${obs.id}')" style="flex:1; color:#dc2626; border-color:#dc2626;"><i class="fi fi-rr-trash"></i> ${state.activeLanguage === 'zh' ? '刪除' : 'Delete'}</button>` 
          : ''}
      </div>
    </div>
  `;
}

window.setFilterTrainee = function(val) { _filterTrainee = val; renderReview(); };

window.lockObservation = async function(id) {
  if (!confirm(state.activeLanguage === 'zh' ? '確定要鎖定這篇週記嗎？鎖定後學生將無法修改。' : 'Are you sure you want to lock this? The trainee will no longer be able to edit it.')) return;
  const obs = state.observations.find(o => o.id === id);
  if (!obs) return;
  
  showLoading();
  try {
    await Api.submitFeedback(id, obs.mentorComment || '', obs.mentorName || Auth.getCurrentUser().name, obs.rating || 0);
    state.observations = await Api.getAllObservations();
    showToast(state.activeLanguage === 'zh' ? '已鎖定' : 'Locked', 'success');
    renderReview();
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.openEditObservation = function(id) {
  const obs = state.observations.find(o => o.id === id);
  if (!obs) return;
  $('editObsId').value = obs.id;
  $('editObsDate').value = formatTaipeiDateOnly(obs.date);
  if (!window.editObsQuill) {
    window.editObsQuill = new Quill('#editObsKeyEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
      }
    });
  }
  
  let content = obs.keyObservation || '';
  if (!content.includes('<p>') && !content.includes('<br>')) {
    content = content.replace(/\n/g, '<br>');
  }
  window.editObsQuill.root.innerHTML = content;

  $('editObsPhoto').value = obs.attachmentUrl || '';
  $('editObsModal').style.display = 'flex';
};

window.saveEditedObservation = async function() {
  const id = $('editObsId').value;
  const data = {
    date: $('editObsDate').value,
    keyObservation: window.editObsQuill.root.innerHTML,
    attachmentUrl: $('editObsPhoto').value.trim()
  };
  
  showLoading();
  $('editObsModal').style.display = 'none';
  try {
    const res = await Api.updateObservation(id, data);
    if (res.success) {
      showToast(state.activeLanguage === 'zh' ? '更新成功' : 'Update successful', 'success');
      state.observations = await Api.getAllObservations();
      renderReview();
    } else {
      showToast('Update failed.', 'error');
    }
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.deleteObservation = async function(id) {
  if (!confirm(state.activeLanguage === 'zh' ? '確定要刪除這筆週記嗎？此操作無法復原。' : 'Are you sure you want to delete this observation? This cannot be undone.')) {
    return;
  }
  showLoading();
  try {
    const res = await Api.deleteObservation(id);
    if (res.success) {
      showToast(state.activeLanguage === 'zh' ? '刪除成功' : 'Deleted successfully', 'success');
      state.observations = await Api.getAllObservations();
      renderReview();
    } else {
      showToast('Delete failed.', 'error');
    }
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.openEditAssessment = function(id) {
  const asm = state.assessments.find(a => a.id === id);
  if (!asm) return;
  $('editAssessId').value = asm.id;
  
  const user = Auth.getCurrentUser() || {role: 'trainee'};
  const isGuest = user.role === 'guest';
  
  // Populate Dept dropdown
  const deptSelect = $('editAssessDept');
  if (isGuest) {
    const d = CONFIG.DEPARTMENTS[user.departmentId];
    deptSelect.innerHTML = `<option value="${user.departmentId}" selected>${state.activeLanguage === 'zh' ? (d.nameZh || d.name) : d.name}</option>`;
    deptSelect.disabled = true;
  } else {
    deptSelect.innerHTML = Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly).map(d => 
      `<option value="${d.id}" ${asm.department === d.id ? 'selected' : ''}>${state.activeLanguage === 'zh' ? d.nameZh : d.name}</option>`
    ).join('');
    deptSelect.disabled = false;
  }
  
  $('editAssessGrade').value = asm.grade;
  $('editAssessSigner').value = asm.assessor;
  $('editAssessComp1').value = asm.competency1;
  $('editAssessComp2').value = asm.competency2;
  $('editAssessComp3').value = asm.competency3;
  $('editAssessComp4').value = asm.competency4;
  $('editAssessComp5').value = asm.competency5 || 3;
  $('editAssessComments').value = asm.comments;
  $('editAssessFile').value = asm.attachmentUrl || '';
  
  $('editAssessModal').style.display = 'flex';
};

window.saveEditedAssessment = async function() {
  const id = $('editAssessId').value;
  const data = {
    department: $('editAssessDept').value,
    grade: $('editAssessGrade').value,
    assessor: $('editAssessSigner').value.trim(),
    competency1: Number($('editAssessComp1').value),
    competency2: Number($('editAssessComp2').value),
    competency3: Number($('editAssessComp3').value),
    competency4: Number($('editAssessComp4').value),
    competency5: Number($('editAssessComp5').value),
    comments: $('editAssessComments').value.trim(),
    attachmentUrl: $('editAssessFile').value.trim()
  };
  
  showLoading();
  $('editAssessModal').style.display = 'none';
  try {
    const res = await Api.updateAssessment(id, data);
    if (res.success) {
      showToast(state.activeLanguage === 'zh' ? '更新成功' : 'Update successful', 'success');
      state.assessments = await Api.getAssessments();
      renderMilestones();
    } else {
      showToast('Update failed.', 'error');
    }
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};

window.deleteAssessment = async function(id) {
  if (!confirm(state.activeLanguage === 'zh' ? '確定要刪除這筆考核嗎？此操作無法復原。' : 'Are you sure you want to delete this assessment? This cannot be undone.')) {
    return;
  }
  showLoading();
  try {
    const res = await Api.deleteAssessment(id);
    if (res.success) {
      showToast(state.activeLanguage === 'zh' ? '刪除成功' : 'Deleted successfully', 'success');
      state.assessments = await Api.getAssessments();
      renderMilestones();
    } else {
      showToast('Delete failed.', 'error');
    }
  } catch(err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
};


window.setFilterDept    = function(val) { _filterDept    = val; renderReview(); };

window.setRating = function(obsId, stars) {
  state.pendingRatings[obsId] = stars;
  const container = $('stars-' + obsId);
  if (!container) return;
  container.querySelectorAll('i').forEach((el, i) => {
    el.className = i < stars ? 'fi fi-ss-star active' : 'fi fi-rs-star';
  });
};

window.submitFeedback = async function(obsId) {
  const comment = ($('feedback-' + obsId) || {}).value || '';
  if (!comment.trim()) { showToast(t('feedbackLabel') + ' is required', 'error'); return; }

  const user = Auth.getCurrentUser();
  showLoading();
  try {
    await Api.submitFeedback(obsId, comment, user.name, 0);
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


// ══════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════

let _toastTimer;
function showToast(msg, type = 'primary') {
  const toast = $('toastNotification');
  if (!toast) return;
  toast.className = 'toast show ' + type;
  toast.querySelector('i').className = type === 'success' ? 'fi fi-rr-check-circle' : 'fi fi-rr-info';
  toast.querySelector('.toast-text').textContent = msg;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Utilities ──────────────────────────────────────────────────────
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
