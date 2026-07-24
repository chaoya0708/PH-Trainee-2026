import sys

with open('js/app.js', 'r') as f:
    content = f.read()

# 1. Mentor Feedback in feed
old_mentor = """        <p class="comment-bubble-text">${obs.mentorComment}</p>
      </div>"""
new_mentor = """        <p class="comment-bubble-text">${obs.mentorComment}</p>
        ${user && user.role === 'trainee' ? `<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(obs.mentorComment)}" target="_blank" style="font-size:10px; color:var(--text-muted); text-decoration:none;"><i class="fi fi-rr-language"></i> Translate (DeepL)</a></div>` : ''}
      </div>"""
content = content.replace(old_mentor, new_mentor)

# 2. Guest Comments in feed
old_guest = """          <p class="comment-bubble-text">${g.comment}</p>
        </div>"""
new_guest = """          <p class="comment-bubble-text">${g.comment}</p>
          ${user && user.role === 'trainee' ? `<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(g.comment)}" target="_blank" style="font-size:10px; color:var(--text-muted); text-decoration:none;"><i class="fi fi-rr-language"></i> Translate (DeepL)</a></div>` : ''}
        </div>"""
content = content.replace(old_guest, new_guest)

# 3. Assessment Comments in milestones
old_assess = """              <div style="font-size:13px;line-height:1.5;border-top:1px dashed var(--card-border);padding-top:10px;">
                <p style="font-style:italic;color:var(--text-primary);">${assessment.comments}</p>
                ${assessment.attachmentUrl ? `"""
new_assess = """              <div style="font-size:13px;line-height:1.5;border-top:1px dashed var(--card-border);padding-top:10px;">
                <p style="font-style:italic;color:var(--text-primary);">${assessment.comments}</p>
                ${user && user.role === 'trainee' ? `<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(assessment.comments)}" target="_blank" style="font-size:10px; color:var(--text-muted); text-decoration:none; padding:4px; border:1px solid rgba(0,0,0,0.05); border-radius:12px; display:inline-block;"><i class="fi fi-rr-language"></i> Translate with DeepL</a></div>` : ''}
                ${assessment.attachmentUrl ? `"""
content = content.replace(old_assess, new_assess)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for DeepL translation buttons.")
