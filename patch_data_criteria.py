import re

with open('js/data.js', 'r') as f:
    content = f.read()

# Replace calculateMilestoneProgress
old_func = r"""function calculateMilestoneProgress\(observations, traineeId, deptId\) \{
  const deptObs = observations\.filter\(o => o\.traineeId === traineeId && o\.department === deptId\);
  if \(deptObs\.length === 0\) return 0;

  let doneCount = 1; // c1
  const hasFeedback = deptObs\.some\(o => o\.rating > 0\);
  const goodRating = deptObs\.some\(o => o\.rating >= 3\);
  const excellentAndReviewed = deptObs\.some\(o => o\.rating >= 4 && o\.status === 'reviewed'\);

  if \(hasFeedback\) doneCount\+\+;
  if \(goodRating\) doneCount\+\+;
  if \(excellentAndReviewed\) doneCount\+\+;

  return \(doneCount / 4\) \* 100;
\}"""

new_func = """function calculateMilestoneProgress(observations, traineeId, deptId) {
  const deptObs = observations.filter(o => o.traineeId === traineeId && o.department === deptId);
  // Need assessments from global state
  const assessment = (window.state && window.state.assessments) ? window.state.assessments.find(a => a.traineeId === traineeId && a.department === deptId) : null;
  
  let doneCount = 0;
  
  const c1 = deptObs.length > 0;
  const c2 = deptObs.some(o => o.rating > 0);
  const c3 = !!assessment;
  const c4 = assessment && (assessment.grade === 'A' || assessment.grade === 'B');

  if (c1) doneCount++;
  if (c2) doneCount++;
  if (c3) doneCount++;
  if (c4) doneCount++;

  return (doneCount / 4) * 100;
}"""

content = re.sub(old_func, new_func, content)

with open('js/data.js', 'w') as f:
    f.write(content)
