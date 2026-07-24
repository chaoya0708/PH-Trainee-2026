import re

with open('js/app.js', 'r') as f:
    content = f.read()

old_logic = r"""      const pct   = calculateMilestoneProgress\(state\.observations, viewId, dept\.id\);
      const deptObs = state\.observations\.filter\(o => o\.traineeId === viewId && o\.department === dept\.id\);
      const c1 = deptObs\.length > 0;
      const c2 = deptObs\.some\(o => o\.rating > 0\);
      const c3 = deptObs\.some\(o => o\.rating >= 3\);
      const c4 = deptObs\.some\(o => o\.rating >= 4 && o\.status === 'reviewed'\);

      const ci = \(done, label\) => `
        <li class="criteria-item \$\{done \? 'done' : ''\}">
          <i class="\$\{done \? 'fi fi-rr-check-circle' : 'fi fi-rr-circle'\}" style="font-size:11px;"></i>
          \$\{label\}
        </li>`;

      const assessment = \(state\.assessments \|\| \[\]\)\.find\(a => a\.traineeId === viewId && a\.department === dept\.id\);"""

new_logic = r"""      const deptObs = state.observations.filter(o => o.traineeId === viewId && o.department === dept.id);
      const assessment = (state.assessments || []).find(a => a.traineeId === viewId && a.department === dept.id);
      
      const c1 = deptObs.length > 0;
      const c2 = deptObs.some(o => o.rating > 0);
      const c3 = !!assessment;
      const c4 = assessment && (assessment.grade === 'A' || assessment.grade === 'B');
      
      // We calculate percentage based on these new criteria
      let doneCount = 0;
      if (c1) doneCount++;
      if (c2) doneCount++;
      if (c3) doneCount++;
      if (c4) doneCount++;
      const pct = (doneCount / 4) * 100;

      const ci = (done, label) => `
        <li class="criteria-item ${done ? 'done' : ''}">
          <i class="${done ? 'fi fi-rr-check-circle' : 'fi fi-rr-circle'}" style="font-size:11px;"></i>
          ${label}
        </li>`;
"""

content = re.sub(old_logic, new_logic, content)

with open('js/app.js', 'w') as f:
    f.write(content)
