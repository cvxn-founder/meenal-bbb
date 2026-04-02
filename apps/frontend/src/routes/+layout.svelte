<script>
  import '../app.css';
  import IconSidebar from '$lib/components/IconSidebar.svelte';
  let { children } = $props();
</script>

<IconSidebar />
<div class="page-body">
  {@render children()}
</div>

<style>
  .page-body { margin-left: 48px; }
</style>
