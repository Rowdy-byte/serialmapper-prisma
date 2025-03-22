<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import HamburgerMenu from '$lib/components/HamburgerMenu.svelte';
	import toast, { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';

	let { children } = $props();

	let pathname = $state();

	$effect(() => {
		pathname = page.url.pathname;
	});

	const links = [
		{ linkName: 'Inbounds', linkPath: '/inbounds' },
		{ linkName: 'Clients', linkPath: '/clients' },
		{ linkName: 'Products', linkPath: '/products' }
	];
</script>

<Toaster />

<nav class="relative flex items-center justify-between p-4">
	<section class="flex h-full items-center justify-center gap-2">
		<a class="text-center text-2xl font-black" href="/"
			>SN<span class="text-md text-orange-500">mapper</span>
			<span class="text-xs font-normal text-slate-500">beta version 1.0</span></a
		>
	</section>
	<section class="flex h-full items-center justify-center gap-2 text-center">
		<div class="hidden items-center gap-2 md:flex">
			{#each links as { linkName, linkPath }}
				{#if pathname !== linkPath}
					<a
						class="rounded-md p-2 font-bold text-gray-300 hover:cursor-pointer hover:bg-gray-800 hover:text-blue-500"
						href={linkPath}
						class:selected={pathname === linkPath}>{linkName}</a
					>
				{/if}
				<!-- if link is active -->
				{#if pathname === linkPath}
					<a
						class="rounded-md bg-gray-800 p-2 text-blue-500"
						href={linkPath}
						class:selected={pathname === linkPath}>{linkName}</a
					>
				{/if}
			{/each}
		</div>
		<div class="text-white md:hidden">
			<HamburgerMenu />
		</div>
	</section>
</nav>

<main class="relative flex min-h-screen flex-grow flex-col bg-gray-950 p-4">
	{@render children()}
</main>
<Footer />
