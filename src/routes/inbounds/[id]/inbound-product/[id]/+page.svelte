<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { MoveRight, Trash2 } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import InboundProductBarcode from '$lib/components/barcodes/InboundProductBarcode.svelte';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const inboundId = urlArray[2];

	let { data, form }: PageProps = $props();
	let { inboundProducts } = data;
	let { inbound } = data;

	const filteredInboundProducts = inboundProducts.filter(
		(product) => product.inboundId === inbound?.id
	);

	function handleUpdateInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to update this inbound product?')) {
			event.preventDefault();
		}
	}

	function handleDeleteInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this inbound product?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		if (form?.success) {
			toast.success(form.message, {
				duration: 4000,
				style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
		if (form?.success === false) {
			toast.error(form.message, {
				duration: 4000,
				style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	});
</script>

<section class="text-md mb-2 rounded-lg bg-gray-900 p-4 shadow-md">
	<ul class="flex items-center gap-2">
		<li>
			<a href={`/inbounds/${inboundId}`} class="font-bold text-gray-500 hover:text-blue-500">
				<span class="hidden font-bold md:inline">Inbound: </span> {inbound?.inboundNumber}</a
			>
		</li>
		<li>
			<MoveRight size="24" class="px-1" />
		</li>
		<li>
			<p class="font-bold text-gray-500">
				{#each filteredInboundProducts as inboundProduct, i}
					{#if inboundProduct.id === Number(params.id)}
						<span class="text-gray-500">
							<span class="hidden md:inline">Inbound Product:</span>
							{i + 1}
						</span>
					{/if}
				{/each}
			</p>
		</li>
	</ul>
</section>
<main class="flex flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-4 font-bold">Inbound Product</h1>
		{#each inboundProducts as inboundProduct}
			{#if inboundProduct.id === Number(params.id)}
				<form class="flex flex-col gap-4" method="post">
					<input
						type="text"
						name="product"
						value={inboundProduct?.product}
						placeholder="Product"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					/>
					<input
						type="text"
						name="serialnumber"
						value={inboundProduct?.serialnumber}
						placeholder="Serialnumber"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					/>
					<input
						type="text"
						name="value"
						value={inboundProduct?.value}
						placeholder="Value"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					/>

					<button
						formaction="?/updateInboundProduct"
						onclick={handleUpdateInboundProduct}
						class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit">Update</button
					>
				</form>
			{/if}
		{/each}
	</section>
	<section class=" max-w-sm justify-center rounded-lg bg-gray-900 shadow-md">
		{#each inboundProducts as inboundProduct}
			{#if inboundProduct.id === Number(params.id)}
				<section class=" rounded-lg bg-gray-900 p-4 shadow-md">
					<h1 class="pb-4 font-bold">Product Sticker</h1>
					<InboundProductBarcode {inboundProduct} {inbound} />
				</section>
			{/if}
		{/each}
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">Delete product from Inbound</h1>
		<form method="post" class="flex gap-2">
			<button
				formaction="?/deleteInboundProduct"
				onclick={handleDeleteInboundProduct}
				class=" fo rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit"><Trash2 /></button
			>
		</form>
	</section>
	<section></section>
</main>
