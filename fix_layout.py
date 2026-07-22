import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# Change flex order and cache bust hero image
css = css.replace("background-image: url('../assets/hero.jpg');", "background-image: url('../assets/hero.jpg?v=2');\n  order: 2;\n  border-right: none;\n  border-left: 1px solid var(--panel-border);")

# Update form side order
css = css.replace(".login-form-side {\n  flex: 1;", ".login-form-side {\n  flex: 1;\n  order: 1;")

# Fix mobile order
old_mobile = """  .login-image-side {
    flex: none;
    height: 30vh;
    border-right: none;
    border-bottom: 1px solid var(--panel-border);
  }
  .login-form-side {
    flex: none;
    height: 70vh;
    padding: 20px;
  }"""

new_mobile = """  .login-image-side {
    flex: none;
    height: 30vh;
    border-left: none;
    border-bottom: 1px solid var(--panel-border);
    order: 1;
  }
  .login-form-side {
    flex: none;
    height: 70vh;
    padding: 20px;
    order: 2;
  }"""

css = css.replace(old_mobile, new_mobile)

with open('css/styles.css', 'w') as f:
    f.write(css)

# Cache bust logo in HTML
with open('index.html', 'r') as f:
    html = f.read()

html = html.replace('src="assets/logo.png"', 'src="assets/logo.png?v=2"')

with open('index.html', 'w') as f:
    f.write(html)

print("done")
