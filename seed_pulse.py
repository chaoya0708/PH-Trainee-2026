import urllib.request
import json
import datetime

project_id = "ph-trainee-2026"
url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/pulse_checks/trainee_1"

now_iso = datetime.datetime.utcnow().isoformat() + "Z"
body = json.dumps({
    'fields': {
        'status': {'stringValue': 'green'},
        'updatedAt': {'stringValue': now_iso}
    }
}).encode('utf-8')

req = urllib.request.Request(url, data=body, method='PATCH', headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
print("Seeded trainee_1 (Jairuz) to green:", res.read())
