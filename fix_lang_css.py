import re

with open('css/styles.css', 'r') as f:
    css = f.read()

new_lang_css = """.login-lang-select {
  display: inline-block;
  background: var(--card-bg); border: 1px solid var(--panel-border);
  color: var(--text-secondary); padding: 8px 16px; border-radius: 50px;
  font-size: 13px; cursor: pointer; outline: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin: 0 auto;
}"""

css = re.sub(r'\.login-lang-select \{.*?\}', new_lang_css, css, flags=re.DOTALL)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done css")
