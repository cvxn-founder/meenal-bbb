<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { searchCompetitors } from '$lib/backend.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step3);
  let s1 = $derived(wizardState.steps.step1);

  let competitors = $state([]);
  let compLoading = $state(false);
  let aiLoading = $state(false);

  onMount(async () => {
    if (s1.drugClass) {
      await loadCompetitors();
    }
  });

  async function loadCompetitors() {
    if (!s1.drugClass) return;
    compLoading = true;
    competitors = [];
    try {
      competitors = await searchCompetitors(s1.drugClass);
    } catch (e) {
      console.warn(e);
    } finally {
      compLoading = false;
    }
  }

  function update(field, value) {
    wizardState.steps.step3[field] = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(3, 'Market Definition', wizardState.steps, { competitors });
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
    <DataCard title="Competitor Drug Lookup" loading={compLoading}>
      {#if competitors.length > 0}
        {#each competitors.slice(0,8) as comp}
          <div class="comp-item">
            <span class="comp-name">{comp.name || comp.title || 'Unknown'}</span>
            {#if comp.score}
              <span class="badge accent">{(comp.score * 100).toFixed(0)}%</span>
            {/if}
          </div>
        {/each}
      {:else}
        <p class="hint-text">Drug class from Step 1 ({s1.drugClass || 'not set'}) will be used to find competitors.</p>
        {#if s1.drugClass}
          <button onclick={loadCompetitors} style="margin-top:8px; font-size:var(--text-xs);">Reload</button>
        {/if}
      {/if}
    </DataCard>

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
      <label>Market Size &amp; Growth Rate</label>
      <input type="text" value={s.marketSizeGrowthRate} oninput={e => update('marketSizeGrowthRate', e.target.value)} placeholder="e.g. Rs. 480 Cr, growing 8% YoY" />
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 0;
    border-bottom: 1px solid var(--divider);
    font-size: var(--text-sm);
  }

  .comp-item:last-child { border-bottom: none; }

  .comp-name {
    color: var(--text);
    flex: 1;
    margin-right: 8px;
  }

  .hint-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
