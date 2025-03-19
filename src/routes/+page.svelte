<script lang="ts">
	import type { PageProps } from './$types';
	import Stats from '$lib/components/statics/Stats.svelte';

	const { data }: PageProps = $props();

	const { clients, inbounds, products, inboundProducts } = data;
</script>

<h1 class="text-xl font-bold">Dashboard</h1>

<main
	class="absolute top-1/2 left-1/2 grid w-full -translate-x-1/2 -translate-y-1/2 grid-cols-2 justify-center gap-4 p-4 md:grid-cols-4 lg:grid-cols-4 xl:max-w-5xl"
>
	<Stats statsName="Inbounds" statsValue={inbounds.length} />
	<Stats statsName="Clients" statsValue={clients.length} />
	<Stats statsName="Products" statsValue={products.length} />
	<Stats statsName="Products In" statsValue={inboundProducts.length} />
</main>
