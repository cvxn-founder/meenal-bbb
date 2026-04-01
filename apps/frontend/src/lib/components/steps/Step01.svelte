<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { findBrand, findCompanyBrands, lookupIngredient, searchTrials } from '$lib/backend.js';

  let s = $derived(wizardState.steps.step1);

  // Panel state
  let awacsBrand = $state(null);       // matched brand from bundled JSON
  let companyBrands = $state([]);      // all brands for this company
  let ingredientData = $state(null);   // GQL ingredient entity
  let ingredientTrials = $state([]);   // vector search trials
  let loading = $state({ brand: false, ingredient: false });

  // Auto-populate fields from AWACS match (only if field is empty)
  function autoFill(brand) {
    if (!brand) return;
    const s1 = wizardState.steps.step1;
    if (!s1.lastYearSales) {
      const v = brand.mat_val?.dec21;
      if (v) { s1.lastYearSales = `Rs. ${v} Cr (MAT Dec 2021)`; }
    }
    if (!s1.mrpPackType && brand.skus?.[0]) {
      // Parse SKU like "VIRILEX TABLET 20" → pack type "Tablet", size 20
      const sku = brand.skus[0];
      const m = sku.match(/(\w+)\s+(\d+)\s*(GM|ML|MG)?$/i);
      if (m) {
        s1.mrpPackType = s1.mrpPackType || m[1];
        s1.mrpPackSize = s1.mrpPackSize || parseInt(m[2]);
      }
    }
    saveState();
  }

  async function onBrandBlur() {
    const name = s.brandName?.trim();
    if (!name || name.length < 2) return;
    loading.brand = true;
    awacsBrand = null;
    try {
      awacsBrand = await findBrand(name);
      if (awacsBrand) autoFill(awacsBrand);
    } finally {
      loading.brand = false;
    }
  }

  async function onCompanyBlur() {
    const name = s.companyName?.trim();
    if (!name || name.length < 2) return;
    companyBrands = await findCompanyBrands(name);
  }

  async function onIngredientBlur() {
    const name = s.keyIngredientName?.trim();
    if (!name || name.length < 2) return;
    loading.ingredient = true;
    ingredientData = null;
    ingredientTrials = [];
    try {
      const [gql, trials] = await Promise.all([
        lookupIngredient(name),
        searchTrials(`${name} ${s.uses || ''}`.trim(), 6)
      ]);
      ingredientData = gql?.drugEntity || null;
      ingredientTrials = trials.filter(t => t.entityType === 'trial').slice(0, 5);
    } finally {
      loading.ingredient = false;
    }
  }

  function update(field, value) {
    wizardState.steps.step1[field] = value;
    saveState();
  }

  function radioUpdate(field, val) {
    wizardState.steps.step1[field] = val;
    saveState();
  }

  // On mount: if brand already set, re-run lookups
  onMount(async () => {
    if (s.brandName?.trim().length > 1) {
      awacsBrand = await findBrand(s.brandName);
      if (s.companyName?.trim().length > 1) companyBrands = await findCompanyBrands(s.companyName);
    }
    if (s.keyIngredientName?.trim().length > 1) {
      const [gql, trials] = await Promise.all([
        lookupIngredient(s.keyIngredientName),
        searchTrials(`${s.keyIngredientName} ${s.uses || ''}`.trim(), 6)
      ]);
      ingredientData = gql?.drugEntity || null;
      ingredientTrials = trials.filter(t => t.entityType === 'trial').slice(0, 5);
    }
  });
</script>

<StepHeader stepNum={1} title="Product Orientation" subtitle="Define your brand and product details" />

<div class="step-body">
  <!-- ── Data panel ── -->
  <div class="data-panel scrollable">

    <!-- AWACS brand match -->
    <DataCard title="AWACS Market Data" loading={loading.brand}>
      {#if awacsBrand}
        <div class="match-badge">Matched in market data</div>
        <div class="data-row"><span class="key">Brand</span><span class="val">{awacsBrand.brand}</span></div>
        <div class="data-row"><span class="key">Company</span><span class="val">{awacsBrand.company}</span></div>
        {#each awacsBrand.skus as sku}
          <div class="data-row"><span class="key">SKU</span><span class="val muted">{sku}</span></div>
        {/each}
        <div class="divider"></div>
        <div class="data-row">
          <span class="key">MAT Dec'21</span>
          <span class="val accent">Rs. {awacsBrand.mat_val?.dec21} Cr</span>
        </div>
        <div class="data-row">
          <span class="key">Market share</span>
          <span class="val">{awacsBrand.ms_dec21}%</span>
        </div>
        <div class="data-row">
          <span class="key">YoY growth</span>
          <span class="val {awacsBrand.cagr_20_21 >= 0 ? 'green' : 'red'}">
            {awacsBrand.cagr_20_21 >= 0 ? '+' : ''}{(awacsBrand.cagr_20_21 * 100).toFixed(1)}%
          </span>
        </div>
        <div class="sparkline">
          {#each ['dec17','dec18','dec19','dec20','dec21'] as yr}
            {@const maxV = Math.max(...['dec17','dec18','dec19','dec20','dec21'].map(y => awacsBrand.mat_val?.[y] || 0))}
            {@const h = maxV > 0 ? Math.round((awacsBrand.mat_val?.[yr] || 0) / maxV * 40) : 0}
            <div class="spark-bar" style="height:{h}px" title="{yr}: {awacsBrand.mat_val?.[yr]} Cr"></div>
          {/each}
        </div>
        <div class="spark-labels">
          <span>'17</span><span>'18</span><span>'19</span><span>'20</span><span>'21</span>
        </div>
      {:else if !loading.brand && s.brandName?.length > 1}
        <p class="hint-text">Brand not found in V3X2 dataset. You can still continue with manual entry.</p>
      {:else}
        <p class="hint-text">Enter brand name to match against AWACS market data.</p>
      {/if}
    </DataCard>

    <!-- Company portfolio -->
    {#if companyBrands.length > 0}
      <DataCard title="Company Portfolio">
        <p class="data-row" style="margin-bottom:6px">
          <span class="key">Brands in dataset</span>
          <span class="val badge accent">{companyBrands.length}</span>
        </p>
        {#each companyBrands.slice(0,5) as b}
          <div class="data-row small">
            <span class="key">{b.brand}</span>
            <span class="val muted">{b.mat_val?.dec21} Cr</span>
          </div>
        {/each}
        {#if companyBrands.length > 5}
          <p class="hint-text">+{companyBrands.length - 5} more</p>
        {/if}
      </DataCard>
    {/if}

    <!-- Ingredient clinical data -->
    <DataCard title="Ingredient Evidence" loading={loading.ingredient}>
      {#if ingredientTrials.length > 0}
        <div class="data-row">
          <span class="key">Clinical trials found</span>
          <span class="val badge accent">{ingredientTrials.length}</span>
        </div>
        {#each ingredientTrials as t}
          <div class="trial-item">
            <span class="badge {t.phases?.[0] === 'PHASE4' ? 'green' : t.phases?.[0] === 'PHASE3' ? 'accent' : 'amber'}">
              {t.phases?.[0]?.replace('PHASE','P') || 'N/A'}
            </span>
            <span class="trial-title">{t.snippet?.slice(0, 90)}...</span>
          </div>
        {/each}
        {#if ingredientData?.trials?.pageInfo?.totalCount > 0}
          <p class="hint-text" style="margin-top:6px">{ingredientData.trials.pageInfo.totalCount} total trials via GraphQL</p>
        {/if}
      {:else if !loading.ingredient && s.keyIngredientName?.length > 1}
        <p class="hint-text">No clinical trials found for this ingredient in the database.</p>
      {:else}
        <p class="hint-text">Enter the key ingredient to find clinical trial evidence.</p>
      {/if}
    </DataCard>

  </div>

  <!-- ── Input panel ── -->
  <div class="input-panel scrollable">

    <div class="section-title">Company & Brand</div>

    <div class="field-row">
      <div class="field">
        <label for="companyName">Company Name</label>
        <input id="companyName" type="text" value={s.companyName}
          oninput={e => update('companyName', e.target.value)}
          onblur={onCompanyBlur}
          placeholder="e.g. TTK Healthcare Ltd" />
      </div>
      <div class="field">
        <label for="brandName">Brand Name</label>
        <input id="brandName" type="text" value={s.brandName}
          oninput={e => update('brandName', e.target.value)}
          onblur={onBrandBlur}
          placeholder="e.g. VIRILEX" />
        {#if awacsBrand}
          <span class="field-hint green">Matched in AWACS data</span>
        {/if}
      </div>
    </div>

    <div class="field">
      <label>Innovator or Generic</label>
      <div class="radio-group">
        {#each ['Innovator', 'Generic'] as opt}
          <label class="radio-option" class:selected={s.innovatorGeneric === opt}>
            <input type="radio" name="innovatorGeneric" value={opt}
              checked={s.innovatorGeneric === opt}
              onchange={() => radioUpdate('innovatorGeneric', opt)} />
            {opt}
          </label>
        {/each}
      </div>
    </div>

    <div class="section-title">Drug Profile</div>

    <div class="field-row">
      <div class="field">
        <label for="drugClass">Drug Class</label>
        <input id="drugClass" type="text" value={s.drugClass}
          oninput={e => update('drugClass', e.target.value)}
          placeholder="e.g. Ayurvedic Herbal Tonic" />
      </div>
      <div class="field">
        <label for="keyIng">Key Ingredient</label>
        <input id="keyIng" type="text" value={s.keyIngredientName}
          oninput={e => update('keyIngredientName', e.target.value)}
          onblur={onIngredientBlur}
          placeholder="e.g. Ashwagandha" />
        <span class="field-hint">Blur to load clinical evidence</span>
      </div>
    </div>

    <div class="field">
      <label for="ingredients">All Ingredients</label>
      <textarea id="ingredients" value={s.ingredients}
        oninput={e => update('ingredients', e.target.value)}
        placeholder="List all active ingredients..." rows="3"></textarea>
    </div>

    <div class="field">
      <label for="moa">Mechanism of Action</label>
      <textarea id="moa" value={s.keyIngredientMoa}
        oninput={e => update('keyIngredientMoa', e.target.value)}
        placeholder="How does the key ingredient work..." rows="3"></textarea>
    </div>

    <div class="field">
      <label for="uses">Uses / Indications</label>
      <textarea id="uses" value={s.uses}
        oninput={e => update('uses', e.target.value)}
        placeholder="Approved and off-label uses..." rows="3"></textarea>
    </div>

    <div class="section-title">Dosage</div>

    <div class="field-row">
      <div class="field">
        <label for="dosDay">Per Day (doses)</label>
        <input id="dosDay" type="number" value={s.dosagePerDay}
          oninput={e => update('dosagePerDay', e.target.value)} placeholder="3" min="0" />
      </div>
      <div class="field">
        <label for="dosMo">Duration (Months)</label>
        <input id="dosMo" type="number" value={s.durationMonths}
          oninput={e => update('durationMonths', e.target.value)} placeholder="1.5" min="0" />
      </div>
      <div class="field">
        <label for="dosYr">Duration (Years)</label>
        <input id="dosYr" type="number" value={s.durationYears}
          oninput={e => update('durationYears', e.target.value)} placeholder="0" min="0" />
      </div>
    </div>

    <div class="section-title">MRP / Pack Details</div>

    <div class="field-row">
      <div class="field">
        <label for="packType">Pack Type</label>
        <input id="packType" type="text" value={s.mrpPackType}
          oninput={e => update('mrpPackType', e.target.value)} placeholder="Tablet" />
      </div>
      <div class="field">
        <label for="packSize">Pack Size</label>
        <input id="packSize" type="number" value={s.mrpPackSize}
          oninput={e => update('mrpPackSize', e.target.value)} placeholder="20" min="0" />
      </div>
      <div class="field">
        <label for="mrp1">MRP (Rs.)</label>
        <input id="mrp1" type="number" value={s.mrpValue}
          oninput={e => update('mrpValue', e.target.value)} placeholder="577" min="0" />
      </div>
    </div>

    <div class="field-row">
      <div class="field">
        <label for="packType2">Pack Type (2nd)</label>
        <input id="packType2" type="text" value={s.mrpPackType2}
          oninput={e => update('mrpPackType2', e.target.value)} placeholder="Tablet" />
      </div>
      <div class="field">
        <label for="packSize2">Pack Size (2nd)</label>
        <input id="packSize2" type="number" value={s.mrpPackSize2}
          oninput={e => update('mrpPackSize2', e.target.value)} placeholder="10" min="0" />
      </div>
      <div class="field">
        <label for="mrp2">MRP (Rs.)</label>
        <input id="mrp2" type="number" value={s.mrpValue2}
          oninput={e => update('mrpValue2', e.target.value)} placeholder="266" min="0" />
      </div>
    </div>

    <div class="section-title">Sales</div>

    <div class="field">
      <label for="sales">Last Year Sales</label>
      <input id="sales" type="text" value={s.lastYearSales}
        oninput={e => update('lastYearSales', e.target.value)}
        placeholder="e.g. Rs. 6.3 Cr (MAT Dec 2021)" />
      {#if awacsBrand && !s.lastYearSales}
        <button class="autofill-btn" onclick={() => {
          update('lastYearSales', `Rs. ${awacsBrand.mat_val?.dec21} Cr (MAT Dec 2021)`)
        }}>Auto-fill from AWACS</button>
      {/if}
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 2 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .data-panel {
    width: 340px; min-width: 340px;
    border-right: 1px solid var(--panel-border);
    padding: 20px 16px;
    background: var(--panel-bg);
    overflow-y: auto;
  }

  .input-panel { flex: 1; padding: 20px 28px; overflow-y: auto; }

  .match-badge {
    display: inline-block;
    font-size: var(--text-xs);
    background: rgba(52,211,153,0.15);
    color: var(--green);
    border: 1px solid rgba(52,211,153,0.3);
    border-radius: 4px;
    padding: 2px 8px;
    margin-bottom: 10px;
  }

  .divider { border-top: 1px solid var(--divider); margin: 8px 0; }

  /* Sparkline */
  .sparkline {
    display: flex; align-items: flex-end; gap: 4px;
    height: 44px; margin-top: 10px; padding: 0 2px;
  }
  .spark-bar {
    flex: 1; background: var(--accent-muted);
    border-top: 2px solid var(--accent);
    border-radius: 2px 2px 0 0;
    min-height: 3px;
    transition: background 0.15s;
  }
  .spark-bar:hover { background: rgba(158,203,255,0.3); }
  .spark-labels {
    display: flex; gap: 4px; padding: 0 2px;
    font-size: 0.55rem; color: var(--text-muted);
  }
  .spark-labels span { flex: 1; text-align: center; }

  .trial-item {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 0; border-bottom: 1px solid var(--divider);
  }
  .trial-item:last-child { border-bottom: none; }
  .trial-title { font-size: var(--text-xs); color: var(--text-muted); line-height: 1.5; }

  .hint-text { font-size: var(--text-sm); color: var(--text-muted); line-height: 1.6; }
  .data-row.small .key { font-size: var(--text-xs); }
  .data-row.small .val { font-size: var(--text-xs); }

  .field-hint {
    display: block; font-size: var(--text-xs);
    color: var(--text-muted); margin-top: 3px;
  }
  .field-hint.green { color: var(--green); }

  .autofill-btn {
    margin-top: 6px; padding: 4px 12px;
    font-size: var(--text-xs); font-family: inherit;
    background: var(--accent-muted); border: 1px solid var(--accent);
    color: var(--accent); border-radius: 6px; cursor: pointer;
  }
  .autofill-btn:hover { background: rgba(158,203,255,0.25); }

  .next-btn { margin-top: 24px; width: 100%; padding: 12px; font-size: var(--text-md); }
</style>
