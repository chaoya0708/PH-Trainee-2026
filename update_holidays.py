import re
import urllib.request
import json
import time

url = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec'

holidays = {
    '2026-09-25': '中秋節 (Mid-Autumn Festival)',
    '2026-09-28': "教師節 (Teacher's Day)",
    '2026-10-09': '雙十節補假 (Double Tenth Day Compensated Holiday)',
    '2026-10-25': '光復節 (Retrocession Day)',
    '2026-12-25': '行憲紀念日 (Constitution Day)'
}

trainees = ['diane', 'jairuz', 'mark']

print("Updating Google Sheet...")
for trainee in trainees:
    for date, obj in holidays.items():
        data = {
            'action': 'updateSchedule',
            'traineeId': trainee,
            'date': date,
            'dept': 'holiday',
            'objective': obj
        }
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='POST')
        req.add_header('Content-Type', 'text/plain') # Apps Script POST needs this to avoid preflight
        try:
            with urllib.request.urlopen(req) as response:
                print(f"Updated {trainee} {date}")
        except Exception as e:
            print(f"Error updating {trainee} {date}: {e}")
        time.sleep(0.5)

print("Updating js/config.js...")
with open('js/config.js', 'r') as f:
    content = f.read()

# We need to replace the lines for the given dates with the new holiday lines.
# Also, if a date doesn't exist (like 10-25), we should insert it.
# Actually it's easier to just do a regex replace if it exists, and if not, we can inject it.
# Let's just find each trainee block and process it.

new_lines = {}
for date, obj in holidays.items():
    new_lines[date] = f"      '{date}': {{ dept: 'holiday', objective: '{obj}' }},"

for trainee in trainees:
    # Find trainee block
    # e.g., diane: { ... }
    # We can split by trainees
    pass

# Simpler way to edit js/config.js:
# Replace existing ones:
for date, obj in holidays.items():
    pattern = r"(      '" + date + r"': \{ dept: '.*?', objective: '.*?' \},?)"
    replacement = f"      '{date}': {{ dept: 'holiday', objective: '{obj}' }},"
    content, n = re.subn(pattern, replacement, content)
    
    # If n == 0, it means the date wasn't found (like 10-25).
    # We should inject it. A good place is right before the next date, or at the end of the block.
    # We'll just inject it after 10-09 or something, but actually order doesn't strictly matter for JS object.
    if n == 0:
        # Let's just append it after '2026-10-09' for all trainees
        if date == '2026-10-25':
            # find 10-09 line and insert 10-25 after it
            content = re.sub(
                r"(      '2026-10-09': \{ dept: 'holiday', objective: '.*?' \},)",
                r"\1\n" + replacement,
                content
            )

with open('js/config.js', 'w') as f:
    f.write(content)

print("Done")
