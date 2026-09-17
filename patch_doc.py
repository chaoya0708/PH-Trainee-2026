import urllib.request
import json

url = "https://firestore.googleapis.com/v1/projects/ph-trainee-2026/databases/(default)/documents/observations/IIJm8kamuJuQN2dqEiu5?updateMask.fieldPaths=targetWeek&updateMask.fieldPaths=submittedAt&updateMask.fieldPaths=date"

data = {
    "fields": {
        "targetWeek": {"stringValue": "2026-06-01~2026-07-10"},
        "submittedAt": {"stringValue": "2026-07-12T19:00:00+08:00"},
        "date": {"stringValue": "2026-07-12T19:00:00+08:00"}
    }
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='PATCH')
req.add_header('Content-Type', 'application/json')
res = urllib.request.urlopen(req)
print(res.read().decode('utf-8'))
