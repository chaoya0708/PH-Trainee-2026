import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

try:
    driver = webdriver.Chrome(options=options)
    driver.get('file:///Users/sofiacykung/Documents/antigravity_demo/MA%20Program/index.html')
    time.sleep(1)
    logs = driver.get_log('browser')
    for log in logs:
        print(log)
    driver.quit()
except Exception as e:
    print("Error:", e)
