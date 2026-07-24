import sys

with open('js/app.js', 'r') as f:
    content = f.read()

old_code = """  container.innerHTML = `
    ${smartNudgeHtml}
    <div class="card-header" style="margin:0 0 4px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('reviewTitle')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${t('reviewSubTitle')}</p></div>
    </div>
    ${assessFormHtml}
    
    <!-- Render Assessments Feed -->
  `;
}"""

new_code = """    // Render Past Assessments
    let pastAssessmentsHtml = '';
    const relevantAssessments = (state.data.assessments || []).filter(a => {
      if (isGuest) return a.department === user.departmentId;
      return true;
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    if (relevantAssessments.length > 0) {
      pastAssessmentsHtml = `
        <div style="margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-secondary);"><i class="fi fi-rr-time-past"></i> ${state.activeLanguage==='zh'?'已送出的考核紀錄':'Submitted Assessments'}</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${relevantAssessments.map(a => {
              const tr = CONFIG.TRAINEES.find(t => t.id === a.traineeId);
              const dept = CONFIG.DEPARTMENTS[a.department] || {};
              return \`
                <div class="glass-card" style="padding:12px; border-left: 4px solid ${dept.color || 'var(--primary)'};">
                  <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <div>
                      <span style="font-weight:bold; font-size:14px;">${tr ? tr.name : a.traineeId}</span>
                      <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">${state.activeLanguage==='zh'?(dept.nameZh || dept.name):dept.name}</span>
                    </div>
                    <span class="badge" style="background:var(--primary);color:#fff;font-weight:800;font-size:12px;">${a.grade}</span>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:10px; font-size:11px; color:var(--text-secondary);">
                    <span style="background:var(--bg-highlight);padding:2px 6px;border-radius:4px;">${t('lblCompetency1').split(' ')[0]}: ${a.competency1}</span>
                    <span style="background:var(--bg-highlight);padding:2px 6px;border-radius:4px;">${t('lblCompetency2').split(' ')[0]}: ${a.competency2}</span>
                    <span style="background:var(--bg-highlight);padding:2px 6px;border-radius:4px;">${t('lblCompetency3').split(' ')[0]}: ${a.competency3}</span>
                    <span style="background:var(--bg-highlight);padding:2px 6px;border-radius:4px;">${t('lblCompetency4').split(' ')[0]}: ${a.competency4}</span>
                    <span style="background:var(--bg-highlight);padding:2px 6px;border-radius:4px;">${t('lblCompetency5').split(' ')[0]}: ${a.competency5}</span>
                  </div>
                  <p style="font-size:13px; font-style:italic; background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; margin-bottom:6px;">${a.comments}</p>
                  <div style="text-align:right; font-size:11px; color:var(--text-muted);">
                    ${a.assessor} • ${formatTaipeiTime(a.submittedAt, state.activeLanguage)}
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      `;
    }

  container.innerHTML = `
    ${smartNudgeHtml}
    <div class="card-header" style="margin:0 0 4px;">
      <div><h2 style="font-family:var(--font-title);font-size:20px;font-weight:700;">${t('reviewTitle')}</h2>
      <p style="font-size:12px;color:var(--text-secondary);">${t('reviewSubTitle')}</p></div>
    </div>
    ${pastAssessmentsHtml}
    ${assessFormHtml}
  `;
}"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('js/app.js', 'w') as f:
        f.write(content)
    print("Patch applied.")
else:
    print("Code not found.")
