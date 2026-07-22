import re

with open('js/app.js', 'r') as f:
    content = f.read()

start_idx = content.find("  container.innerHTML = `")
end_idx = content.find("function renderAnalytics() {")

if start_idx == -1 or end_idx == -1:
    print("Could not find bounds")
    exit(1)

new_inner_html = """  container.innerHTML = `
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

"""

new_content = content[:start_idx] + new_inner_html + content[end_idx:]

with open('js/app.js', 'w') as f:
    f.write(new_content)

print("done")
