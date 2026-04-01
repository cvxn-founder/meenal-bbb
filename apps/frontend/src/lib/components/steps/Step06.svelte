<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step6);
  let s4 = $derived(wizardState.steps.step4);
  let aiLoading = $state(false);

  const leverageStages = [
    { key: 'origination',    label: 'Origination',      zone: 'Market Expansion',   zoneColor: 'accent' },
    { key: 'diagnosis',      label: 'Diagnosis',         zone: 'Market Expansion',   zoneColor: 'accent' },
    { key: 'treatmentChoice',label: 'Treatment Choice',  zone: 'Market Expansion',   zoneColor: 'accent' },
    { key: 'classChoice',    label: 'Class Choice',      zone: 'Share Penetration',  zoneColor: 'pink' },
    { key: 'brandChoice',    label: 'Brand Choice',      zone: 'Share Penetration',  zoneColor: 'pink' },
    { key: 'fulfilment',     label: 'Fulfilment',        zone: 'Share Expansion',    zoneColor: 'green' },
    { key: 'adherence',      label: 'Adherence',         zone: 'Share Expansion',    zoneColor: 'green' }
  ];

  // Auto-recommendations based on funnel data
  let brandChoicePct = $derived(() => {
    const treated = parseFloat(s4.patientsTreated) || 0;
    const targeted = parseFloat(s4.patientsTargeted) || 0;
    if (treated === 0) return null;
    return (targeted / treated) * 100;
  });

  let recommendations = $derived(() => {
    const recs = [];
    const bc = brandChoicePct();
    if (bc !== null) {
      if (bc < 45) recs.push({ stage: 'brandChoice', reason: `Brand choice rate is ${bc.toFixed(1)}% (below 45%) — focus on brand differentiation` });
      if (bc >= 50) recs.push({ stage: 'classChoice', reason: `Brand choice rate is ${bc.toFixed(1)}% (above 50%) — drive class switching` });
    }
    // Always add adherence if not already 3 recs
    if (recs.length < 3) recs.push({ stage: 'adherence', reason: 'Adherence improvement yields compounding growth' });
    return recs.slice(0, 3);
  });

  function toggleLeverage(key) {
    wizardState.steps.step6.leveragePoints[key].selected = !wizardState.steps.step6.leveragePoints[key].selected;
    saveState();
  }

  function updateLeakage(key, value) {
    wizardState.steps.step6.leveragePoints[key].leakage = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(6, 'Leverage Point', wizardState.steps, { recommendations: recommendations() });
      wizardState.steps.step6.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step6.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }

  let selectedCount = $derived(Object.values(s.leveragePoints).filter(lp => lp.selected).length);
</script>

<StepHeader stepNum={6} title="Leverage Point" subtitle="Identify where to focus to maximize brand impact" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Auto-Recommendations">
      {#each recommendations() as rec}
        <div class="rec-item">
          <span class="rec-stage badge accent">{leverageStages.find(l => l.key === rec.stage)?.label}</span>
          <p class="rec-reason">{rec.reason}</p>
        </div>
      {/each}
    </DataCard>

    <DataCard title="Selected Leverage Points">
      {#if selectedCount === 0}
        <p class="hint-text">Toggle stages on the right to select leverage points.</p>
      {:else}
        {#each leverageStages as stage}
          {#if s.leveragePoints[stage.key]?.selected}
            <div class="sel-item">
              <span class="badge {stage.zoneColor}">{stage.label}</span>
              <span class="sel-zone">{stage.zone}</span>
            </div>
          {/if}
        {/each}
        <div class="count-note">{selectedCount}/3 max recommended</div>
      {/if}
    </DataCard>

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Identify Leverage Points"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Leverage Point Matrix</div>

    <div class="matrix-grid">
      {#each ['Market Expansion', 'Share Penetration', 'Share Expansion'] as zone}
        <div class="zone-block">
          <div class="zone-header zone-{zone.toLowerCase().replace(/ /g,'-')}">
            {zone}
          </div>
          <div class="zone-stages">
            {#each leverageStages.filter(l => l.zone === zone) as stage}
              {@const lp = s.leveragePoints[stage.key]}
              <div class="stage-row" class:stage-selected={lp?.selected}>
                <div class="stage-toggle-wrap">
                  <button
                    class="toggle-btn"
                    class:on={lp?.selected}
                    onclick={() => toggleLeverage(stage.key)}
                  >
                    {lp?.selected ? 'YES' : 'NO'}
                  </button>
                  <span class="stage-name">{stage.label}</span>
                </div>
                <div class="leakage-input">
                  <label>Leakage %</label>
                  <input
                    type="number"
                    value={lp?.leakage || ''}
                    oninput={e => updateLeakage(stage.key, e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    style="width: 80px;"
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="note-box">
      <p>Select up to 3 leverage points. Focus on stages with the highest leakage or where your brand has a unique capability to intervene.</p>
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 7 →</button>
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

  .hint-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .rec-item {
    padding: 8px 0;
    border-bottom: 1px solid var(--divider);
  }

  .rec-item:last-child { border-bottom: none; }

  .rec-stage {
    margin-bottom: 4px;
    display: inline-block;
  }

  .rec-reason {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.5;
    margin-top: 4px;
  }

  .sel-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid var(--divider);
  }

  .sel-item:last-of-type { border-bottom: none; }

  .sel-zone {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .count-note {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: 8px;
    text-align: right;
  }

  .matrix-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .zone-block {
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    overflow: hidden;
  }

  .zone-header {
    padding: 8px 14px;
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .zone-market-expansion { background: rgba(158,203,255,0.1); color: var(--accent); }
  .zone-share-penetration { background: rgba(244,114,182,0.1); color: var(--pink); }
  .zone-share-expansion { background: rgba(52,211,153,0.1); color: var(--green); }

  .zone-stages {
    background: var(--surface);
  }

  .stage-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--divider);
    transition: background 0.15s;
  }

  .stage-row:last-child { border-bottom: none; }

  .stage-row.stage-selected {
    background: rgba(158,203,255,0.05);
  }

  .stage-toggle-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toggle-btn {
    padding: 4px 12px;
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: 4px;
    border: 1px solid var(--panel-border);
    background: var(--surface);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    min-width: 44px;
  }

  .toggle-btn.on {
    background: rgba(52,211,153,0.15);
    border-color: var(--green);
    color: var(--green);
  }

  .stage-name {
    font-size: var(--text-sm);
    color: var(--text);
  }

  .leakage-input {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .leakage-input input {
    padding: 4px 8px;
    font-size: var(--text-sm);
  }

  .note-box {
    background: var(--accent-muted);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius-control);
    padding: 12px 16px;
    margin: 12px 0;
  }

  .note-box p {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .next-btn {
    margin-top: 12px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
