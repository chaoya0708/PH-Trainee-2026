import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec"
tid = "mark"

req = urllib.request.Request(f"{url}?role=trainee&traineeId={tid}", method='POST', headers={'Content-Type': 'text/plain'})
data = json.dumps({'action': 'getInitData', 'role': 'trainee', 'traineeId': tid}).encode('utf-8')
schedList = []
try:
    with urllib.request.urlopen(req, data=data, context=ctx) as r:
        init_data = json.loads(r.read().decode('utf-8'))
        sched_dict = init_data.get('schedules', {})
        for date, details in sched_dict.items():
            schedList.append({
                'traineeId': tid,
                'date': date,
                'dept': details.get('dept', ''),
                'objective': details.get('objective', '')
            })
except Exception as e:
    print(f"Failed for {tid}: {e}")

print(f"Fetched {len(schedList)} schedules for {tid}")

if schedList:
    project_id = 'ph-trainee-2026'
    base_url = f'https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents'
    count = 0
    for s in schedList:
        docData = {
            'fields': {
                'traineeId': {'stringValue': s.get('traineeId', '')},
                'date': {'stringValue': s.get('date', '')},
                'dept': {'stringValue': s.get('dept', '')},
                'objective': {'stringValue': s.get('objective', '')}
            }
        }
        push_req = urllib.request.Request(f"{base_url}/schedules", method='POST', headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(push_req, data=json.dumps(docData).encode('utf-8')) as r:
                count += 1
        except Exception as e:
            pass
    print(f"Successfully pushed {count} schedules for {tid} to Firebase!")

