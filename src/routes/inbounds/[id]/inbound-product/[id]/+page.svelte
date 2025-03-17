<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const inboundId = urlArray[2];

	const { data, form }: PageProps = $props();
	let { inboundProducts } = data;

	function handleUpdateInboundProduct() {
		form?.success;
	}

	console.log(data);
</script>

<h1 class="py-4 text-xl font-bold">Inbound: {inboundId} product: {params.id}</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm">
		<h1 class="font-bold">Inbound Product</h1>
		<!-- form for showing Inbound product details and functionality for updating -->
		{#each inboundProducts as inboundProduct}
			{#if inboundProduct.id === Number(params.id)}
				<form class="flex flex-col gap-4" method="post">
					<input
						type="text"
						name="product"
						value={inboundProduct?.product}
						placeholder="Product"
						class="rounded-md border
            border-gray-300 p-2 text-gray-800"
					/>
					<input
						type="text"
						name="serialnumber"
						value={inboundProduct?.serialnumber}
						placeholder="Serialnumber"
						class="rounded-md border
            border-gray-300 p-2 text-gray-800"
					/>

					<button
						formaction="?/updateInboundProduct"
						onclick={handleUpdateInboundProduct}
						class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit">Update</button
					>
				</form>
			{/if}
		{/each}
	</section>
</main>
