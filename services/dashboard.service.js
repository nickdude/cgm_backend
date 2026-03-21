const DietEntry = require('../models/dietEntry.model');
const InsulinEntry = require('../models/insulinEntry.model');
const MedicineEntry = require('../models/medicineEntry.model');
const ExerciseEntry = require('../models/exerciseEntry.model');
const FingerBloodEntry = require('../models/fingerBloodEntry.model');

const buildWeeklyData = () => [
  { day: 'W', value: 94 },
  { day: 'T', value: 79 },
  { day: 'F', value: 81 },
  { day: 'S', value: 90 },
  { day: 'S', value: 90 },
  { day: 'M', value: 80 },
  { day: 'T', value: 10 },
  { day: 'W', value: 94 },
  { day: 'T', value: 79 },
  { day: 'F', value: 81 },
  { day: 'S', value: 90 },
  { day: 'S', value: 77 },
  { day: 'M', value: 80 },
  { day: 'T', value: 79 },
];

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const formatTickLabel = (date) => {
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? 'pm' : 'am';
  return `${hour12} ${suffix}`;
};

const formatCurrentTimeLabel = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'pm' : 'am';
  return `${day}-${month} ${hour12}:${minute} ${suffix}`;
};

const buildTimelinePoints = (seed) => {
  const base = startOfToday();
  const points = [];
  for (let i = 0; i < 16; i += 1) {
    const epochMs = base + i * 90 * 60 * 1000;
    const wave = Math.sin((i / 16) * Math.PI * 2) * 16;
    const drift = ((seed + i * 13) % 11) - 5;
    const glucoseValue = Math.max(72, Math.round(102 + wave + drift));
    points.push({
      epochMs,
      glucoseValue,
      label: formatTickLabel(new Date(epochMs)),
    });
  }
  return points;
};

const readQuickActionBiomarkers = async (userId) => {
  const mapEntries = (entries, actionType, icon) =>
    entries
      .filter((entry) => entry && entry.actionTime)
      .map((entry) => ({
        epochMs: new Date(entry.actionTime).getTime(),
        actionType,
        icon,
      }));

  try {
    const [diet, insulin, medicine, exercise, fingerBlood] = await Promise.all([
      DietEntry.find({ userId }).select('actionTime').sort({ actionTime: -1 }).limit(6).lean(),
      InsulinEntry.find({ userId }).select('actionTime').sort({ actionTime: -1 }).limit(6).lean(),
      MedicineEntry.find({ userId }).select('actionTime').sort({ actionTime: -1 }).limit(6).lean(),
      ExerciseEntry.find({ userId }).select('actionTime').sort({ actionTime: -1 }).limit(6).lean(),
      FingerBloodEntry.find({ userId }).select('actionTime').sort({ actionTime: -1 }).limit(6).lean(),
    ]);

    return [
      ...mapEntries(diet, 'diet', 'meal'),
      ...mapEntries(insulin, 'insulin', 'insulin'),
      ...mapEntries(medicine, 'medicine', 'medicine'),
      ...mapEntries(exercise, 'exercise', 'exercise'),
      ...mapEntries(fingerBlood, 'finger-blood', 'finger-blood'),
    ];
  } catch (_) {
    return [];
  }
};

const buildTimeline = async (seed, userId) => {
  const points = buildTimelinePoints(seed);
  const now = new Date();

  const seededBiomarkers = [
    { epochMs: points[3].epochMs, actionType: 'diet', icon: 'meal' },
    { epochMs: points[6].epochMs, actionType: 'insulin', icon: 'insulin' },
  ];
  const actionBiomarkers = await readQuickActionBiomarkers(userId);

  return {
    currentTimeLabel: formatCurrentTimeLabel(now),
    highlightedValue: `${points[8].glucoseValue} mg/dL`,
    timeTicks: points.map((point) => point.label),
    points,
    biomarkers: [...seededBiomarkers, ...actionBiomarkers],
  };
};

const buildInsights = () => ({
  topStats: [
    { key: 'avgGlucose', value: '18', unit: 'mg/dL', label: 'Avg Glucose', valueColor: '#111111' },
    { key: 'stdDev', value: '7', unit: 'mg/dL', label: 'Std. Dev', valueColor: '#111111' },
    { key: 'spikeTime', value: '1h 40m', unit: '', label: 'Spike Time', valueColor: '#D92D20' },
    { key: 'spike', value: '1', unit: '', label: 'Spike', valueColor: '#D92D20' },
  ],
  cards: [
    {
      title: 'Time above range',
      value: '45',
      unit: 'min',
      status: 'OPTIMAL',
      summary:
        'Your glucose levels have been stable today. Focus on balanced meals and activity to help your body to balance glucose.',
    },
    {
      title: 'Time in range',
      value: '45',
      unit: 'min',
      status: 'OPTIMAL',
      summary:
        'Great in-range performance. Continue this pattern with consistent meal timing and short post-meal movement.',
    },
    {
      title: 'Glucose Excursion',
      value: '45',
      unit: 'min',
      status: 'OPTIMAL',
      summary:
        'Excursions are controlled. Keep hydration and avoid large late-evening carb loads to maintain stability.',
    },
    {
      title: 'GMI',
      value: '6.4',
      unit: '%',
      status: 'OPTIMAL',
      summary:
        'Your estimated HbA1c trend is in a healthy range. Stick with your current routine for continued progress.',
    },
    {
      title: 'Glucose Oscillation’s',
      value: '45',
      unit: 'min',
      status: 'OPTIMAL',
      summary:
        'Daily variability is moderate and manageable. Keep meals balanced and spread activity through the day.',
    },
  ],
});

const buildEventTimeline = () => ({
  title: 'Timeline',
  items: [
    {
      icon: 'meal',
      level: 'neutral',
      time: '11:18 pm',
      title: 'Apples, Dal Yellow, White Rice, Chole, Ch...',
      description: '',
    },
    {
      icon: 'pulse',
      level: 'neutral',
      time: '11:18 pm',
      title: 'Stress',
      description: '',
    },
    {
      icon: 'warning',
      level: 'alert',
      time: '10:56 pm',
      title: 'Hyperglycemic event detected',
      description: 'Your glucose (127) rose above the max target of (110 mg/dL).',
    },
    {
      icon: 'warning',
      level: 'alert',
      time: '3:56 pm',
      title: 'Hyperglycemic event detected',
      description: 'Your glucose (124) rose above the max target of (110 mg/dL).',
    },
    {
      icon: 'warning',
      level: 'alert',
      time: '11:00 AM',
      title: 'Improve glucose variability',
      description: '',
    },
    {
      icon: 'warning',
      level: 'alert',
      time: '8:58 AM',
      title: 'Hyperglycemic event detected',
      description: 'Your glucose (142) rose above the max target of (110 mg/dL).',
    },
    {
      icon: 'check',
      level: 'good',
      time: '8:58 AM',
      title: 'Good nocturnal glucose control',
      description:
        'Your glucose trend during nocturnal hours (12–6 AM) seemed stable and within the healthy range.',
    },
  ],
});

const getDashboardByUserId = async (userId) => {
  const seed = String(userId || 'guest')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const glucoseValue = 95 + (seed % 20);
  const score = 182 + (seed % 10);
  const isControlled = glucoseValue <= 120;
  const timeline = await buildTimeline(seed, userId);

  return {
    mock: true,
    generatedAt: new Date().toISOString(),
    weekly: {
      selectedIndex: 3,
      points: buildWeeklyData(),
    },
    gauge: {
      glucoseValue,
      unit: 'mg/dL',
      isControlled,
      trend: isControlled ? 'up' : 'down',
    },
    metabolicScore: {
      score,
      isImproved: true,
      label: 'Metabolic Score',
      timestamp: '25 mg/dL · 5:22 pm',
    },
    timeline,
    insights: buildInsights(),
    eventTimeline: buildEventTimeline(),
  };
};

module.exports = {
  getDashboardByUserId,
};
