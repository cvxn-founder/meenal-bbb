<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step5);
  let aiLoading = $state(false);

  const stages = [
    { key: 'origination', label: 'Origination', desc: 'Disease burden & patients — how patients become aware of their condition' },
    { key: 'diagnosis', label: 'Diagnosis', desc: 'How diagnosed, diagnostic criteria, tests required' },
    { key: 'treatmentChoices', label: 'Treatment & Class Choices', desc: 'What treatment options are considered, first/second line decisions' },
    { key: 'brandChoice', label: 'Brand Choice', desc: 'How the specific brand is selected by HCP or patient' },
    { key: 'accessFulfilment', label: 'Access / Fulfilment', desc: 'Pharmacy access, formulary status, insurance coverage' },
    { key: 'adherence', label: 'Adherence', desc: 'Compliance and persistence factors, reasons for discontinuation' }
  ];

  function update(field, value) {
    wizardState.steps.step5[field] = value;
    saveState();
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(5, 'Patient Journey Mapping', wizardState.steps, {});
      wizardState.steps.step5.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step5.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={5} title="Patient Journey Mapping" subtitle="Trace the patient's path from disease awareness to treatment adherence" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Journey Framework">
      <div class="journey-framework">
        <div class="jf-section">
          <span class="jf-label expand">Market Expansion</span>
          <div class="jf-stages">
            <span class="jf-stage">Origination</span>
            <span class="jf-stage">Diagnosis</span>
            <span class="jf-stage">Treatment Choice</span>
          </div>
        </div>
        <div class="jf-section">
          <span class="jf-label penetrate">Share Penetration</span>
          <div class="jf-stages">
            <span class="jf-stage">Class Choice</span>
            <span class="jf-stage">Brand Choice</span>
          </div>
        </div>
        <div class="jf-section">
          <span class="jf-label expand2">Share Expansion</span>
          <div class="jf-stages">
            <span class="jf-stage">Fulfilment</span>
            <span class="jf-stage">Adherence</span>
          </div>
        </div>
      </div>
    </DataCard>

    <DataCard title="AI Journey Narrative">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Map Journey"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">Journey Stage Descriptions</div>

    {#each stages as stage, i}
      <div class="stage-block">
        <div class="stage-header">
          <span class="stage-num">{i + 1}</span>
          <div class="stage-info">
            <span class="stage-name">{stage.label}</span>
            <span class="stage-desc">{stage.desc}</span>
          </div>
        </div>
        <textarea
          value={s[stage.key]}
          oninput={e => update(stage.key, e.target.value)}
          placeholder={`Describe the ${stage.label.toLowerCase()} stage for your brand/market...`}
          rows="3"
        ></textarea>
      </div>
    {/each}

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 6 →</button>
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

  .journey-framework {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .jf-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .jf-label {
    font-size: var(--text-xs);
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .jf-label.expand { background: rgba(158,203,255,0.15); color: var(--accent); }
  .jf-label.penetrate { background: rgba(244,114,182,0.15); color: var(--pink); }
  .jf-label.expand2 { background: rgba(52,211,153,0.15); color: var(--green); }

  .jf-stages {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-left: 8px;
  }

  .jf-stage {
    font-size: var(--text-xs);
    color: var(--text-muted);
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .stage-block {
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    padding: 14px;
    margin-bottom: 12px;
  }

  .stage-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
  }

  .stage-num {
    width: 24px;
    height: 24px;
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
  }

  .stage-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stage-name {
    font-size: var(--text-md);
    font-weight: 500;
    color: var(--text);
  }

  .stage-desc {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.4;
  }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
