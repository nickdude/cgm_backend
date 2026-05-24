const User = require('../models/user.model');
const CgmReading = require('../models/cgmReading.model');
const DietEntry = require('../models/dietEntry.model');
const InsulinEntry = require('../models/insulinEntry.model');
const MedicineEntry = require('../models/medicineEntry.model');
const ExerciseEntry = require('../models/exerciseEntry.model');
const FingerBloodEntry = require('../models/fingerBloodEntry.model');
const ApiError = require('../utils/apiError');

const ensureActiveUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

const formatTimeLabel = (date) => {
  const hours = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, '0');
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? 'pm' : 'am';
  return `${hour12}:${minute} ${suffix}`;
};

const formatTickLabel = (date) => {
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? 'pm' : 'am';
  return `${hour12} ${suffix}`;
};

const formatDayLabel = (date) =>
  `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const average = (values) => {
  if (!values.length) {
    return null;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

const stdDev = (values) => {
  if (values.length < 2) {
    return 0;
  }
  const avg = average(values) || 0;
  const variance = values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const getCgmReadings = async (userId, filters = {}) => {
  await ensureActiveUser(userId);

  const query = { userId };
  if (filters.startTime || filters.endTime) {
    query.timestamp = {};
    if (filters.startTime) {
      query.timestamp.$gte = filters.startTime;
    }
    if (filters.endTime) {
      query.timestamp.$lte = filters.endTime;
    }
  }

  const cursor = CgmReading.find(query).sort({ timestamp: 1 });
  if (filters.limit) {
    cursor.limit(filters.limit);
  }

  return cursor.exec();
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

const buildFallbackWeek = () => [
  { day: 'W', value: 94 },
  { day: 'T', value: 79 },
  { day: 'F', value: 81 },
  { day: 'S', value: 90 },
  { day: 'S', value: 90 },
  { day: 'M', value: 80 },
  { day: 'T', value: 79 },
];

const buildWeeklySection = (readings, now) => {
  if (!readings.length) {
    return { selectedIndex: 3, points: buildFallbackWeek() };
  }

  const points = [];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const values = readings
      .filter((reading) => reading.timestamp >= dayStart && reading.timestamp < dayEnd)
      .map((reading) => reading.glucoseValue);
    const avg = average(values);
    points.push({
      day: day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      value: avg == null ? null : Math.round(avg),
    });
  }

  return { selectedIndex: Math.min(6, points.length - 1), points };
};

const buildGaugeSection = (readings) => {
  if (!readings.length) {
    const glucoseValue = 102;
    return {
      glucoseValue,
      unit: 'mg/dL',
      isControlled: true,
      trend: 'up',
    };
  }

  const latest = readings[readings.length - 1];
  return {
    glucoseValue: latest.glucoseValue,
    unit: latest.unit || 'mg/dL',
    isControlled: latest.glucoseValue <= 120,
    trend: latest.trend === 'falling' ? 'down' : 'up',
  };
};

const buildMetabolicScore = (readings) => {
  if (!readings.length) {
    return {
      score: 182,
      isImproved: true,
      label: 'Metabolic Score',
      timestamp: '25 mg/dL · 5:22 pm',
    };
  }

  const values = readings.map((reading) => reading.glucoseValue);
  const avg = average(values) || 100;
  const score = Math.max(0, Math.min(250, Math.round(200 - Math.abs(avg - 100) * 0.9)));
  const latest = readings[readings.length - 1];

  return {
    score,
    isImproved: avg <= 120,
    label: 'Metabolic Score',
    timestamp: `${Math.round(latest.glucoseValue)} mg/dL · ${formatTimeLabel(new Date(latest.timestamp))}`,
  };
};

const buildTimeline = async (readings, userId, now) => {
  if (!readings.length) {
    const base = startOfDay(now).getTime();
    const points = [];
    for (let i = 0; i < 16; i += 1) {
      const epochMs = base + i * 90 * 60 * 1000;
      points.push({
        epochMs,
        glucoseValue: Math.max(72, Math.round(102 + Math.sin((i / 16) * Math.PI * 2) * 16)),
        label: formatTickLabel(new Date(epochMs)),
      });
    }

    return {
      currentTimeLabel: formatTimeLabel(now),
      highlightedValue: `${points[8].glucoseValue} mg/dL`,
      timeTicks: points.map((point) => point.label),
      points,
      biomarkers: await readQuickActionBiomarkers(userId),
    };
  }

  const todayReadings = readings.filter((reading) => reading.timestamp >= startOfDay(now));
  const source = todayReadings.length ? todayReadings : readings.slice(-16);
  const points = [];
  const slotCount = Math.min(16, Math.max(1, source.length));
  const slotStart = startOfDay(now).getTime();
  const slotMinutes = 24 * 60 / slotCount;

  for (let index = 0; index < slotCount; index += 1) {
    const slotStartMs = slotStart + index * slotMinutes * 60 * 1000;
    const slotEndMs = slotStart + (index + 1) * slotMinutes * 60 * 1000;
    const slotValues = source
      .filter((reading) => reading.timestamp.getTime() >= slotStartMs && reading.timestamp.getTime() < slotEndMs)
      .map((reading) => reading.glucoseValue);
    const fallback = source[Math.min(index, source.length - 1)].glucoseValue;
    const value = slotValues.length ? Math.round(average(slotValues) || fallback) : fallback;
    points.push({
      epochMs: slotStartMs,
      glucoseValue: value,
      label: formatTickLabel(new Date(slotStartMs)),
    });
  }

  const latest = readings[readings.length - 1];
  return {
    currentTimeLabel: formatTimeLabel(new Date(latest.timestamp)),
    highlightedValue: `${latest.glucoseValue} mg/dL`,
    timeTicks: points.map((point) => point.label),
    points,
    biomarkers: await readQuickActionBiomarkers(userId),
  };
};

const buildInsights = (readings) => {
  if (!readings.length) {
    return {
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
          summary: 'Your glucose levels have been stable today. Focus on balanced meals and activity to help your body to balance glucose.',
        },
        {
          title: 'Time in range',
          value: '45',
          unit: 'min',
          status: 'OPTIMAL',
          summary: 'Great in-range performance. Continue this pattern with consistent meal timing and short post-meal movement.',
        },
        {
          title: 'Glucose Excursion',
          value: '45',
          unit: 'min',
          status: 'OPTIMAL',
          summary: 'Excursions are controlled. Keep hydration and avoid large late-evening carb loads to maintain stability.',
        },
        {
          title: 'GMI',
          value: '6.4',
          unit: '%',
          status: 'OPTIMAL',
          summary: 'Your estimated HbA1c trend is in a healthy range. Stick with your current routine for continued progress.',
        },
        {
          title: 'Glucose Oscillation’s',
          value: '45',
          unit: 'min',
          status: 'OPTIMAL',
          summary: 'Daily variability is moderate and manageable. Keep meals balanced and spread activity through the day.',
        },
      ],
    };
  }

  const values = readings.map((reading) => reading.glucoseValue);
  const avg = average(values) || 100;
  const std = Math.round(stdDev(values));
  const aboveRange = readings.filter((reading) => reading.glucoseValue > 180).length;
  const belowRange = readings.filter((reading) => reading.glucoseValue < 70).length;
  const inRange = readings.length - aboveRange - belowRange;
  const spikeMinutes = Math.max(5, aboveRange * 5);
  const oscillationMinutes = Math.max(10, Math.round(std * 3));
  const gmi = (3.31 + 0.02392 * avg).toFixed(1);

  return {
    topStats: [
      { key: 'avgGlucose', value: Math.round(avg).toString(), unit: 'mg/dL', label: 'Avg Glucose', valueColor: '#111111' },
      { key: 'stdDev', value: std.toString(), unit: 'mg/dL', label: 'Std. Dev', valueColor: '#111111' },
      { key: 'spikeTime', value: `${Math.floor(spikeMinutes / 60)}h ${spikeMinutes % 60}m`, unit: '', label: 'Spike Time', valueColor: '#D92D20' },
      { key: 'spike', value: aboveRange.toString(), unit: '', label: 'Spike', valueColor: '#D92D20' },
    ],
    cards: [
      {
        title: 'Time above range',
        value: `${aboveRange * 5}`,
        unit: 'min',
        status: aboveRange > 0 ? 'ATTENTION' : 'OPTIMAL',
        summary: 'Recent readings are being persisted to the database. High values will automatically contribute to this metric.',
      },
      {
        title: 'Time in range',
        value: `${Math.max(0, inRange * 5)}`,
        unit: 'min',
        status: 'OPTIMAL',
        summary: 'This reflects readings between 70 and 180 mg/dL, ready for graphing in the dashboard timeline.',
      },
      {
        title: 'Glucose Excursion',
        value: `${spikeMinutes}`,
        unit: 'min',
        status: 'OPTIMAL',
        summary: 'The backend summary now derives excursion windows from stored CGM readings instead of static mock values.',
      },
      {
        title: 'GMI',
        value: gmi,
        unit: '%',
        status: 'OPTIMAL',
        summary: 'Generated from the rolling average glucose level so the dashboard can render a meaningful trend estimate.',
      },
      {
        title: 'Glucose Oscillation’s',
        value: `${oscillationMinutes}`,
        unit: 'min',
        status: 'OPTIMAL',
        summary: 'Variability is based on the standard deviation of your stored CGM readings.',
      },
    ],
  };
};

const buildEventTimeline = (readings) => {
  if (!readings.length) {
    return {
      title: 'Timeline',
      items: [
        {
          icon: 'warning',
          level: 'alert',
          time: '10:56 pm',
          title: 'Hyperglycemic event detected',
          description: 'Your glucose (127) rose above the max target of (110 mg/dL).',
        },
      ],
    };
  }

  const recent = readings.slice(-7).reverse();
  return {
    title: 'Timeline',
    items: recent.map((reading) => {
      const date = new Date(reading.timestamp);
      let level = 'neutral';
      let icon = 'check';
      let title = 'Glucose reading';
      let description = `Glucose reading: ${reading.glucoseValue} ${reading.unit || 'mg/dL'}`;

      if (reading.glucoseValue >= 180) {
        level = 'alert';
        icon = 'warning';
        title = 'Hyperglycemic event detected';
        description = `Your glucose (${reading.glucoseValue}) rose above the max target of (180 mg/dL).`;
      } else if (reading.glucoseValue <= 70) {
        level = 'alert';
        icon = 'warning';
        title = 'Low glucose alert';
        description = `Your glucose (${reading.glucoseValue}) dropped below the target range.`;
      } else {
        level = 'good';
        icon = 'check';
        title = 'Glucose stable';
        description = `Your glucose is within range at ${reading.glucoseValue} mg/dL.`;
      }

      return {
        icon,
        level,
        time: formatTimeLabel(date),
        title,
        description,
      };
    }),
  };
};

const buildCalendar = (readings, now) => {
  if (!readings.length) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      days.push({ day: 0, glucose: null, status: 'empty' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const glucose = 70 + ((day * 7) % 40);
      days.push({
        day,
        glucose,
        status: glucose >= 80 && glucose <= 130 ? 'optimal' : glucose > 130 ? 'high' : 'low',
      });
    }

    return { year: now.getFullYear(), month: now.getMonth() + 1, days };
  }

  const monthStart = startOfMonth(now);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const dayMap = new Map();

  for (const reading of readings) {
    if (reading.timestamp < monthStart || reading.timestamp >= monthEnd) {
      continue;
    }
    const key = reading.timestamp.getDate();
    const entry = dayMap.get(key) || [];
    entry.push(reading.glucoseValue);
    dayMap.set(key, entry);
  }

  const daysInMonth = monthEnd.getDate();
  const firstDayOfWeek = monthStart.getDay();
  const days = [];

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    days.push({ day: 0, glucose: null, status: 'empty' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const values = dayMap.get(day) || [];
    const dayAvg = average(values);
    const glucose = dayAvg == null ? null : Math.round(dayAvg);
    let status = 'empty';
    if (glucose != null) {
      if (glucose >= 80 && glucose <= 130) status = 'optimal';
      else if (glucose > 130) status = 'high';
      else status = 'low';
    }

    days.push({ day, glucose, status });
  }

  return { year: now.getFullYear(), month: now.getMonth() + 1, days };
};

const buildDataPageSummary = async (userId) => {
  const now = new Date();
  const readings = await getCgmReadings(userId, { limit: 500 });
  if (!readings.length) {
    return null;
  }

  const latest = readings[readings.length - 1];
  const values = readings.map((reading) => reading.glucoseValue);
  const avg = average(values) || latest.glucoseValue;
  const stats = {
    avgGlucose: Math.round(avg),
    stdDev: Math.round(stdDev(values)),
    spikeTime: `${Math.floor(Math.max(5, readings.filter((reading) => reading.glucoseValue > 180).length * 5) / 60)}h ${Math.max(5, readings.filter((reading) => reading.glucoseValue > 180).length * 5) % 60}m`,
    spikeCount: readings.filter((reading) => reading.glucoseValue > 180).length,
  };

  const hourlyBuckets = [];
  const todayStart = startOfDay(now);
  for (let hour = 0; hour < 24; hour += 1) {
    const hourStart = new Date(todayStart.getTime() + hour * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    const hourValues = readings
      .filter((reading) => reading.timestamp >= hourStart && reading.timestamp < hourEnd)
      .map((reading) => reading.glucoseValue);
    const hourAvg = average(hourValues);
    hourlyBuckets.push({
      hour: hourStart.toISOString(),
      label: formatTickLabel(hourStart),
      glucoseValue: hourAvg == null ? null : Math.round(hourAvg),
    });
  }

  return {
    mock: false,
    generatedAt: now.toISOString(),
    currentGlucose: {
      value: latest.glucoseValue,
      unit: latest.unit || 'mg/dL',
      trend: latest.trend === 'falling' ? '↓' : '↑',
      timestamp: formatTimeLabel(new Date(latest.timestamp)),
      hasAlert: latest.glucoseValue < 70 || latest.glucoseValue > 180,
      alertMessage:
        latest.glucoseValue < 70
          ? 'Glucose is below target range.'
          : latest.glucoseValue > 180
            ? 'Glucose is above target range.'
            : null,
    },
    metabolicScore: {
      score: Math.max(0, Math.min(100, Math.round(100 - Math.abs(avg - 100) * 0.8))),
      description: 'Your Metabolic Score is derived from stored CGM readings.',
      percentile: `${Math.max(1, Math.min(100, Math.round(100 - Math.abs(avg - 100))))}% of Users`,
    },
    calendar: buildCalendar(readings, now),
    stats,
    hourly: hourlyBuckets,
  };
};

const buildDashboardSummary = async (userId) => {
  const now = new Date();
  const readings = await getCgmReadings(userId, { limit: 500 });
  if (!readings.length) {
    return null;
  }

  return {
    mock: false,
    generatedAt: now.toISOString(),
    weekly: buildWeeklySection(readings, now),
    gauge: buildGaugeSection(readings),
    metabolicScore: buildMetabolicScore(readings),
    timeline: await buildTimeline(readings, userId, now),
    insights: buildInsights(readings),
    eventTimeline: buildEventTimeline(readings),
  };
};

module.exports = {
  buildDashboardSummary,
  buildDataPageSummary,
};
