const { buildDataPageSummary } = require('./cgm_summary.service');

const getDataPageByUserId = async (userId) => {
  const summary = await buildDataPageSummary(userId);
  if (summary) {
    return summary;
  }

  const now = new Date();
  return {
    mock: true,
    generatedAt: now.toISOString(),
    currentGlucose: {
      value: 102,
      unit: 'mg/dL',
      trend: '↑',
      timestamp: '10:02 am',
      hasAlert: false,
      alertMessage: null,
    },
    metabolicScore: {
      score: 81,
      description: 'Your Metabolic Score is in the',
      percentile: 'top 40% of all Users',
    },
    calendar: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      days: [],
    },
    stats: {
      avgGlucose: 108,
      stdDev: 7,
      spikeTime: '1h 40m',
      spikeCount: 1,
    },
  };
};

module.exports = {
  getDataPageByUserId,
};
