import urllib.request
import json

project_id = 'ph-trainee-2026'
base_url = f'https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents'

# 1. Delete all existing garbage schedules
try:
    req = urllib.request.Request(f"{base_url}/schedules?pageSize=1000")
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        for doc in data.get('documents', []):
            name = doc['name']
            del_req = urllib.request.Request(f"https://firestore.googleapis.com/v1/{name}", method='DELETE')
            urllib.request.urlopen(del_req)
            print(f"Deleted {name}")
except Exception as e:
    print(f"Error deleting: {e}")

# 2. Push correct schedules
with open('scratch/correct_scheds.json', 'r') as f:
    scheds = json.load(f)

print(f"Pushing {len(scheds)} schedules...")
count = 0
for s in scheds:
    docData = {
        'fields': {
            'traineeId': {'stringValue': s.get('traineeId', '')},
            'date': {'stringValue': s.get('date', '')},
            'dept': {'stringValue': s.get('dept', '')},
            'objective': {'stringValue': s.get('objective', '')}
        }
    }
    req = urllib.request.Request(f"{base_url}/schedules", method='POST', headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, data=json.dumps(docData).encode('utf-8')) as r:
            count += 1
    except Exception as e:
        print(f"Failed pushing sched: {e}")

print(f"Successfully pushed {count} schedules!")
