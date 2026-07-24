import re

# 1. Update index.html (remove icon)
with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('<div class="header-icon" style="background: rgba(255,255,255,0.1); color: #fff;"><i class="fi fi-rr-brain"></i></div>', '')

with open('index.html', 'w') as f:
    f.write(html)

# 2. Update i18n.js (update text)
with open('js/i18n.js', 'r') as f:
    i18n = f.read()

i18n = i18n.replace("tabInsights: '導師觀察筆記',", "tabInsights: '觀察筆記',")
i18n = i18n.replace("tabInsights: 'Mentor Insights',", "tabInsights: 'Mentor Insight',")

with open('js/i18n.js', 'w') as f:
    f.write(i18n)
