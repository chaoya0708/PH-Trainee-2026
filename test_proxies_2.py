import urllib.request
import urllib.parse

fileId = '1t-1A-sIOMmB0sJ93x1Yh7r_g2g7Y-K_O'
directUrl = f'https://drive.google.com/uc?export=download&id={fileId}'
encodedUrl = urllib.parse.quote(directUrl)

proxies = [
    ('thingproxy', f'https://thingproxy.freeboard.io/fetch/{directUrl}'),
    ('cors-anywhere', f'https://cors-anywhere.herokuapp.com/{directUrl}')
]

for name, url in proxies:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as res:
            data = res.read()
            print(f"{name} Status: {res.status}, Size: {len(data)}")
            print(f"{name} Start: {data[:50]}")
    except Exception as e:
        print(f"{name} Error: {e}")
