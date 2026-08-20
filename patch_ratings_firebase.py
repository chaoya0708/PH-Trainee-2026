import urllib.request
import json

project_id = "ph-trainee-2026"
url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations"

req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read())

for doc in data.get('documents', []):
    fields = doc.get('fields', {})
    doc_id = doc['name'].split('/')[-1]
    
    status = fields.get('status', {}).get('stringValue', '')
    rating_val = fields.get('rating', {})
    
    rating = 0
    if 'integerValue' in rating_val: rating = int(rating_val['integerValue'])
    if 'doubleValue' in rating_val: rating = float(rating_val['doubleValue'])
        
    self_rating = fields.get('selfRating')
    
    if status == 'pending' and rating > 0 and not self_rating:
        print(f"Patching document {doc_id} for trainee {fields.get('traineeId', {}).get('stringValue')}")
        
        patch_url = f"{url}/{doc_id}?updateMask.fieldPaths=selfRating&updateMask.fieldPaths=rating"
        
        payload = {
            "fields": {
                "selfRating": {"doubleValue": float(rating) if isinstance(rating, float) else rating, "integerValue": str(rating) if isinstance(rating, int) else None},
                "rating": {"integerValue": "0"}
            }
        }
        
        if isinstance(rating, int):
            del payload['fields']['selfRating']['doubleValue']
        else:
            del payload['fields']['selfRating']['integerValue']
            
        patch_req = urllib.request.Request(patch_url, data=json.dumps(payload).encode('utf-8'), method='PATCH')
        patch_req.add_header('Content-Type', 'application/json')
        
        try:
            patch_res = urllib.request.urlopen(patch_req)
            print(f"Successfully patched {doc_id}")
        except Exception as e:
            print(f"Failed to patch {doc_id}: {e}")
