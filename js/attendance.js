/**
 * AttendIQ Attendance Calculation Engine
 * Accurate mathematical utilities for student attendance metrics.
 */

const AttendanceEngine = {
  MIN_TARGET: 75, // 75% minimum attendance rule

  /**
   * Calculate attendance percentage.
   * @param {number} attended - Number of classes attended
   * @param {number} total - Total classes conducted
   * @returns {number} Attendance percentage rounded to 1 decimal place
   */
  calculatePercentage(attended, total) {
    if (!total || total <= 0) return 0;
    if (attended < 0) attended = 0;
    if (attended > total) attended = total;
    return Number(((attended / total) * 100).toFixed(1));
  },

  /**
   * Determine status based on minimum target (75%).
   * @param {number} percentage
   * @returns {'safe' | 'warning' | 'critical'}
   */
  getStatus(percentage) {
    if (percentage >= this.MIN_TARGET) {
      return 'safe';
    } else if (percentage >= 65) {
      return 'warning';
    } else {
      return 'critical';
    }
  },

  /**
   * Calculate consecutive classes needed to reach 75% attendance.
   * Formula:
   * (attended + x) / (total + x) >= 0.75
   * (attended + x) / (total + x) >= 3/4
   * 4 * (attended + x) >= 3 * (total + x)
   * 4*attended + 4x >= 3*total + 3x
   * x >= 3*total - 4*attended
   *
   * @param {number} attended - Number of attended classes
   * @param {number} total - Total classes conducted
   * @returns {number} Number of consecutive classes needed (0 if already >= 75%)
   */
  classesNeededToReachTarget(attended, total) {
    if (!total || total === 0) return 0;
    const currentPercent = (attended / total) * 100;
    if (currentPercent >= this.MIN_TARGET) return 0;

    const needed = Math.ceil(3 * total - 4 * attended);
    return Math.max(0, needed);
  },

  /**
   * Calculate number of classes a student can safely miss without dropping below 75%.
   * Formula:
   * attended / (total + y) >= 0.75
   * attended / (total + y) >= 3/4
   * 4 * attended >= 3 * (total + y)
   * 3y <= 4 * attended - 3 * total
   * y <= (4 * attended - 3 * total) / 3
   *
   * @param {number} attended - Number of attended classes
   * @param {number} total - Total classes conducted
   * @returns {number} Number of classes that can be safely missed
   */
  classesCanMiss(attended, total) {
    if (!total || total === 0) return 0;
    const currentPercent = (attended / total) * 100;
    if (currentPercent < this.MIN_TARGET) return 0;

    const safeMisses = Math.floor((4 * attended - 3 * total) / 3);
    return Math.max(0, safeMisses);
  },

  /**
   * Aggregate statistics across an array of subjects.
   * @param {Array} subjects
   * @returns {Object} Overall summary stats
   */
  calculateOverall(subjects = []) {
    if (!subjects || subjects.length === 0) {
      return {
        totalClasses: 0,
        attendedClasses: 0,
        missedClasses: 0,
        percentage: 0,
        status: 'safe',
        criticalSubjectsCount: 0,
        safeSubjectsCount: 0,
        totalSubjects: 0
      };
    }

    let totalClasses = 0;
    let attendedClasses = 0;
    let missedClasses = 0;
    let criticalSubjectsCount = 0;
    let safeSubjectsCount = 0;

    subjects.forEach(sub => {
      const attended = Number(sub.attended) || 0;
      const missed = Number(sub.missed) || 0;
      const total = Number(sub.total) || (attended + missed);

      totalClasses += total;
      attendedClasses += attended;
      missedClasses += missed;

      const pct = this.calculatePercentage(attended, total);
      if (pct >= this.MIN_TARGET) {
        safeSubjectsCount++;
      } else {
        criticalSubjectsCount++;
      }
    });

    const overallPercentage = this.calculatePercentage(attendedClasses, totalClasses);
    const overallStatus = this.getStatus(overallPercentage);

    return {
      totalClasses,
      attendedClasses,
      missedClasses,
      percentage: overallPercentage,
      status: overallStatus,
      criticalSubjectsCount,
      safeSubjectsCount,
      totalSubjects: subjects.length
    };
  }
};

// Export for module or standard browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AttendanceEngine;
}
