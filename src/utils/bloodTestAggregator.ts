import { MedicalReport, BloodTestResult } from '../types';
import { BT_GROUPS, BT_ALIASES } from '../data/bloodTestDb';

export interface ParameterHistoryEntry {
  reportId: string;
  reportTitle: string;
  date: string;
  value: string;
  numVal: number;
  unit: string;
  status: 'normal' | 'low' | 'high';
  doctor?: string;
  refRange?: string;
  deltaFromPrev?: number;
}

export interface UnifiedParameter {
  id: string;
  name: string;
  canonicalName: string;
  groupName: string;
  unit: string;
  min: number;
  max: number;
  refRange: string;
  latestValue: string;
  latestNum: number;
  latestStatus: 'normal' | 'low' | 'high';
  latestDate: string;
  latestDoctor?: string;
  latestReportId: string;
  latestReportTitle: string;
  previousValue?: string;
  previousNum?: number;
  previousDate?: string;
  previousStatus?: 'normal' | 'low' | 'high';
  trend: 'up' | 'down' | 'stable' | 'none';
  delta?: number;
  deltaPercent?: number;
  history: ParameterHistoryEntry[];
  totalScansCount: number;
  isRecentlyUpdated?: boolean;
}

export interface UnifiedCategory {
  groupName: string;
  parameters: UnifiedParameter[];
  abnormalCount: number;
  totalCount: number;
}

export interface BloodTestStats {
  totalParametersTracked: number;
  abnormalCount: number;
  normalCount: number;
  totalHistoricalScans: number;
  latestScanDate: string | null;
  parametersWithHistoryCount: number;
}

export interface AggregatedBloodData {
  categories: UnifiedCategory[];
  allParameters: UnifiedParameter[];
  stats: BloodTestStats;
  archivedReports: MedicalReport[];
}

/**
 * Normalizes a parameter name to standard catalog names if matching alias is found
 */
export function getCanonicalTestInfo(name: string, reportedUnit?: string) {
  const cleanName = name.toLowerCase().trim();

  for (const group of BT_GROUPS) {
    for (const test of group.tests) {
      if (test.n.toLowerCase() === cleanName) {
        return { groupName: group.g, test };
      }
      const aliases = BT_ALIASES[test.n] || [];
      if (aliases.some(a => a.toLowerCase() === cleanName || cleanName.includes(a.toLowerCase()))) {
        return { groupName: group.g, test };
      }
    }
  }

  // Fallback for custom laboratory tests
  return {
    groupName: 'General Laboratory Findings',
    test: {
      n: name.trim(),
      u: reportedUnit || '',
      mn: 0,
      mx: 0
    }
  };
}

/**
 * Aggregates all blood test results from all medical reports into a unified master panel.
 * Automatically updates to the latest scan values and preserves older readings in the historical archive.
 */
export function aggregateBloodParameters(reports: MedicalReport[]): AggregatedBloodData {
  // 1. Filter reports that have blood test data or are categorized as blood tests
  const bloodReports = reports
    .filter(r => (r.btData && r.btData.length > 0) || r.cat === 'blood')
    // Sort oldest to newest for chronological tracking
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Map to collect readings per parameter: canonicalKey -> { info, readings: [] }
  const paramMap = new Map<string, {
    canonicalName: string;
    groupName: string;
    unit: string;
    min: number;
    max: number;
    refRange: string;
    readings: ParameterHistoryEntry[];
  }>();

  bloodReports.forEach(report => {
    if (!report.btData) return;

    report.btData.forEach(group => {
      group.results.forEach(res => {
        if (!res.n || !res.val) return;

        const { groupName: stdGroup, test: stdTest } = getCanonicalTestInfo(res.n, res.u);
        const canonicalKey = stdTest.n.toLowerCase();

        const numVal = parseFloat(res.val);
        const hasNum = !isNaN(numVal);

        let status: 'normal' | 'low' | 'high' = res.status || 'normal';
        if (hasNum && (stdTest.mx > 0 || res.mx > 0)) {
          const max = res.mx > 0 ? res.mx : stdTest.mx;
          const min = res.mn > 0 ? res.mn : stdTest.mn;
          if (max > 0 && numVal > max) status = 'high';
          else if (min > 0 && numVal < min) status = 'low';
          else status = 'normal';
        }

        const unit = res.u || stdTest.u || '';
        const min = res.mn > 0 ? res.mn : stdTest.mn;
        const max = res.mx > 0 ? res.mx : stdTest.mx;
        const refRange = res.refRange || (max > 0 ? `${min} - ${max} ${unit}` : '—');

        const entry: ParameterHistoryEntry = {
          reportId: report.id,
          reportTitle: report.title,
          date: report.date,
          value: res.val,
          numVal: hasNum ? numVal : 0,
          unit,
          status,
          doctor: report.doctor,
          refRange
        };

        if (!paramMap.has(canonicalKey)) {
          paramMap.set(canonicalKey, {
            canonicalName: stdTest.n,
            groupName: stdGroup || group.g || 'General Laboratory Findings',
            unit,
            min,
            max,
            refRange,
            readings: [entry]
          });
        } else {
          const existing = paramMap.get(canonicalKey)!;
          existing.readings.push(entry);
          if (!existing.unit && unit) existing.unit = unit;
          if (existing.min === 0 && min > 0) existing.min = min;
          if (existing.max === 0 && max > 0) existing.max = max;
        }
      });
    });
  });

  // Calculate find newest report date overall for "recently updated" flags
  const allDates = bloodReports.map(r => r.date).filter(Boolean);
  const newestReportDate = allDates.length > 0
    ? allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    : null;

  // Build unified parameter items
  const allParameters: UnifiedParameter[] = [];

  paramMap.forEach((data, canonicalKey) => {
    // Sort readings by date descending (newest first) for history view
    const sortedReadings = [...data.readings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Latest reading is index 0
    const latest = sortedReadings[0];
    const prev = sortedReadings.length > 1 ? sortedReadings[1] : undefined;

    let trend: 'up' | 'down' | 'stable' | 'none' = 'none';
    let delta: number | undefined = undefined;
    let deltaPercent: number | undefined = undefined;

    if (prev && !isNaN(latest.numVal) && !isNaN(prev.numVal)) {
      delta = parseFloat((latest.numVal - prev.numVal).toFixed(2));
      if (prev.numVal > 0) {
        deltaPercent = parseFloat(((delta / prev.numVal) * 100).toFixed(1));
      }
      if (delta > 0.01) trend = 'up';
      else if (delta < -0.01) trend = 'down';
      else trend = 'stable';
    }

    // Attach deltaFromPrev to historical entries
    for (let i = 0; i < sortedReadings.length; i++) {
      const current = sortedReadings[i];
      const nextOlder = sortedReadings[i + 1];
      if (nextOlder && !isNaN(current.numVal) && !isNaN(nextOlder.numVal)) {
        current.deltaFromPrev = parseFloat((current.numVal - nextOlder.numVal).toFixed(2));
      }
    }

    const isRecentlyUpdated = newestReportDate ? latest.date === newestReportDate : false;

    allParameters.push({
      id: `param-${canonicalKey.replace(/[^a-z0-9]/g, '-')}`,
      name: data.canonicalName,
      canonicalName: data.canonicalName,
      groupName: data.groupName,
      unit: data.unit,
      min: data.min,
      max: data.max,
      refRange: data.refRange,
      latestValue: latest.value,
      latestNum: latest.numVal,
      latestStatus: latest.status,
      latestDate: latest.date,
      latestDoctor: latest.doctor,
      latestReportId: latest.reportId,
      latestReportTitle: latest.reportTitle,
      previousValue: prev?.value,
      previousNum: prev?.numVal,
      previousDate: prev?.date,
      previousStatus: prev?.status,
      trend,
      delta,
      deltaPercent,
      history: sortedReadings,
      totalScansCount: sortedReadings.length,
      isRecentlyUpdated
    });
  });

  // Group by categories respecting standard BT_GROUPS ordering
  const groupOrder = BT_GROUPS.map(g => g.g);
  groupOrder.push('General Laboratory Findings');

  const categories: UnifiedCategory[] = [];

  // 1. Ordered standard groups
  groupOrder.forEach(gName => {
    const paramsInGroup = allParameters.filter(p => p.groupName === gName);
    if (paramsInGroup.length > 0) {
      const abnormalCount = paramsInGroup.filter(
        p => p.latestStatus === 'high' || p.latestStatus === 'low'
      ).length;

      categories.push({
        groupName: gName,
        parameters: paramsInGroup,
        abnormalCount,
        totalCount: paramsInGroup.length
      });
    }
  });

  // 2. Any additional custom groups
  const existingGroups = new Set(categories.map(c => c.groupName));
  allParameters.forEach(p => {
    if (!existingGroups.has(p.groupName)) {
      const paramsInGroup = allParameters.filter(item => item.groupName === p.groupName);
      const abnormalCount = paramsInGroup.filter(
        item => item.latestStatus === 'high' || item.latestStatus === 'low'
      ).length;

      categories.push({
        groupName: p.groupName,
        parameters: paramsInGroup,
        abnormalCount,
        totalCount: paramsInGroup.length
      });
      existingGroups.add(p.groupName);
    }
  });

  // Calculate high-level stats
  const totalParametersTracked = allParameters.length;
  const abnormalCount = allParameters.filter(
    p => p.latestStatus === 'high' || p.latestStatus === 'low'
  ).length;
  const normalCount = totalParametersTracked - abnormalCount;
  const parametersWithHistoryCount = allParameters.filter(p => p.history.length > 1).length;

  // Archived reports sorted newest first for document viewing
  const archivedReports = [...bloodReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    categories,
    allParameters,
    stats: {
      totalParametersTracked,
      abnormalCount,
      normalCount,
      totalHistoricalScans: archivedReports.length,
      latestScanDate: newestReportDate,
      parametersWithHistoryCount
    },
    archivedReports
  };
}
