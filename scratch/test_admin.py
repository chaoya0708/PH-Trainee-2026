import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec"
req = urllib.request.Request(f"{url}?role=admin", method='POST', headers={'Content-Type': 'text/plain'})
data = json.dumps({'action': 'getInitData', 'role': 'admin'}).encode('utf-8')
with urllib.request.urlopen(req, data=data, context=ctx) as r:
    res = json.loads(r.read().decode('utf-8'))
    print(json.dumps(res.get('schedules', {}), indent=2))
