import urllib.request
import json
import os
import re

project_id = "ph-trainee-2026"
urls = {
    'observations': f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations",
    'assessments': f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/assessments",
    'guest_comments': f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/guest_comments",
    'resources': f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/resources",
    'schedules': f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/schedules"
}

full_data = {}

def parse_value(v):
    if 'stringValue' in v: return v['stringValue']
    if 'integerValue' in v: return int(v['integerValue'])
    if 'doubleValue' in v: return float(v['doubleValue'])
    if 'booleanValue' in v: return v['booleanValue']
    return ""

for key, url in urls.items():
    try:
        req = urllib.request.Request(url)
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        
        docs = []
        for doc in data.get('documents', []):
            fields = doc.get('fields', {})
            parsed_doc = {}
            for k, v in fields.items():
                parsed_doc[k] = parse_value(v)
            docs.append(parsed_doc)
            
        full_data[key] = docs
    except Exception as e:
        full_data[key] = []
        print(f"Error fetching {key}: {e}")

# Save to full_data.json
with open('scratch/full_data.json', 'w') as f:
    json.dump(full_data, f, indent=2, ensure_ascii=False)

# Save to gas_data.json
with open('scratch/gas_data.json', 'w') as f:
    json.dump(full_data, f, indent=2, ensure_ascii=False)

# Update migrate.html
try:
    with open('migrate.html', 'r') as f:
        html = f.read()
    
    json_str = json.dumps(full_data, indent=2, ensure_ascii=False)
    # Replace everything between FULL_DATA = { ... };
    pattern = re.compile(r'const FULL_DATA = \{.*?\};', re.DOTALL)
    new_html = pattern.sub(f'const FULL_DATA = {json_str};', html)
    
    with open('migrate.html', 'w') as f:
        f.write(new_html)
    print("Updated migrate.html")
except Exception as e:
    print(f"Error updating migrate.html: {e}")

print("Data synced successfully.")
