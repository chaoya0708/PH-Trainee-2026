import sys
import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Update renderJournals tabs
old_journals_tabs = """${CONFIG.TRAINEES.map(tr => `
          <button class="btn ${state.activeJournalTraineeId === tr.id ? 'btn-primary' : 'btn-outline'}" 
                  onclick="state.activeJournalTraineeId='${tr.id}'; window.renderJournals();"
                  style="flex:1; white-space:nowrap; border-radius:8px; padding:8px 12px; font-size:14px; font-weight:600;">
            ${tr.avatar ? tr.avatar : '🎓'} ${tr.name.split(' (')[0]}
          </button>
        `).join('')}"""

new_journals_tabs = """${CONFIG.TRAINEES.map(tr => {
          const parts = tr.name.split(' / ');
          const nameHtml = parts.length > 1 
            ? `<span>${parts[0]}</span><span style="font-size:11px; font-weight:400; opacity:0.85; margin-top:4px;">${parts[1]}</span>`
            : `<span>${tr.name}</span>`;
          return `
          <button class="btn ${state.activeJournalTraineeId === tr.id ? 'btn-primary' : 'btn-outline'}" 
                  onclick="state.activeJournalTraineeId='${tr.id}'; window.renderJournals();"
                  style="flex:1; display:flex; flex-direction:column; align-items:center; border-radius:12px; padding:12px 8px; font-size:15px; font-weight:700; line-height:1.2; min-width:140px;">
            <span style="font-size:20px; margin-bottom:6px;">${tr.avatar ? tr.avatar : '🎓'}</span>
            ${nameHtml}
          </button>
          `;
        }).join('')}"""

content = content.replace(old_journals_tabs, new_journals_tabs)


# 2. Update dashboard and milestones tabs (trainee-tabs)
def repl_tabs(m):
    return """<div class="trainee-tabs">
          ${CONFIG.TRAINEES.map(tr => {
            const parts = tr.name.split(' / ');
            const nameHtml = parts.length > 1 ? `${parts[0]} <span style="font-size:11px; opacity:0.8; margin-left:4px;">/ ${parts[1]}</span>` : tr.name;
            return `
            <button class="trainee-tab-btn ${state.selectedTraineeId === tr.id ? 'active' : ''}"
              onclick="window.selectViewTrainee('${tr.id}')" style="display:flex; align-items:center;">
              ${tr.avatar ? `<span style="margin-right:6px;">${tr.avatar}</span>` : ''} ${nameHtml}
            </button>
            `;
          }).join('')}
        </div>"""

content = re.sub(r'<div class="trainee-tabs">.*?</div>', repl_tabs, content, flags=re.DOTALL)


with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to app.js")
