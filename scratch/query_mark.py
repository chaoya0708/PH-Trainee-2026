import urllib.request
import json
url = "https://firestore.googleapis.com/v1/projects/ph-trainee-2026/databases/(default)/documents/observations/?pageSize=300"
req = urllib.request.Request(url)
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode("utf-8"))
for doc in data.get("documents", []):
    fields = doc.get("fields", {})
    trainee = fields.get("traineeId", {}).get("stringValue", "")
    objective = fields.get("objective", {}).get("stringValue", "")
    targetWeek = fields.get("targetWeek", {}).get("stringValue", "")
    if trainee == "mark":
        doc_id = doc["name"].split("/")[-1]
        print(f"ID: {doc_id}, Week: {targetWeek}, Obj: {objective}, fields: {fields.get('selfRating', {})}")
