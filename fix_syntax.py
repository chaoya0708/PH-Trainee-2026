import sys

with open('js/app.js', 'r') as f:
    content = f.read()

content = content.replace("return \\`\n                <div", "return `\n                <div")
content = content.replace("</div>\n              \\`;", "</div>\n              `;")

with open('js/app.js', 'w') as f:
    f.write(content)

print("Syntax fixed")
