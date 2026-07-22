import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Login Page: remove from login-brand, add to login-image-side
logo_tag = '<img src="assets/logo.png?v=2" alt="Logo" class="brand-logo-large">'
html = html.replace(logo_tag, '')

image_side = '<div class="login-image-side">'
image_side_with_logo = '<div class="login-image-side">\n    <img src="assets/logo.png?v=2" alt="Logo" class="hero-corner-logo">'
html = html.replace(image_side, image_side_with_logo)

# 2. Dashboard Top Bar: add logo next to toggle
top_bar_start = '<button class="mobile-menu-toggle" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>'
top_bar_with_logo = top_bar_start + '\n    <img src="assets/logo.png?v=2" alt="Logo" class="top-bar-logo">'
html = html.replace(top_bar_start, top_bar_with_logo)

# Optionally remove dashboard-logo from sidebar
sidebar_logo_tag = '<img src="assets/logo.png?v=2" alt="Logo" class="dashboard-logo">'
html = html.replace(sidebar_logo_tag, '')

with open('index.html', 'w') as f:
    f.write(html)

print("HTML modified")
