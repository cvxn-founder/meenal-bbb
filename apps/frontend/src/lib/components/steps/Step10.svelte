<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step10);
  let s7 = $derived(wizardState.steps.step7);
  let aiLoading = $state(false);

  onMount(() => {
    // Pre-populate from Step 7 stakeholders if segments is empty
    if (s.segments.length === 0 && s7.stakeholders.length > 0) {
      const hcpStakeholders = s7.stakeholders.filter(sh =>
        sh.type.toLowerCase().includes('hcp') ||
        sh.type.toLowerCase().includes('physician') ||
        sh.type.toLowerCase().includes('professional') ||
        sh.type.toLowerCase().includes('doctor') ||
        sh.type.toLowerCase().includes('specialist')
      );

      const defaultSegments = [
        { hcpType: 'KOL / Specialist', universe: '', coverage: '', mmm: '', tier1: 25, tier2: 35, tier3: 25, tier4: 15 },
        { hcpType: 'Tier 1 HCP', universe: '', coverage: '', mmm: '', tier1: 15, tier2: 40, tier3: 30, tier4: 15 },
        { hcpType: 'Tier 2 HCP', universe: '', coverage: '', mmm: '', tier1: 10, tier2: 30, tier3: 40, tier4: 20 },
        { hcpType: 'GP / CP', universe: '', coverage: '', mmm: '', tier1: 5, tier2: 20, tier3: 35, tier4: 40 }
      ];

      wizardState.steps.step10.segments = defaultSegments;
      saveState();
    }
  });

  function addSegment() {
    wizardState.steps.step10.segments = [
      ...wizardState.steps.step10.segments,
      { hcpType: '', universe: '', coverage: '', mmm: '', tier1: 0, tier2: 0, tier3: 0, tier4: 0 }
    ];
    saveState();
  }

  function removeSegment(i) {
    wizardState.steps.step10.segments = wizardState.steps.step10.segments.filter((_, idx) => idx !== i);
    saveState();
  }

  function updateSeg(i, field, value) {
    wizardState.steps.step10.segments[i][field] = value;
    saveState();
  }

  let totalUniv = $derived(s.segments.reduce((sum, seg) => sum + (parseInt(seg.universe) || 0), 0));
  let totalMMM = $derived(s.segments.reduce((sum, seg) => sum + (parseInt(seg.mmm) || 0), 0));

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(10, 'Segmentation', wizardState.steps, { totalUniverse: totalUniv, totalMMM });
      wizardState.steps.step10.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step10.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={10} title="Segmentation" subtitle="Define HCP tiers and coverage targets" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Segmentation Summary">
      <div class="data-row"><span class="key">Total Universe</span><span class="val">{totalUniv > 0 ? totalUniv.toLocaleString() : '—'}</span></div>
      <div class="data-row"><span class="key">Total MMM Target</span><span class="val badge accent">{totalMMM > 0 ? totalMMM.toLocaleString() : '—'}</span></div>
      {#if totalUniv > 0 && totalMMM > 0}
        <div class="data-row">
          <span class="key">MMM Coverage</span>
          <span class="val badge {(totalMMM/totalUniv*100) > 30 ? 'green' : 'amber'}">{(totalMMM/totalUniv*100).toFixed(1)}%</span>
        </div>
      {/if}
    </DataCard>

    <DataCard title="Tier Definitions">
      <div class="tier-def">
        <div class="tier-item"><span class="badge accent">Tier 1</span><span class="tier-desc">High frequency, high prescribers (MMM priority)</span></div>
        <div class="tier-item"><span class="badge accent">Tier 2</span><span class="tier-desc">Medium frequency, growth potential</span></div>
        <div class="tier-item"><span class="badge accent">Tier 3</span><span class="tier-desc">Low frequency, awareness building</span></div>
        <div class="tier-item"><span class="badge amber">Tier 4+</span><span class="tier-desc">Digital / non-personal promotion only</span></div>
      </div>
    </DataCard>

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Optimize Segmentation"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">HCP Segmentation Table</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>HCP Type</th>
            <th>Universe</th>
            <th>Coverage</th>
            <th>MMM#</th>
            <th>Tier 1%</th>
            <th>Tier 2%</th>
            <th>Tier 3%</th>
            <th>Tier 4+%</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each s.segments as seg, i}
            {@const tierSum = (parseFloat(seg.tier1)||0) + (parseFloat(seg.tier2)||0) + (parseFloat(seg.tier3)||0) + (parseFloat(seg.tier4)||0)}
            <tr class:tier-warn={tierSum > 0 && Math.round(tierSum) !== 100}>
              <td><input type="text" value={seg.hcpType} oninput={e => updateSeg(i,'hcpType',e.target.value)} placeholder="HCP type" /></td>
              <td><input type="number" value={seg.universe} oninput={e => updateSeg(i,'universe',e.target.value)} placeholder="0" min="0" /></td>
              <td><input type="text" value={seg.coverage} oninput={e => updateSeg(i,'coverage',e.target.value)} placeholder="e.g. 60%" /></td>
              <td><input type="number" value={seg.mmm} oninput={e => updateSeg(i,'mmm',e.target.value)} placeholder="0" min="0" /></td>
              <td><input type="number" value={seg.tier1} oninput={e => updateSeg(i,'tier1',e.target.value)} placeholder="0" min="0" max="100" /></td>
              <td><input type="number" value={seg.tier2} oninput={e => updateSeg(i,'tier2',e.target.value)} placeholder="0" min="0" max="100" /></td>
              <td><input type="number" value={seg.tier3} oninput={e => updateSeg(i,'tier3',e.target.value)} placeholder="0" min="0" max="100" /></td>
              <td><input type="number" value={seg.tier4} oninput={e => updateSeg(i,'tier4',e.target.value)} placeholder="0" min="0" max="100" /></td>
              <td>
                <button class="del-btn" onclick={() => removeSegment(i)} title="Remove">&#215;</button>
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr>
            <td style="color:var(--text-muted); font-size:var(--text-xs);">Total</td>
            <td style="font-weight:500; font-size:var(--text-sm);">{totalUniv.toLocaleString()}</td>
            <td></td>
            <td style="font-weight:500; font-size:var(--text-sm); color:var(--accent);">{totalMMM.toLocaleString()}</td>
            <td colspan="5"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <button onclick={addSegment} style="margin-top: 10px; font-size: var(--text-sm);">+ Add Segment</button>

    <div class="note-box" style="margin-top:16px;">
      <p>Tier percentages for each HCP type should sum to 100%. MMM (Monthly Medical Representatives Meeting) count determines your field force coverage.</p>
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 11 →</button>
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

  .tier-def {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tier-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .tier-desc {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.4;
    flex: 1;
  }

  table td input {
    border: none;
    background: transparent;
    padding: 4px 4px;
    font-size: var(--text-xs);
    width: 100%;
    min-width: 50px;
  }

  table td input:focus {
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: 4px;
  }

  .tier-warn td {
    background: rgba(245,158,11,0.05);
  }

  tfoot td {
    padding: 8px 10px;
    border-top: 2px solid var(--panel-border);
    background: var(--surface);
  }

  .del-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    padding: 4px;
    line-height: 1;
    border-radius: 4px;
  }

  .del-btn:hover { color: var(--red); background: rgba(248,113,113,0.1); }

  .note-box {
    background: var(--accent-muted);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius-control);
    padding: 12px 16px;
  }

  .note-box p {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .next-btn {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
