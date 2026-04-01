<script>
  import { onMount } from 'svelte';
  import StepHeader from '$lib/components/StepHeader.svelte';
  import AiPanel from '$lib/components/AiPanel.svelte';
  import DataCard from '$lib/components/DataCard.svelte';
  import { wizardState, saveState, resetWizard } from '$lib/store.svelte.js';
  import { getTopBrands, getMarketMeta } from '$lib/backend.js';
  import { analyzeStep, formatNarrative } from '$lib/ai.js';

  let s = $derived(wizardState.steps.step12);
  let s1 = $derived(wizardState.steps.step1);
  let aiLoading = $state(false);

  // Bundled AWACS data (auto-loaded)
  let bundledBrands = $state([]);
  let mktMeta = $state(null);
  let useBundle = $state(true);   // toggle: bundled vs manual paste

  onMount(async () => {
    [bundledBrands, mktMeta] = await Promise.all([getTopBrands(15), getMarketMeta()]);
  });

  // Leaderboard: either bundled data or parsed from manual paste
  let leaderboard = $derived(useBundle
    ? bundledBrands.map((b, i) => ({
        rank: i + 1,
        brand: b.brand,
        company: b.company,
        sku: b.skus?.[0] || '',
        mat17: b.mat_val?.dec17 ?? 0,
        mat18: b.mat_val?.dec18 ?? 0,
        mat19: b.mat_val?.dec19 ?? 0,
        mat20: b.mat_val?.dec20 ?? 0,
        mat21: b.mat_val?.dec21 ?? 0,
        ms: b.ms_dec21 ?? 0,
        cagr: b.cagr_20_21 ?? 0
      }))
    : (s.awacsData?.trim() ? s.awacsData.trim().split('\n').map((line, i) => {
        const p = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
        return {
          rank: i+1, brand: p[0]?.trim()||'', company: p[1]?.trim()||'',
          sku: p[2]?.trim()||'',
          mat17: parseFloat(p[3])||0, mat18: parseFloat(p[4])||0,
          mat19: parseFloat(p[5])||0, mat20: parseFloat(p[6])||0,
          mat21: parseFloat(p[7])||0,
          ms: parseFloat(p[8])||0, cagr: 0
        };
      }).filter(r => r.brand) : [])
  );

  let maxVal = $derived(Math.max(...leaderboard.map(r => r.mat21), 1));

  function isOurBrand(brand) {
    return s1.brandName && brand.toLowerCase().includes(s1.brandName.toLowerCase());
  }

  async function handleAnalyze() {
    aiLoading = true;
    try {
      const narrative = await analyzeStep(12, 'Market Position Analysis', wizardState.steps, {
        leaderboard: leaderboard.slice(0, 12).map(r => ({
          brand: r.brand, company: r.company,
          mat_dec21: r.mat21, market_share: r.ms,
          yoy_growth: r.cagr
        })),
        marketMeta: mktMeta
      });
      wizardState.steps.step12.aiNarrative = formatNarrative(narrative);
      saveState();
    } catch (e) {
      wizardState.steps.step12.aiNarrative = `<p style="color:var(--red)">Error: ${e.message}</p>`;
    } finally {
      aiLoading = false;
    }
  }
</script>

<StepHeader stepNum={12} title="AWACS / Market View" subtitle="Market leaderboard and competitive position analysis" />

<div class="step-body">
  <div class="data-panel scrollable">
    <DataCard title="Market Share (Dec '21)">
      {#if mktMeta}
        <div class="data-row" style="margin-bottom:8px">
          <span class="key">Total V3X2</span>
          <span class="val accent">Rs. {mktMeta.size_cr} Cr</span>
        </div>
      {/if}
      {#if leaderboard.length > 0}
        <div class="share-chart">
          {#each leaderboard.slice(0,10) as row}
            {@const pct = (row.mat21 / maxVal) * 100}
            <div class="share-row" class:our-brand={isOurBrand(row.brand)}>
              <div class="share-brand">{row.brand}</div>
              <div class="share-bar-wrap">
                <div class="share-bar" style="width:{pct}%"></div>
                <span class="share-val">{row.mat21} Cr</span>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="hint-text">Loading market data...</p>
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

    <div class="toggle-row">
      <button class="toggle-btn" class:active={useBundle} onclick={() => useBundle = true}>
        AWACS Data (bundled)
      </button>
      <button class="toggle-btn" class:active={!useBundle} onclick={() => useBundle = false}>
        Paste custom data
      </button>
    </div>

    {#if !useBundle}
      <div class="section-title">Paste AWACS Data</div>
      <p class="hint">Tab or comma-separated: Brand, Company, SKU, MAT'17, MAT'18, MAT'19, MAT'20, MAT'21, MS%</p>
      <textarea
        value={s.awacsData}
        oninput={e => { wizardState.steps.step12.awacsData = e.target.value; saveState(); }}
        placeholder="TENTEX FORTE	HIMALAYA	TENTEX FORTE TABLET 10	15.47	19.92	22.0	23.65	25.39	18.2"
        rows="8"
        style="font-family: monospace; font-size: var(--text-xs);"
      ></textarea>
    {/if}

    {#if leaderboard.length > 0}
      <div class="section-title" style="margin-top: 20px;">Market Leaderboard (V3X2 — MAT Cr)</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Brand</th>
              <th>Company</th>
              <th>'17</th><th>'18</th><th>'19</th><th>'20</th><th>'21</th>
              <th>MS%</th>
              <th>YoY</th>
            </tr>
          </thead>
          <tbody>
            {#each leaderboard as row}
              <tr class:our-brand-row={isOurBrand(row.brand)}>
                <td style="color:var(--text-muted)">{row.rank}</td>
                <td style="font-weight:500">{row.brand}{isOurBrand(row.brand) ? ' ★' : ''}</td>
                <td style="color:var(--text-muted)">{row.company}</td>
                <td style="color:var(--text-muted); font-size:var(--text-xs)">{row.mat17 || '—'}</td>
                <td style="color:var(--text-muted); font-size:var(--text-xs)">{row.mat18 || '—'}</td>
                <td style="color:var(--text-muted); font-size:var(--text-xs)">{row.mat19 || '—'}</td>
                <td style="color:var(--text-muted); font-size:var(--text-xs)">{row.mat20 || '—'}</td>
                <td style="font-weight:500; color:var(--accent)">{row.mat21}</td>
                <td>{row.ms}%</td>
                <td>
                  <span class="badge {row.cagr > 0.08 ? 'green' : row.cagr > 0.02 ? 'amber' : 'red'}">{row.cagr >= 0 ? '+' : ''}{(row.cagr*100).toFixed(1)}%</span>
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

  .toggle-row {
    display: flex; gap: 8px; margin-bottom: 16px;
  }
  .toggle-btn {
    padding: 6px 14px; font-size: var(--text-sm); font-family: inherit;
    border-radius: 8px; border: 1px solid var(--button-border);
    background: var(--button-bg); color: var(--text-muted); cursor: pointer;
  }
  .toggle-btn.active {
    background: var(--accent-muted); border-color: var(--accent); color: var(--accent);
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
