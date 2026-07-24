import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace DeepL link 1 (Milestones assessment comments)
old_link_1 = r"""<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/\$\{encodeURIComponent\(assessment\.comments\)\}" target="_blank" style="font-size:10px; color:var\(--text-muted\); text-decoration:none; padding:4px; border:1px solid rgba\(0,0,0,0\.05\); border-radius:12px; display:inline-block;"><i class="fi fi-rr-language"></i> Translate with DeepL</a></div>"""
new_link_1 = """<div style="text-align:right; margin-top:8px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(assessment.comments)}" target="_blank" style="font-size:11px; color:#fff; background:var(--primary); text-decoration:none; padding:6px 12px; border-radius:12px; display:inline-block; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fi fi-rr-language"></i> Auto-Translate (English)</a></div>"""
content = re.sub(old_link_1, new_link_1, content)

# Replace DeepL link 2 (Journals mentor comment)
old_link_2 = r"""<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/\$\{encodeURIComponent\(obs\.mentorComment\)\}" target="_blank" style="font-size:10px; color:var\(--text-muted\); text-decoration:none;"><i class="fi fi-rr-language"></i> Translate \(DeepL\)</a></div>"""
new_link_2 = """<div style="text-align:right; margin-top:8px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(obs.mentorComment)}" target="_blank" style="font-size:11px; color:#fff; background:var(--primary); text-decoration:none; padding:6px 12px; border-radius:12px; display:inline-block; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fi fi-rr-language"></i> Auto-Translate (English)</a></div>"""
content = re.sub(old_link_2, new_link_2, content)

# Replace DeepL link 3 (Journals guest comment)
old_link_3 = r"""<div style="text-align:right; margin-top:4px;"><a href="https://www.deepl.com/translator#zh/en/\$\{encodeURIComponent\(g\.comment\)\}" target="_blank" style="font-size:10px; color:var\(--text-muted\); text-decoration:none;"><i class="fi fi-rr-language"></i> Translate \(DeepL\)</a></div>"""
new_link_3 = """<div style="text-align:right; margin-top:8px;"><a href="https://www.deepl.com/translator#zh/en/${encodeURIComponent(g.comment)}" target="_blank" style="font-size:11px; color:#fff; background:var(--primary); text-decoration:none; padding:6px 12px; border-radius:12px; display:inline-block; font-weight:600; box-shadow:0 2px 4px rgba(0,0,0,0.1);"><i class="fi fi-rr-language"></i> Auto-Translate (English)</a></div>"""
content = re.sub(old_link_3, new_link_3, content)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for DeepL buttons.")
