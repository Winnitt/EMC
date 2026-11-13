export interface BloodTestDef {
  n: string; // Parameter Name
  u: string; // Unit
  mn: number; // Min normal
  mx: number; // Max normal
}

export interface BloodTestGroupDef {
  g: string; // Group Name
  tests: BloodTestDef[];
}

export const BT_GROUPS: BloodTestGroupDef[] = [
  {
    g: 'Complete Blood Count (CBC)',
    tests: [
      { n: 'Hemoglobin (Hb)', u: 'g/dL', mn: 12.0, mx: 17.5 },
      { n: 'RBC Count', u: 'M/μL', mn: 4.2, mx: 5.8 },
      { n: 'WBC Count (TLC)', u: 'cells/cu.mm', mn: 4000, mx: 11000 },
      { n: 'Platelet Count', u: 'lakh/cu.mm', mn: 1.5, mx: 4.5 },
      { n: 'Hematocrit (PCV)', u: '%', mn: 36.0, mx: 50.0 },
      { n: 'MCV', u: 'fL', mn: 80.0, mx: 100.0 },
      { n: 'MCH', u: 'pg', mn: 27.0, mx: 33.0 },
      { n: 'MCHC', u: 'g/dL', mn: 32.0, mx: 36.0 },
      { n: 'Neutrophils', u: '%', mn: 40.0, mx: 75.0 },
      { n: 'Lymphocytes', u: '%', mn: 20.0, mx: 45.0 },
      { n: 'Eosinophils', u: '%', mn: 1.0, mx: 6.0 },
      { n: 'Monocytes', u: '%', mn: 2.0, mx: 10.0 },
      { n: 'ESR (Westergren)', u: 'mm/hr', mn: 0, mx: 20.0 }
    ]
  },
  {
    g: 'Blood Sugar & Glycemic Control',
    tests: [
      { n: 'Fasting Blood Sugar (FBS)', u: 'mg/dL', mn: 70.0, mx: 99.0 },
      { n: 'Post-Prandial Blood Sugar (PPBS)', u: 'mg/dL', mn: 70.0, mx: 140.0 },
      { n: 'Random Blood Sugar (RBS)', u: 'mg/dL', mn: 70.0, mx: 140.0 },
      { n: 'HbA1c (Glycated Hemoglobin)', u: '%', mn: 4.0, mx: 5.6 },
      { n: 'Average Blood Glucose (eAG)', u: 'mg/dL', mn: 70.0, mx: 115.0 },
      { n: 'Fasting Insulin', u: 'μIU/mL', mn: 2.6, mx: 24.9 }
    ]
  },
  {
    g: 'Lipid Profile',
    tests: [
      { n: 'Total Cholesterol', u: 'mg/dL', mn: 125.0, mx: 200.0 },
      { n: 'Triglycerides', u: 'mg/dL', mn: 50.0, mx: 150.0 },
      { n: 'HDL Cholesterol (Good)', u: 'mg/dL', mn: 40.0, mx: 60.0 },
      { n: 'LDL Cholesterol (Bad)', u: 'mg/dL', mn: 0.0, mx: 100.0 },
      { n: 'VLDL Cholesterol', u: 'mg/dL', mn: 5.0, mx: 30.0 },
      { n: 'Total / HDL Ratio', u: 'ratio', mn: 3.0, mx: 5.0 }
    ]
  },
  {
    g: 'Kidney Function Test (RFT / KFT)',
    tests: [
      { n: 'Serum Creatinine', u: 'mg/dL', mn: 0.6, mx: 1.2 },
      { n: 'Blood Urea Nitrogen (BUN)', u: 'mg/dL', mn: 7.0, mx: 20.0 },
      { n: 'Blood Urea', u: 'mg/dL', mn: 15.0, mx: 40.0 },
      { n: 'Serum Uric Acid', u: 'mg/dL', mn: 3.5, mx: 7.2 },
      { n: 'eGFR', u: 'mL/min/1.73m²', mn: 90.0, mx: 130.0 }
    ]
  },
  {
    g: 'Liver Function Test (LFT)',
    tests: [
      { n: 'SGPT (ALT)', u: 'U/L', mn: 7.0, mx: 56.0 },
      { n: 'SGOT (AST)', u: 'U/L', mn: 10.0, mx: 40.0 },
      { n: 'Alkaline Phosphatase (ALP)', u: 'U/L', mn: 44.0, mx: 147.0 },
      { n: 'Total Bilirubin', u: 'mg/dL', mn: 0.2, mx: 1.2 },
      { n: 'Direct Bilirubin', u: 'mg/dL', mn: 0.0, mx: 0.3 },
      { n: 'Total Protein', u: 'g/dL', mn: 6.0, mx: 8.3 },
      { n: 'Serum Albumin', u: 'g/dL', mn: 3.5, mx: 5.0 },
      { n: 'Serum Globulin', u: 'g/dL', mn: 2.0, mx: 3.5 },
      { n: 'Gamma GT (GGTP)', u: 'U/L', mn: 9.0, mx: 48.0 }
    ]
  },
  {
    g: 'Thyroid Profile (TFT)',
    tests: [
      { n: 'TSH (Thyroid Stimulating)', u: 'μIU/mL', mn: 0.4, mx: 4.2 },
      { n: 'Free T3 (FT3)', u: 'pg/mL', mn: 2.0, mx: 4.4 },
      { n: 'Free T4 (FT4)', u: 'ng/dL', mn: 0.8, mx: 1.8 },
      { n: 'Total T3', u: 'ng/dL', mn: 80.0, mx: 200.0 },
      { n: 'Total T4', u: 'μg/dL', mn: 5.0, mx: 12.0 }
    ]
  },
  {
    g: 'Serum Electrolytes',
    tests: [
      { n: 'Serum Sodium (Na+)', u: 'mEq/L', mn: 135.0, mx: 145.0 },
      { n: 'Serum Potassium (K+)', u: 'mEq/L', mn: 3.5, mx: 5.1 },
      { n: 'Serum Chloride (Cl-)', u: 'mEq/L', mn: 96.0, mx: 106.0 },
      { n: 'Serum Calcium', u: 'mg/dL', mn: 8.5, mx: 10.5 },
      { n: 'Serum Magnesium', u: 'mg/dL', mn: 1.7, mx: 2.2 }
    ]
  },
  {
    g: 'Iron Studies & Anemia Markers',
    tests: [
      { n: 'Serum Iron', u: 'μg/dL', mn: 60.0, mx: 170.0 },
      { n: 'Serum Ferritin', u: 'ng/mL', mn: 20.0, mx: 300.0 },
      { n: 'Total Iron Binding Capacity (TIBC)', u: 'μg/dL', mn: 240.0, mx: 450.0 },
      { n: 'Transferrin Saturation', u: '%', mn: 20.0, mx: 50.0 }
    ]
  },
  {
    g: 'Vitamins & Minerals',
    tests: [
      { n: 'Vitamin D3 (25-OH)', u: 'ng/mL', mn: 30.0, mx: 100.0 },
      { n: 'Vitamin B12', u: 'pg/mL', mn: 200.0, mx: 900.0 },
      { n: 'Serum Zinc', u: 'μg/dL', mn: 70.0, mx: 120.0 },
      { n: 'Folic Acid (Vitamin B9)', u: 'ng/mL', mn: 4.0, mx: 20.0 }
    ]
  },
  {
    g: 'Cardiac & Coagulation Markers',
    tests: [
      { n: 'Troponin-I', u: 'ng/mL', mn: 0.0, mx: 0.04 },
      { n: 'NT-proBNP', u: 'pg/mL', mn: 0.0, mx: 125.0 },
      { n: 'Prothrombin Time (PT)', u: 'seconds', mn: 11.0, mx: 13.5 },
      { n: 'INR', u: 'ratio', mn: 0.8, mx: 1.2 },
      { n: 'D-Dimer', u: 'ng/mL', mn: 0.0, mx: 500.0 }
    ]
  },
  {
    g: 'Inflammatory & Pancreatic Markers',
    tests: [
      { n: 'hs-CRP (High-Sensitivity CRP)', u: 'mg/L', mn: 0.0, mx: 1.0 },
      { n: 'Serum Procalcitonin', u: 'ng/mL', mn: 0.0, mx: 0.1 },
      { n: 'Serum Amylase', u: 'U/L', mn: 28.0, mx: 100.0 },
      { n: 'Serum Lipase', u: 'U/L', mn: 10.0, mx: 60.0 }
    ]
  }
];

export const BT_ALIASES: Record<string, string[]> = {
  'Hemoglobin (Hb)': ['hb', 'hgb', 'hemoglobin', 'haemoglobin', 'hb%'],
  'RBC Count': ['rbc', 'red blood count', 'erythrocyte count'],
  'WBC Count (TLC)': ['wbc', 'tlc', 'white blood count', 'total leukocyte count', 'leukocytes'],
  'Platelet Count': ['platelet', 'plt', 'thrombocyte', 'platelets'],
  'Hematocrit (PCV)': ['pcv', 'hematocrit', 'packed cell volume'],
  'Neutrophils': ['neutrophils', 'polymorphs', 'segs'],
  'Lymphocytes': ['lymphocytes', 'lymphs'],
  'Eosinophils': ['eosinophils', 'eos'],
  'Monocytes': ['monocytes', 'mono'],
  'ESR (Westergren)': ['esr', 'erythrocyte sedimentation rate'],
  'Fasting Blood Sugar (FBS)': ['fbs', 'fasting glucose', 'fbg', 'fasting blood glucose', 'fasting sugar'],
  'Post-Prandial Blood Sugar (PPBS)': ['ppbs', 'pp glucose', 'post prandial', '2hr glucose', 'post meal sugar'],
  'Random Blood Sugar (RBS)': ['rbs', 'random blood glucose', 'random sugar'],
  'HbA1c (Glycated Hemoglobin)': ['hba1c', 'a1c', 'glycated hemoglobin', 'glycosylated hb'],
  'Serum Creatinine': ['creatinine', 'creat', 's.creatinine', 'sr. creatinine', 'serum creat'],
  'Blood Urea Nitrogen (BUN)': ['bun', 'blood urea nitrogen'],
  'Blood Urea': ['urea', 'blood urea', 's.urea'],
  'Serum Uric Acid': ['uric acid', 'urate', 's.uric acid'],
  'SGPT (ALT)': ['sgpt', 'alt', 'alanine aminotransferase', 'alanine transaminase'],
  'SGOT (AST)': ['sgot', 'ast', 'aspartate aminotransferase', 'aspartate transaminase'],
  'Alkaline Phosphatase (ALP)': ['alp', 'alkaline phosphatase', 'alkphos', 'alk.phos'],
  'Total Bilirubin': ['total bilirubin', 't.bili', 't bili', 's.bilirubin total'],
  'Direct Bilirubin': ['direct bilirubin', 'conjugated bilirubin', 'd.bili'],
  'TSH (Thyroid Stimulating)': ['tsh', 'thyroid stimulating hormone', 'thyrotropin', 's.tsh'],
  'Free T3 (FT3)': ['ft3', 'free t3', 'free triiodothyronine'],
  'Free T4 (FT4)': ['ft4', 'free t4', 'free thyroxine'],
  'Serum Sodium (Na+)': ['sodium', 'na+', 's.sodium'],
  'Serum Potassium (K+)': ['potassium', 'k+', 's.potassium'],
  'Serum Chloride (Cl-)': ['chloride', 'cl-', 's.chloride'],
  'Serum Calcium': ['calcium', 'ca++', 's.calcium', 'total calcium'],
  'Total Cholesterol': ['total cholesterol', 'cholesterol', 't.chol'],
  'Triglycerides': ['triglycerides', 'tg', 'trigs'],
  'HDL Cholesterol (Good)': ['hdl', 'hdl cholesterol', 'hdl-c'],
  'LDL Cholesterol (Bad)': ['ldl', 'ldl cholesterol', 'ldl-c'],
  'Vitamin D3 (25-OH)': ['vitamin d', 'vit d', 'vit d3', '25-oh vitamin d', '25 hydroxy vitamin d'],
  'Vitamin B12': ['vitamin b12', 'vit b12', 'b12', 'cobalamin', 'cyanocobalamin'],
  'Serum Ferritin': ['ferritin', 's.ferritin'],
  'hs-CRP (High-Sensitivity CRP)': ['hs-crp', 'crp', 'c-reactive protein', 'hscrp'],
  'INR': ['inr', 'pt-inr', 'international normalized ratio']
};
