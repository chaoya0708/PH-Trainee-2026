import json
import urllib.request

url = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec'

data = json.dumps({'action': 'getAllObservations'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'text/plain'})
with urllib.request.urlopen(req) as res:
    obs = json.loads(res.read().decode('utf-8'))

for o in obs:
    if o.get('traineeId') == 'jairuz':
        if '08-09' in o.get('submittedAt', '') or '08/09' in o.get('submittedAt', ''):
            print("Found exact:", o)
            update_payload = {
                'action': 'updateObservation',
                'id': o['id'],
                'data': { 'department': 'yushan_packaging' }
            }
            req2 = urllib.request.Request(url, data=json.dumps(update_payload).encode('utf-8'), headers={'Content-Type': 'text/plain'})
            with urllib.request.urlopen(req2) as res2:
                print("Update response:", json.loads(res2.read().decode('utf-8')))
        else:
            # Print other jairuz observations to debug if exact match fails
            print("Other jairuz:", o.get('id'), o.get('submittedAt'), o.get('department'))
