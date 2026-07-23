import re

path = '/Users/sofiacykung/Documents/antigravity_demo/MA Program/js/config.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'(diane: \{.*?)(jairuz: \{)', content, re.DOTALL)
if match:
    diane_mark_part = match.group(1)
    # Replace the department ID
    new_diane_mark_part = diane_mark_part.replace("'cmf_production_rende'", "'cmf_production_hunei'")
    content = content.replace(diane_mark_part, new_diane_mark_part)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed schedules for Diane and Mark.")
else:
    print("Could not find the section.")
