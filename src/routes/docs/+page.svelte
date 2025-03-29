<!-- <script lang="ts">
	import type { ComponentType } from 'svelte';

	let Component = $state<ComponentType | null>(null);

	let { data } = $props();

	console.log(data);

	$effect(() => {
		setTimeout(() => {
			if (data.content) {
				Component = data.content;
			}
		}, 1000);
	});
</script>

<main>
	{@const Component = data.content}
	{#if Component}
		<Component />
	{:else}
		<p>Loading...</p>
	{/if}
</main> -->
