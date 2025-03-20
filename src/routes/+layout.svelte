<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import { Hamburger } from 'svelte-hamburgers';
	import HamburgerMenu from '$lib/components/HamburgerMenu.svelte';
	let { children } = $props();
</script>

<nav class="relative flex items-center justify-between p-4">
	<section class="flex h-full items-center justify-center gap-2">
		<a class="text-center text-2xl font-bold" href="/"
			>SN<span class="text-md text-orange-500">mapper</span>
			<span class="text-xs font-normal text-slate-500">beta version 1.0</span></a
		>
	</section>
	<section class="flex h-full items-center justify-center gap-2 text-center">
		<div class="hidden items-center gap-2 md:flex">
			<a href="/inbounds">Inbounds</a>
			|
			<a href="/clients">Clients</a>
			|
			<a href="/products">Products</a>
		</div>
		<div class="text-white md:hidden">
			<HamburgerMenu />
		</div>
	</section>
</nav>

<main class=" h-full bg-gray-950 p-4">
	{@render children()}
</main>
<Footer />
