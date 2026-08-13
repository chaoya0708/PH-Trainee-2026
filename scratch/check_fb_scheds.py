import urllib.request
import json
project_id = 'ph-trainee-2026'
url = f'https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/schedules?pageSize=5'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    print(json.dumps(data.get('documents', []), indent=2))
