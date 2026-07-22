import re

with open('index.html', 'r') as f:
    html = f.read()

# Revert title
html = html.replace('全球人才培育系統 ｜ Global Talent Hub', '國際生學習歷程 ｜ Milestone System')

# Modify Station Assessor role name
html = html.replace('<strong>輪調單位考核</strong>', '<strong>現場指導與評核</strong>')
html = html.replace('<small>Station Assessor</small>', '<small>Station Feedback</small>')

with open('index.html', 'w') as f:
    f.write(html)

with open('js/i18n.js', 'r') as f:
    i18n = f.read()

i18n = i18n.replace("roleAssessorName: '現場考核',", "roleAssessorName: '現場指導與評核',")
i18n = i18n.replace("roleAssessorName: 'Assessor',", "roleAssessorName: 'Station Feedback',")

with open('js/i18n.js', 'w') as f:
    f.write(i18n)

print("done")
