import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec"

with open('scratch/full_data.json', 'r') as f:
    obs = json.load(f).get('observations', [])

trainees = set(o['traineeId'] for o in obs if 'traineeId' in o)
schedList = []

for tid in trainees:
    req = urllib.request.Request(f"{url}?role=trainee&traineeId={tid}", method='POST', headers={'Content-Type': 'text/plain'})
    data = json.dumps({'action': 'getInitData', 'role': 'trainee', 'traineeId': tid}).encode('utf-8')
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

with open('scratch/correct_scheds.json', 'w') as f:
    json.dump(schedList, f, indent=2)
print(f"Generated correct_scheds.json with {len(schedList)} records")
