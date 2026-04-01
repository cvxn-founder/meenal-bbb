const GQL = 'https://api.ontologer.com/graphql';

// ── GraphQL ───────────────────────────────────────────────────────────────────

export async function runGraphQL(query, variables = {}) {
  try {
    const res = await fetch(GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) console.warn('[GQL]', json.errors.map(e => e.message));
    return json.data;
  } catch (e) {
    console.warn('[GQL] fetch failed:', e);
    return null;
  }
}

// Ingredient-level lookup (works for Ayurvedic/herbal; brand names like VIRILEX won't resolve)
export async function lookupIngredient(name) {
  if (!name || name.trim().length < 2) return null;
  const safe = name.replace(/"/g, '').trim();
  return runGraphQL(`{
    drugEntity(name: "${safe}") {
      id name
      trials(pageSize: 5) { edges { node { nctId title status phase enrollmentCount } } pageInfo { totalCount } }
      publications(pageSize: 5) { edges { node { pmid title } } pageInfo { totalCount } }
      adverseEvents(pageSize: 5) { edges { node { term } } pageInfo { totalCount } }
    }
  }`);
}

// Condition entity — gives trial count (real number) for disease burden reference
export async function lookupCondition(condition) {
  if (!condition || condition.trim().length < 2) return null;
  const safe = condition.replace(/"/g, '').trim();
  return runGraphQL(`{
    conditionEntity(name: "${safe}") {
      id name
      trials(pageSize: 5) { edges { node { nctId title phase status enrollmentCount } } pageInfo { totalCount } }
    }
  }`);
}

// ── Vector search ─────────────────────────────────────────────────────────────

async function vectorSearch(query, index, top_k = 8) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch('https://api.ontologer.com/api/search/simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), index, top_k })
    });
    const text = await res.text();
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const d = JSON.parse(line);
        if (d.type === 'results') return d.results || [];
      } catch {}
    }
    return [];
  } catch (e) {
    console.warn('[vectorSearch] failed:', e);
    return [];
  }
}

// Clinical trials for an ingredient or condition (uses ClinicalTrials.gov FAISS index)
export async function searchTrials(query, top_k = 8) {
  return vectorSearch(query, 'trials', top_k);
}

// PubMed publications for an ingredient / condition
export async function searchPublications(query, top_k = 8) {
  return vectorSearch(query, 'publications', top_k);
}

// ── Bundled AWACS data ────────────────────────────────────────────────────────

let _bbbData = null;

export async function getBbbData() {
  if (_bbbData) return _bbbData;
  try {
    const res = await fetch('/bbb-data.json');
    _bbbData = await res.json();
    return _bbbData;
  } catch (e) {
    console.warn('[getBbbData] failed:', e);
    return null;
  }
}

// Find a brand entry by name (fuzzy: normalise case)
export async function findBrand(brandName) {
  const data = await getBbbData();
  if (!data) return null;
  const q = brandName.trim().toUpperCase();
  return data.brands.find(b => b.brand.toUpperCase() === q) || null;
}

// Find a company's brands
export async function findCompanyBrands(companyName) {
  const data = await getBbbData();
  if (!data) return [];
  const q = companyName.trim().toUpperCase();
  return data.brands.filter(b => b.company.toUpperCase().includes(q));
}

// Top N brands by dec21 MAT value
export async function getTopBrands(n = 12) {
  const data = await getBbbData();
  if (!data) return [];
  return data.brands.slice(0, n);
}

// Market metadata
export async function getMarketMeta() {
  const data = await getBbbData();
  return data?.market || null;
}

// Doctor universe
export async function getDoctorUniverse() {
  const data = await getBbbData();
  return data?.doctor_universe || {};
}

// Environment / India macro
export async function getEnvironmentData() {
  const data = await getBbbData();
  return data?.environment?.india || null;
}

// Market definition reference
export async function getMarketDefinitionRef() {
  const data = await getBbbData();
  return data?.market_definition_reference || null;
}
