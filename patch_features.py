import sys

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Add Speech Recognition logic at the very end of app.js (before the closing bracket if any, or just append)
speech_logic = """
// Voice to Text Feature
window.startVoiceRecognition = function(targetId, btnId) {
  const target = document.getElementById(targetId);
  const btn = document.getElementById(btnId);
  if (!target || !btn) return;

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert(state.activeLanguage === 'zh' ? '您的瀏覽器不支援語音輸入，請使用最新版 Chrome 或 Safari。' : 'Voice input not supported on this browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = state.activeLanguage === 'zh' ? 'zh-TW' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btn.innerHTML = '<i class="fi fi-rr-circle-microphone" style="color:var(--danger)"></i> ' + (state.activeLanguage === 'zh' ? '聆聽中...' : 'Listening...');
  btn.style.borderColor = 'var(--danger)';
  btn.style.color = 'var(--danger)';

  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    target.value = (target.value ? target.value + (state.activeLanguage === 'zh' ? '，' : ', ') : '') + transcript;
  };

  recognition.onend = function() {
    btn.innerHTML = '<i class="fi fi-rr-mic"></i> ' + (state.activeLanguage === 'zh' ? '語音輸入' : 'Voice');
    btn.style.borderColor = 'var(--primary)';
    btn.style.color = 'var(--primary)';
  };
};

"""
if "// Voice to Text Feature" not in content:
    content += speech_logic

# 2. Modify Assessment form
old_assess_group = """        <div class="form-group" style="margin-top:14px;">
          <label>${t('lblAssessComments')}</label>
          <textarea class="form-control" id="assessComments" rows="3" placeholder="請輸入本輪調站別之考核總評語... / Enter overall assessment comments..."></textarea>
        </div>"""

new_assess_group = """        <div class="form-group" style="margin-top:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="margin:0;">${t('lblAssessComments')}</label>
            <button id="btnVoiceAssess" class="btn btn-sm" style="background:transparent; border:1px solid var(--primary); color:var(--primary); border-radius:20px; padding:2px 10px; font-size:11px; display:flex; align-items:center; gap:4px;" onclick="window.startVoiceRecognition('assessComments', 'btnVoiceAssess')">
              <i class="fi fi-rr-mic"></i> ${state.activeLanguage === 'zh' ? '語音輸入' : 'Voice'}
            </button>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'主動積極，表現優異。':'Proactive and excellent. ')">${state.activeLanguage==='zh'?'主動積極':'Proactive'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'符合期待，實作能力佳。':'Meets expectations, good hands-on. ')">${state.activeLanguage==='zh'?'實作能力佳':'Hands-on'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'具備良好觀察力，能適時發問。':'Good observation, asks questions. ')">${state.activeLanguage==='zh'?'觀察力佳':'Good Observation'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'適應力強，與同仁互動良好。':'Adaptable, interacts well. ')">${state.activeLanguage==='zh'?'互動良好':'Good Interaction'}</button>
          </div>
          <textarea class="form-control" id="assessComments" rows="3" placeholder="請輸入本輪調站別之考核總評語... / Enter overall assessment comments..."></textarea>
        </div>"""

content = content.replace(old_assess_group, new_assess_group)

# 3. Modify Guest Comment for Journals
old_guest_comment = """    actionHtml = `
      <div class="review-box">
        <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${t('guestCommentLabel')}</p>
        <div class="form-group" style="margin-bottom:8px;">
          <textarea class="form-control" id="gcomment-${obs.id}" rows="2" placeholder="${t('phGuestComment')}"></textarea>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.submitGuestComment('${obs.id}')">
          ${t('submitGuestBtn')}
        </button>
      </div>
    `;"""

new_guest_comment = """    actionHtml = `
      <div class="review-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin:0;">${t('guestCommentLabel')}</p>
          <button id="btnVoiceGuest-${obs.id}" class="btn btn-sm" style="background:transparent; border:1px solid var(--primary); color:var(--primary); border-radius:20px; padding:2px 8px; font-size:10px; display:flex; align-items:center; gap:4px;" onclick="window.startVoiceRecognition('gcomment-${obs.id}', 'btnVoiceGuest-${obs.id}')">
            <i class="fi fi-rr-mic"></i> ${state.activeLanguage === 'zh' ? '語音' : 'Voice'}
          </button>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '本週表現符合期待。'">符合期待</button>
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '建議多參與實作。'">建議多實作</button>
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '學習態度佳。'">態度佳</button>
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <textarea class="form-control" id="gcomment-${obs.id}" rows="2" placeholder="${t('phGuestComment')}"></textarea>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.submitGuestComment('${obs.id}')">
          ${t('submitGuestBtn')}
        </button>
      </div>
    `;"""

content = content.replace(old_guest_comment, new_guest_comment)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to app.js for voice and quick replies.")
