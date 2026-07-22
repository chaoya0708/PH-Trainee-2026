import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Bump app.js version
content = re.sub(r'js/app\.js\?v=\d+', 'js/app.js?v=190', content)

# Remove pdf.js script
content = re.sub(r'<script src="https://cdnjs\.cloudflare\.com/ajax/libs/pdf\.js/[^\n]+</script>\n?', '', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done cleaning index.html")
