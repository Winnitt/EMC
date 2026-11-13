export interface AllergyCategory {
  cat: 'Respiratory' | 'Food' | 'Skin' | 'Drug' | 'Insect';
  name: string;
  allergens: string[];
}

export const ALLERGY_DB: AllergyCategory[] = [
  {
    cat: 'Respiratory',
    name: 'Allergic Rhinitis (Hay Fever)',
    allergens: [
      'Parthenium pollen (Congress Grass)',
      'House Dust Mites (D. farinae)',
      'House Dust Mites (D. pteronyssinus)',
      'Bermuda Grass pollen (Cynodon dactylon)',
      'Amaranthus spinosus pollen',
      'Prosopis juliflora pollen',
      'Fungus Alternaria alternata',
      'Fungus Aspergillus fumigatus',
      'Cockroach allergen (Periplaneta americana)'
    ]
  },
  {
    cat: 'Respiratory',
    name: 'Allergic Asthma',
    allergens: [
      'Pollen grains (Ricinus communis)',
      'Pollen grains (Holoptelea integrifolia)',
      'Eucalyptus pollen',
      'Pet dander (Cat)',
      'Pet dander (Dog)',
      'Grain dust (Wheat storage)'
    ]
  },
  {
    cat: 'Food',
    name: 'Pulse & Legume Allergy',
    allergens: [
      'Chickpea (Besan / Chana)',
      'Lentils (Toor / Moong / Urad)',
      'Soybean',
      'Pigeon pea'
    ]
  },
  {
    cat: 'Food',
    name: 'Dairy & Milk Allergy',
    allergens: [
      'Cow Milk Protein (Casein)',
      'Cow Milk Protein (Whey)',
      'Buffalo Milk',
      'Paneer / Milk Solids'
    ]
  },
  {
    cat: 'Food',
    name: 'Wheat & Grain Allergy',
    allergens: [
      'Wheat Gluten',
      'Celiac disease trigger',
      'Maida (Refined Flour)',
      'Barley & Rye'
    ]
  },
  {
    cat: 'Food',
    name: 'Nut & Seed Allergy',
    allergens: [
      'Peanut (Groundnut)',
      'Cashew Nut (Kaju)',
      'Mustard Seed (Sarson)',
      'Sesame Seed (Til)',
      'Walnut (Akhrot)'
    ]
  },
  {
    cat: 'Food',
    name: 'Seafood Allergy',
    allergens: [
      'Prawns / Shrimp',
      'Crab / Lobster',
      'Fish (Rohu / Catla / Pomfret)',
      'Squid'
    ]
  },
  {
    cat: 'Skin',
    name: 'Parthenium Dermatitis',
    allergens: [
      'Parthenium hysterophorus contact',
      'Airborne contact dermatitis trigger'
    ]
  },
  {
    cat: 'Skin',
    name: 'Metal & Chemical Dermatitis',
    allergens: [
      'Nickel (Artificial jewelry, belt buckles)',
      'Hair Dye (Paraphenylenediamine - PPD)',
      'Henna / Kali Mehendi additives',
      'Chromium (Leather goods, wet cement)'
    ]
  },
  {
    cat: 'Skin',
    name: 'Cosmetic & Latex Allergy',
    allergens: [
      'Natural Rubber Latex',
      'Fragrance Mix / Perfumes',
      'Preservatives (Parabens, Kathon CG)'
    ]
  },
  {
    cat: 'Drug',
    name: 'Beta-Lactam Antibiotic Allergy',
    allergens: [
      'Penicillin',
      'Amoxicillin',
      'Ampicillin',
      'Augmentin (Co-amoxiclav)',
      'Cephalosporins (Cefixime, Cefuroxime)'
    ]
  },
  {
    cat: 'Drug',
    name: 'NSAID / Painkiller Allergy',
    allergens: [
      'Aspirin',
      'Ibuprofen',
      'Diclofenac',
      'Mefenamic Acid',
      'Aceclofenac'
    ]
  },
  {
    cat: 'Drug',
    name: 'Sulfa & Anticonvulsant Allergy',
    allergens: [
      'Sulfonamides (Cotrimoxazole / Bactrim)',
      'Phenytoin',
      'Carbamazepine',
      'Allopurinol'
    ]
  },
  {
    cat: 'Insect',
    name: 'Hymenoptera Venom Allergy',
    allergens: [
      'Honeybee sting (Apis cerana/dorsata)',
      'Wasp sting (Vespa tropica)',
      'Yellow jacket sting',
      'Hornet venom'
    ]
  },
  {
    cat: 'Insect',
    name: 'Biting Insect Hypersensitivity',
    allergens: [
      'Mosquito bite hypersensitivity',
      'Red ant bite (Soleropsis)',
      'Bedbug bite saliva'
    ]
  }
];

export interface SearchableItem {
  term: string;
  cat: string;
  hint: string;
}

export const ALLERGY_SEARCH: SearchableItem[] = [];

ALLERGY_DB.forEach(group => {
  ALLERGY_SEARCH.push({
    term: group.name,
    cat: group.cat,
    hint: `Category: ${group.cat}`
  });
  group.allergens.forEach(allergen => {
    ALLERGY_SEARCH.push({
      term: allergen,
      cat: group.cat,
      hint: `${group.name} (${group.cat})`
    });
  });
});
