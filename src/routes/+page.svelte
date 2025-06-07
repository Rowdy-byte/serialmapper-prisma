<script lang="ts">
	import type { PageProps } from './$types';
	import { BarChart3, TrendingUp, Package, Users } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

	import ChartBarClient from '$lib/components/charts/ChartBarClient.svelte';
	import ChartBarProducts from '$lib/components/charts/ChartBarProducts.svelte';
	import ChartBarInboundProducts from '$lib/components/charts/ChartBarInboundProducts.svelte';
	import ChartBarInboundsOutbounds from '$lib/components/charts/ChartBarInboundsOutbounds.svelte';

	const { data }: PageProps = $props();

	// Data transformation with error handling
	const {
		clients: rawClients = [],
		inbounds: rawInbounds = [],
		outbounds: rawOutbounds = [],
		products: rawProducts = [],
		inboundProducts: rawInboundProducts = []
	} = data;

	// Helper function to safely transform dates
	function transformData<T extends { createdAt: string | Date }>(
		items: T[]
	): (Omit<T, 'createdAt'> & { createdAt: string })[] {
		return items.map((item) => ({
			...item,
			createdAt: new Date(item.createdAt).toISOString()
		}));
	}

	// Transform all data
	const clients = transformData(rawClients);
	const products = transformData(rawProducts);
	const inboundProducts = transformData(rawInboundProducts);
	const inbounds = transformData(rawInbounds);
	const outbounds = transformData(rawOutbounds || []);

	// Calculate stats for overview cards
	const stats = {
		totalClients: clients.length,
		totalProducts: products.length,
		totalInbounds: inbounds.length,
		totalOutbounds: outbounds.length,
		activeInbounds: inbounds.length,
		t1Clients: 0
	};

	// Overview cards configuration
	const overviewCards = [
		{
			title: 'Total Clients',
			value: stats.totalClients,
			subtitle: `${stats.t1Clients} T1 subscribers`,
			icon: Users,
			color: 'text-blue-400',
			bgColor: 'bg-blue-500/10',
			borderColor: 'border-blue-500/20'
		},
		{
			title: 'Active Inbounds',
			value: stats.activeInbounds,
			subtitle: `${stats.totalInbounds} total`,
			icon: TrendingUp,
			color: 'text-green-400',
			bgColor: 'bg-green-500/10',
			borderColor: 'border-green-500/20'
		},
		{
			title: 'Total Products',
			value: stats.totalProducts,
			subtitle: `${inboundProducts.length} inbound items`,
			icon: Package,
			color: 'text-purple-400',
			bgColor: 'bg-purple-500/10',
			borderColor: 'border-purple-500/20'
		},
		{
			title: 'Outbound Items',
			value: stats.totalOutbounds,
			subtitle: 'Shipped products',
			icon: BarChart3,
			color: 'text-orange-400',
			bgColor: 'bg-orange-500/10',
			borderColor: 'border-orange-500/20'
		}
	];
</script>

<!-- Page Header -->
<div class="mb-8">
	<div class="border-b border-gray-700 pb-6">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
				<p class="mt-1 text-sm text-gray-400">Overview of your serial mapping operations</p>
			</div>
			<div class="flex items-center gap-2 text-sm text-gray-400">
				<div class="h-2 w-2 rounded-full bg-green-400"></div>
				<span>System Active</span>
			</div>
		</div>
	</div>
</div>

<!-- Main Dashboard Content -->
<div class="space-y-8">
	<!-- Overview Cards -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
		{#each overviewCards as card, index}
			<div
				class="relative overflow-hidden rounded-xl border {card.borderColor} {card.bgColor} p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
				in:fly={{ y: 20, delay: index * 100 }}
			>
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<p class="text-sm font-medium text-gray-400">
							{card.title}
						</p>
						<p class="mt-2 text-3xl font-bold text-white">
							{card.value.toLocaleString()}
						</p>
						<p class="mt-1 text-xs text-gray-500">
							{card.subtitle}
						</p>
					</div>
					<div class="flex-shrink-0">
						<div class="rounded-lg {card.bgColor} p-3">
							<svelte:component this={card.icon} class="h-6 w-6 {card.color}" />
						</div>
					</div>
				</div>

				<!-- Subtle gradient overlay -->
				<div
					class="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-gray-900/20"
				></div>
			</div>
		{/each}
	</section>

	<!-- Charts Grid -->
	<section class="grid grid-cols-1 gap-6 xl:grid-cols-2" aria-label="Analytics charts">
		<!-- Client Analytics -->
		<div
			class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:shadow-xl"
			in:fade={{ delay: 200 }}
		>
			<div class="border-b border-gray-700/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<Users class="h-5 w-5 text-blue-400" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-white">Client Distribution</h3>
						<p class="text-sm text-gray-400">Subscription tiers and activity</p>
					</div>
				</div>
			</div>
			<div class="p-6">
				<ChartBarClient {clients} />
			</div>
		</div>

		<!-- Products Analytics -->
		<div
			class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:shadow-xl"
			in:fade={{ delay: 300 }}
		>
			<div class="border-b border-gray-700/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-500/10 p-2">
						<Package class="h-5 w-5 text-purple-400" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-white">Product Overview</h3>
						<p class="text-sm text-gray-400">Inventory and categorization</p>
					</div>
				</div>
			</div>
			<div class="p-6">
				<ChartBarProducts {products} />
			</div>
		</div>

		<!-- Inbound Products Analytics -->
		<div
			class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:shadow-xl"
			in:fade={{ delay: 400 }}
		>
			<div class="border-b border-gray-700/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-green-500/10 p-2">
						<TrendingUp class="h-5 w-5 text-green-400" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-white">Inbound Products</h3>
						<p class="text-sm text-gray-400">Receiving and processing</p>
					</div>
				</div>
			</div>
			<div class="p-6">
				<ChartBarInboundProducts {inboundProducts} />
			</div>
		</div>

		<!-- Inbounds vs Outbounds -->
		<div
			class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/50 hover:shadow-xl"
			in:fade={{ delay: 500 }}
		>
			<div class="border-b border-gray-700/50 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-orange-500/10 p-2">
						<BarChart3 class="h-5 w-5 text-orange-400" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-white">Flow Analytics</h3>
						<p class="text-sm text-gray-400">Inbound vs outbound trends</p>
					</div>
				</div>
			</div>
			<div class="p-6">
				<ChartBarInboundsOutbounds {inbounds} {outbounds} />
			</div>
		</div>
	</section>

	<!-- Additional Insights Section -->
	<section
		class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm"
		in:fade={{ delay: 600 }}
	>
		<div class="mb-6">
			<h3 class="text-lg font-semibold text-white">Quick Insights</h3>
			<p class="text-sm text-gray-400">Key performance indicators at a glance</p>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Subscription Rate -->
			<div class="rounded-lg border border-gray-700/30 bg-gray-800/50 p-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-400">T1 Subscription Rate</span>
					<span class="text-lg font-semibold text-blue-400">
						{stats.totalClients > 0 ? Math.round((stats.t1Clients / stats.totalClients) * 100) : 0}%
					</span>
				</div>
				<div class="mt-2 h-2 rounded-full bg-gray-700">
					<div
						class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
						style="width: {stats.totalClients > 0
							? (stats.t1Clients / stats.totalClients) * 100
							: 0}%"
					></div>
				</div>
			</div>

			<!-- Processing Efficiency -->
			<div class="rounded-lg border border-gray-700/30 bg-gray-800/50 p-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-400">Active Inbounds</span>
					<span class="text-lg font-semibold text-green-400">
						{stats.activeInbounds}
					</span>
				</div>
				<p class="mt-1 text-xs text-gray-500">
					{stats.totalInbounds - stats.activeInbounds} completed
				</p>
			</div>

			<!-- Average Items per Inbound -->
			<div class="rounded-lg border border-gray-700/30 bg-gray-800/50 p-4">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-400">Avg Items/Inbound</span>
					<span class="text-lg font-semibold text-purple-400">
						{stats.totalInbounds > 0 ? Math.round(inboundProducts.length / stats.totalInbounds) : 0}
					</span>
				</div>
				<p class="mt-1 text-xs text-gray-500">
					{inboundProducts.length} total items
				</p>
			</div>
		</div>
	</section>
</div>

<style>
	/* Custom scrollbar for better aesthetics */
	:global(.dashboard-scroll) {
		scrollbar-width: thin;
		scrollbar-color: #374151 #1f2937;
	}

	:global(.dashboard-scroll::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.dashboard-scroll::-webkit-scrollbar-track) {
		background: #1f2937;
		border-radius: 3px;
	}

	:global(.dashboard-scroll::-webkit-scrollbar-thumb) {
		background: #374151;
		border-radius: 3px;
	}

	:global(.dashboard-scroll::-webkit-scrollbar-thumb:hover) {
		background: #4b5563;
	}

	/* Enhance focus states for accessibility */
	:global(.dashboard-card:focus-within) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Custom gradient borders */
	.gradient-border {
		background: linear-gradient(135deg, #374151, #1f2937);
		padding: 1px;
		border-radius: 0.75rem;
	}

	.gradient-border > div {
		background: #111827;
		border-radius: calc(0.75rem - 1px);
	}
</style>
