<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { searchPublications } from '$lib/backend.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step9);
  let s1 = $derived(wizardState.steps.step1);

  let publications = $state([]);
  let pubsLoading = $state(false);
  let aiLoading = $state(false);

  onMount(async () => {
    if (s1.keyIngredientName) {
      await loadPublications();
    }
  });

  async function loadPublications() {
    if (!s1.keyIngredientName) return;
    pubsLoading = true;
    try {
      publications = await searchPublications(s1.keyIngredientName);
    } catch (e) {
      console.warn(e);
    } finally {
      pubsLoading = false;
    }
  }

  function update(field, value) {
    wizardState.steps.step9[field] = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(9, 'Brand Wheel', wizardState.steps, { publications: publications.slice(0, 5) });
      wizardState.steps.step9.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step9.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={9} title="Brand Wheel" subtitle="Define your brand's features, claims, and core essence" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Publications / Trials" loading={pubsLoading}>
      {#if publications.length > 0}
        {#each publications.slice(0, 6) as pub}
          <div class="pub-item">
            {#if pub.pmid}
              <span class="badge accent" style="margin-bottom: 4px; display: inline-block;">PMID {pub.pmid}</span>
            {/if}
            <p class="pub-title">{pub.title?.slice(0, 100)}...</p>
          </div>
        {/each}
      {:else}
        <p class="hint-text">Publications for "{s1.keyIngredientName || 'key ingredient'}" will appear here.</p>
        {#if s1.keyIngredientName}
          <button onclick={loadPublications} style="margin-top: 8px; font-size: var(--text-xs);">Load Publications</button>
        {/if}
      {/if}
    </DataCard>

    <DataCard title="Brand Wheel Preview">
      <div class="wheel-preview">
        <div class="wheel-center">
          <span class="wheel-center-label">{s.brandEssence || 'Brand Essence'}</span>
        </div>
        <div class="wheel-ring">
          <div class="wheel-segment smp">
            <span class="ws-label">SMP</span>
            <span class="ws-val">{s.smp?.slice(0, 40) || '—'}</span>
          </div>
          <div class="wheel-segment feat">
            <span class="ws-label">Features</span>
            <span class="ws-val">{[s.feature1, s.feature2, s.feature3].filter(Boolean).length} defined</span>
          </div>
          <div class="wheel-segment evid">
            <span class="ws-label">Evidence</span>
            <span class="ws-val">{s.supportingEvidence ? 'Added' : 'None'}</span>
          </div>
        </div>
      </div>
    </DataCard>

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Build Brand Wheel"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Features &amp; Attributes</div>

    <div class="field-row">
      <div class="field">
        <label>Product Design 1</label>
        <input type="text" value={s.feature1} oninput={e => update('feature1', e.target.value)} placeholder="e.g. Proprietary blend formulation" />
      </div>
      <div class="field">
        <label>Product Design 2</label>
        <input type="text" value={s.feature2} oninput={e => update('feature2', e.target.value)} placeholder="e.g. Standardized extract 5%" />
      </div>
      <div class="field">
        <label>Product Design 3</label>
        <input type="text" value={s.feature3} oninput={e => update('feature3', e.target.value)} placeholder="e.g. No synthetic additives" />
      </div>
    </div>

    <div class="section-title">Clinical Data &amp; Endorsements</div>

    <div class="field-row">
      <div class="field">
        <label>Clinical Data Point 1</label>
        <input type="text" value={s.clinicalData1} oninput={e => update('clinicalData1', e.target.value)} placeholder="e.g. 78% improvement in IIEF score" />
      </div>
      <div class="field">
        <label>Clinical Data Point 2</label>
        <input type="text" value={s.clinicalData2} oninput={e => update('clinicalData2', e.target.value)} placeholder="e.g. 3-month RCT, n=120" />
      </div>
      <div class="field">
        <label>Clinical Data Point 3</label>
        <input type="text" value={s.clinicalData3} oninput={e => update('clinicalData3', e.target.value)} placeholder="e.g. Published in JAMA" />
      </div>
    </div>

    <div class="field-row">
      <div class="field">
        <label>Endorsement 1</label>
        <input type="text" value={s.endorsement1} oninput={e => update('endorsement1', e.target.value)} placeholder="e.g. Indian Urology Society" />
      </div>
      <div class="field">
        <label>Endorsement 2</label>
        <input type="text" value={s.endorsement2} oninput={e => update('endorsement2', e.target.value)} placeholder="e.g. Ayush Ministry Certified" />
      </div>
      <div class="field">
        <label>Endorsement 3</label>
        <input type="text" value={s.endorsement3} oninput={e => update('endorsement3', e.target.value)} placeholder="e.g. ISO 9001 Certified" />
      </div>
    </div>

    <div class="section-title">Supporting Evidence</div>

    <div class="field">
      <label>Supporting Evidence (publications, case studies, real-world data)</label>
      <textarea value={s.supportingEvidence} oninput={e => update('supportingEvidence', e.target.value)} placeholder="Summarize key evidence supporting the brand's claims..." rows="4"></textarea>
    </div>

    <div class="section-title">Brand Core</div>

    <div class="field">
      <label>Single Minded Proposition (SMP)</label>
      <input type="text" value={s.smp} oninput={e => update('smp', e.target.value)} placeholder="The one core claim your brand owns — e.g. 'Clinically proven vitality restoration'" />
    </div>

    <div class="field">
      <label>Brand Essence</label>
      <input type="text" value={s.brandEssence} oninput={e => update('brandEssence', e.target.value)} placeholder="The soul of your brand in 2-5 words — e.g. 'Empowering masculine confidence'" />
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 10 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .data-panel {
    width: 340px;
    min-width: 340px;
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

  .pub-item {
    padding: 8px 0;
    border-bottom: 1px solid var(--divider);
  }

  .pub-item:last-child { border-bottom: none; }

  .pub-title {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.5;
  }

  .wheel-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }

  .wheel-center {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--accent-muted);
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    text-align: center;
  }

  .wheel-center-label {
    font-size: 0.6rem;
    font-weight: 500;
    color: var(--accent);
    line-height: 1.4;
  }

  .wheel-ring {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .wheel-segment {
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 80px;
    text-align: center;
  }

  .wheel-segment.smp { background: rgba(244,114,182,0.1); border: 1px solid rgba(244,114,182,0.3); }
  .wheel-segment.feat { background: var(--accent-muted); border: 1px solid var(--panel-border); }
  .wheel-segment.evid { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); }

  .ws-label {
    font-size: 0.5rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ws-val {
    font-size: var(--text-xs);
    color: var(--text);
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
