import re

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Hide the Pulse Check Explanation Box for guests
old_box = r"""    <!-- Leaderboard Table -->
    <div style="background-color:rgba\(37, 99, 235, 0\.05\); border-left:3px solid #2563eb; padding:10px 14px; margin-top:20px; border-radius:4px; font-size:12px; color:var\(--text-secondary\); line-height:1\.6;">
      <strong style="color:var\(--text-primary\);">💡 Pulse Check \(敏捷脈搏打卡\) 用意說明：</strong><br>
      \$\{state\.activeLanguage === 'zh' 
        \? '此欄位顯示學生每週自行回報的當下心理與學習狀態。綠色代表「順利推進」，黃色代表「遇到瓶頸」，紅色代表「需要協助」。導師與主管可藉此即時察覺學生的困難並適時介入輔導。' 
        : 'Displays the weekly self-reported psychological and learning status of the trainees. Mentors and executives can use this to quickly identify bottlenecks and provide timely support.'\}
    </div>"""

new_box = """    <!-- Leaderboard Table -->
    ${user.role !== 'guest' ? `
    <div style="background-color:rgba(37, 99, 235, 0.05); border-left:3px solid #2563eb; padding:10px 14px; margin-top:20px; border-radius:4px; font-size:12px; color:var(--text-secondary); line-height:1.6;">
      <strong style="color:var(--text-primary);">💡 Pulse Check (敏捷脈搏打卡) 用意說明：</strong><br>
      ${state.activeLanguage === 'zh' 
        ? '此欄位顯示學生每週自行回報的當下心理與學習狀態。綠色代表「順利推進」，黃色代表「遇到瓶頸」，紅色代表「需要協助」。導師與主管可藉此即時察覺學生的困難並適時介入輔導。' 
        : 'Displays the weekly self-reported psychological and learning status of the trainees. Mentors and executives can use this to quickly identify bottlenecks and provide timely support.'}
    </div>
    ` : ''}"""

content = re.sub(old_box, new_box, content)

# 2. Hide Pulse Check header for guests
old_th = r"              <th>Pulse Check</th>"
new_th = "              ${user.role !== 'guest' ? '<th>Pulse Check</th>' : ''}"
content = re.sub(old_th, new_th, content)

# 3. Hide Pulse Check cell for guests
old_td = r"        <td>\$\{pulseBadge\}</td>"
new_td = "        ${user.role !== 'guest' ? `<td>${pulseBadge}</td>` : ''}"
content = re.sub(old_td, new_td, content)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for hiding Pulse Check from guests.")
