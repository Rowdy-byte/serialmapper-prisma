<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import HamburgerMenu from '$lib/components/navigation/HamburgerMenu.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';

	let { children } = $props();

	let pathname = $state();

	$effect(() => {
		pathname = page.url.pathname;
	});

	const links = [
		{ linkName: 'Inbounds', linkPath: '/inbounds' },
		{ linkName: 'Outbounds', linkPath: '/outbounds' },
		{ linkName: 'Products', linkPath: '/products' },
		{ linkName: 'Clients', linkPath: '/clients' }
	];
</script>

<section class="sticky top-0 left-0 z-50 bg-gray-950">
	<nav class="flex items-center justify-between p-4">
		<section class="flex h-full items-center rounded-full bg-gray-900 p-2">
			<a class="flex items-center justify-center text-2xl font-black italic" href="/"
				>SN<span class="text-md text-orange-500">mapper</span>
			</a>

			<!-- <img class="w-32" src="/logo.png" alt="serialmapper-logo" /> -->
		</section>
		<!-- <section class="ml-1 flex h-2 w-full flex-col rounded-lg bg-gray-900 p-1 shadow-md"></section> -->
		<section class="flex h-full items-center gap-2">
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
</section>

<main class="relative flex min-h-screen flex-grow flex-col bg-gray-950 p-4">
	<Toaster />
	{@render children()}
</main>
<Footer />
