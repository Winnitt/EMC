import interactions from '../data/drugInteractions.json';
import { Medication } from '../types';

export interface InteractionWarning {
  ruleId: string;
  severity: 'CRITICAL' | 'FATAL' | 'HIGH';
  pair: [string, string];
  risk: string;
  conflictingWith: string;
}

export function evaluateDrugInteractions(
  existingMeds: (Medication | string)[],
  candidateMedName: string
): InteractionWarning[] {
  if (!candidateMedName || candidateMedName.trim().length === 0) return [];

  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = clean(candidateMedName);

  // Map existing medications to their names and generic names
  const currentMedsData: { displayName: string; tokens: string[] }[] = existingMeds
    .filter(Boolean)
    .map(m => {
      if (typeof m === 'string') {
        return { displayName: m, tokens: [clean(m)] };
      }
      const tokens = [clean(m.name)];
      if (m.genericName) tokens.push(clean(m.genericName));
      return { displayName: m.name, tokens };
    });

  const warnings: InteractionWarning[] = [];
  const recordedKeys = new Set<string>();

  for (const rule of interactions) {
    const severity = rule.severity as 'CRITICAL' | 'FATAL' | 'HIGH';
    const pair = rule.pair as [string, string];

    const candidateMatchesA = rule.group_a.some(token => {
      const cleanedToken = clean(token);
      return target.includes(cleanedToken) || cleanedToken.includes(target);
    });

    const candidateMatchesB = rule.group_b.some(token => {
      const cleanedToken = clean(token);
      return target.includes(cleanedToken) || cleanedToken.includes(target);
    });

    if (candidateMatchesA) {
      const conflicting = currentMedsData.find(item =>
        item.tokens.some(token =>
          rule.group_b.some(b => {
            const cleanedB = clean(b);
            return token.includes(cleanedB) || cleanedB.includes(token);
          })
        )
      );

      if (conflicting) {
        const key = `${rule.id}-${conflicting.displayName}`;
        if (!recordedKeys.has(key)) {
          recordedKeys.add(key);
          warnings.push({
            ruleId: rule.id,
            severity,
            pair,
            risk: rule.risk,
            conflictingWith: conflicting.displayName
          });
        }
      }
    }

    if (candidateMatchesB) {
      const conflicting = currentMedsData.find(item =>
        item.tokens.some(token =>
          rule.group_a.some(a => {
            const cleanedA = clean(a);
            return token.includes(cleanedA) || cleanedA.includes(token);
          })
        )
      );

      if (conflicting) {
        const key = `${rule.id}-${conflicting.displayName}`;
        if (!recordedKeys.has(key)) {
          recordedKeys.add(key);
          warnings.push({
            ruleId: rule.id,
            severity,
            pair,
            risk: rule.risk,
            conflictingWith: conflicting.displayName
          });
        }
      }
    }
  }

  return warnings;
}

// Check if any medications in a list conflict with each other
export function findAllActiveInteractions(meds: Medication[]): {
  medA: string;
  medB: string;
  warning: InteractionWarning;
}[] {
  const results: { medA: string; medB: string; warning: InteractionWarning }[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < meds.length; i++) {
    for (let j = i + 1; j < meds.length; j++) {
      const medA = meds[i];
      const medB = meds[j];
      const warnings = evaluateDrugInteractions([medA], medB.name);

      for (const w of warnings) {
        const pairKey = [medA.id, medB.id].sort().join('-') + '-' + w.ruleId;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          results.push({
            medA: medA.name,
            medB: medB.name,
            warning: w
          });
        }
      }
    }
  }

  return results;
}
