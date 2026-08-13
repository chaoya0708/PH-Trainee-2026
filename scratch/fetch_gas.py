import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec"

def fetch_action(action):
    req = urllib.request.Request(url, method='POST', headers={'Content-Type': 'text/plain'})
    data = json.dumps({'action': action}).encode('utf-8')
    try:
        # Apps Script returns a 302 redirect. urllib handles redirects automatically.
        with urllib.request.urlopen(req, data=data, context=ctx) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {action}: {e}")
        return None

print("Fetching observations...")
obs = fetch_action('getAllObservations')

print("Fetching guest comments...")
comments = fetch_action('getAllGuestComments')

print("Fetching schedules...")
scheds = fetch_action('getAllSchedules')

print("Fetching assessments...")
assess = fetch_action('getAssessments')

print("Fetching resources...")
res = fetch_action('getAllResources')

data = {
    'observations': obs,
    'guestComments': comments,
    'schedules': scheds,
    'assessments': assess,
    'resources': res
}

with open('scratch/gas_data.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved to scratch/gas_data.json")
