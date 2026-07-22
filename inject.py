import re

with open('js/config.js', 'r') as f:
    config_content = f.read()

with open('new_diane_schedules.txt', 'r') as f:
    new_schedules = f.read().rstrip()

# Find the end of Diane's schedules
target_str = "      '2026-06-26': { dept: 'cmf_production', objective: '調理單位執行燒賣調理配餡 / Siomai Filling Preparation' }"
replacement = target_str + ",\n" + new_schedules

new_config = config_content.replace(target_str, replacement)

with open('js/config.js', 'w') as f:
    f.write(new_config)

print("Injected into config.js")
