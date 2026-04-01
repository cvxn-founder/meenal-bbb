<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step4);
  let aiLoading = $state(false);

  function update(field, value) {
    wizardState.steps.step4[field] = value;
    saveState();
  }

  let living = $derived(parseFloat(s.patientsLiving) || 0);
  let diagnosed = $derived(parseFloat(s.patientsDiagnosed) || 0);
  let treated = $derived(parseFloat(s.patientsTreated) || 0);
  let targeted = $derived(parseFloat(s.patientsTargeted) || 0);

  let diagnosedPct = $derived(living > 0 ? ((diagnosed / living) * 100).toFixed(1) : '—');
  let treatedPct = $derived(diagnosed > 0 ? ((treated / diagnosed) * 100).toFixed(1) : '—');
  let targetedPct = $derived(treated > 0 ? ((targeted / treated) * 100).toFixed(1) : '—');

  let bar1 = $derived(100);
  let bar2 = $derived(living > 0 ? Math.min((diagnosed / living) * 100, 100) : 0);
  let bar3 = $derived(living > 0 ? Math.min((treated / living) * 100, 100) : 0);
  let bar4 = $derived(living > 0 ? Math.min((targeted / living) * 100, 100) : 0);

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(4, 'Patient Funnel', wizardState.steps, {
        funnelMetrics: { living, diagnosed, treated, targeted, diagnosedPct, treatedPct, targetedPct }
      });
      wizardState.steps.step4.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step4.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={4} title="Patient Funnel" subtitle="Map patients from disease burden to target audience" />

<div class="step-body">
  <!-- Funnel Visual Panel -->
  <div class="data-panel scrollable">
    <div class="panel-title">Funnel Visualization</div>

    <div class="funnel-wrap">
      <div class="funnel-level" style="--w: {bar1}%">
        <div class="funnel-bar" style="width: var(--w)">
          <span class="funnel-label">Living with Disease</span>
        </div>
        <div class="funnel-meta">
          <span class="funnel-val">{living > 0 ? living.toFixed(2) + ' Mn' : '—'}</span>
          <span class="funnel-pct badge accent">100%</span>
        </div>
      </div>

      <div class="funnel-arrow">&#8595;</div>

      <div class="funnel-level" style="--w: {bar2}%">
        <div class="funnel-bar" style="width: var(--w); background: rgba(158,203,255,0.25)">
          <span class="funnel-label">Diagnosed</span>
        </div>
        <div class="funnel-meta">
          <span class="funnel-val">{diagnosed > 0 ? diagnosed.toFixed(2) + ' Mn' : '—'}</span>
          <span class="funnel-pct badge {parseFloat(diagnosedPct) >= 70 ? 'green' : parseFloat(diagnosedPct) >= 40 ? 'amber' : 'red'}">{diagnosedPct}%</span>
        </div>
      </div>

      <div class="funnel-arrow">&#8595;</div>

      <div class="funnel-level" style="--w: {bar3}%">
        <div class="funnel-bar" style="width: var(--w); background: rgba(158,203,255,0.18)">
          <span class="funnel-label">Treated</span>
        </div>
        <div class="funnel-meta">
          <span class="funnel-val">{treated > 0 ? treated.toFixed(2) + ' Mn' : '—'}</span>
          <span class="funnel-pct badge {parseFloat(treatedPct) >= 70 ? 'green' : parseFloat(treatedPct) >= 40 ? 'amber' : 'red'}">{treatedPct}%</span>
        </div>
      </div>

      <div class="funnel-arrow">&#8595;</div>

      <div class="funnel-level" style="--w: {bar4}%">
        <div class="funnel-bar" style="width: var(--w); background: rgba(52,211,153,0.2)">
          <span class="funnel-label">Target Patients</span>
        </div>
        <div class="funnel-meta">
          <span class="funnel-val">{targeted > 0 ? targeted.toFixed(2) + ' Mn' : '—'}</span>
          <span class="funnel-pct badge {parseFloat(targetedPct) >= 70 ? 'green' : parseFloat(targetedPct) >= 40 ? 'amber' : 'red'}">{targetedPct}%</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 16px;">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Analyze Funnel"
      />
    </div>
  </div>

  <!-- Input Panel -->
  <div class="input-panel scrollable">
    <div class="section-title">Patient Funnel Inputs</div>
    <p class="hint">Enter patient numbers in millions (Mn). Each level is a subset of the previous.</p>

    <div class="funnel-input-group">
      <div class="funnel-input-row">
        <div class="funnel-input-icon">1</div>
        <div class="field" style="flex:1; margin:0;">
          <label>No. of patients living with the disease (Mn)</label>
          <input type="number" value={s.patientsLiving} oninput={e => update('patientsLiving', e.target.value)} placeholder="e.g. 50" min="0" step="0.1" />
        </div>
      </div>

      <div class="funnel-connector"></div>

      <div class="funnel-input-row">
        <div class="funnel-input-icon">2</div>
        <div class="field" style="flex:1; margin:0;">
          <label>No. diagnosed (Mn) — diagnosis rate: {diagnosedPct}%</label>
          <input type="number" value={s.patientsDiagnosed} oninput={e => update('patientsDiagnosed', e.target.value)} placeholder="e.g. 20" min="0" step="0.1" />
        </div>
      </div>

      <div class="funnel-connector"></div>

      <div class="funnel-input-row">
        <div class="funnel-input-icon">3</div>
        <div class="field" style="flex:1; margin:0;">
          <label>No. treated (Mn) — treatment rate: {treatedPct}%</label>
          <input type="number" value={s.patientsTreated} oninput={e => update('patientsTreated', e.target.value)} placeholder="e.g. 10" min="0" step="0.1" />
        </div>
      </div>

      <div class="funnel-connector"></div>

      <div class="funnel-input-row">
        <div class="funnel-input-icon target">4</div>
        <div class="field" style="flex:1; margin:0;">
          <label>Target patients (Mn) — target rate: {targetedPct}%</label>
          <input type="number" value={s.patientsTargeted} oninput={e => update('patientsTargeted', e.target.value)} placeholder="e.g. 3" min="0" step="0.1" />
        </div>
      </div>
    </div>

    <div class="section-title" style="margin-top:24px;">Funnel Analysis Notes</div>
    <p class="hint" style="margin-bottom:12px;">Use the AI panel to analyze leakage between funnel stages and identify key intervention points.</p>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 5 →</button>
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

  .panel-title {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--divider);
  }

  .input-panel {
    flex: 1;
    padding: 20px 28px;
    overflow-y: auto;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .funnel-wrap {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .funnel-level {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .funnel-bar {
    height: 36px;
    background: var(--accent-muted);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    min-width: 30%;
    transition: width 0.4s ease;
  }

  .funnel-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text);
    white-space: nowrap;
  }

  .funnel-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px 6px;
  }

  .funnel-val {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text);
  }

  .funnel-pct {
    font-size: var(--text-xs);
  }

  .funnel-arrow {
    text-align: center;
    color: var(--text-muted);
    font-size: 1.1rem;
    line-height: 1.2;
    margin: 2px 0;
  }

  .funnel-input-group {
    display: flex;
    flex-direction: column;
  }

  .funnel-input-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px 0;
  }

  .funnel-input-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-muted);
    border: 1px solid var(--accent);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: 500;
    flex-shrink: 0;
    margin-top: 18px;
  }

  .funnel-input-icon.target {
    background: rgba(52,211,153,0.15);
    border-color: var(--green);
    color: var(--green);
  }

  .funnel-connector {
    width: 2px;
    height: 16px;
    background: var(--panel-border);
    margin-left: 13px;
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
