import requests
import urllib.parse
# Test CORS proxy with a public file (we don't have a real drive link but we can test if the proxy works)
url = "https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/helloworld/helloworld.pdf"
proxy_url = "https://api.allorigins.win/raw?url=" + urllib.parse.quote(url)
res = requests.get(proxy_url)
print("Status:", res.status_code)
print("Content-Type:", res.headers.get('Content-Type'))
print("Length:", len(res.content))
