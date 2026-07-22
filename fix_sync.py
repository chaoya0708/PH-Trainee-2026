import re

with open('js/app.js', 'r') as f:
    js = f.read()

# Add a return at the top of autoSyncSchedules to disable the forced upload
js = js.replace("window.autoSyncSchedules = async function() {\n  if (CONFIG.DEMO_MODE) return;", "window.autoSyncSchedules = async function() {\n  return; // DISABLED: Data is already in Google Sheets\n  if (CONFIG.DEMO_MODE) return;")

with open('js/app.js', 'w') as f:
    f.write(js)
print("done")
