<script>
  let { stepNum, title, subtitle = '' } = $props();
</script>

<header class="step-header">
  <div class="step-meta">
    <span class="step-label">Step {stepNum} of 12</span>
    {#if subtitle}
      <span class="step-subtitle">{subtitle}</span>
    {/if}
  </div>
  <h1 class="step-title">{title}</h1>
</header>

<style>
  .step-header {
    padding: 18px 28px 16px;
    border-bottom: 1px solid var(--panel-border);
    background: var(--chrome-bg);
    flex-shrink: 0;
  }

  .step-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
  }

  .step-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .step-subtitle {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .step-title {
    font-size: var(--text-xl);
    font-weight: 500;
    color: var(--text);
    line-height: 1.2;
  }
</style>
