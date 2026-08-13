import urllib.request
import urllib.parse
import json
import time

bucket = "ph-trainee-2026.appspot.com"
name = "uploads/test_" + str(int(time.time())) + ".txt"
url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?name={urllib.parse.quote(name)}"

req = urllib.request.Request(url, data=b"hello world", headers={'Content-Type': 'text/plain'}, method='POST')
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    print("SUCCESS", data)
except Exception as e:
    print("FAILED", e, e.read().decode())
