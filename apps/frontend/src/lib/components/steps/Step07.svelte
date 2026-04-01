<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step7);
  let aiLoading = $state(false);

  const DOCTOR_UNIVERSE = [
    { specialty: 'GP (General Practitioner)', count: 50000 },
    { specialty: 'CP (Consulting Physician)', count: 41000 },
    { specialty: 'Internal Medicine', count: 60000 },
    { specialty: 'Gynecologist', count: 37000 },
    { specialty: 'Pediatrician', count: 12000 },
    { specialty: 'Orthopaedist', count: 17000 },
    { specialty: 'Urologist', count: 5200 },
    { specialty: 'Dermatologist', count: 4500 },
    { specialty: 'Endocrinologist', count: 8500 },
    { specialty: 'Chest / Pulmonologist', count: 4000 + 6000 },
    { specialty: 'ENT', count: 6000 },
    { specialty: 'Rheumatologist', count: 1400 },
    { specialty: 'Oncologist', count: 1396 }
  ];

  function updateStakeholder(index, field, value) {
    wizardState.steps.step7.stakeholders[index][field] = field === 'influence' ? parseFloat(value) || 0 : value;
    saveState();
  }

  function addStakeholder() {
    wizardState.steps.step7.stakeholders = [...wizardState.steps.step7.stakeholders, { type: '', influence: 0, drivers: '', barriers: '' }];
    saveState();
  }

  function removeStakeholder(index) {
    wizardState.steps.step7.stakeholders = wizardState.steps.step7.stakeholders.filter((_, i) => i !== index);
    saveState();
  }

  let totalInfluence = $derived(s.stakeholders.reduce((sum, sh) => sum + (parseFloat(sh.influence) || 0), 0));

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(7, 'Key Stakeholder Habits', wizardState.steps, { doctorUniverse: DOCTOR_UNIVERSE });
      wizardState.steps.step7.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step7.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={7} title="Key Stakeholder Habits (KSH)" subtitle="Map who influences prescribing, purchasing and adherence decisions" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="India Doctor Universe">
      {#each DOCTOR_UNIVERSE as doc}
        <div class="data-row">
          <span class="key">{doc.specialty}</span>
          <span class="val">{doc.count.toLocaleString()}</span>
        </div>
      {/each}
    </DataCard>

    <DataCard title="AI Insights">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Analyze Stakeholders"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Stakeholder Influence Map</div>

    <div class="total-influence" class:over={Math.round(totalInfluence) > 100} class:ok={Math.round(totalInfluence) === 100}>
      Total Influence: <strong>{totalInfluence.toFixed(0)}%</strong>
      {#if Math.round(totalInfluence) !== 100}
        <span class="warn">(should sum to 100%)</span>
      {:else}
        <span class="ok-mark">&#10003;</span>
      {/if}
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:200px">Stakeholder Type</th>
            <th style="width:90px">Influence %</th>
            <th>Drivers</th>
            <th>Barriers</th>
            <th style="width:40px"></th>
          </tr>
        </thead>
        <tbody>
          {#each s.stakeholders as sh, i}
            <tr>
              <td>
                <input type="text" value={sh.type} oninput={e => updateStakeholder(i, 'type', e.target.value)} placeholder="Stakeholder type" />
              </td>
              <td>
                <input type="number" value={sh.influence} oninput={e => updateStakeholder(i, 'influence', e.target.value)} placeholder="0" min="0" max="100" />
              </td>
              <td>
                <input type="text" value={sh.drivers} oninput={e => updateStakeholder(i, 'drivers', e.target.value)} placeholder="Key drivers..." />
              </td>
              <td>
                <input type="text" value={sh.barriers} oninput={e => updateStakeholder(i, 'barriers', e.target.value)} placeholder="Key barriers..." />
              </td>
              <td>
                <button class="del-btn" onclick={() => removeStakeholder(i)} title="Remove">&#215;</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <button onclick={addStakeholder} style="margin-top: 10px; font-size: var(--text-sm);">+ Add Stakeholder</button>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 8 →</button>
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

  .total-influence {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: 14px;
    padding: 8px 12px;
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius-control);
  }

  .total-influence.ok {
    border-color: var(--green);
    background: rgba(52,211,153,0.05);
  }

  .total-influence.over {
    border-color: var(--red);
    background: rgba(248,113,113,0.05);
  }

  .total-influence strong {
    color: var(--text);
  }

  .warn { color: var(--amber); margin-left: 6px; }
  .ok-mark { color: var(--green); margin-left: 6px; }

  table td input {
    border: none;
    background: transparent;
    padding: 4px 6px;
    border-radius: 4px;
  }

  table td input:focus {
    background: var(--surface);
    border: 1px solid var(--accent);
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

  .del-btn:hover {
    color: var(--red);
    background: rgba(248,113,113,0.1);
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
