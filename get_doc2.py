import urllib.request
import json

url = "https://firestore.googleapis.com/v1/projects/ph-trainee-2026/databases/(default)/documents/observations/obs-new7"
req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read())
print(json.dumps(data, indent=2))
