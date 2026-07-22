import re

with open('js/config.js', 'r') as f:
    config_content = f.read()

with open('new_mark_schedules.txt', 'r') as f:
    new_schedules = f.read().rstrip()

target_str = "      '2026-07-10': { dept: 'cmf_production', objective: '成型蒸炊單位執行設備拆洗 / Equipment Disassembly & Cleaning' }"
# To be safe, let's make sure it's the one in Mark's block.
# Actually, the text is only found in Mark's block anyway, let's verify if there are multiple.
if config_content.count(target_str) == 1:
    replacement = target_str + ",\n" + new_schedules
    new_config = config_content.replace(target_str, replacement)

    with open('js/config.js', 'w') as f:
        f.write(new_config)

    print("Injected into config.js")
else:
    print(f"Error: Found {config_content.count(target_str)} occurrences of the target string.")
