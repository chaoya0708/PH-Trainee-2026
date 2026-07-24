import re

with open('js/app.js', 'r') as f:
    content = f.read()

content = content.replace("👑 ", "")

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for crown emoji.")
