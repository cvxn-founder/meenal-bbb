<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import { wizardState, saveState, advanceStep } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step11);
  let aiLoading = $state(false);

  function updateList(quad, i, value) {
    wizardState.steps.step11[quad][i] = value;
    saveState();
  }

  function addItem(quad) {
    wizardState.steps.step11[quad] = [...wizardState.steps.step11[quad], ''];
    saveState();
  }

  function removeItem(quad, i) {
    wizardState.steps.step11[quad] = wizardState.steps.step11[quad].filter((_, idx) => idx !== i);
    saveState();
  }

  const quadrants = [
    { key: 'strengths', label: 'Strengths', color: 'green', desc: 'Internal advantages of your brand' },
    { key: 'weaknesses', label: 'Weaknesses', color: 'red', desc: 'Internal limitations to address' },
    { key: 'opportunities', label: 'Opportunities', color: 'accent', desc: 'External factors you can capitalize on' },
    { key: 'threats', label: 'Threats', color: 'amber', desc: 'External risks to manage' }
  ];

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(11, 'SWOT Analysis', wizardState.steps, {
        allStepsContext: {
          product: wizardState.steps.step1,
          environment: wizardState.steps.step2,
          market: wizardState.steps.step3,
          funnel: wizardState.steps.step4,
          leverage: wizardState.steps.step6,
          stakeholders: wizardState.steps.step7,
          brandWheel: wizardState.steps.step9
        }
      });
      const formatted = formatNarrative(narrative);
      wizardState.steps.step11.aiNarrative = formatted;

      // Parse AI output to populate quadrants if they're empty
      const parsed = parseSwotFromNarrative(narrative);
      if (parsed) {
        if (s.strengths.every(x => !x)) wizardState.steps.step11.strengths = parsed.strengths;
        if (s.weaknesses.every(x => !x)) wizardState.steps.step11.weaknesses = parsed.weaknesses;
        if (s.opportunities.every(x => !x)) wizardState.steps.step11.opportunities = parsed.opportunities;
        if (s.threats.every(x => !x)) wizardState.steps.step11.threats = parsed.threats;
      }
      saveState();
    } catch (e) {
      wizardState.steps.step11.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }

  function parseSwotFromNarrative(text) {
    // Simple extraction of bullet points under each section
    const sections = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    const lines = text.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('strength')) currentSection = 'strengths';
      else if (lower.includes('weakness')) currentSection = 'weaknesses';
      else if (lower.includes('opportunit')) currentSection = 'opportunities';
      else if (lower.includes('threat')) currentSection = 'threats';
      else if (currentSection && (line.trim().startsWith('-') || line.trim().startsWith('•'))) {
        const item = line.replace(/^[-•]\s*/, '').trim();
        if (item && sections[currentSection].length < 5) {
          sections[currentSection].push(item);
        }
      }
    }

    const hasData = Object.values(sections).some(arr => arr.length > 0);
    return hasData ? sections : null;
  }
</script>

<StepHeader stepNum={11} title="SWOT Analysis" subtitle="Comprehensive strategic assessment using all wizard data" />

<div class="step-body">
  <div class="swot-left scrollable">
    <div class="ai-section">
      <div class="ai-section-header">
        <span class="ai-label">AI SWOT Generator</span>
        <span class="ai-note">Uses all previous step data</span>
      </div>
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Generate SWOT"
      />
    </div>
  </div>

  <div class="swot-grid-wrap scrollable">
    <div class="swot-grid">
      {#each quadrants as quad}
        <div class="swot-quad quad-{quad.color}">
          <div class="quad-header">
            <span class="quad-title">{quad.label}</span>
            <span class="quad-desc">{quad.desc}</span>
          </div>
          <div class="quad-items">
            {#each s[quad.key] as item, i}
              <div class="quad-item-row">
                <span class="bullet"></span>
                <input
                  type="text"
                  value={item}
                  oninput={e => updateList(quad.key, i, e.target.value)}
                  placeholder="Add point..."
                  class="quad-input"
                />
                <button class="del-btn" onclick={() => removeItem(quad.key, i)} title="Remove">&#215;</button>
              </div>
            {/each}
            <button class="add-item-btn" onclick={() => addItem(quad.key)}>+ Add point</button>
          </div>
        </div>
      {/each}
    </div>

    <button class="primary next-btn" onclick={advanceStep}>Continue to Step 12 →</button>
  </div>
</div>

<style>
  .step-body { display: flex; flex: 1; overflow: hidden; }

  .swot-left {
    width: 300px;
    min-width: 300px;
    border-right: 1px solid var(--panel-border);
    padding: 20px 16px;
    background: var(--panel-bg);
    overflow-y: auto;
  }

  .swot-grid-wrap {
    flex: 1;
    padding: 20px 28px;
    overflow-y: auto;
  }

  .ai-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ai-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ai-note {
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-style: italic;
  }

  .swot-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }

  .swot-quad {
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    overflow: hidden;
  }

  .quad-header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .quad-title {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .quad-desc {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .quad-green .quad-header { background: rgba(52,211,153,0.1); }
  .quad-green .quad-title { color: var(--green); }
  .quad-red .quad-header { background: rgba(248,113,113,0.1); }
  .quad-red .quad-title { color: var(--red); }
  .quad-accent .quad-header { background: var(--accent-muted); }
  .quad-accent .quad-title { color: var(--accent); }
  .quad-amber .quad-header { background: rgba(245,158,11,0.1); }
  .quad-amber .quad-title { color: var(--amber); }

  .quad-items {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .quad-item-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .bullet {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--text-muted);
    flex-shrink: 0;
  }

  .quad-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 3px 6px;
    font-size: var(--text-sm);
  }

  .quad-input:focus {
    background: var(--panel-bg);
    border: 1px solid var(--accent);
    border-radius: 4px;
  }

  .del-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 2px 4px;
    line-height: 1;
    border-radius: 4px;
  }

  .del-btn:hover { color: var(--red); background: rgba(248,113,113,0.1); }

  .add-item-btn {
    background: transparent;
    border: 1px dashed var(--panel-border);
    color: var(--text-muted);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: var(--text-xs);
    cursor: pointer;
    text-align: left;
    margin-top: 2px;
  }

  .add-item-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-muted);
  }

  .next-btn {
    width: 100%;
    padding: 12px;
    font-size: var(--text-md);
  }
</style>
