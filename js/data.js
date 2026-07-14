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
  if (deptObs.length === 0) return 0;

  let score = 25; // has at least one submission

  const hasRating  = deptObs.some(o => o.rating > 0);
  if (hasRating) score += 25;

  const hasGoodRating = deptObs.some(o => o.rating >= 3);
  if (hasGoodRating) score += 25;

  const hasExcellent = deptObs.some(o => o.rating >= 4 && o.status === 'reviewed');
  if (hasExcellent) score += 25;

  return score;
}

window.VimeiData = { calculateMilestoneProgress };
window.calculateMilestoneProgress = calculateMilestoneProgress;

