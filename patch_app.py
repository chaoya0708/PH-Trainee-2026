import sys

with open('js/app.js', 'r') as f:
    content = f.read()

target = """      html += grouped[tId].map(a => {
        const dept = CONFIG.DEPARTMENTS[a.department] || {};
        return `
                  <div class="glass-card" style="padding:12px; border-left: 4px solid ${dept.color || 'var(--primary)'}; margin:0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                      <div>
                        <span style="font-weight:bold; font-size:13px;">${state.activeLanguage === 'zh' ? (dept.nameZh || dept.name) : dept.name}</span>"""

replacement = """      html += grouped[tId].map(a => {
        let isSelf = a.department && a.department.startsWith('self_eval');
        let deptName = '';
        let monthStr = '';
        if (isSelf) {
          monthStr = a.department.replace('self_eval_', '');
          deptName = state.activeLanguage === 'zh' ? `自我評估 (${monthStr})` : `Self Assessment (${monthStr})`;
        } else {
          const dept = CONFIG.DEPARTMENTS[a.department] || {};
          deptName = state.activeLanguage === 'zh' ? (dept.nameZh || dept.name) : dept.name;
        }
        const leftColor = isSelf ? 'var(--primary)' : (CONFIG.DEPARTMENTS[a.department]?.color || 'var(--primary)');

        return \`
                  <div class="glass-card" style="padding:12px; border-left: 4px solid \${leftColor}; margin:0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                      <div>
                        <span style="font-weight:bold; font-size:13px;">\${deptName}</span>"""

if target in content:
    content = content.replace(target, replacement)
    with open('js/app.js', 'w') as f:
        f.write(content)
    print("Success replacing block 1")
else:
    print("Failed to find target 1")
