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
  const targetDept = (window.CONFIG && window.CONFIG.DEPARTMENTS) 
    ? (window.CONFIG.DEPARTMENTS[deptId] || {}) 
    : {};

  const matchDept = (deptStr) => {
    if (!deptStr) return false;
    if (deptStr === deptId) return true;
    if (targetDept.name && deptStr === targetDept.name) return true;
    if (targetDept.nameZh && deptStr === targetDept.nameZh) return true;
    if (targetDept.shortZh && deptStr === targetDept.shortZh) return true;
    return false;
  };

  const deptObs = observations.filter(
    o => o.traineeId === traineeId && matchDept(o.department)
  );
  
  const assessment = (window.state && window.state.assessments) 
    ? window.state.assessments.find(a => a.traineeId === traineeId && matchDept(a.department)) 
    : null;

  let score = 0;

  const c1 = deptObs.length > 0;
  const c2 = deptObs.some(o => o.status && o.status.trim().toLowerCase() === 'reviewed');
  const c3 = !!assessment;
  const c4 = assessment && ['A+', 'A', 'B'].includes((assessment.grade || '').trim().toUpperCase());

  if (c1) score += 25;
  if (c2) score += 25;
  if (c3) score += 25;
  if (c4) score += 25;

  return score;
}

window.VimeiData = { calculateMilestoneProgress };
window.calculateMilestoneProgress = calculateMilestoneProgress;

