<script>
  let { loading = false, narrative = '', onAnalyze, buttonLabel = 'Analyze with AI' } = $props();
</script>

<div class="ai-panel">
  <div class="ai-panel-header">
    <span class="ai-label">AI Analysis</span>
    <span class="model-badge">Qwen</span>
  </div>

  <button class="primary analyze-btn" onclick={onAnalyze} disabled={loading}>
    {#if loading}
      <span class="spinner"></span> Analyzing...
    {:else}
      {buttonLabel}
    {/if}
  </button>

  {#if loading}
    <div class="skeleton-wrap">
      <div class="skeleton" style="width: 90%"></div>
      <div class="skeleton" style="width: 75%"></div>
      <div class="skeleton" style="width: 85%"></div>
      <div class="skeleton" style="width: 60%"></div>
      <div class="skeleton" style="width: 80%"></div>
      <div class="skeleton" style="width: 70%"></div>
    </div>
  {:else if narrative}
    <div class="narrative-wrap scrollable">
      <div class="ai-narrative">{@html narrative}</div>
    </div>
  {:else}
    <div class="empty-state">
      <p>Fill in the fields on the left, then click the button above to get AI-powered insights.</p>
    </div>
  {/if}
</div>

<style>
  .ai-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
  }

  .ai-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ai-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .model-badge {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--accent);
    background: var(--accent-muted);
    border: 1px solid var(--panel-border);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .analyze-btn {
    width: 100%;
    padding: 10px;
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--accent);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .skeleton-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0;
  }

  .narrative-wrap {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  .empty-state {
    padding: 20px 0;
    text-align: center;
  }

  .empty-state p {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.6;
  }
</style>
