import re

# 1. Update i18n.js
with open('js/i18n.js', 'r') as f:
    i18n = f.read()

if 'tabInsights:' not in i18n:
    # Insert for EN
    en_insert = "    tabInsights: 'Mentor\\'s Insight Memo',\n    insightsDesc: 'Internal private observation notes for Mentor.',\n    tabAnalytics:"
    i18n = i18n.replace('    tabAnalytics:', en_insert)
    
    # Insert for ZH
    zh_insert = "    tabInsights: '導師觀察筆記',\n    insightsDesc: '導師專用之私密觀察記錄',\n    tabAnalytics:"
    # Note: tabAnalytics for ZH might be different if translated, let's check
    i18n = i18n.replace("    tabAnalytics:  '數據與圖表',", zh_insert.replace('tabAnalytics:', "tabAnalytics:  '數據與圖表',"))
    i18n = i18n.replace("    tabAnalytics: '數據與圖表',", zh_insert.replace('tabAnalytics:', "tabAnalytics: '數據與圖表',"))

with open('js/i18n.js', 'w') as f:
    f.write(i18n)

# 2. Update index.html
with open('index.html', 'r') as f:
    html = f.read()

# Remove the brain icon specifically from liInsights
html = re.sub(r'(<li class="nav-item" id="liInsights">\s*<a class="nav-link" onclick="window\.switchTab\(\'insights\'\)">\s*)<i class="fi fi-rr-brain"></i>', r'\1', html)

with open('index.html', 'w') as f:
    f.write(html)
