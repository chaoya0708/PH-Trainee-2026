import re

with open('js/i18n.js', 'r') as f:
    content = f.read()

# Replace English criteria
content = content.replace("criteria1: 'Weekly Journal Submitted',", "criteria1: 'Learning in Progress (Journal)',")
content = content.replace("criteria2: 'Mentor Confirmed Weekly Report',", "criteria2: 'Receiving Mentor Feedback',")
content = content.replace("criteria3: 'Good Performance (Rating ≥ 3★)',", "criteria3: 'Station Assessment Completed',")
content = content.replace("criteria4: 'Excellent & Locked (Rating ≥ 4★)',", "criteria4: 'Passed Station (Grade A/B)',")

# Replace Chinese criteria
content = content.replace("criteria1: '已提交週記',", "criteria1: '持續學習中 (首篇週記)',")
content = content.replace("criteria2: '導師已確認週報',", "criteria2: '持續獲得導師回饋',")
content = content.replace("criteria3: '表現良好（評分 ≥ 3★）',", "criteria3: '完成站別最終考核',")
content = content.replace("criteria4: '表現優異且已結案（評分 ≥ 4★）',", "criteria4: '順利通過此站別 (A/B)',")

with open('js/i18n.js', 'w') as f:
    f.write(content)
