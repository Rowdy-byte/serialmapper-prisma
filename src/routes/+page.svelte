<script lang="ts">
	import type { PageProps } from './$types';
	import ChartBarClient from '$lib/components/charts/ChartBarClient.svelte';
	import ChartBarProducts from '$lib/components/charts/ChartBarProducts.svelte';
	import ChartBarInboundProducts from '$lib/components/charts/ChartBarInboundProducts.svelte';
	import ChartBarInboundsOutbounds from '$lib/components/charts/ChartBarInboundsOutbounds.svelte';

	const { data }: PageProps = $props();
	console.log('data', data);

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

<div
	class="absolute top-1/2 left-1/2 container mx-auto -translate-x-1/2 -translate-y-1/2 transform p-4"
>
	<main class="mx-auto grid max-w-4xl grid-cols-1 gap-4 xl:grid-cols-2">
		<section class=" flex max-w-2xl flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarClient {clients} />
		</section>
		<section class=" flex max-w-2xl flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarProducts {products} />
		</section>
		<section class=" flex max-w-2xl flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarInboundProducts {inboundProducts} />
		</section>
		<section class=" flex max-w-2xl flex-col rounded-lg bg-gray-900 p-4">
			<ChartBarInboundsOutbounds {inbounds} {outbounds} />
		</section>
	</main>
</div>
