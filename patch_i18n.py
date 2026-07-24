import sys

with open('js/i18n.js', 'r') as f:
    content = f.read()

# Replace English
content = content.replace("lblCompetency1:       'Learning Agility & Adaptability',", "lblCompetency1:       'Proactive Learning & Questioning',")
content = content.replace("lblCompetency2:       'Problem Solving & Analysis',", "lblCompetency2:       'Observation Skills',")
content = content.replace("lblCompetency3:       'Proactiveness & Execution',", "lblCompetency3:       'Communication & Interaction',")
content = content.replace("lblCompetency4:       'Communication & Teamwork',", "lblCompetency4:       'Adaptability',")
content = content.replace("lblCompetency5:       'Innovation & Strategic Thinking',", "lblCompetency5:       'Engagement & Cooperation',")

# Replace Chinese
content = content.replace("lblCompetency1:       '學習敏銳度與適應力',", "lblCompetency1:       '主動學習與發問',")
content = content.replace("lblCompetency2:       '邏輯分析與問題解決',", "lblCompetency2:       '現場觀察力',")
content = content.replace("lblCompetency3:       '積極主動與當責執行',", "lblCompetency3:       '溝通與互動',")
content = content.replace("lblCompetency4:       '溝通協調與團隊合作',", "lblCompetency4:       '環境適應力',")
content = content.replace("lblCompetency5:       '創新思維與策略觀',", "lblCompetency5:       '實作與配合度',")

with open('js/i18n.js', 'w') as f:
    f.write(content)

print("Patch applied to i18n.js")
