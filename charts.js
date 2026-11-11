/**
 * Chart Manager for StudySync & AttendIQ
 * Manages Chart.js interactive visualizations for student attendance.
 */

const ChartManager = {
  overallChart: null,
  subjectBarChart: null,

  /**
   * Initialize or update both charts.
   * @param {Array} subjects
   * @param {Object} overallStats
   */
  updateCharts(subjects, overallStats) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded yet.');
      return;
    }

    this.renderOverallDoughnut(overallStats);
    this.renderSubjectBarChart(subjects);
  },

  /**
   * Render or update Overall Attendance Doughnut Chart
   */
  renderOverallDoughnut(overallStats) {
    const ctx = document.getElementById('overallDoughnutChart');
    if (!ctx) return;

    const attended = overallStats.attendedClasses || 0;
    const missed = overallStats.missedClasses || 0;
    const total = attended + missed;
    const hasData = total > 0;
    const isSafe = overallStats.percentage >= 75;

    const data = hasData ? {
      labels: ['Attended Classes', 'Missed Classes'],
      datasets: [
        {
          data: [attended, missed],
          backgroundColor: [
            isSafe ? '#10b981' : '#f59e0b',
            '#ef4444'
          ],
          hoverBackgroundColor: [
            isSafe ? '#059669' : '#d97706',
            '#dc2626'
          ],
          borderWidth: 0,
          cutout: '72%'
        }
      ]
    } : {
      labels: ['No Classes Recorded'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#e2e8f0'],
          hoverBackgroundColor: ['#cbd5e1'],
          borderWidth: 0,
          cutout: '72%'
        }
      ]
    };

    if (this.overallChart) {
      this.overallChart.data = data;
      this.overallChart.options.plugins.legend.display = hasData;
      this.overallChart.update('active');
    } else {
      this.overallChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: hasData,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  family: "'Inter', sans-serif",
                  size: 12,
                  weight: '500'
                },
                color: '#64748b',
                padding: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  if (!hasData) return ' No attendance records yet';
                  const label = context.label || '';
                  const value = context.parsed;
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return ` ${label}: ${value} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  },

  /**
   * Render or update Subject Comparison Bar Chart
   */
  renderSubjectBarChart(subjects = []) {
    const ctx = document.getElementById('subjectBarChart');
    if (!ctx) return;

    const hasSubjects = subjects && subjects.length > 0;
    const labels = hasSubjects
      ? subjects.map(s => s.code || (s.name.length > 9 ? s.name.substring(0, 8) + '…' : s.name))
      : ['No Subjects'];

    const percentages = hasSubjects ? subjects.map(s => {
      const total = s.total !== undefined ? s.total : ((s.attended || 0) + (s.missed || 0));
      return total > 0 ? Number(((s.attended / total) * 100).toFixed(1)) : 0;
    }) : [0];

    const backgroundColors = hasSubjects ? percentages.map(p => {
      if (p >= 75) return '#10b981'; // emerald
      if (p >= 65) return '#f59e0b'; // amber
      return '#ef4444'; // rose/red
    }) : ['#e2e8f0'];

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Attendance %',
          data: percentages,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 24,
          maxBarThickness: 32
        }
      ]
    };

    if (this.subjectBarChart) {
      this.subjectBarChart.data = data;
      this.subjectBarChart.update('active');
    } else {
      this.subjectBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: {
                color: '#f1f5f9'
              },
              ticks: {
                stepSize: 25,
                callback: function (val) {
                  return val + '%';
                },
                font: {
                  family: "'Inter', sans-serif",
                  size: 11
                },
                color: '#94a3b8'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: "'Inter', sans-serif",
                  size: 12,
                  weight: '600'
                },
                color: '#475569'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function (items) {
                  if (!hasSubjects) return 'No Subjects Added';
                  const index = items[0].dataIndex;
                  return subjects[index] ? subjects[index].name : '';
                },
                label: function (context) {
                  if (!hasSubjects) return ' Add subjects to compare';
                  const val = context.parsed.y;
                  const status = val >= 75 ? 'Safe (≥ 75%)' : 'Shortage (< 75%)';
                  return ` Attendance: ${val}% [${status}]`;
                }
              }
            }
          }
        }
      });
    }
  }
};
