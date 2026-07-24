import re

# 1. Update index.html header-banner color
with open('index.html', 'r') as f:
    html = f.read()

# Add color: #ffffff; to header-banner text
html = html.replace('<div class="header-banner" style="background: linear-gradient(135deg, #1e293b, #0f172a);">', 
                    '<div class="header-banner" style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff;">')

with open('index.html', 'w') as f:
    f.write(html)

# 2. Add missing keys to i18n.js
with open('js/i18n.js', 'r') as f:
    i18n = f.read()

# English inserts
en_insert = """    tabInsights: 'Mentor\\'s Insight Memo',
    insightsDesc: 'Internal private observation notes for Mentor.',
    insightsNew: 'New Observation',
    placeholderNote: 'Write your observation here...',
    btnSaveNote: 'Save Note',"""
i18n = i18n.replace("    tabInsights: 'Mentor\\'s Insight Memo',\n    insightsDesc: 'Internal private observation notes for Mentor.',", en_insert)

# Chinese inserts
zh_insert = """    tabInsights: '導師觀察筆記',
    insightsDesc: '導師專用之私密觀察記錄',
    insightsNew: '新增觀察紀錄',
    placeholderNote: '請在此輸入您的觀察筆記...',
    btnSaveNote: '儲存筆記',"""
i18n = i18n.replace("    tabInsights: '導師觀察筆記',\n    insightsDesc: '導師專用之私密觀察記錄',", zh_insert)

with open('js/i18n.js', 'w') as f:
    f.write(i18n)

