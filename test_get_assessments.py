import urllib.request
import json

url = 'https://script.google.com/macros/s/AKfycbxRQtIUr5rYPsLrbL4SJLZt8mwJBXVF1Z1xim_aJux0IuGy72GXk9qGC7HH5JB-MNPvdA/exec?action=getAssessments'

req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode('utf-8'))
print(json.dumps(data, indent=2))
