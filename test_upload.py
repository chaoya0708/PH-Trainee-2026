import urllib.request
import json

url = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec'
data = {
  'action': 'uploadFile',
  'base64': 'data:text/plain;base64,SGVsbG8gV29ybGQh',
  'mimeType': 'text/plain',
  'filename': 'test.txt'
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='POST', headers={'Content-Type': 'text/plain'})
try:
    with urllib.request.urlopen(req) as response:
        print('Response:', response.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)
