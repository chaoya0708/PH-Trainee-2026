import sys

with open('js/app.js', 'r') as f:
    content = f.read()

old_code = """    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.gap = '4px';
    popup.style.minWidth = '160px';

    const options = [
      { r: 'admin', i: 'admin', l: '👑 Mentor (Admin)' },
      { r: 'executive', i: 'executive', l: '🏢 Management' },
      { r: 'guest', i: 'cmf_production_rende', l: '👥 Guest' },
      { r: 'trainee', i: 'diane', l: '🎓 Diane' },
      { r: 'trainee', i: 'mark', l: '🎓 Mark' },
      { r: 'trainee', i: 'jairuz', l: '🎓 Jairuz' }
    ];"""

new_code = """    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.gap = '4px';
    popup.style.minWidth = '160px';
    popup.style.maxHeight = '70vh';
    popup.style.overflowY = 'auto';

    const options = [
      { r: 'admin', i: 'admin', l: '👑 Mentor (Admin)' },
      { r: 'executive', i: 'executive', l: '👔 Executive' }
    ];
    Object.values(CONFIG.DEPARTMENTS).filter(d => !d.isRecordOnly).forEach(d => {
      options.push({ r: 'guest', i: d.id, l: '📋 ' + (d.shortZh || d.nameZh || d.name) });
    });
    options.push(
      { r: 'trainee', i: 'diane', l: '👩‍🎓 Trainee (Diane)' },
      { r: 'trainee', i: 'mark', l: '👨‍🎓 Trainee (Mark)' },
      { r: 'trainee', i: 'jairuz', l: '👨‍🎓 Trainee (Jairuz)' }
    );"""

content = content.replace(old_code, new_code)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied to app.js")
