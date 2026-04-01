<script>
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, resetWizard } from '$lib/store.svelte.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step12);
  let s1 = $derived(wizardState.steps.step1);
  let aiLoading = $state(false);

  function updateData(value) {
    wizardState.steps.step12.awacsData = value;
    saveState();
  }

  let parsedLeaderboard = $derived(() => {
    if (!s.awacsData.trim()) return [];
    return s.awacsData.trim().split('\n')
      .map((line, i) => {
        const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
        return {
          rank: i + 1,
          brand: parts[0]?.trim() || '',
          company: parts[1]?.trim() || '',
          sku: parts[2]?.trim() || '',
          mat1: parts[3]?.trim() || '',
          mat2: parts[4]?.trim() || '',
          mat3: parts[5]?.trim() || '',
          mat4: parts[6]?.trim() || '',
          mat5: parts[7]?.trim() || '',
          cagr: parts[8]?.trim() || ''
        };
      })
      .filter(r => r.brand);
  });

  let maxVal = $derived(() => {
    const vals = parsedLeaderboard().map(r => parseFloat(r.mat5) || 0);
    return Math.max(...vals, 1);
  });

  function isOurBrand(brand) {
    return s1.brandName && brand.toLowerCase().includes(s1.brandName.toLowerCase());
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(12, 'Market Position Analysis', wizardState.steps, {
        leaderboard: parsedLeaderboard()
      });
      wizardState.steps.step12.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step12.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }

  const SAMPLE_DATA = `Brand A\tCompany X\t3\t45.2\t48.6\t52.1\t56.8\t61.3\t7.9%
Brand B\tCompany Y\t2\t38.1\t40.2\t43.8\t45.1\t48.2\t6.1%
Brand C\tCompany Z\t4\t22.4\t24.1\t26.3\t27.8\t30.1\t7.7%
VIRILEX\tTTK Healthcare\t2\t10.2\t11.8\t12.4\t13.6\t14.9\t10.0%
Brand E\tCompany W\t1\t8.9\t9.2\t9.8\t10.1\t10.5\t4.2%`;

  function loadSample() {
    wizardState.steps.step12.awacsData = SAMPLE_DATA;
    saveState();
  }
</script>

<StepHeader stepNum={12} title="AWACS / Market View" subtitle="Market leaderboard and competitive position analysis" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Market Share Chart">
      {#if parsedLeaderboard().length > 0}
        <div class="share-chart">
          {#each parsedLeaderboard() as row}
            {@const val = parseFloat(row.mat5) || 0}
            {@const pct = (val / maxVal()) * 100}
            <div class="share-row" class:our-brand={isOurBrand(row.brand)}>
              <div class="share-brand">{row.brand}</div>
              <div class="share-bar-wrap">
                <div class="share-bar" style="width: {pct}%"></div>
                <span class="share-val">{row.mat5 || '—'}</span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="hint-text">Paste AWACS data on the right to see the market share chart.</p>
      {/if}
    </DataCard>

    <DataCard title="AI Strategic Analysis">
      <AiPanel
        loading={aiLoading}
        narrative={s.aiNarrative}
        onAnalyze={handleAnalyze}
        buttonLabel="Analyze Market Position"
      />
    </DataCard>
  </div>

  <div class="input-panel scrollable">
    <div class="section-title">AWACS Data Input</div>
    <p class="hint">Paste tab-separated or comma-separated data: Brand, Company, SKU, MAT Y1, MAT Y2, MAT Y3, MAT Y4, MAT Y5, CAGR</p>

    <div class="data-actions">
      <button onclick={loadSample} style="font-size: var(--text-xs);">Load Sample Data</button>
    </div>

    <textarea
      value={s.awacsData}
      oninput={e => updateData(e.target.value)}
      placeholder="Brand A	Company X	3	45.2	48.6	52.1	56.8	61.3	7.9%&#10;Brand B	Company Y	2	38.1	40.2	43.8	45.1	48.2	6.1%"
      rows="8"
      style="font-family: monospace; font-size: var(--text-xs);"
    ></textarea>

    {#if parsedLeaderboard().length > 0}
      <div class="section-title" style="margin-top: 20px;">Market Leaderboard</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Brand</th>
              <th>Company</th>
              <th>SKU</th>
              <th>MAT Y1</th>
              <th>MAT Y2</th>
              <th>MAT Y3</th>
              <th>MAT Y4</th>
              <th>MAT Y5</th>
              <th>CAGR</th>
            </tr>
          </thead>
          <tbody>
            {#each parsedLeaderboard() as row}
              <tr class:our-brand-row={isOurBrand(row.brand)}>
                <td style="color:var(--text-muted)">{row.rank}</td>
                <td style="font-weight:500">{row.brand} {isOurBrand(row.brand) ? '★' : ''}</td>
                <td style="color:var(--text-muted)">{row.company}</td>
                <td style="color:var(--text-muted); text-align:center">{row.sku}</td>
                <td>{row.mat1}</td>
                <td>{row.mat2}</td>
                <td>{row.mat3}</td>
                <td>{row.mat4}</td>
                <td style="font-weight:500; color:var(--accent)">{row.mat5}</td>
                <td>
                  <span class="badge {parseFloat(row.cagr) > 8 ? 'green' : parseFloat(row.cagr) > 4 ? 'amber' : 'red'}">{row.cagr}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="completion-box">
      <div class="completion-header">Brand Building Blueprint Complete</div>
      <p class="completion-text">You have completed all 12 steps of the BBB framework. Your brand strategy is saved locally. Use the AI analysis in each step to generate narratives, or restart with a new brand.</p>
      <button onclick={resetWizard} class="reset-btn">Start New BBB Analysis</button>
    </div>
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

  .input-panel {
    flex: 1;
    padding: 20px 28px;
    overflow-y: auto;
  }

  .hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: 10px;
    line-height: 1.6;
  }

  .hint-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .data-actions {
    margin-bottom: 8px;
  }

  .share-chart {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .share-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .share-row.our-brand .share-brand {
    color: var(--green);
    font-weight: 500;
  }

  .share-brand {
    font-size: var(--text-xs);
    color: var(--text);
    font-weight: 500;
  }

  .share-bar-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .share-bar {
    height: 14px;
    background: var(--accent-muted);
    border: 1px solid var(--panel-border);
    border-radius: 3px;
    min-width: 4px;
    transition: width 0.4s ease;
  }

  .our-brand .share-bar {
    background: rgba(52,211,153,0.25);
    border-color: var(--green);
  }

  .share-val {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
  }

  .our-brand-row td {
    background: rgba(52,211,153,0.04);
  }

  .our-brand-row td:nth-child(2) {
    color: var(--green);
  }

  .completion-box {
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    padding: 24px;
    margin-top: 28px;
    text-align: center;
  }

  .completion-header {
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--accent);
    margin-bottom: 12px;
  }

  .completion-text {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .reset-btn {
    background: rgba(248,113,113,0.1);
    border: 1px solid var(--red);
    color: var(--red);
    padding: 10px 24px;
    font-size: var(--text-md);
    cursor: pointer;
  }

  .reset-btn:hover {
    background: rgba(248,113,113,0.2);
  }
</style>
