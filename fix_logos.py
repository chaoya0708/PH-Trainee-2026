import re

with open('index.html', 'r') as f:
    html = f.read()

# Replace the logo image source with local 'assets/logo.jpg'
old_logo_src = 'src="https://www.chimeifood.com.tw/assets/images/logo.png"'
new_logo_src = 'src="assets/logo.jpg"'

html = html.replace(old_logo_src, new_logo_src)

with open('index.html', 'w') as f:
    f.write(html)
print("done")
