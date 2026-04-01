<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { lookupDrug } from '$lib/backend.js';

  let s = $derived(wizardState.steps.step1);

  let drugData = $state(null);
  let drugLoading = $state(false);
  let drugError = $state('');

  let debounceTimer;

  function update(field, value) {
    wizardState.steps.step1[field] = value;
    saveState();
  }

  async function handleBrandBlur() {
    if (!s.brandName || s.brandName.trim().length < 2) return;
    drugLoading = true;
    drugError = '';
    drugData = null;
    try {
      const data = await lookupDrug(s.brandName);
      drugData = data?.drugEntity ?? null;
      if (!drugData) drugError = 'No data found for this brand.';
    } catch (e) {
      drugError = 'Lookup failed. Check connection.';
    } finally {
      drugLoading = false;
    }
  }

  function radioUpdate(field, val) {
    wizardState.steps.step1[field] = val;
    saveState();
  }
</script>

<StepHeader stepNum={1} title="Product Orientation" subtitle="Define your brand and product details" />

<div class="step-body">
  <!-- Data Panel -->
  <div class="data-panel scrollable">
    <DataCard title="Drug Entity Lookup" loading={drugLoading}>
      {#if drugError}
        <p class="error-msg">{drugError}</p>
      {:else if drugData}
        <div class="data-row">
          <span class="key">Name</span>
          <span class="val">{drugData.name}</span>
        </div>
        {#if drugData.profile?.sponsorName}
          <div class="data-row">
            <span class="key">Sponsor</span>
            <span class="val">{drugData.profile.sponsorName}</span>
          </div>
        {/if}
        {#if drugData.profile?.approvalDate}
          <div class="data-row">
            <span class="key">Approved</span>
            <span class="val">{drugData.profile.approvalDate}</span>
          </div>
        {/if}
        {#if drugData.trials?.pageInfo?.totalCount}
          <div class="data-row">
            <span class="key">Clinical Trials</span>
            <span class="val badge accent">{drugData.trials.pageInfo.totalCount}</span>
          </div>
          {#each drugData.trials.edges.slice(0,3) as { node }}
            <div class="trial-item">
              <span class="trial-phase badge amber">{node.phase || 'N/A'}</span>
              <span class="trial-title">{node.title?.slice(0, 80)}...</span>
            </div>
          {/each}
        {/if}
        {#if drugData.publications?.pageInfo?.totalCount}
          <div class="data-row" style="margin-top: 8px;">
            <span class="key">Publications</span>
            <span class="val badge accent">{drugData.publications.pageInfo.totalCount}</span>
          </div>
        {/if}
      {:else if !drugLoading}
        <p class="hint-text">Enter a brand name and blur the field to look up drug data.</p>
      {/if}
    </DataCard>

    <DataCard title="Example Brand">
      <div class="data-row"><span class="key">Brand</span><span class="val">VIRILEX</span></div>
      <div class="data-row"><span class="key">Company</span><span class="val">TTK Healthcare</span></div>
      <div class="data-row"><span class="key">Market</span><span class="val">Sex Tonics &amp; Stimulants</span></div>
      <div class="data-row"><span class="key">Class</span><span class="val">Herbal Tonic</span></div>
    </DataCard>
  </div>

  <!-- Input Panel -->
  <div class="input-panel scrollable">
    <div class="section-title">Company & Brand</div>

    <div class="field-row">
      <div class="field">
        <label>Company Name</label>
        <input type="text" value={s.companyName} oninput={e => update('companyName', e.target.value)} placeholder="e.g. TTK Healthcare" />
      </div>
      <div class="field">
        <label>Brand Name</label>
        <input type="text" value={s.brandName} oninput={e => update('brandName', e.target.value)} onblur={handleBrandBlur} placeholder="e.g. VIRILEX" />
      </div>
    </div>

    <div class="field">
      <label>Innovator or Generic</label>
      <div class="radio-group">
        {#each ['Innovator', 'Generic'] as opt}
          <label class="radio-option" class:selected={s.innovatorGeneric === opt}>
            <input type="radio" name="innovatorGeneric" value={opt} checked={s.innovatorGeneric === opt} onchange={() => radioUpdate('innovatorGeneric', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="section-title">Drug Profile</div>

    <div class="field-row">
      <div class="field">
        <label>Drug Class</label>
        <input type="text" value={s.drugClass} oninput={e => update('drugClass', e.target.value)} placeholder="e.g. Herbal Tonic" />
      </div>
      <div class="field">
        <label>Key Ingredient Name</label>
        <input type="text" value={s.keyIngredientName} oninput={e => update('keyIngredientName', e.target.value)} placeholder="e.g. Ashwagandha" />
      </div>
    </div>

    <div class="field">
      <label>Ingredients (all)</label>
      <textarea value={s.ingredients} oninput={e => update('ingredients', e.target.value)} placeholder="List all ingredients..." rows="3"></textarea>
    </div>

    <div class="field">
      <label>Mechanism of Action (Key Ingredient)</label>
      <textarea value={s.keyIngredientMoa} oninput={e => update('keyIngredientMoa', e.target.value)} placeholder="Describe how the key ingredient works..." rows="3"></textarea>
    </div>

    <div class="field">
      <label>Uses / Indications</label>
      <textarea value={s.uses} oninput={e => update('uses', e.target.value)} placeholder="Approved and off-label uses..." rows="3"></textarea>
    </div>

    <div class="section-title">Dosage</div>

    <div class="field-row">
      <div class="field">
        <label>Per Day (doses)</label>
        <input type="number" value={s.dosagePerDay} oninput={e => update('dosagePerDay', e.target.value)} placeholder="2" min="0" />
      </div>
      <div class="field">
        <label>Duration (Months)</label>
        <input type="number" value={s.durationMonths} oninput={e => update('durationMonths', e.target.value)} placeholder="3" min="0" />
      </div>
      <div class="field">
        <label>Duration (Years)</label>
        <input type="number" value={s.durationYears} oninput={e => update('durationYears', e.target.value)} placeholder="1" min="0" />
      </div>
    </div>

    <div class="section-title">MRP / Pack Details</div>

    <div class="field-row">
      <div class="field">
        <label>Pack Type</label>
        <input type="text" value={s.mrpPackType} oninput={e => update('mrpPackType', e.target.value)} placeholder="Bottle" />
      </div>
      <div class="field">
        <label>Pack Size</label>
        <input type="number" value={s.mrpPackSize} oninput={e => update('mrpPackSize', e.target.value)} placeholder="200" min="0" />
      </div>
      <div class="field">
        <label>MRP (Rs.)</label>
        <input type="number" value={s.mrpValue} oninput={e => update('mrpValue', e.target.value)} placeholder="350" min="0" />
      </div>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Pack Type (Other)</label>
        <input type="text" value={s.mrpPackType2} oninput={e => update('mrpPackType2', e.target.value)} placeholder="Sachet" />
      </div>
      <div class="field">
        <label>Pack Size (Other)</label>
        <input type="number" value={s.mrpPackSize2} oninput={e => update('mrpPackSize2', e.target.value)} placeholder="10" min="0" />
      </div>
      <div class="field">
        <label>MRP (Other, Rs.)</label>
        <input type="number" value={s.mrpValue2} oninput={e => update('mrpValue2', e.target.value)} placeholder="120" min="0" />
      </div>
    </div>

    <div class="section-title">Sales</div>

    <div class="field">
      <label>Last Year Sales</label>
      <input type="text" value={s.lastYearSales} oninput={e => update('lastYearSales', e.target.value)} placeholder="e.g. Rs. 12.4 Cr" />
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 2 →</button>
  </div>
</div>

<style>
  .step-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

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

  .hint-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .error-msg {
    font-size: var(--text-sm);
    color: var(--red);
  }

  .trial-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--divider);
  }

  .trial-item:last-child { border-bottom: none; }

  .trial-phase {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .trial-title {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.5;
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
