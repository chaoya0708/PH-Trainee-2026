import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# Change max-width of brand-logo-large from 240px to 140px for square logo
css = css.replace('max-width: 240px;', 'max-width: 120px;')
css = css.replace('max-width: 140px;', 'max-width: 90px;') # Sidebar logo slightly smaller
css = css.replace('max-width: 180px !important;', 'max-width: 100px !important;') # Mobile login logo
css = css.replace('max-width: 120px !important;', 'max-width: 80px !important;') # Mobile sidebar logo

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
