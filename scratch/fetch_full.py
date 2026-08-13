import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec"

def fetch_action(action, extra={}):
    payload = {'action': action}
    payload.update(extra)
    req = urllib.request.Request(url, method='POST', headers={'Content-Type': 'text/plain'})
    data = json.dumps(payload).encode('utf-8')
    try:
        with urllib.request.urlopen(req, data=data, context=ctx) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {action}: {e}")
        return None

obs = fetch_action('getAllObservations')
comments = fetch_action('getAllGuestComments')
assess = fetch_action('getAssessments')
res = fetch_action('getAllResources')

trainees = set(o['traineeId'] for o in obs if 'traineeId' in o)
scheds = []

for tid in trainees:
    # Append URL param for e.parameter
    req = urllib.request.Request(f"{url}?role=trainee&traineeId={tid}", method='POST', headers={'Content-Type': 'text/plain'})
    data = json.dumps({'action': 'getInitData'}).encode('utf-8')
    try:
        with urllib.request.urlopen(req, data=data, context=ctx) as r:
            init_data = json.loads(r.read().decode('utf-8'))
            if 'schedules' in init_data:
                for date, details in init_data['schedules'].items():
                    scheds.append({
                        'traineeId': tid,
                        'date': date,
                        'dept': details.get('dept', ''),
                        'objective': details.get('objective', '')
                    })
    except Exception as e:
        pass

data = {
    'observations': obs or [],
    'guest_comments': comments or [],
    'assessments': assess or [],
    'resources': res or [],
    'schedules': scheds or []
}

with open('scratch/full_data.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done generating full_data.json")
