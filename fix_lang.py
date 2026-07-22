import re

with open('css/styles.css', 'r') as f:
    css = f.read()

new_lang_css = """.login-lang-select {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1000;
  background: var(--card-bg); border: 1px solid var(--card-border);
  color: var(--text-secondary); padding: 6px 12px; border-radius: 20px;
  font-size: 12px; cursor: pointer; outline: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}"""

css = re.sub(r'\.login-lang-select \{.*?\}', new_lang_css, css, flags=re.DOTALL)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
