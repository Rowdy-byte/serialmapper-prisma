<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<nav class="relative flex items-center justify-between p-4">
	<section class="flex items-center justify-center gap-2">
		<a class="text-center text-2xl font-bold" href="/"
			>SNM <span class="text-xs text-slate-500">beta version 1.0</span></a
		>
	</section>
	<section class="flex items-center justify-center gap-2 text-center">
		<a href="/inbounds">Inbounds</a>
		|
		<a href="/clients">Clients</a>
		|
		<a href="/products">Products</a>
	</section>
</nav>

<main class=" h-full p-4">
	{@render children()}
</main>
<Footer />
