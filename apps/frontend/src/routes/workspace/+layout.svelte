<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  let { children } = $props();
</script>

<div class="app-shell">
  <Sidebar />
  <main class="main-content">
    {@render children()}
  </main>
</div>

<style>
  .app-shell {
    display: flex;
    height: 100%;
    overflow: hidden;
  }
  .main-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg);
  }
</style>
