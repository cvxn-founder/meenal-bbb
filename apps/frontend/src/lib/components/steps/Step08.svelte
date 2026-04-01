<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step8);
  let aiLoading = $state(false);

  const segments = [
    'Early Adopters (KOLs)',
    'Heavy Prescribers (Tier 1)',
    'Medium Prescribers (Tier 2)',
    'Generalists / GPs',
    'Rural / Semi-Urban HCPs',
    'Online / Digital HCPs'
  ];

  const doctorTypes = ['KOL/Specialist', 'Tier 1 HCP', 'Tier 2 HCP', 'GP/CP', 'Rural HCP'];

  function updateCompetitor(i, field, value) {
    wizardState.steps.step8.competitors[i][field] = value;
    saveState();
  }

  function updateMatrix(value) {
    wizardState.steps.step8.categoryMatrix = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(8, 'Contested Categories', wizardState.steps, {});
      wizardState.steps.step8.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step8.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={8} title="Contested Categories" subtitle="Map competitive presence across segments and doctor types" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Competitive Coverage Map">
      <p class="hint-text">Fill in the competitor table to the right. The matrix shows where each brand is strong.</p>
      <div class="matrix-preview">
        <div class="matrix-head">
          <span></span>
          {#each doctorTypes as dt}
            <span class="dt-label">{dt}</span>
          {/each}
        </div>
        {#each segments as seg}
          <div class="matrix-row">
            <span class="seg-label">{seg}</span>
            {#each doctorTypes as dt}
              <span class="matrix-cell">
                {#if s.competitors.some(c => c.segment.toLowerCase().includes(seg.toLowerCase().split(' ')[0]))}
                  <span class="cell-dot filled"></span>
                {:else}
                  <span class="cell-dot empty"></span>
                {/if}
              </span>
            {/each}
          </div>
        {/each}
      </div>
    </DataCard>

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Map Competitive Landscape"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Top 5 Competitors</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Brand</th>
            <th>Company</th>
            <th>Segment Strength</th>
            <th>Coverage</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each s.competitors as comp, i}
            <tr>
              <td style="color:var(--text-muted); font-size: var(--text-xs);">{i+1}</td>
              <td><input type="text" value={comp.brand} oninput={e => updateCompetitor(i,'brand',e.target.value)} placeholder="Brand name" /></td>
              <td><input type="text" value={comp.company} oninput={e => updateCompetitor(i,'company',e.target.value)} placeholder="Company" /></td>
              <td><input type="text" value={comp.segment} oninput={e => updateCompetitor(i,'segment',e.target.value)} placeholder="e.g. Specialists" /></td>
              <td><input type="text" value={comp.coverage} oninput={e => updateCompetitor(i,'coverage',e.target.value)} placeholder="e.g. High" /></td>
              <td><input type="text" value={comp.notes} oninput={e => updateCompetitor(i,'notes',e.target.value)} placeholder="Strategic notes" /></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="section-title" style="margin-top: 20px;">Category Matrix Notes</div>
    <p class="hint" style="margin-bottom: 10px;">Describe competitive presence across doctor types and geographic segments. Identify white space opportunities.</p>

    <textarea
      value={s.categoryMatrix}
      oninput={e => updateMatrix(e.target.value)}
      placeholder="Describe the competitive matrix: which segments are contested, where is there white space, how is your brand positioned vs competitors..."
      rows="6"
    ></textarea>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 9 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .data-panel {
    width: 380px;
    min-width: 380px;
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

  .hint-text, .hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .matrix-preview {
    margin-top: 10px;
    overflow-x: auto;
  }

  .matrix-head {
    display: grid;
    grid-template-columns: 120px repeat(5, 1fr);
    gap: 2px;
    margin-bottom: 4px;
  }

  .dt-label {
    font-size: 0.5rem;
    font-weight: 500;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.3;
  }

  .matrix-row {
    display: grid;
    grid-template-columns: 120px repeat(5, 1fr);
    gap: 2px;
    margin-bottom: 3px;
    align-items: center;
  }

  .seg-label {
    font-size: 0.55rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .matrix-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cell-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .cell-dot.filled {
    background: var(--accent);
    opacity: 0.7;
  }

  .cell-dot.empty {
    background: var(--surface);
    border: 1px solid var(--panel-border);
  }

  table td input {
    border: none;
    background: transparent;
    padding: 4px 6px;
    font-size: var(--text-xs);
  }

  table td input:focus {
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: 4px;
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
