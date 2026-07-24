/**
 * VIMEI Knowledge Tracker - Static Data Utilities (v2)
 * =====================================================
 * localStorage 已移至 api.js 管理。
 * 此檔案僅提供靜態輔助函式。
 */

/**
 * Calculate completion percentage for a trainee in one department.
 * Criteria (25% each):
 *   1. At least one observation submitted
 *   2. At least one observation has a rating > 0 (admin reviewed)
 *   3. At least one observation has rating >= 3
 *   4. At least one observation has rating >= 4 AND status === 'reviewed'
 */
function calculateMilestoneProgress(observations, traineeId, deptId) {
  const deptObs = observations.filter(
    o => o.traineeId === traineeId && o.department === deptId
  );
  
  const assessment = (window.state && window.state.assessments) 
    ? window.state.assessments.find(a => a.traineeId === traineeId && a.department === deptId) 
    : null;

  let score = 0;

  const c1 = deptObs.length > 0;
  const c2 = deptObs.some(o => o.rating > 0);
  const c3 = !!assessment;
  const c4 = assessment && (assessment.grade === 'A' || assessment.grade === 'B');

  if (c1) score += 25;
  if (c2) score += 25;
  if (c3) score += 25;
  if (c4) score += 25;

  return score;
}

window.VimeiData = { calculateMilestoneProgress };
window.calculateMilestoneProgress = calculateMilestoneProgress;

