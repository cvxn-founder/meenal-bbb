<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { getEnvironmentData, getMarketMeta } from '$lib/backend.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step2);
  let aiLoading = $state(false);
  let envData = $state(null);
  let mktData = $state(null);

  onMount(async () => {
    [envData, mktData] = await Promise.all([getEnvironmentData(), getMarketMeta()]);
  });

  function update(field, value) {
    wizardState.steps.step2[field] = value;
    saveState();
  }

  function radio(field, val) {
    wizardState.steps.step2[field] = val;
    saveState();
  }

  const YNM = ['Yes', 'No', 'Moderate'];
  const LMH = ['Low', 'Moderate', 'High'];

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(2, 'Environment Understanding', wizardState.steps, {
        indiaData: envData,
        marketData: mktData
      });
      wizardState.steps.step2.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step2.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={2} title="Environment Understanding" subtitle="Assess country, industry and market attractiveness" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="India Pharma Macro">
      <div class="data-row"><span class="key">Population</span><span class="val">{envData?.population_bn ?? 1.44} Bn</span></div>
      <div class="data-row"><span class="key">GDP</span><span class="val">${envData?.gdp_tr_usd ?? 27.36} Tr</span></div>
      <div class="data-row"><span class="key">GDP Growth</span><span class="val badge green">{envData?.gdp_growth_pct ?? 7.3}%</span></div>
      <div class="data-row"><span class="key">Pharma Market</span><span class="val">${envData?.pharma_market_bn_usd ?? 54.6} Bn</span></div>
      <div class="data-row"><span class="key">Pharma Growth</span><span class="val badge green">{envData?.pharma_growth_pct ?? 12.3}%</span></div>
      <div class="data-row"><span class="key">Urban</span><span class="val">{envData?.urban_pct ?? 36.8}%</span></div>
      <div class="data-row"><span class="key">Rural</span><span class="val">{envData?.rural_pct ?? 63.2}%</span></div>
      <div class="data-row"><span class="key">GNI per Capita</span><span class="val">${envData?.gni_per_capita ?? 8230}</span></div>
      <div class="data-row"><span class="key">IP Protection</span><span class="val badge green">{envData?.ip_strength ?? 'Strong'}</span></div>
      <div class="data-row"><span class="key">Reimbursement</span><span class="val badge amber">OOP &gt;30%</span></div>
    </DataCard>
    {#if mktData}
    <DataCard title="V3X2 Category (AWACS)">
      <div class="data-row"><span class="key">Category</span><span class="val">{mktData.category}</span></div>
      <div class="data-row"><span class="key">Market Size</span><span class="val accent">Rs. {mktData.size_cr} Cr</span></div>
      <div class="data-row"><span class="key">Growth Rate</span><span class="val badge green">{(mktData.growth_rate*100).toFixed(1)}%</span></div>
      <div class="data-row"><span class="key">CAGR (5yr)</span><span class="val">{(mktData.cagr*100).toFixed(1)}%</span></div>
      <div class="data-row"><span class="key">Brands</span><span class="val">{mktData.num_brands}</span></div>
      <div class="data-row"><span class="key">Companies</span><span class="val">{mktData.num_companies}</span></div>
    </DataCard>
    {/if}

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Analyze Environment"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Attractiveness Assessment</div>

    <div class="field">
      <label>Is the country attractive?</label>
      <div class="radio-group">
        {#each YNM as opt}
          <label class="radio-option" class:selected={s.countryAttractive === opt}>
            <input type="radio" name="countryAttractive" value={opt} checked={s.countryAttractive === opt} onchange={() => radio('countryAttractive', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label>Is the industry attractive?</label>
      <div class="radio-group">
        {#each YNM as opt}
          <label class="radio-option" class:selected={s.industryAttractive === opt}>
            <input type="radio" name="industryAttractive" value={opt} checked={s.industryAttractive === opt} onchange={() => radio('industryAttractive', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label>Is the represented market attractive?</label>
      <div class="radio-group">
        {#each YNM as opt}
          <label class="radio-option" class:selected={s.marketAttractive === opt}>
            <input type="radio" name="marketAttractive" value={opt} checked={s.marketAttractive === opt} onchange={() => radio('marketAttractive', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="section-title">Category Dynamics</div>

    <div class="field">
      <label>Category Size</label>
      <div class="radio-group">
        {#each LMH as opt}
          <label class="radio-option" class:selected={s.categorySize === opt}>
            <input type="radio" name="categorySize" value={opt} checked={s.categorySize === opt} onchange={() => radio('categorySize', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label>Category Growth</label>
      <div class="radio-group">
        {#each LMH as opt}
          <label class="radio-option" class:selected={s.categoryGrowth === opt}>
            <input type="radio" name="categoryGrowth" value={opt} checked={s.categoryGrowth === opt} onchange={() => radio('categoryGrowth', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label>Competitive Intensity</label>
      <div class="radio-group">
        {#each LMH as opt}
          <label class="radio-option" class:selected={s.competitiveIntensity === opt}>
            <input type="radio" name="competitiveIntensity" value={opt} checked={s.competitiveIntensity === opt} onchange={() => radio('competitiveIntensity', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="section-title">Market Details</div>

    <div class="field">
      <label>Market Size &amp; Growth (narrative)</label>
      <textarea value={s.marketSizeGrowth} oninput={e => update('marketSizeGrowth', e.target.value)} placeholder="Describe market size, growth rate, trends..." rows="3"></textarea>
    </div>

    <div class="field">
      <label>Key Players</label>
      <textarea value={s.keyPlayers} oninput={e => update('keyPlayers', e.target.value)} placeholder="List major companies in this market..." rows="3"></textarea>
    </div>

    <div class="field">
      <label>Key Brands</label>
      <textarea value={s.keyBrands} oninput={e => update('keyBrands', e.target.value)} placeholder="List top brands in the category..." rows="3"></textarea>
    </div>

    <div class="section-title">Evidence &amp; Publications</div>

    <div class="field">
      <label>Clinical Evidence / Endorsements Level</label>
      <div class="radio-group">
        {#each LMH as opt}
          <label class="radio-option" class:selected={s.clinicalEvidence === opt}>
            <input type="radio" name="clinicalEvidence" value={opt} checked={s.clinicalEvidence === opt} onchange={() => radio('clinicalEvidence', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <label>Publication Level</label>
      <div class="radio-group">
        {#each LMH as opt}
          <label class="radio-option" class:selected={s.publicationLevel === opt}>
            <input type="radio" name="publicationLevel" value={opt} checked={s.publicationLevel === opt} onchange={() => radio('publicationLevel', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 3 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .data-panel {
    width: 360px;
    min-width: 360px;
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

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
