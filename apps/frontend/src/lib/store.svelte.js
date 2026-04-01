const STORAGE_KEY = 'bbb-wizard-v1';

function defaultState() {
  return {
    currentStep: 1,
    steps: {
      step1: {
        companyName: '',
        brandName: '',
        innovatorGeneric: 'Generic',
        drugClass: '',
        ingredients: '',
        keyIngredientName: '',
        keyIngredientMoa: '',
        uses: '',
        dosagePerDay: '',
        durationMonths: '',
        durationYears: '',
        mrpPackType: '',
        mrpPackSize: '',
        mrpValue: '',
        mrpPackType2: '',
        mrpPackSize2: '',
        mrpValue2: '',
        lastYearSales: ''
      },
      step2: {
        countryAttractive: '',
        industryAttractive: '',
        marketAttractive: '',
        categorySize: '',
        categoryGrowth: '',
        competitiveIntensity: '',
        marketSizeGrowth: '',
        keyPlayers: '',
        keyBrands: '',
        clinicalEvidence: '',
        publicationLevel: '',
        aiNarrative: ''
      },
      step3: {
        marketDefinition: '',
        marketSizeGrowthRate: '',
        drugClassMolecules: '',
        physicianUniverse: '',
        patientUniverse: '',
        keyPlayers: '',
        aiNarrative: ''
      },
      step4: {
        patientsLiving: '',
        patientsDiagnosed: '',
        patientsTreated: '',
        patientsTargeted: '',
        aiNarrative: ''
      },
      step5: {
        origination: '',
        diagnosis: '',
        treatmentChoices: '',
        brandChoice: '',
        accessFulfilment: '',
        adherence: '',
        aiNarrative: ''
      },
      step6: {
        leveragePoints: {
          origination: { selected: false, leakage: '' },
          diagnosis: { selected: false, leakage: '' },
          treatmentChoice: { selected: false, leakage: '' },
          classChoice: { selected: false, leakage: '' },
          brandChoice: { selected: false, leakage: '' },
          fulfilment: { selected: false, leakage: '' },
          adherence: { selected: false, leakage: '' }
        },
        aiNarrative: ''
      },
      step7: {
        stakeholders: [
          { type: 'Patients', influence: 20, drivers: '', barriers: '' },
          { type: 'Healthcare Professionals', influence: 40, drivers: '', barriers: '' },
          { type: 'Providers/Pharmacies', influence: 15, drivers: '', barriers: '' },
          { type: 'Payers/Insurance', influence: 15, drivers: '', barriers: '' },
          { type: 'Policy Makers', influence: 10, drivers: '', barriers: '' }
        ],
        aiNarrative: ''
      },
      step8: {
        competitors: [
          { brand: '', company: '', segment: '', coverage: '', notes: '' },
          { brand: '', company: '', segment: '', coverage: '', notes: '' },
          { brand: '', company: '', segment: '', coverage: '', notes: '' },
          { brand: '', company: '', segment: '', coverage: '', notes: '' },
          { brand: '', company: '', segment: '', coverage: '', notes: '' }
        ],
        categoryMatrix: '',
        aiNarrative: ''
      },
      step9: {
        feature1: '',
        feature2: '',
        feature3: '',
        clinicalData1: '',
        clinicalData2: '',
        clinicalData3: '',
        endorsement1: '',
        endorsement2: '',
        endorsement3: '',
        supportingEvidence: '',
        smp: '',
        brandEssence: '',
        aiNarrative: ''
      },
      step10: {
        segments: [],
        aiNarrative: ''
      },
      step11: {
        strengths: ['', '', ''],
        weaknesses: ['', '', ''],
        opportunities: ['', '', ''],
        threats: ['', '', ''],
        aiNarrative: ''
      },
      step12: {
        awacsData: '',
        parsedLeaderboard: [],
        aiNarrative: ''
      }
    }
  };
}

function loadState() {
  if (typeof localStorage === 'undefined') return defaultState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      const def = defaultState();
      return {
        currentStep: parsed.currentStep ?? def.currentStep,
        steps: {
          ...def.steps,
          ...Object.fromEntries(
            Object.keys(def.steps).map(k => [k, { ...def.steps[k], ...(parsed.steps?.[k] ?? {}) }])
          )
        }
      };
    }
  } catch (e) {
    console.warn('[BBB] Failed to load state:', e);
  }
  return defaultState();
}

const initial = loadState();

export let wizardState = $state(initial);

export function saveState() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardState));
  } catch (e) {
    console.warn('[BBB] Failed to save state:', e);
  }
}

export function goToStep(n) {
  if (n >= 1 && n <= 12 && n <= wizardState.currentStep + 1) {
    wizardState.currentStep = n;
    saveState();
  }
}

export function advanceStep() {
  if (wizardState.currentStep < 12) {
    wizardState.currentStep = wizardState.currentStep + 1;
    saveState();
  }
}

export function resetWizard() {
  const fresh = defaultState();
  wizardState.currentStep = fresh.currentStep;
  wizardState.steps = fresh.steps;
  saveState();
}
