<script lang="ts">
	import Chart from 'chart.js/auto';
	import type { PageProps } from './$types';
	import ChartBarClient from '$lib/components/charts/ChartBarClient.svelte';
	import ChartBarProducts from '$lib/components/charts/ChartBarProducts.svelte';

	const { data }: PageProps = $props();

	const { clients: rawClients, inbounds, products: rawProducts, inboundProducts } = data;
	const clients = rawClients.map((client) => ({
		...client,
		createdAt: client.createdAt.toISOString()
	}));
	const products = rawProducts.map((product) => ({
		...product,
		createdAt: product.createdAt.toISOString()
	}));
</script>

<h1 class="text-xl font-bold">Dashboard</h1>

<div class="absolute top-1/2 left-1/2 container -translate-x-1/2 -translate-y-1/2 transform">
	<main class="grid max-w-6xl grid-cols-1 gap-4">
		<section class="flex flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarClient {clients} />
		</section>
		<section class="flex flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarProducts {products} />
		</section>
		<section></section>
		<section></section>
	</main>
</div>
