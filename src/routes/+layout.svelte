<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav class="flex items-center justify-between p-4">
	<section>
		<a href="/">Home</a>
	</section>
	<section class="flex gap-2">
		<a href="/inbounds">Inbounds</a>
		|
		<a href="/clients">Clients</a>
		|
		<a href="/products">Products</a>
	</section>
</nav>

<main class="p-4">
	{@render children()}
</main>
