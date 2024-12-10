/**
 * Calculate exam statistics: total, active, and upcoming exams.
 * @param {Array} exams - List of exam objects with startDate and endDate.
 * @returns {Object} An object containing the total, active, and upcoming exam counts.
 */
function calculateExamStatistics(exams) {
    const now = new Date(); // Current UTC time
  
    const total = exams.length;
    const activeExams = exams.filter(
      exam => now >= exam.startDate && now <= exam.endDate
    ).length;
    const upcomingExams = exams.filter(
      exam => now < exam.startDate
    ).length;
  
    return {
      total,
      activeExams,
      upcomingExams
    };
  }
  
  module.exports = {
    calculateExamStatistics
  };