<script>
  import { STEPS } from '$lib/steps.js';
  import { wizardState, goToStep } from '$lib/store.svelte.js';
</script>

<nav class="sidebar">
  <div class="logo">
    <span class="logo-text">BBB</span>
  </div>

  <div class="steps-list scrollable">
    {#each STEPS as step}
      {@const unlocked = step.n <= wizardState.currentStep}
      {@const active = step.n === wizardState.currentStep}
      <button
        class="step-btn"
        class:active
        class:unlocked
        class:locked={!unlocked}
        disabled={!unlocked}
        onclick={() => goToStep(step.n)}
        title={step.label}
      >
        <span class="step-num">{step.n}</span>
        <span class="step-short">{step.short}</span>
      </button>
    {/each}
  </div>

  <div class="sidebar-footer">
    <span class="powered">Powered by</span>
    <span class="ontologer">Ontologer</span>
  </div>
</nav>

<style>
  .sidebar {
    width: 72px;
    min-width: 72px;
    height: 100vh;
    background: var(--chrome-bg);
    border-right: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }

  .logo {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--panel-border);
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.1em;
  }

  .steps-list {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .step-btn {
    width: 56px;
    height: 52px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    transition: all 0.15s;
    padding: 0;
  }

  .step-btn.unlocked {
    color: var(--text-muted);
    cursor: pointer;
  }

  .step-btn.unlocked:hover {
    background: var(--accent-muted);
    border-color: var(--panel-border);
    color: var(--accent);
  }

  .step-btn.active {
    background: var(--accent-muted);
    border-color: var(--accent);
    color: var(--accent);
  }

  .step-btn.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .step-num {
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1;
  }

  .step-short {
    font-size: 0.5rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1;
    max-width: 54px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sidebar-footer {
    width: 100%;
    padding: 10px 4px;
    border-top: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }

  .powered {
    font-size: 0.48rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ontologer {
    font-size: 0.55rem;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.05em;
  }
</style>
