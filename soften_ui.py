import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# Soften main containers
css = css.replace('.glass-card {\n  border: 1px solid var(--card-border) !important;\n  background: var(--card-bg) !important;\n}', 
                  '.glass-card {\n  border: 1px solid var(--card-border) !important;\n  background: var(--card-bg) !important;\n  border-radius: 16px !important;\n}')

css = re.sub(r'(\.stat-card\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 16px;', css)
css = re.sub(r'(\.calendar-view\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 16px;', css)
css = re.sub(r'(\.feed-item\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 16px;', css)
css = re.sub(r'(\.review-box\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 12px;', css)
css = re.sub(r'(\.comment-bubble\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 12px;', css)

# Soften elements
css = re.sub(r'(\.nav-item\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 12px;', css)
css = re.sub(r'(\.action-btn\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 8px;', css)
css = re.sub(r'(\.btn-icon\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 50px;', css)
css = re.sub(r'(\.avatar\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 50%;', css)
css = re.sub(r'(\.status-badge\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 20px;', css)

# Calendar elements
css = re.sub(r'(\.cal-dot\s*\{[^}]*)border-radius: 0 !important;', r'\1border-radius: 50% !important;', css)
css = re.sub(r'(\.cal-dot\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 50%;', css)
css = re.sub(r'(\.calendar-nav-btn\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 8px;', css)
css = re.sub(r'(\.calendar-toggle\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 8px;', css)
css = re.sub(r'(\.cal-toggle-btn\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 6px;', css)
css = re.sub(r'(\.progress-bar\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 10px;', css)
css = re.sub(r'(\.progress-fill\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 10px;', css)

# Soften modal
css = re.sub(r'(\.modal-content\s*\{[^}]*)border-radius: 0;', r'\1border-radius: 16px;', css)

with open('css/styles.css', 'w') as f:
    f.write(css)

print("UI Softened.")
