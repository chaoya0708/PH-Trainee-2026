import re
from datetime import date, timedelta

holidays = {
    '2026-09-25': ('holiday', '中秋節 (Mid-Autumn Festival)'),
    '2026-09-28': ('holiday', "教師節 (Teacher's Day)"),
    '2026-10-09': ('holiday', '雙十節補假 (Double Tenth Day Compensated Holiday)'),
    '2026-10-25': ('holiday', '光復節 (Retrocession Day)'),
    '2026-10-26': ('holiday', '光復節補假 (Retrocession Day Compensated Holiday)'),
    '2026-12-25': ('holiday', '行憲紀念日 (Constitution Day)')
}

dept_map = {
    'yushan_cooking': ('yushan_cooking', '玉膳(調理食品：烹煮區) Prepared Foods – Cooking Area'),
    'yushan_warehouse': ('yushan_warehouse', '玉膳(倉儲物流與凍庫管理) Warehouse & Cold Storage Management'),
    'yushan_qc': ('yushan_qc', '玉膳(現場品管 QA/QC) On-site QA/QC'),
    'yushan_packaging': ('yushan_packaging', '玉膳(調理食品：後段包裝) Prepared Foods – Packaging Area'),
    'yushan_prep': ('yushan_prep', '玉膳(調理食品：前處理段) Prepared Foods – Pre-processing')
}

assignments = {
    'diane': {
        9: 'yushan_cooking',
        10: 'yushan_packaging',
        11: 'yushan_warehouse',
        12: 'yushan_prep'
    },
    'mark': {
        9: 'yushan_warehouse',
        10: 'yushan_cooking',
        11: 'yushan_packaging',
        12: 'yushan_qc'
    },
    'jairuz': {
        9: 'yushan_qc',
        10: 'yushan_prep',
        11: 'yushan_cooking',
        12: 'yushan_warehouse'
    }
}

def generate_schedule(name):
    start_date = date(2026, 9, 1)
    end_date = date(2026, 12, 31)
    days = (end_date - start_date).days
    lines = []
    
    for i in range(days + 1):
        d = start_date + timedelta(days=i)
        d_str = d.strftime('%Y-%m-%d')
        
        # Holiday check
        if d_str in holidays:
            dept, obj = holidays[d_str]
            lines.append(f"      '{d_str}': {{ dept: '{dept}', objective: '{obj}' }}")
            continue
            
        # Weekend check
        if d.weekday() >= 5: # 5=Sat, 6=Sun
            continue
            
        # Regular day
        dept_key = assignments[name][d.month]
        dept, obj = dept_map[dept_key]
        lines.append(f"      '{d_str}': {{ dept: '{dept}', objective: '{obj}' }}")
        
    return lines

with open('/Users/sofiacykung/Documents/antigravity_demo/MA Program/js/config.js', 'r', encoding='utf-8') as f:
    content = f.read()

def update_block(name, content):
    pattern = re.compile(r'(\s+' + name + r': \{)(.*?)(^\s+\},?$)', re.MULTILINE | re.DOTALL)
    match = pattern.search(content)
    if match:
        prefix = match.group(1)
        inner = match.group(2)
        suffix = match.group(3)
        
        kept_lines = []
        for line in inner.split('\n'):
            line_strip = line.strip()
            if not line_strip: continue
            
            date_match = re.search(r"'(\d{4}-\d{2}-\d{2})'", line_strip)
            if date_match:
                d_str = date_match.group(1)
                if d_str < '2026-09-01':
                    if line.endswith(','):
                        kept_lines.append(line[:-1])
                    else:
                        kept_lines.append(line)
        
        new_lines = generate_schedule(name)
        
        all_lines = kept_lines + new_lines
        
        new_inner = "\n" + ",\n".join(all_lines) + "\n"
        
        new_content = content[:match.start()] + prefix + new_inner + suffix + content[match.end():]
        return new_content
    return content

content = update_block('diane', content)
content = update_block('mark', content)
content = update_block('jairuz', content)

with open('/Users/sofiacykung/Documents/antigravity_demo/MA Program/js/config.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schedule updated successfully.")
