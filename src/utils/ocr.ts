import { createWorker } from 'tesseract.js';
import { BT_GROUPS, BT_ALIASES } from '../data/bloodTestDb';
import { MED_DB } from '../data/medDb';
import { BloodTestResult, ParsedOcrData, Medication } from '../types';

export const compressImage = (dataUrl: string, maxDim = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      // White background for transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const runOCRScan = async (
  imageDataUrl: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ParsedOcrData> => {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    if (onProgress) onProgress(10, 'Initializing OCR Engine...');
    
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pct = Math.round(20 + (m.progress || 0) * 75);
          onProgress(pct, `Analyzing medical document... ${Math.round((m.progress || 0) * 100)}%`);
        }
      }
    });

    if (onProgress) onProgress(25, 'Reading text & extracting values...');
    const result = await worker.recognize(imageDataUrl);
    const rawText = result.data.text || '';

    if (onProgress) onProgress(95, 'Parsing medical data...');
    const parsed = parseOCRText(rawText);
    await worker.terminate();

    return parsed;
  } catch (err) {
    console.error('OCR recognition error:', err);
    if (worker) {
      try { await worker.terminate(); } catch {}
    }
    // Fallback parser even if OCR had warning
    return parseOCRText('');
  }
};

export const parseOCRText = (rawText: string): ParsedOcrData => {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bloodTests = extractBloodTests(rawText, lines);
  const medications = extractMedications(lines);
  const date = extractDate(rawText) || new Date().toISOString().split('T')[0];
  const doctorOrLab = extractDoctorOrLab(lines) || 'Diagnostic Laboratory';

  return {
    bloodTests,
    medications,
    date,
    doctorOrLab,
    rawText
  };
};

export const extractBloodTests = (
  _rawText: string,
  lines: string[]
): { groupName: string; tests: BloodTestResult[] }[] => {
  const groups: Record<string, { groupName: string; tests: BloodTestResult[] }> = {};
  const usedLines = new Set<number>();

  // Build lookup index: alias -> { groupName, test }
  const lookup: Record<string, { groupName: string; test: { n: string; u: string; mn: number; mx: number } }> = {};

  BT_GROUPS.forEach((grp) => {
    grp.tests.forEach((test) => {
      const aliases = BT_ALIASES[test.n] || [];
      const allNames = [test.n.toLowerCase(), ...aliases.map((a) => a.toLowerCase())];
      allNames.forEach((alias) => {
        lookup[alias] = { groupName: grp.g, test };
      });
    });
  });

  // Pass 1: Match against standard catalog tests with known clinical normal ranges
  lines.forEach((line, lineIdx) => {
    if (usedLines.has(lineIdx)) return;
    const cleanLine = line.toLowerCase().replace(/[^a-z0-9.\s%\/+-]/g, ' ');

    for (const [alias, { groupName, test }] of Object.entries(lookup)) {
      if (!cleanLine.includes(alias)) continue;

      // Search for numeric values
      const nums = line.match(/\b\d+\.?\d*\b/g);
      if (!nums) continue;

      // Filter out obvious years like 2024, 2025, 2026, 1990
      const val = nums.find((n) => {
        const v = parseFloat(n);
        const isYear = v >= 1950 && v <= 2030 && Number.isInteger(v);
        return v > 0 && v < 999999 && !isYear;
      });

      if (!val) continue;

      const v = parseFloat(val);
      let status: 'normal' | 'low' | 'high' = 'normal';
      if (test.mx > 0 && v > test.mx) status = 'high';
      else if (test.mn > 0 && v < test.mn) status = 'low';

      // Check if line has explicit HIGH / LOW / H / L indicators
      if (/\b(high|\(h\)|h\b|\*high\*|abnormal)\b/i.test(line)) {
        status = 'high';
      } else if (/\b(low|\(l\)|l\b|\*low\*)\b/i.test(line)) {
        status = 'low';
      }

      // Ref range in same line
      const refMatch = line.match(/(\d+\.?\d*)\s*[-–至to]\s*(\d+\.?\d*)/i);
      const refRange = refMatch ? `${refMatch[1]} - ${refMatch[2]}` : `${test.mn} - ${test.mx}`;

      if (!groups[groupName]) {
        groups[groupName] = { groupName, tests: [] };
      }

      if (!groups[groupName].tests.some((t) => t.n === test.n)) {
        groups[groupName].tests.push({
          n: test.n,
          u: test.u,
          mn: test.mn,
          mx: test.mx,
          val: val,
          status,
          refRange
        });
        usedLines.add(lineIdx);
      }
      break;
    }
  });

  // Pass 2: Extract generic tabular parameter lines with Name, Value, Unit, Ref Range
  lines.forEach((line, lineIdx) => {
    if (usedLines.has(lineIdx)) return;
    if (line.length < 5 || line.length > 120) return;
    if (/^(patient|doctor|date|sample|age|sex|gender|page|bill|invoice|specimen|tested|referred|lab|hospital|center)/i.test(line)) return;

    // Pattern: [Text parameter name] ... [Number value] ... [Optional Unit] ... [Optional range: min - max]
    const tabMatch = line.match(/^([A-Za-z0-9\s()/%.-]{3,35})\s+([0-9]+\.?[0-9]*)\s*([a-zA-Z/%μuLmgdLkU]+)?(?:\s+(?:Ref|Normal|Range)?:?\s*([0-9.]+\s*[-–]\s*[0-9.]+))?/i);
    if (tabMatch) {
      const pName = tabMatch[1].trim();
      const pVal = tabMatch[2].trim();
      const pUnit = (tabMatch[3] || '').trim();
      const pRef = (tabMatch[4] || '').trim();

      const numVal = parseFloat(pVal);
      if (isNaN(numVal) || (numVal >= 1950 && numVal <= 2030 && Number.isInteger(numVal))) return;

      let mn = 0;
      let mx = 0;
      let status: 'normal' | 'low' | 'high' = 'normal';

      if (pRef) {
        const rNums = pRef.match(/([0-9.]+)\s*[-–]\s*([0-9.]+)/);
        if (rNums) {
          mn = parseFloat(rNums[1]);
          mx = parseFloat(rNums[2]);
          if (mx > 0 && numVal > mx) status = 'high';
          else if (mn > 0 && numVal < mn) status = 'low';
        }
      }

      if (/\b(high|\(h\)|h\b|abnormal)\b/i.test(line)) status = 'high';
      if (/\b(low|\(l\)|l\b)\b/i.test(line)) status = 'low';

      const groupName = 'General Laboratory Findings';
      if (!groups[groupName]) {
        groups[groupName] = { groupName, tests: [] };
      }

      if (!groups[groupName].tests.some((t) => t.n.toLowerCase() === pName.toLowerCase())) {
        groups[groupName].tests.push({
          n: pName,
          u: pUnit || '—',
          mn,
          mx,
          val: pVal,
          status,
          refRange: pRef || (mx > 0 ? `${mn} - ${mx}` : '—')
        });
        usedLines.add(lineIdx);
      }
    }
  });

  return Object.values(groups);
};

export const extractMedications = (lines: string[]): Partial<Medication>[] => {
  const found: Partial<Medication>[] = [];
  const added = new Set<string>();

  lines.forEach((line) => {
    const l = line.toLowerCase();

    for (const med of MED_DB) {
      const gMatch = l.includes(med.g.toLowerCase());
      const brandMatch = med.brands.find((b) => l.includes(b.toLowerCase()));

      if (gMatch || brandMatch) {
        const matchedName = brandMatch || med.g;
        if (added.has(matchedName.toLowerCase())) continue;

        // Extract dosage if present (e.g. 500mg, 40 mg, 10mcg)
        const doseMatch = line.match(/\b\d+\s*(mg|mcg|g|ml|iu)\b/i);
        const dose = doseMatch ? doseMatch[0] : '1 tablet';

        // Extract frequency if present (OD, BD, TDS, QID, 1-0-1)
        let freq = 'OD';
        let tod: Medication['tod'] = 'morning';
        if (/\b(bd|bid|1-0-1|twice)\b/i.test(line)) {
          freq = 'BD';
          tod = 'night';
        } else if (/\b(tds|tid|1-1-1|thrice)\b/i.test(line)) {
          freq = 'TDS';
          tod = 'afternoon';
        } else if (/\b(night|hs|0-0-1|bedtime)\b/i.test(line)) {
          freq = 'OD';
          tod = 'night';
        } else if (/\b(sos|prn|as needed)\b/i.test(line)) {
          freq = 'PRN';
          tod = 'any';
        }

        found.push({
          id: 'med-' + Math.random().toString(36).substring(2, 7),
          name: `${matchedName}${doseMatch ? '' : ' ' + dose}`,
          genericName: med.g,
          dose: doseMatch ? `1 tablet (${doseMatch[0]})` : dose,
          freq,
          tod,
          time: tod === 'morning' ? '08:00' : tod === 'night' ? '20:30' : '14:00',
          cond: med.ind
        });

        added.add(matchedName.toLowerCase());
        break;
      }
    }
  });

  return found;
};

export const extractDate = (text: string): string => {
  // Try YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b/);
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;

  // Try Month names e.g. 15 Jan 2025
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const namedMatch = text.match(/\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3})[a-z]*\.?\s+(20\d{2})\b/i);
  if (namedMatch) {
    const m = monthMap[namedMatch[2].toLowerCase().slice(0, 3)];
    if (m) {
      const d = String(namedMatch[1]).padStart(2, '0');
      return `${namedMatch[3]}-${m}-${d}`;
    }
  }

  return '';
};

export const extractDoctorOrLab = (lines: string[]): string => {
  // Look for Dr. or Hospital / Diagnostics
  for (const line of lines.slice(0, 10)) {
    if (/\b(dr\.|doctor|dr\s)/i.test(line)) {
      return line.replace(/[^\w\s.,-]/g, '').trim();
    }
    if (/\b(diagnostics|hospital|pathology|lab|laboratory|clinic|imaging|healthcare)\b/i.test(line)) {
      return line.replace(/[^\w\s.,-]/g, '').trim();
    }
  }
  return '';
};
