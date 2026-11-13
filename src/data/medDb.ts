export interface MedRecord {
  g: string; // Generic name
  brands: string[]; // Common brand names in India
  cat: string; // Category
  ind: string; // Indication
}

export const MED_DB: MedRecord[] = [
  // Analgesic & Antipyretic
  { g: 'Paracetamol', brands: ['Dolo 650', 'Calpol', 'Crocin', 'Pacimol', 'Pyrigesic'], cat: 'Analgesic', ind: 'Fever, pain, headache' },
  { g: 'Ibuprofen', brands: ['Brufen', 'Ibugesic', 'Combiflam (with Paracetamol)'], cat: 'NSAID', ind: 'Inflammation, body aches, dental pain' },
  { g: 'Aceclofenac', brands: ['Zerodol', 'Hifenac', 'Dolokind', 'Zerodol-SP'], cat: 'NSAID', ind: 'Joint pain, arthritis, sprain' },
  { g: 'Diclofenac', brands: ['Voveran', 'Volini', 'Dynapar', 'Diclogesic'], cat: 'NSAID', ind: 'Severe pain, musculoskeletal pain' },
  { g: 'Mefenamic Acid', brands: ['Meftal-Spas', 'Meftal', 'Ponstan'], cat: 'Antispasmodic', ind: 'Menstrual cramps, abdominal pain' },
  { g: 'Tramadol', brands: ['Tramazac', 'Ultracet (with Paracetamol)', 'Domadol'], cat: 'Opioid Analgesic', ind: 'Moderate to severe post-op or chronic pain' },

  // Gastrointestinal
  { g: 'Pantoprazole', brands: ['Pan 40', 'Pantocid', 'Pantodac', 'Pan-D (with Domperidone)'], cat: 'PPI (Antacid)', ind: 'Acid reflux, GERD, gastric ulcers' },
  { g: 'Omeprazole', brands: ['Omez', 'Ocid', 'Omez-D'], cat: 'PPI (Antacid)', ind: 'Acidity, heartburn, peptic ulcer' },
  { g: 'Rabeprazole', brands: ['Razo 20', 'Happi', 'Rablet', 'Cyra-D'], cat: 'PPI (Antacid)', ind: 'Gastritis, reflux esophagitis' },
  { g: 'Esomeprazole', brands: ['Nexpro', 'Esomac', 'Sompraz'], cat: 'PPI (Antacid)', ind: 'Acid peptic disease, Zollinger-Ellison' },
  { g: 'Ranitidine / Famotidine', brands: ['Rantac', 'Aciloc', 'Famocid'], cat: 'H2 Blocker', ind: 'Mild heartburn, stomach hyperacidity' },
  { g: 'Domperidone', brands: ['Domstal', 'Motinorm', 'Vomisave'], cat: 'Antiemetic', ind: 'Nausea, vomiting, indigestion, fullness' },
  { g: 'Ondansetron', brands: ['Emeset', 'Zofran', 'Vomikind'], cat: 'Antiemetic', ind: 'Severe vomiting, post-chemo or gastroenteritis nausea' },
  { g: 'Sucralfate', brands: ['Sucrafil', 'Ulcagel', 'Pepsigard'], cat: 'Mucosal Protectant', ind: 'Stomach ulcer coating, duodenal ulcers' },
  { g: 'Lactulose', brands: ['Duphalac', 'Cremaffin Plus', 'Looz'], cat: 'Laxative', ind: 'Chronic constipation, hepatic encephalopathy' },
  { g: 'Loperamide', brands: ['Imodium', 'Lopamide', 'Roko'], cat: 'Antidiarrheal', ind: 'Acute non-infectious diarrhea' },

  // Antidiabetic
  { g: 'Metformin', brands: ['Glycomet', 'Obimet', 'Glucophage', 'Cetapin'], cat: 'Antidiabetic (Biguanide)', ind: 'Type 2 Diabetes mellitus, PCOS' },
  { g: 'Glimepiride', brands: ['Amaryl', 'Glimestar', 'Zoryl', 'Gemer (with Metformin)'], cat: 'Antidiabetic (Sulfonylurea)', ind: 'Type 2 Diabetes glucose lowering' },
  { g: 'Teneligliptin', brands: ['Ziten', 'Tenalim', 'Tenebite', 'Dynaglipt'], cat: 'Antidiabetic (DPP-4 Inhibitor)', ind: 'Post-prandial blood sugar control' },
  { g: 'Vildagliptin', brands: ['Galvus', 'Jalra', 'Zomelis', 'Galvus Met'], cat: 'Antidiabetic (DPP-4 Inhibitor)', ind: 'Type 2 Diabetes' },
  { g: 'Sitagliptin', brands: ['Januvia', 'Istavel', 'Janumet (with Metformin)'], cat: 'Antidiabetic (DPP-4 Inhibitor)', ind: 'Type 2 Diabetes management' },
  { g: 'Dapagliflozin', brands: ['Forxiga', 'Oxra', 'Dapavel', 'Voage'], cat: 'Antidiabetic (SGLT2 Inhibitor)', ind: 'Diabetes, heart failure, renal protection' },
  { g: 'Empagliflozin', brands: ['Jardiance', 'Gibtulio', 'Ajaduo'], cat: 'Antidiabetic (SGLT2 Inhibitor)', ind: 'Type 2 Diabetes, cardiovascular risk reduction' },
  { g: 'Human Insulin (Regular/NPH/30-70)', brands: ['Human Mixtard', 'Huminsulin', 'Insulatard', 'Actrapid'], cat: 'Insulin', ind: 'Type 1 & severe Type 2 Diabetes' },
  { g: 'Insulin Glargine', brands: ['Lantus', 'Basalog', 'Toujeo'], cat: 'Long-acting Insulin', ind: 'Basal 24-hour glycemic control' },

  // Cardiovascular & Antihypertensive
  { g: 'Telmisartan', brands: ['Telma 40', 'Telmikind', 'Telsar', 'Telma-H (with HCTZ)', 'Telma-AM'], cat: 'Antihypertensive (ARB)', ind: 'High blood pressure, stroke prevention' },
  { g: 'Losartan', brands: ['Losacar', 'Repace', 'Covance', 'Losar-H'], cat: 'Antihypertensive (ARB)', ind: 'Hypertension, diabetic nephropathy' },
  { g: 'Olmesartan', brands: ['Olmy', 'Olmecip', 'Pinom'], cat: 'Antihypertensive (ARB)', ind: 'Essential hypertension' },
  { g: 'Amlodipine', brands: ['Amlong', 'Stamlo', 'Amlopin', 'Numlo'], cat: 'Calcium Channel Blocker', ind: 'High blood pressure, angina pectoris' },
  { g: 'Cilnidipine', brands: ['Cilacar', 'Nexsulin', 'Cilny'], cat: 'Calcium Channel Blocker', ind: 'Hypertension with tachycardia or renal strain' },
  { g: 'Metoprolol', brands: ['Betaloc', 'Metolar-XR', 'Starpress-XL'], cat: 'Beta-blocker', ind: 'Angina, hypertension, arrhythmias, post-MI' },
  { g: 'Atenolol', brands: ['Tenormin', 'Betacard', 'Aten'], cat: 'Beta-blocker', ind: 'Hypertension, migraine prophylaxis' },
  { g: 'Bisoprolol', brands: ['Concor', 'Bisoheart', 'Corbis'], cat: 'Beta-blocker', ind: 'Heart failure, chronic stable angina' },
  { g: 'Ramipril', brands: ['Cardace', 'Hopace', 'Ramirace'], cat: 'ACE Inhibitor', ind: 'Hypertension, post-heart attack heart failure' },
  { g: 'Enalapril', brands: ['Envas', 'Nuril', 'Enam'], cat: 'ACE Inhibitor', ind: 'High blood pressure, congestive heart failure' },
  { g: 'Hydrochlorothiazide / Chlorthalidone', brands: ['Aquazide', 'Thalizide', 'Hythalton'], cat: 'Diuretic', ind: 'Fluid retention, edema, hypertension' },
  { g: 'Furosemide / Torsemide', brands: ['Lasix', 'Dytor', 'Torsine'], cat: 'Loop Diuretic', ind: 'Pulmonary edema, CHF, kidney swelling' },

  // Lipid Lowering (Statins)
  { g: 'Atorvastatin', brands: ['Atorva', 'Lipitor', 'Tonact', 'Storvas', 'Atorlip'], cat: 'Statin (Lipid-lowering)', ind: 'High cholesterol, coronary artery disease' },
  { g: 'Rosuvastatin', brands: ['Rosuvas', 'Rozucor', 'Crestor', 'Rosavel'], cat: 'Statin (Lipid-lowering)', ind: 'High LDL, hyperlipidemia, atherosclerosis' },
  { g: 'Fenofibrate', brands: ['Lipicard', 'Fibator', 'Stanlip'], cat: 'Fibrate', ind: 'Very high triglycerides' },

  // Antiplatelet & Anticoagulant
  { g: 'Aspirin (Low Dose / Ecosprin)', brands: ['Ecosprin 75', 'Ecosprin 150', 'Disprin', 'Loprin'], cat: 'Antiplatelet', ind: 'Heart attack & ischemic stroke prevention' },
  { g: 'Clopidogrel', brands: ['Clopilet', 'Plavix', 'Deplatt', 'Clavix'], cat: 'Antiplatelet', ind: 'Post-stent placement, acute coronary syndrome' },
  { g: 'Warfarin / Acenocoumarol', brands: ['Warf', 'Acitrom'], cat: 'Anticoagulant', ind: 'DVT, PE, atrial fibrillation, metallic valve' },
  { g: 'Apixaban / Rivaroxaban', brands: ['Eliquis', 'Xarelto', 'Rivochar', 'Apigat'], cat: 'DOAC (Anticoagulant)', ind: 'Stroke prevention in non-valvular AFib, DVT' },

  // Antibiotics & Anti-infectives
  { g: 'Amoxicillin + Clavulanic Acid', brands: ['Augmentin 625', 'Moxikind-CV', 'Clavam 625', 'Mega-CV'], cat: 'Antibiotic (Beta-lactam)', ind: 'Bacterial respiratory, ENT, skin, dental infection' },
  { g: 'Azithromycin', brands: ['Azithral', 'Azee', 'Zithrox', 'Azicip'], cat: 'Antibiotic (Macrolide)', ind: 'Throat infection, pneumonia, typhoid, bronchitis' },
  { g: 'Cefixime', brands: ['Taxim-O', 'Zifi', 'Cefolac', 'Mahacef'], cat: 'Antibiotic (Cephalosporin)', ind: 'Urinary tract infection, typhoid, otitis media' },
  { g: 'Ciprofloxacin', brands: ['Cifran', 'Ciplox', 'Ciprobid'], cat: 'Antibiotic (Fluoroquinolone)', ind: 'Infectious diarrhea, bone/joint, UTI' },
  { g: 'Ofloxacin + Ornidazole', brands: ['O2', 'Oflox-OZ', 'Zenflox-OZ', 'Norflox-TZ'], cat: 'Antibiotic / Antiprotozoal', ind: 'Gastroenteritis, amoebic dysentery' },
  { g: 'Doxycycline', brands: ['Doxicip', 'Doxt-SL', 'Microdox'], cat: 'Antibiotic (Tetracycline)', ind: 'Acne, scrub typhus, malaria prophylaxis, respiratory' },
  { g: 'Metronidazole', brands: ['Flagyl', 'Metrogyl', 'Aldazole'], cat: 'Antiprotozoal / Antibacterial', ind: 'Amoebiasis, dental abscess, Giardia' },

  // Antiallergy & Respiratory
  { g: 'Levocetirizine', brands: ['Levocet', '1-AL', 'Vozet', 'Teczine', 'Montair-LC (with Montelukast)'], cat: 'Antihistamine', ind: 'Sneezing, allergic rhinitis, hives, itching' },
  { g: 'Cetirizine', brands: ['Cetzine', 'Alerid', 'Okacet'], cat: 'Antihistamine', ind: 'Allergies, urticaria, running nose' },
  { g: 'Bilastine', brands: ['Bilasave', 'Bilashine', 'Bilaxten'], cat: 'Non-sedating Antihistamine', ind: 'Chronic urticaria, allergic rhinoconjunctivitis' },
  { g: 'Fexofenadine', brands: ['Allegra 120', 'Allegra 180', 'Fexova', 'Histafree'], cat: 'Antihistamine', ind: 'Seasonal allergies, skin rashes' },
  { g: 'Montelukast', brands: ['Montair 10', 'Singulair', 'Romilast'], cat: 'Leukotriene Receptor Antagonist', ind: 'Asthma maintenance, allergic rhinitis' },
  { g: 'Salbutamol / Albuterol', brands: ['Asthalin', 'Ventorlin', 'Deriphyllin'], cat: 'Bronchodilator (SABA)', ind: 'Acute asthma attack, wheezing, COPD' },
  { g: 'Budesonide + Formoterol Inhaler', brands: ['Foracort', 'Budecort', 'Symbicort', 'Budamate'], cat: 'Inhaled Corticosteroid + LABA', ind: 'Asthma controller, COPD flare prevention' },
  { g: 'Fluticasone Nasal Spray', brands: ['Flomist', 'Flixonase', 'Furamist'], cat: 'Steroid Nasal Spray', ind: 'Chronic sinus congestion, allergic rhinitis' },

  // Thyroid
  { g: 'Levothyroxine', brands: ['Thyronorm', 'Eltroxin', 'Thyrox'], cat: 'Thyroid Hormone', ind: 'Hypothyroidism, goiter management' },
  { g: 'Methimazole / Carbimazole', brands: ['Neo-Mercazole', 'Thyrozole'], cat: 'Antithyroid', ind: 'Hyperthyroidism, Graves disease' },

  // Neuro & Psychiatric
  { g: 'Alprazolam', brands: ['Alprax', 'Restyl', 'Zolax'], cat: 'Benzodiazepine', ind: 'Severe panic disorder, anxiety crisis (SOS)' },
  { g: 'Clonazepam', brands: ['Clona', 'Zapiz', 'Rivotril', 'Lonazep'], cat: 'Benzodiazepine / Anticonvulsant', ind: 'Seizures, restless legs, panic attacks' },
  { g: 'Escitalopram', brands: ['Nexito', 'Cipralex', 'Stalopam', 'Nexito Plus (with Clonazepam)'], cat: 'SSRI Antidepressant', ind: 'Major depression, generalized anxiety disorder' },
  { g: 'Sertraline', brands: ['Daxid', 'Zoloft', 'Serta', 'Serlift'], cat: 'SSRI Antidepressant', ind: 'Depression, OCD, PTSD' },
  { g: 'Pregabalin / Gabapentin', brands: ['Pregalin', 'Maxgalin', 'Gabapin', 'Nurokind-P'], cat: 'Neuropathic Agent', ind: 'Diabetic neuropathy, fibromyalgia, nerve pain' },

  // Vitamins & Supplements
  { g: 'Cholecalciferol (Vitamin D3 60,000 IU)', brands: ['D3 Must 60K', 'Calcirol', 'Uprise-D3', 'Depura'], cat: 'Vitamin D Supplement', ind: 'Vitamin D deficiency, bone health, osteoporosis' },
  { g: 'Methylcobalamin (Vitamin B12)', brands: ['Nurokind-LC', 'Rejunex', 'Cobadex', 'Neurobion Forte'], cat: 'Vitamin B Complex', ind: 'Peripheral neuropathy, megaloblastic anemia' },
  { g: 'Ferrous Ascorbate + Folic Acid', brands: ['Orofer-XT', 'Livogen-Z', 'Autrin', 'Fefol'], cat: 'Iron Supplement', ind: 'Iron deficiency anemia, pregnancy supplement' },
  { g: 'Calcium Carbonate + Vit D3', brands: ['Shelcal 500', 'Calcimax', 'Gemcal', 'Cipcal'], cat: 'Mineral Supplement', ind: 'Bone mineralization, calcium deficiency' },

  // Dermatology & Topical
  { g: 'Clobetasol Propionate', brands: ['Tenovate', 'Cloben-G', 'Clobetamil-G'], cat: 'Topical Steroid', ind: 'Severe eczema, psoriasis, dermatitis' },
  { g: 'Mupirocin Ointment', brands: ['Bactroban', 'T-Bact', 'Mupirox'], cat: 'Topical Antibiotic', ind: 'Bacterial skin infections, impetigo, wound care' },
  { g: 'Clotrimazole / Terbinafine', brands: ['Candid', 'Canesten', 'Sebifin', 'Exifine'], cat: 'Antifungal', ind: 'Fungal skin infections, ringworm, candidiasis' }
];

export const MED_SEARCH: { term: string; cat: string; hint: string }[] = [];

MED_DB.forEach(item => {
  MED_SEARCH.push({
    term: item.g,
    cat: item.cat,
    hint: `Generic: ${item.g} (${item.ind})`
  });
  item.brands.forEach(b => {
    MED_SEARCH.push({
      term: b,
      cat: item.cat,
      hint: `Brand of ${item.g} — ${item.cat}`
    });
  });
});
