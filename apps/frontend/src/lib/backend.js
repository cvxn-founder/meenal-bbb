const GQL = 'https://api.ontologer.com/graphql';

export async function runGraphQL(query, variables = {}) {
  try {
    const res = await fetch(GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) console.warn('[GQL]', json.errors);
    return json.data;
  } catch (e) {
    console.warn('[GQL] fetch failed:', e);
    return null;
  }
}

export async function lookupDrug(name) {
  if (!name || name.trim().length < 2) return null;
  return runGraphQL(`{
    drugEntity(name: "${name.replace(/"/g, '')}") {
      id name
      profile { sponsorName applicationNumber approvalDate }
      trials(pageSize: 5) { edges { node { nctId title status phase } } pageInfo { totalCount } }
      publications(pageSize: 5) { edges { node { pmid title } } pageInfo { totalCount } }
      adverseEvents(pageSize: 5) { edges { node { term } } pageInfo { totalCount } }
    }
  }`);
}

export async function searchCompetitors(drugClass) {
  if (!drugClass || drugClass.trim().length < 2) return [];
  try {
    const res = await fetch('https://api.ontologer.com/api/search/simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: drugClass, index: 'drugs', top_k: 10 })
    });
    const text = await res.text();
    return text.split('\n')
      .filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch (e) {
    console.warn('[searchCompetitors] failed:', e);
    return [];
  }
}

export async function searchPublications(ingredient) {
  if (!ingredient || ingredient.trim().length < 2) return [];
  try {
    const res = await fetch('https://api.ontologer.com/api/search/simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: ingredient, index: 'publications', top_k: 8 })
    });
    const text = await res.text();
    return text.split('\n')
      .filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch (e) {
    console.warn('[searchPublications] failed:', e);
    return [];
  }
}
