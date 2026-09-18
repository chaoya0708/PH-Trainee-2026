import urllib.request
import json

url = "https://firestore.googleapis.com/v1/projects/ph-trainee-2026/databases/(default)/documents/observations"
req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read())

for doc in data.get('documents', []):
    fields = doc.get('fields', {})
    traineeId = fields.get('traineeId', {}).get('stringValue', '')
    if traineeId == 'jairuz':
        name = doc['name']
        dept = fields.get('department', {}).get('stringValue', '')
        week = fields.get('targetWeek', {}).get('stringValue', '')
        print(f"ID: {name.split('/')[-1]}, Dept: {dept}, Week: {week}")
