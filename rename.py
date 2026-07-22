import re

# 1. Update index.html
with open('index.html', 'r') as f:
    html = f.read()

# Change page title subtitle
html = html.replace('<p>國際生學習歷程 &amp; Milestone System</p>', '<p>全球人才培育系統 ｜ Global Talent Hub</p>')

# Change hardcoded roles
html = html.replace('<strong>高階主管</strong>', '<strong data-i18n="roleExecutiveName">管理團隊</strong>')
html = html.replace('<strong>高階主管 / Executive</strong>', '<strong>管理團隊 / Management Team</strong>')

with open('index.html', 'w') as f:
    f.write(html)

# 2. Update i18n.js
with open('js/i18n.js', 'r') as f:
    i18n = f.read()

i18n = i18n.replace("roleExecutiveName: 'Executive',", "roleExecutiveName: 'Management Team',")
i18n = i18n.replace("roleExecutiveName: '高階主管',", "roleExecutiveName: '管理團隊',")

# Update description just in case it mentions high-level
i18n = i18n.replace("roleExecutiveDesc: '檢視所有報表與學習成效',", "roleExecutiveDesc: '檢視所有報表與學習成效',") # No change needed

with open('js/i18n.js', 'w') as f:
    f.write(i18n)

print("done")
