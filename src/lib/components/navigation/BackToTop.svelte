<script lang="ts">
	import { ArrowUpToLine } from '@lucide/svelte';

	let showBackToTop = $state(false);

	let { scrollTo } = $props();

	function handleScroll() {
		showBackToTop = window.scrollY > 100;
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	$effect(() => {
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

{#if showBackToTop}
	<button
		title={scrollTo}
		onclick={scrollToTop}
		class="custom-gray fixed right-6 bottom-12 rounded-full bg-gray-900 p-2 text-blue-500
		shadow-lg hover:text-blue-800"
		aria-label="Scroll to top"
	>
		<ArrowUpToLine size="24" strokeWidth="1px" />
	</button>
{/if}
