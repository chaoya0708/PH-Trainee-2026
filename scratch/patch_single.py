import urllib.request
import json

project_id = "ph-trainee-2026"
doc_id = "Yo09CMH1MZ8io87I4nky"
rating = 3

doc_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations/{doc_id}?updateMask.fieldPaths=selfRating"
patch_data = {
    "fields": {
        "selfRating": {"integerValue": str(rating)}
    }
}
patch_req = urllib.request.Request(doc_url, data=json.dumps(patch_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
try:
    patch_res = urllib.request.urlopen(patch_req)
    print(f"Updated {doc_id} to {rating}!")
except Exception as e:
    print(f"Error updating {doc_id}: {e}")
