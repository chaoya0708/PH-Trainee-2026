with open('js/i18n.js', 'r') as f:
    i18n = f.read()

# Fix the Chinese part which got wrongly replaced
bad_zh_insert = """    tabInsights: 'Mentor\\'s Insight Memo',
    insightsDesc: 'Internal private observation notes for Mentor.',
    tabAnalytics:  '數據分析',"""

correct_zh_insert = """    tabInsights: '導師觀察筆記',
    insightsDesc: '導師專用之私密觀察記錄',
    tabAnalytics:  '數據分析',"""

i18n = i18n.replace(bad_zh_insert, correct_zh_insert)

with open('js/i18n.js', 'w') as f:
    f.write(i18n)
