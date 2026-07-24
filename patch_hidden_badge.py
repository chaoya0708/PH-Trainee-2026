import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace user.role !== 'trainee' with user.role === 'admin' for the hidden badge
old_badge = r"\$\{!assessment\.visibleToTrainee && user\.role !== 'trainee' \? `<div style=\"position:absolute; top:-8px; right:12px; background:#fef2f2; color:#ef4444;"
new_badge = r"${!assessment.visibleToTrainee && user.role === 'admin' ? `<div style=\"position:absolute; top:-8px; right:12px; background:#fef2f2; color:#ef4444;"

content = re.sub(old_badge, new_badge, content)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for hidden badge visibility.")
