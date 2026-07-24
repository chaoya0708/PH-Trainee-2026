import sys

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Assessment Quick Replies
assess_bubbles = """          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'主動積極，表現優異。':'Proactive and excellent. ')">${state.activeLanguage==='zh'?'主動積極':'Proactive'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'符合期待，實作能力佳。':'Meets expectations, good hands-on. ')">${state.activeLanguage==='zh'?'實作能力佳':'Hands-on'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'具備良好觀察力，能適時發問。':'Good observation, asks questions. ')">${state.activeLanguage==='zh'?'觀察力佳':'Good Observation'}</button>
            <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:11px; padding:4px 8px;" onclick="document.getElementById('assessComments').value += (state.activeLanguage==='zh'?'適應力強，與同仁互動良好。':'Adaptable, interacts well. ')">${state.activeLanguage==='zh'?'互動良好':'Good Interaction'}</button>
          </div>"""

content = content.replace(assess_bubbles, "")

# 2. Guest Comment Quick Replies
guest_bubbles = """        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '本週表現符合期待。'">符合期待</button>
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '建議多參與實作。'">建議多實作</button>
          <button class="btn btn-outline btn-sm" style="border-radius:12px; font-size:10px; padding:2px 6px;" onclick="document.getElementById('gcomment-${obs.id}').value += '學習態度佳。'">態度佳</button>
        </div>"""

content = content.replace(guest_bubbles, "")

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to remove quick reply bubbles.")
