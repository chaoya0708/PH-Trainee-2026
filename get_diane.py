import urllib.request
import json

project_id = "ph-trainee-2026"
url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations?pageSize=300"
req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read())

for doc in data.get('documents', []):
    fields = doc.get('fields', {})
    trainee = fields.get('traineeId', {}).get('stringValue', '')
    if trainee == 'diane':
        doc_id = doc['name'].split('/')[-1]
        dept = fields.get('department', {}).get('stringValue', '')
        week = fields.get('targetWeek', {}).get('stringValue', '')
        rating = fields.get('selfRating', {}).get('integerValue', '') or fields.get('selfRating', {}).get('doubleValue', '')
        date = fields.get('submittedAt', {}).get('stringValue', '') or fields.get('date', {}).get('stringValue', '')
        print(f"ID: {doc_id} | Dept: {dept} | Week: {week} | Rating: {rating} | Date: {date}")
