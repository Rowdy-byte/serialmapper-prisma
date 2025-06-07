<script lang="ts">
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import HamburgerMenu from '$lib/components/navigation/HamburgerMenu.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { Home, Package, Users, FileText, Menu, X } from '@lucide/svelte';

	let { children } = $props();

	let pathname = $state();
	let currentPage = $state();
	let mobileMenuOpen = $state(false);

	$effect(() => {
		pathname = page.url.pathname;
		currentPage = page.url.pathname;
	});

	const links = [
		{
			linkName: 'Dashboard',
			linkPath: '/',
			icon: Home,
			description: 'Overview & analytics'
		},
		{
			linkName: 'Inbounds',
			linkPath: '/inbounds',
			icon: Package,
			description: 'Incoming inventory'
		},
		{
			linkName: 'Outbounds',
			linkPath: '/outbounds',
			icon: Package,
			description: 'Outgoing shipments'
		},
		{
			linkName: 'Products',
			linkPath: '/products',
			icon: Package,
			description: 'Product catalog'
		},
		{
			linkName: 'Clients',
			linkPath: '/clients',
			icon: Users,
			description: 'Client management'
		}
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Navigation Header -->
<header
	class="sticky top-0 left-0 z-50 w-full border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md"
>
	<nav class="container mx-auto max-w-7xl px-4">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center">
				<a
					href="/"
					class="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50"
					onclick={closeMobileMenu}
				>
					<div class="flex items-center justify-center rounded-lg bg-orange-400 p-2">
						<span class="text-lg font-bold text-white">SN</span>
					</div>
					<div class="hidden sm:block">
						<span class="text-xl font-bold text-white">mapper</span>
						<div class="text-xs text-gray-400">Serial Management</div>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden items-center gap-1 lg:flex">
				{#each links as { linkName, linkPath, icon }}
					<a
						href={linkPath}
						class="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 {pathname ===
						linkPath
							? 'bg-blue-600/20 text-blue-400 shadow-lg'
							: 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}"
					>
						<svelte:component
							this={icon}
							class="h-4 w-4 {pathname === linkPath
								? 'text-blue-400'
								: 'text-gray-400 group-hover:text-gray-300'}"
						/>
						<span>{linkName}</span>

						<!-- Active indicator -->
						{#if pathname === linkPath}
							<div
								class="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-blue-400"
							></div>
						{/if}
					</a>
				{/each}
			</div>

			<!-- CTA and Mobile Menu Button -->
			<div class="flex items-center gap-3">
				<!-- Documentation Link -->
				<a
					href="/docs"
					class="hidden items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-400 transition-all duration-200 hover:border-orange-500/50 hover:bg-orange-500/20 hover:text-orange-300 sm:flex"
				>
					<FileText class="h-4 w-4" />
					<span>Documentation</span>
				</a>

				<!-- Mobile Menu Button -->
				<button
					onclick={toggleMobileMenu}
					class="flex items-center justify-center rounded-lg bg-gray-800/50 p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
					aria-label="Toggle mobile menu"
				>
					{#if mobileMenuOpen}
						<X class="h-5 w-5" />
					{:else}
						<Menu class="h-5 w-5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if mobileMenuOpen}
			<div
				class="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm lg:hidden"
				transition:fade={{ duration: 200 }}
			>
				<div class="space-y-1 px-2 py-4">
					{#each links as { linkName, linkPath, icon, description }}
						<a
							href={linkPath}
							onclick={closeMobileMenu}
							class="group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all duration-200 {pathname ===
							linkPath
								? 'bg-blue-600/20 text-blue-400'
								: 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}"
						>
							<div
								class="flex-shrink-0 rounded-lg {pathname === linkPath
									? 'bg-blue-500/20'
									: 'bg-gray-700/50 group-hover:bg-gray-600/50'} p-2"
							>
								<svelte:component
									this={icon}
									class="h-4 w-4 {pathname === linkPath
										? 'text-blue-400'
										: 'text-gray-400 group-hover:text-gray-300'}"
								/>
							</div>
							<div class="flex-1">
								<div class="font-medium">{linkName}</div>
								<div class="text-xs {pathname === linkPath ? 'text-blue-400/70' : 'text-gray-500'}">
									{description}
								</div>
							</div>
							{#if pathname === linkPath}
								<div class="h-2 w-2 rounded-full bg-blue-400"></div>
							{/if}
						</a>
					{/each}

					<!-- Mobile Documentation Link -->
					<div class="border-t border-gray-800/50 pt-3">
						<a
							href="/docs"
							onclick={closeMobileMenu}
							class="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-3 text-base font-medium text-orange-400 transition-all duration-200 hover:bg-orange-500/20"
						>
							<div class="flex-shrink-0 rounded-lg bg-orange-500/20 p-2">
								<FileText class="h-4 w-4 text-orange-400" />
							</div>
							<div class="flex-1">
								<div class="font-medium">Documentation</div>
								<div class="text-xs text-orange-400/70">API reference & guides</div>
							</div>
						</a>
					</div>
				</div>
			</div>
		{/if}
	</nav>
</header>

<!-- Toast Notifications -->
<div class="z-50">
	<Toaster />
</div>

<!-- Main Content -->
<main class="relative flex min-h-screen flex-grow flex-col bg-gray-950" transition:fade>
	{#key currentPage}
		{@render children()}
	{/key}
</main>

<!-- Footer -->
<Footer />

<style>
	/* Smooth transitions */
	:global(.transition-colors) {
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}

	/* Custom scrollbar for mobile menu */
	:global(.mobile-menu-scroll) {
		scrollbar-width: thin;
		scrollbar-color: #374151 transparent;
	}

	:global(.mobile-menu-scroll::-webkit-scrollbar) {
		width: 4px;
	}

	:global(.mobile-menu-scroll::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.mobile-menu-scroll::-webkit-scrollbar-thumb) {
		background-color: #374151;
		border-radius: 2px;
	}
</style>
