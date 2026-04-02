<script>
  import { STEPS } from '$lib/steps.js';
  import { wizardState, goToStep } from '$lib/store.svelte.js';
</script>

<nav class="sidebar">
  <div class="logo">
    <span class="logo-bbb">BBB</span>
    <span class="logo-sub">Brand Blueprint</span>
  </div>

  <div class="steps-list scrollable">
    {#each STEPS as step}
      {@const completed = step.n < wizardState.currentStep}
      {@const active    = step.n === wizardState.currentStep}
      {@const unlocked  = step.n <= wizardState.currentStep}
      <button
        class="step-btn"
        class:active
        class:completed
        class:locked={!unlocked}
        disabled={!unlocked}
        onclick={() => goToStep(step.n)}
        title={step.label}
      >
        <span class="step-num">
          {#if completed}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            {step.n}
          {/if}
        </span>
        <span class="step-label">{step.label}</span>
      </button>
    {/each}
  </div>

  <div class="sidebar-footer">
    <span class="powered-by">Powered by</span>
    <span class="powered-name">Ontologer</span>
  </div>
</nav>

<style>
  .sidebar {
    width: 220px; min-width: 220px;
    height: 100vh;
    background: var(--chrome-bg);
    border-right: 1px solid var(--panel-border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; z-index: 100;
  }

  .logo {
    padding: 18px 20px 16px;
    border-bottom: 1px solid var(--panel-border);
    flex-shrink: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .logo-bbb {
    font-size: 0.95rem; font-weight: 500;
    color: var(--accent); letter-spacing: 0.12em;
  }
  .logo-sub {
    font-size: var(--text-xs); color: #171717;
    letter-spacing: 0.04em;
  }

  .steps-list {
    flex: 1; overflow-y: auto;
    padding: 6px 0;
    display: flex; flex-direction: column;
  }

  .step-btn {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 8px 16px;
    border-radius: 0;          /* no rounding */
    background: transparent;
    border: none; border-left: 3px solid transparent;
    text-align: left; cursor: pointer;
    transition: background 0.1s, border-color 0.1s;
  }

  .step-btn.locked { opacity: 0.35; cursor: not-allowed; }

  .step-btn:not(.active):not(.locked):hover {
    background: #f5f5f5;
  }

  /* Active */
  .step-btn.active {
    background: var(--accent-muted);
    border-left-color: var(--accent);
  }
  .step-btn.active .step-num  { color: var(--accent); background: rgba(13,148,136,0.12); }
  .step-btn.active .step-label { color: var(--accent); font-weight: 500; }

  /* Completed */
  .step-btn.completed .step-num  { color: var(--green); background: var(--green-bg); }
  .step-btn.completed .step-label { color: #171717; }

  /* Unlocked, not active/completed */
  .step-btn:not(.active):not(.completed):not(.locked) .step-num  { color: #171717; background: #f5f5f5; }
  .step-btn:not(.active):not(.completed):not(.locked) .step-label { color: #171717; }

  .step-num {
    width: 22px; height: 22px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--text-xs); font-weight: 500;
    flex-shrink: 0;
  }

  .step-label {
    font-size: var(--text-sm); line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .sidebar-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--panel-border);
    display: flex; flex-direction: column; gap: 1px;
    flex-shrink: 0;
  }
  .powered-by {
    font-size: 0.55rem; color: #171717;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .powered-name {
    font-size: var(--text-xs); font-weight: 500;
    color: var(--accent); letter-spacing: 0.03em;
  }
</style>
