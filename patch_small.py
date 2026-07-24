import sys
import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Update Trainee buttons in renderJournals
old_buttons = """<button class="btn ${state.activeJournalTraineeId === tr.id ? 'btn-primary' : 'btn-outline'}" 
                  onclick="state.activeJournalTraineeId='${tr.id}'; window.renderJournals();"
                  style="flex:1; white-space:nowrap; border-radius:12px; padding:12px; font-size:16px;">
            ${tr.avatar ? tr.avatar : '🎓'} ${tr.name}
          </button>"""

new_buttons = """<button class="btn ${state.activeJournalTraineeId === tr.id ? 'btn-primary' : 'btn-outline'}" 
                  onclick="state.activeJournalTraineeId='${tr.id}'; window.renderJournals();"
                  style="flex:1; white-space:nowrap; border-radius:8px; padding:8px 12px; font-size:14px; font-weight:600;">
            ${tr.avatar ? tr.avatar : '🎓'} ${tr.name.split(' (')[0]}
          </button>"""

content = content.replace(old_buttons, new_buttons)

# 2. Update Self-assessment reminder
old_reminder_logic = """const selfEval = (state.assessments || []).find(a => a.traineeId === viewId && a.department === currentSelfEvalId);

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
          <span>${state.activeLanguage === 'zh' ? '<strong>溫馨提醒：</strong>請於「每個月的 30 日前」完成本月份的自我覺察評分。' : '<strong>Reminder:</strong> Please complete your self-assessment before the 30th of every month.'}</span>
        </div>"""

new_reminder_logic = """const selfEval = (state.assessments || []).find(a => a.traineeId === viewId && a.department === currentSelfEvalId);

  const taipeiNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  let assessMonth = taipeiNow.getMonth() + 1;
  let assessYear = taipeiNow.getFullYear();
  if (taipeiNow.getDate() >= 30) {
    assessMonth++;
    if(assessMonth > 12) { assessMonth = 1; assessYear++; }
  }
  const next30Str = `${assessMonth}/30`;
  const selfAssessReminderZh = `⚠️ 提醒：請於(${next30Str}) 11:59 PM 前完成本月份的自我能力覺察評分。`;
  const selfAssessReminderEn = `⚠️ Reminder: Please complete your self-assessment by (${next30Str}) 11:59 PM.`;
  const selfAssessBanner = state.activeLanguage === 'zh' ? selfAssessReminderZh : selfAssessReminderEn;

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
        <div class="alert-info" style="background:#fff3cd; color:#856404; border:none; margin-bottom:15px; border-radius:12px; padding:12px;">
          <span style="font-weight:600;">${selfAssessBanner}</span>
        </div>"""

content = content.replace(old_reminder_logic, new_reminder_logic)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to app.js")
