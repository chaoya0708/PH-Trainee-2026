import re

with open('css/styles.css', 'r') as f:
    css = f.read()

new_slogan_css = """.login-slogan-card {
  margin: 20px 0 32px 0;
  padding: 0;
  background: transparent;
  border: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-slogan-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  font-weight: 500;
  letter-spacing: 0.5px;
  font-style: italic;
  position: relative;
  display: inline-block;
  opacity: 0.85;
}
.login-slogan-text::before {
  content: '“';
  color: var(--primary-color);
  font-size: 20px;
  font-weight: bold;
  margin-right: 4px;
  vertical-align: -4px;
}
.login-slogan-text::after {
  content: '”';
  color: var(--primary-color);
  font-size: 20px;
  font-weight: bold;
  margin-left: 4px;
  vertical-align: -4px;
}"""

css = re.sub(r'\.login-slogan-card \{.*?\n\}\n\.login-slogan-text \{.*?\n\}', new_slogan_css, css, flags=re.DOTALL)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
