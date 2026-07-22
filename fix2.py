import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Extract from renderDashboard to container.innerHTML
start_idx = content.find("function renderDashboard() {")
end_idx = content.find("  const overallPct = calcOverallProgress(viewId);")

if start_idx == -1 or end_idx == -1:
    print("Could not find bounds")
    exit(1)

new_render = """function renderDashboard() {
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

"""

new_content = content[:start_idx] + new_render + content[end_idx:]
with open('js/app.js', 'w') as f:
    f.write(new_content)

print("done")
