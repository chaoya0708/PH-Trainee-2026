import urllib.request
import json

project_id = "ph-trainee-2026"
doc_id = "fsxmkAHqzMrWmjnEAobA"
new_week = "2026-06-01~2026-07-10"

doc_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations/{doc_id}?updateMask.fieldPaths=targetWeek"
patch_data = {
    "fields": {
        "targetWeek": {"stringValue": new_week}
    }
}
patch_req = urllib.request.Request(doc_url, data=json.dumps(patch_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
try:
    patch_res = urllib.request.urlopen(patch_req)
    print(f"Updated {doc_id} to {new_week}!")
except Exception as e:
    print(f"Error updating {doc_id}: {e}")
