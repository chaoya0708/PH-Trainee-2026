import urllib.request
import json

project_id = "ph-trainee-2026"
docs_to_update = [
    ("obs-new2", 3),
    ("obs-new4", 3),
    ("obs-1785926176821", 3),
    ("obs-new11", 3)
]

for doc_id, rating in docs_to_update:
    doc_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations/{doc_id}?updateMask.fieldPaths=selfRating"
    patch_data = {
        "fields": {
            "selfRating": {"integerValue": rating}
        }
    }
    patch_req = urllib.request.Request(doc_url, data=json.dumps(patch_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
    try:
        patch_res = urllib.request.urlopen(patch_req)
        print(f"Updated {doc_id} to {rating}!")
    except Exception as e:
        print(f"Error updating {doc_id}: {e}")
