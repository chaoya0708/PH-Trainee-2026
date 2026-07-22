import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# I will systematically replace border-radius: 0 with elegant values
replacements = {
    r'\.login-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 20px'),
    r'\.card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.btn \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50px'),
    r'\.role-btn \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.avatar \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50%'),
    r'\.role-badge \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.tab-btn \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50px'),
    r'\.trainee-tab-btn \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50px'),
    r'\.status-badge \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50px'),
    r'\.form-control \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.dashboard-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.sched-empty \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.objective-box \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.obs-dept \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 8px'),
    r'\.obs-idea \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 12px'),
    r'\.filter-btn \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50px'),
    r'\.milestone-item \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.modal-content \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 20px'),
    r'\.close-modal \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50%'),
    r'\.form-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.analytics-metric-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.asm-form-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.asm-history-card \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 16px'),
    r'\.asm-score \{.*?\}': lambda m: m.group(0).replace('border-radius: 0', 'border-radius: 50%'),
}

# Apply all replacements
for pattern, repl in replacements.items():
    css = re.sub(pattern, repl, css, flags=re.DOTALL)

# Any remaining "border-radius: 0;" that I missed (except the scrollbar) can be set to 12px.
# Actually let's just replace them blindly to 12px for safety, except for top-bar or specific ones.
# top-bar has border-radius: 0; padding: 14px 22px; -> we can leave it 0 because it's a full width nav bar.
# sidebar-nav li has border-radius: 0; -> change to 8px
css = css.replace('.sidebar-nav li {\n  border-radius: 0;', '.sidebar-nav li {\n  border-radius: 8px;')
css = css.replace('border-radius: 0; cursor: pointer;', 'border-radius: 12px; cursor: pointer;')

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done rounding")
