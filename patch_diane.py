import urllib.request
import json

project_id = "ph-trainee-2026"
base_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations/"

updates = {
    'Mpn7TWHd71IllD1aBrWR': {'targetWeek': '6/1~7/10', 'submittedAt': '2026-07-11T10:00:00+08:00', 'date': '2026-07-11T10:00:00+08:00', 'selfRating': 4.5},
    'obs-new1': {'selfRating': 4.0},
    'obs-new6': {'selfRating': 4.0},
    'obs-new9': {'selfRating': 3.5},
    'obs-new12': {'selfRating': 4.5}
}

for doc_id, fields_to_update in updates.items():
    # Construct update body
    fields = {}
    updateMask = []
    for k, v in fields_to_update.items():
        if isinstance(v, float):
            fields[k] = {'doubleValue': v}
        elif isinstance(v, int):
            fields[k] = {'integerValue': str(v)}
        else:
            fields[k] = {'stringValue': str(v)}
        updateMask.append(f"updateMask.fieldPaths={k}")
        
    body = json.dumps({'fields': fields}).encode('utf-8')
    url = base_url + doc_id + "?" + "&".join(updateMask)
    
    req = urllib.request.Request(url, data=body, method='PATCH', headers={'Content-Type': 'application/json'})
    try:
        res = urllib.request.urlopen(req)
        print(f"Updated {doc_id}")
    except Exception as e:
        print(f"Failed to update {doc_id}: {e}")

