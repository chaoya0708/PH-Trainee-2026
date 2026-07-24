import re

with open('js/i18n.js', 'r') as f:
    content = f.read()

zh_add = """    tabInsights: '導師觀察筆記',
    insightsDesc: '僅限導師檢視的內部觀察紀錄與學員寫作分析。',
    btnSaveNote: '儲存筆記',
    placeholderNote: '撰寫您對該學員（或整體）的綜合評估與觀察心得...',"""

en_add = """    tabInsights: 'Mentor Insights',
    insightsDesc: 'Internal private observation notes and trainee writing analysis for Mentors.',
    btnSaveNote: 'Save Note',
    placeholderNote: 'Write your comprehensive assessment and observations for this trainee (or in general)...',"""

if 'tabInsights:' not in content:
    content = content.replace("tabAnalytics: '排行榜',", "tabAnalytics: '排行榜',\n" + zh_add)
    content = content.replace("tabAnalytics: 'Leaderboard',", "tabAnalytics: 'Leaderboard',\n" + en_add)

with open('js/i18n.js', 'w') as f:
    f.write(content)
