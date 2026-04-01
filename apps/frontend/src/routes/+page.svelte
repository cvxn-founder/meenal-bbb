<script>
  import { wizardState } from '$lib/store.svelte.js';
  import Step01 from '$lib/components/steps/Step01.svelte';
  import Step02 from '$lib/components/steps/Step02.svelte';
  import Step03 from '$lib/components/steps/Step03.svelte';
  import Step04 from '$lib/components/steps/Step04.svelte';
  import Step05 from '$lib/components/steps/Step05.svelte';
  import Step06 from '$lib/components/steps/Step06.svelte';
  import Step07 from '$lib/components/steps/Step07.svelte';
  import Step08 from '$lib/components/steps/Step08.svelte';
  import Step09 from '$lib/components/steps/Step09.svelte';
  import Step10 from '$lib/components/steps/Step10.svelte';
  import Step11 from '$lib/components/steps/Step11.svelte';
  import Step12 from '$lib/components/steps/Step12.svelte';
</script>

<div class="step-container">
  {#if wizardState.currentStep === 1}<Step01 />
  {:else if wizardState.currentStep === 2}<Step02 />
  {:else if wizardState.currentStep === 3}<Step03 />
  {:else if wizardState.currentStep === 4}<Step04 />
  {:else if wizardState.currentStep === 5}<Step05 />
  {:else if wizardState.currentStep === 6}<Step06 />
  {:else if wizardState.currentStep === 7}<Step07 />
  {:else if wizardState.currentStep === 8}<Step08 />
  {:else if wizardState.currentStep === 9}<Step09 />
  {:else if wizardState.currentStep === 10}<Step10 />
  {:else if wizardState.currentStep === 11}<Step11 />
  {:else}<Step12 />
  {/if}
</div>

<style>
  .step-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
