import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace https://www.deepl.com/translator with https://www.deepl.com/en/translator
content = content.replace("https://www.deepl.com/translator#", "https://www.deepl.com/en/translator#")

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied for DeepL UI language.")
