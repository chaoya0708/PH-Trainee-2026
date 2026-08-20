import urllib.request
import json

project_id = "ph-trainee-2026"
url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations"

req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read())

found = False
for doc in data.get('documents', []):
    fields = doc.get('fields', {})
    traineeId = fields.get('traineeId', {}).get('stringValue', '')
    targetWeek = fields.get('targetWeek', {}).get('stringValue', '')
    if traineeId == "diane" and targetWeek == "2026-08-10~2026-08-14":
        doc_url = f"https://firestore.googleapis.com/v1/{doc['name']}?updateMask.fieldPaths=selfRating"
        patch_data = {
            "fields": {
                "selfRating": {"doubleValue": 4.5}
            }
        }
        patch_req = urllib.request.Request(doc_url, data=json.dumps(patch_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
        patch_res = urllib.request.urlopen(patch_req)
        print("Updated Firebase!", json.loads(patch_res.read()))
        found = True

if not found:
    print("Not found in Firebase.")
