import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the button
button_old = """      ${obs.attachmentUrl ? `
        <div class="obs-block">
          <h5>${state.activeLanguage === 'zh' ? '照片或報告檔案連結' : 'Attachment Link'}</h5>
          <button onclick="window.openPdfModal('${obs.attachmentUrl}', \\`${obs.keyObservation.replace(/'/g, "\\\\'").replace(/\\n/g, "\\\\n")}\\`, \\`${(obs.actionableIdea||'').replace(/'/g, "\\\\'").replace(/\\n/g, "\\\\n")}\\`)" class="btn btn-secondary btn-sm" style="margin-top:6px; color:var(--primary); border-color:var(--primary);">
            <i class="fas fa-file-pdf" style="margin-right:6px;"></i> ${state.activeLanguage === 'zh' ? '點擊檢視報告與 AI 解析' : 'View Report & AI Analysis'}
          </button>
        </div>` : ''}"""

button_new = """      ${obs.attachmentUrl ? `
        <div class="obs-block">
          <h5>${state.activeLanguage === 'zh' ? '照片或報告檔案連結' : 'Attachment Link'}</h5>
          <button onclick="window.open('${obs.attachmentUrl}', '_blank')" class="btn btn-secondary btn-sm" style="margin-top:6px; color:var(--primary); border-color:var(--primary);">
            <i class="fas fa-external-link-alt" style="margin-right:6px;"></i> ${state.activeLanguage === 'zh' ? '點擊檢視附件內容' : 'View Attachment'}
          </button>
        </div>` : ''}"""

content = content.replace(button_old, button_new)

# 2. Delete everything from `window.vimeiTranslate = async function(text)` to the end of the file
# We'll use a regex to match from the start of the `window.vimeiTranslate` block
match = re.search(r'// ══════════════════════════════════════════════════════════════════\nwindow\.vimeiTranslate = async function', content)
if match:
    content = content[:match.start()].strip() + '\n'

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done removing AI translation logic.")
