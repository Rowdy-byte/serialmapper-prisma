<script lang="ts">
	import '../app.css';
	// import '../global.css';
	import Footer from '$lib/components/Footer.svelte';
	import HamburgerMenu from '$lib/components/navigation/HamburgerMenu.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	let pathname = $state();
	let currentPage = $state();

	$effect(() => {
		pathname = page.url.pathname;
		currentPage = page.url.pathname;
	});

	const links = [
		{ linkName: 'Inbounds', linkPath: '/inbounds' },
		{ linkName: 'Outbounds', linkPath: '/outbounds' },
		{ linkName: 'Products', linkPath: '/products' },
		{ linkName: 'Clients', linkPath: '/clients' }
		// { linkName: 'Docs', linkPath: '/docs' }
	];
</script>

<section class="sticky top-0 left-0 z-50 w-full bg-gray-950 p-4">
	<nav class="container mx-auto flex w-full items-center justify-between">
		<section class="flex items-center rounded">
			<a class="flex items-center justify-center text-2xl font-black italic" href="/">
				SN<span class="text-md text-orange-500">mapper</span>
			</a>
			<!-- <a class="" href="/">
				<img class="logo w-24 md:w-28" src="/logo.png" alt="serialmapper-logo" />
			</a> -->
		</section>
		<!-- <section class="ml-1 flex h-2 w-full flex-col rounded-lg bg-gray-900 p-1 shadow-md"></section> -->
		<section class="flex h-full items-center gap-2">
			<div class="hidden items-center gap-2 py-4 md:flex">
				{#each links as { linkName, linkPath }}
					{#if pathname !== linkPath}
						<a
							class="rounded-md p-2 font-medium text-gray-300 hover:cursor-pointer hover:bg-gray-800 hover:text-blue-500"
							href={linkPath}
							class:selected={pathname === linkPath}>{linkName}</a
						>
					{/if}
					{#if pathname === linkPath}
						<a
							class="rounded-md bg-gray-800 p-2 font-bold text-blue-500"
							href={linkPath}
							class:selected={pathname === linkPath}>{linkName}</a
						>
					{/if}
				{/each}
				<a
					href="/docs"
					class="ml-8 rounded-lg border border-orange-500 px-4 py-2 font-bold text-orange-500 hover:bg-orange-500 hover:text-white"
					>Docs</a
				>
			</div>
			<div class="text-white md:hidden">
				<HamburgerMenu />
			</div>
		</section>
	</nav>
</section>
<div class="z-50">
	<Toaster />
</div>
<main class="relative flex min-h-screen flex-grow flex-col bg-gray-950 p-2" transition:fade>
	{#key currentPage}
		{@render children()}
	{/key}
</main>
<Footer />
