<script>
  import '../app.css';
  import IconSidebar from '$lib/components/IconSidebar.svelte';
  let { children } = $props();
</script>

<div class="app-root">
  <IconSidebar />
  <div class="app-main">
    {@render children()}
  </div>
</div>

<style>
  .app-root {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  .app-main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
  }
</style>
