import re

with open('css/styles.css', 'r') as f:
    css = f.read()

# Replace all "border-radius: 0;" with "border-radius: 12px;"
# This will catch everything that my previous script missed.
css = css.replace('border-radius: 0;', 'border-radius: 12px;')

# Fix the scrollbar one
css = css.replace('::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 12px; }', 
                  '::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 10px; }')

# For `.top-bar` let's keep it square or subtly rounded
css = css.replace('.top-bar {\n  background: var(--card-bg); border-bottom: 1px solid var(--panel-border); padding: 14px 22px; border-radius: 12px; box-shadow: none;\n}',
                  '.top-bar {\n  background: var(--card-bg); border-bottom: 1px solid var(--panel-border); padding: 14px 22px; border-radius: 0; box-shadow: none;\n}')

# For modal content maybe 24px is better
css = css.replace('.modal-content {\n  background: var(--card-bg); width: 90%; max-width: 500px; padding: 14px 18px; border-radius: 12px; box-shadow: none;\n  border: 1px solid var(--panel-border);\n}',
                  '.modal-content {\n  background: var(--card-bg); width: 90%; max-width: 500px; padding: 14px 18px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);\n  border: 1px solid var(--panel-border);\n}')

# avatar
css = css.replace('.avatar {\n  background: var(--primary-color); color: #fff; width: 42px; height: 42px; border-radius: 12px;',
                  '.avatar {\n  background: var(--primary-color); color: #fff; width: 42px; height: 42px; border-radius: 50%;')

with open('css/styles.css', 'w') as f:
    f.write(css)

print("done global")
