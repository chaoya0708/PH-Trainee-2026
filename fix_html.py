import re

with open('index.html', 'r') as f:
    html = f.read()

# Replace Login Brand
old_login_brand = """      <div class="login-brand">
        <span class="login-logo">🎓</span>
        <div>
          <h1>VIMEI Knowledge Tracker</h1>
          <p>儲備幹部輪調學習歷程與里程碑追蹤</p>
        </div>
      </div>"""

new_login_brand = """      <div class="login-brand" style="flex-direction: column;">
        <img src="https://www.chimeifood.com.tw/assets/images/logo.png" alt="Chimei Food Logo" class="brand-logo-large" onerror="this.src='https://dummyimage.com/600x200/000/fff&text=CHIMEI+FOOD'"/>
        <div style="text-align: center; margin-top: 10px;">
          <h1 style="display:none;">VIMEI Knowledge Tracker</h1>
          <p style="font-family: var(--font-serif); font-size: 14px;">儲備幹部輪調學習歷程與里程碑追蹤</p>
        </div>
      </div>"""

html = html.replace(old_login_brand, new_login_brand)

# Replace Dashboard sidebar Brand
old_dash_brand = """      <div class="brand">
        <span class="brand-logo">🎓</span>
        <div class="brand-text">
          <h1>VIMEI</h1>
          <p>Knowledge Tracker</p>
        </div>
      </div>"""

new_dash_brand = """      <div class="brand" style="justify-content: center; padding-bottom: 30px;">
        <img src="https://www.chimeifood.com.tw/assets/images/logo.png" alt="Chimei Food Logo" class="dashboard-logo" onerror="this.src='https://dummyimage.com/300x100/000/fff&text=CHIMEI'"/>
        <div class="brand-text" style="display:none;">
          <h1>VIMEI</h1>
          <p>Knowledge Tracker</p>
        </div>
      </div>"""

html = html.replace(old_dash_brand, new_dash_brand)

with open('index.html', 'w') as f:
    f.write(html)
print("done")
