<script>
  let { loading = false, narrative = '', onAnalyze, buttonLabel = 'Analyze with AI' } = $props();
</script>

<div class="ai-panel">
  <div class="ai-header">
    <span class="ai-label">AI Analysis</span>
    <span class="model-tag">Qwen</span>
  </div>

  <button class="primary analyze-btn" onclick={onAnalyze} disabled={loading}>
    {#if loading}
      <span class="spinner"></span> Analyzing…
    {:else}
      {buttonLabel}
    {/if}
  </button>

  {#if loading}
    <div class="skeleton-wrap">
      <div class="skeleton" style="width:90%"></div>
      <div class="skeleton" style="width:75%"></div>
      <div class="skeleton" style="width:83%"></div>
      <div class="skeleton" style="width:60%"></div>
      <div class="skeleton" style="width:78%"></div>
    </div>
  {:else if narrative}
    <div class="narrative-box">
      <div class="narrative-inner">
        <div class="ai-narrative">{@html narrative}</div>
      </div>
    </div>
  {:else}
    <p class="empty-hint">Fill in the fields, then click the button above to get AI insights for this step.</p>
  {/if}
</div>

<style>
  .ai-panel { display: flex; flex-direction: column; gap: 12px; }

  .ai-header {
    display: flex; align-items: center;
    justify-content: space-between;
  }
  .ai-label {
    font-size: var(--text-xs); font-weight: 500;
    color: #525252;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .model-tag {
    font-size: var(--text-xs); font-weight: 500;
    color: var(--accent);
    background: var(--accent-muted);
    border: 1px solid var(--accent);
    padding: 1px 7px; border-radius: 4px;
  }

  .analyze-btn {
    width: 100%; padding: 10px;
    font-size: var(--text-sm);
    display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }

  .spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .skeleton-wrap { display: flex; flex-direction: column; gap: 7px; padding: 2px 0; }

  /* Consultant comment box style */
  .narrative-box {
    border-left: 3px solid var(--accent);
    background: #fafafa;
    border-radius: 0 6px 6px 0;
    overflow: hidden;
  }
  .narrative-inner {
    padding: 14px 16px;
    max-height: 360px;
    overflow-y: auto;
  }

  .empty-hint {
    font-size: var(--text-sm);
    color: #525252;
    line-height: 1.6;
    margin: 0;
  }
</style>
