<script>
  let { stepNum, title, subtitle = '' } = $props();
</script>

<header class="step-header">
  <div class="step-meta">
    <span class="step-pill">Step {stepNum} / 12</span>
    {#if subtitle}
      <span class="step-subtitle">{subtitle}</span>
    {/if}
  </div>
  <h1 class="step-title">{title}</h1>
</header>

<style>
  .step-header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--panel-border);
    background: var(--chrome-bg);
    flex-shrink: 0;
  }
  .step-meta {
    display: flex; align-items: center;
    gap: 10px; margin-bottom: 5px;
  }
  .step-pill {
    font-size: var(--text-xs); font-weight: 500;
    color: var(--accent);
    background: var(--accent-muted);
    border: 1px solid var(--accent);
    padding: 2px 8px; border-radius: 4px;
    letter-spacing: 0.04em;
  }
  .step-subtitle {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  .step-title {
    font-size: var(--text-xl); font-weight: 500;
    color: var(--text); margin: 0; line-height: 1.25;
  }
</style>
