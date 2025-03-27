<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { MoveRight } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const outboundId = urlArray[2];

	const { pathname } = page.url;
	const segments = pathname.split('/');

	let { data, form }: PageProps = $props();
	let { outboundProducts = [] } = data;
	let { outbound } = data;

	interface OutboundProduct {
		id: number;
		product: string;
		serialnumber: string;
		outboundId: number;
	}

	const filteredOutboundProducts =
		outboundProducts?.filter((product) => product.outboundId === outbound?.id) || [];

	function handleUpdateOutboundProduct(event: Event) {
		if (!confirm('Are you sure you want to update this outbound product?')) {
			event.preventDefault();
		}
	}

	function handleDeleteOutboundProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this outbound product?')) {
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

<section class="breadcrums text-md mb-2 rounded-lg bg-gray-900 p-4 shadow-md">
	<ul class="flex items-center gap-2">
		<li>
			<a href={`/inbounds/${outboundId}`} class="font-bold text-gray-500 hover:text-blue-500">
				<span class="hidden font-bold md:inline">Outbound: </span> {outbound?.outboundNumber}</a
			>
		</li>
		<li>
			<MoveRight size="24" class="px-1" />
		</li>
		<li>
			<p class="text-gray-500">
				{#each filteredOutboundProducts as outboundProduct, i}
					{#if outboundProduct.id === Number(params.id)}
						<span class="text-gray-500">
							<span class="hidden font-bold md:inline">Outbound Product:</span>
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
		<h1 class="pb-4 font-bold">Outbound Product</h1>
		{#each outboundProducts as outboundProduct}
			{#if outboundProduct.id === Number(params.id)}
				<form class="flex flex-col gap-4" method="post">
					<input
						type="text"
						name="product"
						value={outboundProduct?.product}
						placeholder="Product"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					/>
					<input
						type="text"
						name="serialnumber"
						value={outboundProduct?.serialnumber}
						placeholder="Serialnumber"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					/>

					<button
						formaction="?/updateOutboundProduct"
						onclick={handleUpdateOutboundProduct}
						class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:border-gray-400 hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit">Update</button
					>
				</form>
			{/if}
		{/each}
	</section>

	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">Delete product from Inbound</h1>
		<form method="post" class="flex gap-2">
			<button
				formaction="?/deleteOutboundProduct"
				onclick={handleDeleteOutboundProduct}
				class=" rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Delete</button
			>
		</form>
	</section>
</main>
