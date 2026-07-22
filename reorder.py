import re

with open('index.html', 'r') as f:
    html = f.read()

# Extract the grid block
start_str = '<div class="role-selector-grid">'
end_str = '</div>\n    </div>\n\n    <!-- Step 2a: Admin PIN -->'

pattern = re.compile(re.escape(start_str) + r'(.*?)' + re.escape(end_str), re.DOTALL)
match = pattern.search(html)

if match:
    # We will just write the new HTML directly for the buttons
    new_grid = """<div class="role-selector-grid">
        <button class="role-btn" onclick="selectLoginRole('trainee')">
          <strong>國際生</strong>
          <small>Trainee</small>
        </button>
        <button class="role-btn" onclick="selectLoginRole('guest')">
          <strong>現場指導與評核</strong>
          <small>Station Feedback</small>
        </button>
        <button class="role-btn" onclick="selectLoginRole('executive')">
          <strong data-i18n="roleExecutiveName">管理團隊</strong>
          <small>Management Team</small>
        </button>
        <button class="role-btn" onclick="selectLoginRole('admin')">
          <strong>計畫導師</strong>
          <small>Program Mentor</small>
        </button>
      </div>
    </div>

    <!-- Step 2a: Admin PIN -->"""

    html = html[:match.start()] + new_grid + html[match.end():]

    with open('index.html', 'w') as f:
        f.write(html)
    print("Reordered successfully.")
else:
    print("Could not find the target HTML block.")

