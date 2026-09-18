import urllib.request
import json

updates = {
    'obs-new3': 4,
    'obs-new5': 4,
    'obs-new8': 4,
    'obs-new7': 5
}

base_url = "https://firestore.googleapis.com/v1/projects/ph-trainee-2026/databases/(default)/documents/observations/"

for doc_id, rating in updates.items():
    url = f"{base_url}{doc_id}?updateMask.fieldPaths=selfRating"
    data = {
        "fields": {
            "selfRating": {"integerValue": str(rating)}
        }
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='PATCH')
    req.add_header('Content-Type', 'application/json')
    try:
        res = urllib.request.urlopen(req)
        print(f"Successfully updated {doc_id} to {rating}")
    except Exception as e:
        print(f"Failed to update {doc_id}: {e}")

