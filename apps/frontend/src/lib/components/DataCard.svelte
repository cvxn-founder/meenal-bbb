<script>
  let { title, loading = false, children } = $props();
</script>

<div class="data-card">
  <div class="data-card-title">{title}</div>
  {#if loading}
    <div class="skeleton" style="width: 80%"></div>
    <div class="skeleton" style="width: 65%"></div>
    <div class="skeleton" style="width: 72%"></div>
  {:else}
    {@render children?.()}
  {/if}
</div>

<style>
  .data-card {
    background: var(--surface);
    border: 1px solid var(--panel-border);
    border-radius: var(--panel-radius);
    padding: 14px 16px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .data-card-title {
    font-size: var(--text-xs); font-weight: 500;
    color: #171717;
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 10px; padding-bottom: 8px;
    border-bottom: 1px solid var(--divider);
  }
</style>
