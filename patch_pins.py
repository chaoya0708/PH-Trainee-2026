import sys

# Update config.js
with open('js/config.js', 'r') as f:
    config_content = f.read()

config_content = config_content.replace("ADMIN_PIN: '0000',", "ADMIN_PIN: '3142',")

# Update guest pins in config.js which were also 0000 (wait, let me check if they were 0000)
# Actually, the user wants the master pin and God mode to be 3142. They didn't mention other pins, but we can change the admin pin first. Let's just do ADMIN_PIN.

with open('js/config.js', 'w') as f:
    f.write(config_content)

# Update app.js
with open('js/app.js', 'r') as f:
    app_content = f.read()

app_content = app_content.replace("Auth.login(opt.r, opt.i, '0000');", "Auth.login(opt.r, opt.i, CONFIG.ADMIN_PIN);")
app_content = app_content.replace('if (pin === "0000") {', 'if (pin === CONFIG.ADMIN_PIN) {')
app_content = app_content.replace("Auth.login(role, id, '0000');", "Auth.login(role, id, CONFIG.ADMIN_PIN);")

with open('js/app.js', 'w') as f:
    f.write(app_content)

print("Patch applied to config.js and app.js")
