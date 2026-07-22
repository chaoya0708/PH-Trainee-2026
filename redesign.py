import re

with open('css/styles.css', 'r') as f:
    css = f.read()

old_roots = re.search(r':root\s*\{.*?\n\}', css, re.DOTALL)
new_roots = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

:root {
  --bg-color: #ffffff; 
  --bg-gradient: #ffffff; 
  --panel-bg: #ffffff;
  --panel-border: #000000;
  --card-bg: #ffffff;
  --card-border: #000000;
  --text-primary: #000000;
  --text-secondary: #000000;
  --text-muted: #555555;
  --primary: #f97316;
  --primary-hover: #ea580c;
  --primary-glow: transparent;
  --secondary: #000000;
  --secondary-hover: #333333;
  --secondary-glow: transparent;
  --success: #000000;
  --success-glow: transparent;
  --warning: #000000;
  --danger: #000000;

  --font-title: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-serif: 'Playfair Display', serif;
  --backdrop-blur: none;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --transition-fast: 0.1s;
  --transition-normal: 0.15s;
  --sidebar-width: 260px;
}"""

old_dark = re.search(r'\[data-theme="dark"\]\s*\{.*?\n\}', css, re.DOTALL)
new_dark = """[data-theme="dark"] {
  --bg-color: #000000;
  --bg-gradient: #000000;
  --panel-bg: #000000;
  --panel-border: #ffffff;
  --card-bg: #000000;
  --card-border: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #ffffff;
  --text-muted: #aaaaaa;
  --primary: #f97316;
  --primary-hover: #ea580c;
  --primary-glow: transparent;
  --secondary: #ffffff;
  --secondary-hover: #cccccc;
  --secondary-glow: transparent;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}"""

if old_roots:
    css = css.replace(old_roots.group(0), new_roots)
if old_dark:
    css = css.replace(old_dark.group(0), new_dark)

# Remove old font import if present
css = re.sub(r"@import url\('https://fonts\.googleapis\.com/css2\?family=Inter[^']*'\);\n", "", css)

# Replace border-radius everywhere
css = re.sub(r'border-radius:\s*[^;]+;', 'border-radius: 0;', css)

# Replace box-shadow everywhere
css = re.sub(r'box-shadow:\s*[^;]+;', 'box-shadow: none;', css)

# Brutalize gradients
css = css.replace("background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);", "color: var(--text-primary);")
css = css.replace("-webkit-background-clip: text; -webkit-text-fill-color: transparent;", "")

custom_css = """
/* Siteinspire Overrides */
.btn {
  border: 1px solid var(--text-primary) !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  background: var(--bg-color);
  color: var(--text-primary);
}
.btn:hover {
  background: var(--text-primary) !important;
  color: var(--bg-color) !important;
}
.btn-primary {
  background: var(--text-primary);
  color: var(--bg-color);
}
.btn-primary:hover {
  background: var(--bg-color) !important;
  color: var(--text-primary) !important;
}

.glass-card {
  border: 1px solid var(--card-border) !important;
  background: var(--card-bg) !important;
}

.top-bar {
  border: 1px solid var(--panel-border) !important;
  background: var(--panel-bg) !important;
}

.cal-dot { border-radius: 0 !important; width: 10px !important; height: 10px !important; }

.login-brand h1, .brand-text h1 {
  display: none !important;
}

.brand-logo-large {
  width: 100%;
  max-width: 240px;
  height: auto;
  margin: 0 auto;
  display: block;
}

.dashboard-logo {
  max-width: 140px;
  display: block;
}

.calendar-header { border-bottom: 1px solid var(--card-border); }
.cal-head-day { border-right: 1px solid var(--card-border); }

/* Remove any glowing or transparent bg */
.role-btn { border: 1px solid var(--card-border); }
.role-btn:hover { background: var(--text-primary); color: var(--bg-color); border-color: var(--text-primary); }
.role-btn:hover strong, .role-btn:hover small { color: var(--bg-color); }
"""

css += custom_css

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done")
