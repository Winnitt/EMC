const SENIOR_MODE_KEY = 'mc_senior_mode';

export const getSeniorMode = (): boolean => {
  try {
    const val = localStorage.getItem(SENIOR_MODE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
};

export const saveSeniorMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(SENIOR_MODE_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save senior mode:', err);
  }
};

export const getSeniorModeConfig = () => ({
  isSeniorMode: getSeniorMode()
});

export const saveSeniorModeConfig = (config: { isSeniorMode: boolean }) => {
  saveSeniorMode(config.isSeniorMode);
};

// Plain English mapping for medical terms to make them easy for seniors
export const SIMPLE_ENGLISH_TERMS: Record<string, { simpleName: string; meaning: string }> = {
  // Blood tests
  'Hemoglobin': { simpleName: 'Hemoglobin (Blood Energy)', meaning: 'Carries oxygen and gives you energy.' },
  'Fasting Blood Sugar': { simpleName: 'Morning Sugar (Fasting)', meaning: 'Sugar level before having breakfast.' },
  'Postprandial Blood Sugar': { simpleName: 'After-Food Sugar', meaning: 'Sugar level 2 hours after your meal.' },
  'HbA1c': { simpleName: '3-Month Sugar Average', meaning: 'Shows average blood sugar over the last 3 months.' },
  'Total Cholesterol': { simpleName: 'Total Blood Fat (Cholesterol)', meaning: 'Total fats in your blood vessels.' },
  'HDL Cholesterol': { simpleName: 'Good Heart Cholesterol', meaning: 'Good fat that protects your heart.' },
  'LDL Cholesterol': { simpleName: 'Bad Cholesterol', meaning: 'Fat you want to keep low for healthy arteries.' },
  'Triglycerides': { simpleName: 'Blood Fats (Triglycerides)', meaning: 'Fats from food stored in your body.' },
  'Serum Creatinine': { simpleName: 'Kidney Filter Level (Creatinine)', meaning: 'Checks how well your kidneys clean your blood.' },
  'Blood Urea': { simpleName: 'Kidney Waste Level (Urea)', meaning: 'Waste removed by kidneys.' },
  'SGPT / ALT': { simpleName: 'Liver Health Check (ALT)', meaning: 'Enzyme showing how healthy your liver is.' },
  'SGOT / AST': { simpleName: 'Liver & Heart Enzyme (AST)', meaning: 'Enzyme found in liver and heart muscles.' },
  'Serum Bilirubin Total': { simpleName: 'Liver Jaundice Level (Bilirubin)', meaning: 'Checks liver and prevents yellow eyes/skin.' },
  'TSH': { simpleName: 'Thyroid Control Hormone', meaning: 'Controls body energy, weight, and metabolism.' },
  'Vitamin D3': { simpleName: 'Bone & Sunshine Vitamin (D3)', meaning: 'Keeps bones, joints, and immune system strong.' },
  'Vitamin B12': { simpleName: 'Nerve & Brain Vitamin (B12)', meaning: 'Keeps nerves and brain sharp, prevents tiredness.' },
  'Serum Calcium': { simpleName: 'Bone Calcium Level', meaning: 'Mineral needed for strong bones and teeth.' },
  'Serum Potassium': { simpleName: 'Heart & Muscle Salt (Potassium)', meaning: 'Mineral for normal heartbeat and muscle strength.' },
  'Serum Sodium': { simpleName: 'Body Salt Balance (Sodium)', meaning: 'Controls water balance and blood pressure.' },
  'Uric Acid': { simpleName: 'Joint & Gout Acid', meaning: 'High levels can cause pain in big toe or joints.' },
  'Platelet Count': { simpleName: 'Blood Clotting Cells (Platelets)', meaning: 'Helps stop bleeding when you get a small cut.' },
  'Total Leukocyte Count (WBC)': { simpleName: 'Immune Defender Cells (WBC)', meaning: 'White blood cells that fight off infections.' }
};

export const getSimpleTestName = (name: string): string => {
  return SIMPLE_ENGLISH_TERMS[name]?.simpleName || name;
};

export const getSimpleTestMeaning = (name: string): string | null => {
  return SIMPLE_ENGLISH_TERMS[name]?.meaning || null;
};

// Frequency to plain English description
export const formatFrequencyPlain = (freq: string): string => {
  switch (freq) {
    case 'OD': return 'Once every day';
    case 'BD': return 'Twice every day (Morning & Night)';
    case 'TDS': return '3 times every day';
    case 'QID': return '4 times every day';
    case 'PRN': return 'Only when needed for pain (SOS)';
    case 'Alternate': return 'Every alternate day';
    case 'Weekly': return 'Once a week';
    default: return freq;
  }
};

export const formatTimeOfDayPlain = (tod: string): { label: string; when: string; icon: string } => {
  switch (tod) {
    case 'morning':
      return { label: 'Morning', when: 'After breakfast', icon: '🌅' };
    case 'afternoon':
      return { label: 'Afternoon', when: 'After lunch', icon: '☀️' };
    case 'evening':
      return { label: 'Evening', when: 'With evening tea / snacks', icon: '🌆' };
    case 'night':
      return { label: 'Night', when: 'Before sleeping at night', icon: '🌙' };
    default:
      return { label: 'Anytime', when: 'As advised by doctor', icon: '🔄' };
  }
};
