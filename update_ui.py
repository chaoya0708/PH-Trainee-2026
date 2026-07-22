import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# 1. login-brand p font size
css = re.sub(r'\.login-brand p \{ font-size: 11px;', '.login-brand p { font-size: 16px; letter-spacing: 1px;', css)
css = re.sub(r'\.login-brand p \{ font-size: 12px !important; \}', '.login-brand p { font-size: 15px !important; letter-spacing: 1px; }', css)

# 2. login-card border removal
css = re.sub(r'border: 1px solid var\(--panel-border\);', 'border: none;', css)
css = css.replace("border-top: 1px solid var(--text-primary);\n    border-bottom: 1px solid var(--text-primary);", "")

# 3. form-control (inputs) to line style
input_style = """
.form-control {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--text-primary);
  border-radius: 0;
  color: var(--text-primary);
  transition: all 0.3s ease;
}
.form-control:focus {
  outline: none;
  border-bottom-color: var(--primary);
}
"""
css = re.sub(r'\.form-control \{.*?\n\}', input_style.strip(), css, flags=re.DOTALL)

# 4. pin-input adjust (if needed)
# pin-input extends form-control, so we just make sure it has no background.
css = css.replace('.pin-input {\n  font-size: 20px !important;', '.pin-input {\n  background: transparent !important;\n  font-size: 20px !important;')

# 5. role-btn rounded corners
css = re.sub(r'\.role-btn \{.*?border-radius: 0;.*?\n\}', lambda m: m.group(0).replace('border-radius: 0;', 'border-radius: 12px;'), css, flags=re.DOTALL)

# 6. Primary and outline buttons rounded
css = re.sub(r'\.btn \{.*?border-radius: 0;.*?\n\}', lambda m: m.group(0).replace('border-radius: 0;', 'border-radius: 50px;'), css, flags=re.DOTALL)
css = re.sub(r'\.btn-sm \{.*?border-radius: 0;.*?\n\}', lambda m: m.group(0).replace('border-radius: 0;', 'border-radius: 50px;'), css, flags=re.DOTALL)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
