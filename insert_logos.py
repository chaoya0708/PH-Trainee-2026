import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Dashboard Top Bar Logo
if 'class="top-bar-logo"' not in html:
    # Insert right before <div class="page-title">
    html = html.replace('<div class="page-title">', '<img src="assets/logo.png?v=2" alt="Logo" class="top-bar-logo">\n        <div class="page-title">')

# 2. Login Page Image Logo
if 'class="hero-corner-logo"' not in html:
    html = html.replace('<div class="login-image-side">', '<div class="login-image-side">\n    <img src="assets/logo.png?v=2" alt="Logo" class="hero-corner-logo">')

# 3. Clean up the sidebar dashboard logo and login form logo
html = html.replace('<img src="assets/logo.png?v=2" alt="Logo" class="dashboard-logo">', '')
html = html.replace('<img src="assets/logo.png?v=2" alt="Logo" class="brand-logo-large">', '')

with open('index.html', 'w') as f:
    f.write(html)
print("Logos inserted")
