<script lang="ts">
	import type { PageProps } from './$types';
	import ChartBarClient from '$lib/components/charts/ChartBarClient.svelte';
	import ChartBarProducts from '$lib/components/charts/ChartBarProducts.svelte';
	import ChartBarInboundProducts from '$lib/components/charts/ChartBarInboundProducts.svelte';
	import ChartBarInboundsOutbounds from '$lib/components/charts/ChartBarInboundsOutbounds.svelte';

	const { data }: PageProps = $props();

	const {
		clients: rawClients,
		inbounds: rawInbounds,
		outbounds: rawOutbounds,
		products: rawProducts,
		inboundProducts: rawInboundProducts
	} = data;

	const clients = rawClients.map((client) => ({
		...client,
		createdAt: new Date(client.createdAt).toISOString()
	}));

	const products = rawProducts.map((product) => ({
		...product,
		createdAt: new Date(product.createdAt).toISOString()
	}));

	const inboundProducts = rawInboundProducts.map((inboundProduct) => ({
		...inboundProduct,
		createdAt: new Date(inboundProduct.createdAt).toISOString()
	}));

	const inbounds = rawInbounds.map((inbound) => ({
		...inbound,
		createdAt: new Date(inbound.createdAt).toISOString()
	}));

	const outbounds =
		rawOutbounds?.map((outbound: any) => ({
			...outbound,
			createdAt: new Date(outbound.createdAt).toISOString()
		})) || [];
</script>

<div class="container mx-auto p-4">
	<main class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<section class="flex flex-col rounded-lg bg-gray-900 p-4 shadow-lg">
			<ChartBarClient {clients} />
		</section>
		<section class="flex flex-col rounded-lg bg-gray-900 p-4 shadow-lg">
			<ChartBarProducts {products} />
		</section>
		<section class="flex flex-col rounded-lg bg-gray-900 p-4 shadow-lg">
			<ChartBarInboundProducts {inboundProducts} />
		</section>
		<section class="flex flex-col rounded-lg bg-gray-900 p-4 shadow-lg">
			<ChartBarInboundsOutbounds {inbounds} {outbounds} />
		</section>
	</main>
</div>
