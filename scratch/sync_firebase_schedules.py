import re
import urllib.request
import json
import time

project_id = "ph-trainee-2026"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/schedules"

existing = {}
next_page_token = None

while True:
    url = base_url
    if next_page_token:
        url += f"?pageToken={next_page_token}"
    req = urllib.request.Request(url)
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        for doc in data.get('documents', []):
            fields = doc.get('fields', {})
            tid = fields.get('traineeId', {}).get('stringValue')
            d = fields.get('date', {}).get('stringValue')
            if tid and d:
                existing[(tid, d)] = doc['name']
        next_page_token = data.get('nextPageToken')
        if not next_page_token:
            break
    except Exception as e:
        print(f"Error fetching schedules: {e}")
        break

print(f"Loaded {len(existing)} existing schedules.")

with open('/Users/sofiacykung/Documents/antigravity_demo/MA Program/js/config.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'DEFAULT_SCHEDULES:\s*\{([\s\S]*?)\n  \}', content)
if not match:
    print("Could not find DEFAULT_SCHEDULES")
    exit(1)

sched_block = match.group(1)

trainees = ['diane', 'mark', 'jairuz']
updates = []
adds = []

for trainee in trainees:
    t_match = re.search(r'(' + trainee + r': \{)(.*?)(\})', sched_block, re.DOTALL)
    if t_match:
        inner = t_match.group(2)
        for line in inner.split('\n'):
            # objective value can be in single or double quotes
            line_match = re.search(r"'(\d{4}-\d{2}-\d{2})':\s*\{\s*dept:\s*'([^']+)',\s*objective:\s*['\"](.*?)['\"]\s*\}", line)
            if line_match:
                date = line_match.group(1)
                dept = line_match.group(2)
                obj = line_match.group(3)
                
                payload = {
                    "fields": {
                        "traineeId": {"stringValue": trainee},
                        "date": {"stringValue": date},
                        "dept": {"stringValue": dept},
                        "objective": {"stringValue": obj}
                    }
                }
                
                key = (trainee, date)
                if key in existing:
                    updates.append((existing[key], payload))
                else:
                    adds.append(payload)

print(f"Found {len(updates)} to update, {len(adds)} to add.")

for doc_name, payload in updates:
    patch_url = f"https://firestore.googleapis.com/v1/{doc_name}"
    req = urllib.request.Request(patch_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"Error updating {doc_name}: {e}")

for payload in adds:
    req = urllib.request.Request(base_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"Error adding: {e}")

print("Firebase sync complete.")
