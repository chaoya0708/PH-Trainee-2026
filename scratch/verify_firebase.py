import urllib.request
import json

project_id = 'ph-trainee-2026'
base_url = f'https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents'

def get_collection_count(collection_name):
    url = f"{base_url}/{collection_name}?pageSize=1000"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            docs = data.get('documents', [])
            return len(docs)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return 0
        else:
            return -1
    except Exception as e:
        return -1

with open('scratch/full_data.json', 'r') as f:
    local_data = json.load(f)

collections = ['observations', 'guest_comments', 'assessments', 'resources', 'schedules']

print(f"{'Collection':<20} | {'Expected (Google Sheets)':<25} | {'Actual (Firebase)':<20} | {'Status'}")
print("-" * 80)

all_match = True
for col in collections:
    expected = len(local_data.get(col, []))
    actual = get_collection_count(col)
    
    status = "✅ MATCH" if expected == actual else "❌ MISMATCH"
    if expected != actual:
        all_match = False
    
    print(f"{col:<20} | {expected:<25} | {actual:<20} | {status}")

print("-" * 80)
if all_match:
    print("VERIFICATION SUCCESS: All collections match exactly!")
else:
    print("VERIFICATION FAILED: Data counts do not match!")
