<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { MoveRight, Trash2 } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import OutboundProductBarcode from '$lib/components/barcodes/OutboundProductBarcode.svelte';

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

<div class="container mx-auto py-4">
	<section
		class="breadcrums text-md mb-4 flex justify-between rounded-lg bg-gray-900 p-4 shadow-md"
	>
		<ul class="flex items-center gap-2">
			<li>
				<a href={`/inbounds/${outboundId}`} class="font-bold text-gray-500">
					<span class="hidden md:inline">Outbound: </span>
					<span class="hover:text-blue-500">{outbound?.outboundNumber}</span>
				</a>
			</li>
			<li>
				<MoveRight size="24" class="px-1" />
			</li>
			<li>
				<p class="font-bold text-gray-500">
					{#each filteredOutboundProducts as outboundProduct, i}
						{#if outboundProduct.id === Number(params.id)}
							<span class="text-gray-500">
								<span class="hidden md:inline">Outbound Product:</span>
								{i + 1}
							</span>
						{/if}
					{/each}
				</p>
			</li>
		</ul>
		<form method="post" class="flex gap-2">
			<SecondaryBtn
				type={'button'}
				dataTooltip={'Delete Outbound Product'}
				tooltipTitle={'Delete Outbound Product'}
				onclick={handleDeleteOutboundProduct}
			>
				<Trash2 />
			</SecondaryBtn>
		</form>
	</section>
	<main class="flex flex-col gap-4">
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
						<input
							type="text"
							name="value"
							value={outboundProduct?.value}
							placeholder="Value"
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
		<section class=" max-w-sm justify-center rounded-lg bg-gray-900/40 shadow-md">
			{#each outboundProducts as outboundProduct}
				{#if outboundProduct.id === Number(params.id)}
					<section class=" items-center rounded-lg bg-gray-900/40 p-4 shadow-md">
						<h1 class="pb-4 text-center font-bold">Sticker</h1>
						<OutboundProductBarcode {outboundProduct} {outbound} />
					</section>
				{/if}
			{/each}
		</section>
		<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md"></section>
	</main>
</div>
