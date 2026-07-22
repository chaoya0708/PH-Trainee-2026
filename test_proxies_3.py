import urllib.request
import urllib.parse
import json

fileId = '1t-1A-sIOMmB0sJ93x1Yh7r_g2g7Y-K_O'
directUrl = f'https://drive.google.com/uc?export=download&id={fileId}'

# Test allorigins/get
proxyUrl = 'https://api.allorigins.win/get?url=' + urllib.parse.quote(directUrl)

req = urllib.request.Request(proxyUrl, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as res:
        data = res.read()
        print("allorigins/get Status:", res.status)
except Exception as e:
    print("allorigins/get Error:", e)
