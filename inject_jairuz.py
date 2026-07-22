import re

with open('js/config.js', 'r') as f:
    config_content = f.read()

with open('new_jairuz_schedules.txt', 'r') as f:
    new_schedules = f.read().rstrip()

target_str = "      '2026-07-10': { dept: 'cmf_production', objective: '西點單位執行550成型篩選/封口 / Model 550 Forming / Inspection / Sealing' }"

if config_content.count(target_str) == 1:
    replacement = target_str + ",\n" + new_schedules
    new_config = config_content.replace(target_str, replacement)

    with open('js/config.js', 'w') as f:
        f.write(new_config)

    print("Injected into config.js")
else:
    print(f"Error: Found {config_content.count(target_str)} occurrences of the target string.")
