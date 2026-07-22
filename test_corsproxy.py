import urllib.request

fileId = '1t-1A-sIOMmB0sJ93x1Yh7r_g2g7Y-K_O'
directUrl = f'https://drive.google.com/uc?export=download&id={fileId}'
proxyUrl = 'https://corsproxy.io/?' + directUrl

req = urllib.request.Request(proxyUrl, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as res:
        data = res.read()
        print("Status:", res.status)
        print("Size:", len(data))
        print("Start:", data[:200])
except Exception as e:
    print("Error:", e)
