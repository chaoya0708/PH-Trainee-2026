import sys

with open('js/config.js', 'r') as f:
    content = f.read()

content = content.replace("'白妙儀 (Diane Solomon Barcelenia)'", "'白妙儀 / Diane Solomon Barcelenia'")
content = content.replace("'段亦林 (Mark Jayzon Comon Dagala)'", "'段亦林 / Mark Jayzon Comon Dagala'")
content = content.replace("'侯俊材 (Jairuz Delos Reyes Nazareno)'", "'侯俊材 / Jairuz Delos Reyes Nazareno'")

with open('js/config.js', 'w') as f:
    f.write(content)

print("Patch applied to config.js")
