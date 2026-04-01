<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { getTopBrands, getMarketMeta, getMarketDefinitionRef, searchTrials } from '$lib/backend.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step3);
  let s1 = $derived(wizardState.steps.step1);

  let topBrands = $state([]);
  let mktMeta = $state(null);
  let mktDefRef = $state(null);
  let trialResults = $state([]);
  let compLoading = $state(false);
  let aiLoading = $state(false);

  onMount(async () => {
    compLoading = true;
    try {
      const [brands, meta, defRef] = await Promise.all([
        getTopBrands(12),
        getMarketMeta(),
        getMarketDefinitionRef()
      ]);
      topBrands = brands;
      mktMeta = meta;
      mktDefRef = defRef;
      // Auto-populate empty fields from bundled data
      const s3 = wizardState.steps.step3;
      if (!s3.marketDefinition && meta?.category) {
        s3.marketDefinition = `${meta.category} (${meta.awacs_code})`;
        saveState();
      }
      if (!s3.marketSize && meta?.size_cr) {
        s3.marketSize = `Rs. ${meta.size_cr} Cr, ${(meta.growth_rate*100).toFixed(1)}% growth (MAT Dec 2021)`;
        saveState();
      }
      // Load condition trials if we have a condition/uses from step 1
      if (s1.uses || s1.drugClass) {
        const q = s1.uses || s1.drugClass;
        trialResults = (await searchTrials(q, 5)).filter(t => t.entityType === 'trial');
      }
    } finally {
      compLoading = false;
    }
  });

  function update(field, value) {
    wizardState.steps.step3[field] = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(3, 'Market Definition', wizardState.steps, {
        topBrands: topBrands.slice(0,10).map(b => ({
          brand: b.brand, company: b.company,
          mat_dec21: b.mat_val?.dec21, ms: b.ms_dec21, cagr: b.cagr_20_21
        })),
        marketMeta: mktMeta,
        trialResults: trialResults.slice(0,3)
      });
      wizardState.steps.step3.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step3.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={3} title="Market Definition" subtitle="Define your served market and competitive landscape" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="V3X2 Top Brands (AWACS)" loading={compLoading}>
      {#if mktMeta}
        <div class="data-row" style="margin-bottom:8px">
          <span class="key">Total market</span>
          <span class="val accent">Rs. {mktMeta.size_cr} Cr</span>
        </div>
      {/if}
      {#each topBrands.slice(0, 10) as b, i}
        <div class="comp-item" class:our-brand={s1.brandName && b.brand.toLowerCase().includes(s1.brandName.toLowerCase())}>
          <span class="rank">{i+1}</span>
          <div class="comp-info">
            <span class="comp-name">{b.brand}</span>
            <span class="comp-co">{b.company}</span>
          </div>
          <div class="comp-stats">
            <span class="val accent">{b.mat_val?.dec21} Cr</span>
            <span class="val muted {b.cagr_20_21 >= 0 ? 'green' : 'red'}">{b.cagr_20_21 >= 0 ? '+' : ''}{(b.cagr_20_21*100).toFixed(1)}%</span>
          </div>
        </div>
      {/each}
    </DataCard>
    {#if trialResults.length > 0}
    <DataCard title="Clinical Evidence (Condition)">
      {#each trialResults as t}
        <div class="trial-item">
          <span class="badge {t.phases?.[0] === 'PHASE4' ? 'green' : 'accent'}">{t.phases?.[0]?.replace('PHASE','P') || 'N/A'}</span>
          <span class="trial-title">{t.snippet?.slice(0,80)}...</span>
        </div>
      {/each}
    </DataCard>
    {/if}

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Define Market"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Market Identification</div>

    <div class="field">
      <label>Market Definition / AWACS Code</label>
      <input type="text" value={s.marketDefinition} oninput={e => update('marketDefinition', e.target.value)} placeholder="e.g. Sex Tonics & Stimulants / STS" />
    </div>

    <div class="field">
      <label for="mktSize">Market Size &amp; Growth Rate</label>
      <input id="mktSize" type="text" value={s.marketSize} oninput={e => update('marketSize', e.target.value)} placeholder="e.g. Rs. 139 Cr, 7.8% growth" />
      {#if mktMeta && !s.marketSize}
        <span class="field-hint">Auto-filled from AWACS data on load</span>
      {/if}
    </div>

    <div class="field">
      <label>Drug Class / Molecules in Market</label>
      <textarea value={s.drugClassMolecules} oninput={e => update('drugClassMolecules', e.target.value)} placeholder="List all drug classes and key molecules competing in this market..." rows="4"></textarea>
    </div>

    <div class="section-title">Physician &amp; Patient Universe</div>

    <div class="field">
      <label>Physician Universe (specialties)</label>
      <textarea value={s.physicianUniverse} oninput={e => update('physicianUniverse', e.target.value)} placeholder="e.g. Urologists: 5,200&#10;Andrologists: 1,200&#10;GPs: 50,000" rows="4"></textarea>
    </div>

    <div class="field">
      <label>Patient Universe (millions)</label>
      <input type="number" value={s.patientUniverse} oninput={e => update('patientUniverse', e.target.value)} placeholder="e.g. 50" min="0" step="0.1" />
    </div>

    <div class="section-title">Key Players</div>

    <div class="field">
      <label>Key Players (Brand, Company, Market Share %)</label>
      <textarea value={s.keyPlayers} oninput={e => update('keyPlayers', e.target.value)} placeholder="Brand A, Company X, 22%&#10;Brand B, Company Y, 18%&#10;Brand C, Company Z, 14%" rows="6"></textarea>
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 4 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .data-panel {
    width: 320px;
    min-width: 320px;
    border-right: 1px solid var(--panel-border);
    padding: 20px 16px;
    background: var(--panel-bg);
    overflow-y: auto;
  }

  .input-panel {
    flex: 1;
    padding: 20px 28px;
    overflow-y: auto;
  }

  .comp-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0; border-bottom: 1px solid var(--divider);
    font-size: var(--text-sm);
  }
  .comp-item:last-child { border-bottom: none; }
  .comp-item.our-brand { background: rgba(158,203,255,0.07); border-radius: 4px; padding: 6px 4px; }
  .rank { font-size: var(--text-xs); color: var(--text-muted); width: 16px; flex-shrink: 0; text-align: right; }
  .comp-info { flex: 1; min-width: 0; }
  .comp-name { display: block; color: var(--text); font-size: var(--text-sm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .comp-co { display: block; font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .comp-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex-shrink: 0; }
  .comp-stats .val { font-size: var(--text-xs); }
  .trial-item { display: flex; align-items: flex-start; gap: 6px; padding: 5px 0; border-bottom: 1px solid var(--divider); }
  .trial-item:last-child { border-bottom: none; }
  .trial-title { font-size: var(--text-xs); color: var(--text-muted); line-height: 1.4; }
  .hint-text { font-size: var(--text-sm); color: var(--text-muted); line-height: 1.6; }
  .field-hint { display: block; font-size: var(--text-xs); color: var(--text-muted); margin-top: 3px; }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
