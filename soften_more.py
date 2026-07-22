import re

with open('css/styles.css', 'r') as f:
    css = f.read()

css = re.sub(r'(\.sched-icon\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 12px;', css)
css = re.sub(r'(\.obs-photo\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 12px;', css)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
