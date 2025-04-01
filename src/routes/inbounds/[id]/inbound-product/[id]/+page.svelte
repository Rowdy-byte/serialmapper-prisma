<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { MoveRight, Trash2 } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import InboundProductBarcode from '$lib/components/barcodes/InboundProductBarcode.svelte';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';

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

<div class="container mx-auto py-4">
	<section
		class="text-md mb-4 flex items-center justify-between rounded-lg bg-gray-900/40 p-4 shadow-md"
	>
		<ul class="flex items-center gap-2">
			<li>
				<a href={`/inbounds/${inboundId}`} class="font-bold text-gray-500 hover:text-blue-500">
					<span class="hidden font-bold md:inline"
						><span class="text-gray-500">Inbound:</span>
					</span>
					{inbound?.inboundNumber}</a
				>
			</li>
			<li class="text-gray-500">
				<MoveRight size="24" class="px-1" />
			</li>
			<li>
				<p class="font-bold text-gray-500">
					{#each filteredInboundProducts as inboundProduct, i}
						{#if inboundProduct.id === Number(params.id)}
							<span class="text-gray-500">
								<span class="hidden md:inline"><span class="text-gray-500">Product: </span> </span>
								{i + 1}
							</span>
						{/if}
					{/each}
				</p>
			</li>
		</ul>
		<div>
			<form method="post" action="?/deleteInboundProduct" class="flex gap-2">
				<SecondaryBtn
					onclick={handleDeleteInboundProduct}
					dataTooltip={'Delete Inbound'}
					tooltipTitle={'Delete Inbound'}
					type={'submit'}
				>
					<Trash2 />
				</SecondaryBtn>
			</form>
		</div>
	</section>
	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Inbound Product</h1>
			{#each inboundProducts as inboundProduct}
				{#if inboundProduct.id === Number(params.id)}
					<form class="flex flex-col gap-4" action="?/updateInboundProduct" method="post">
						<input
							type="text"
							name="product"
							value={inboundProduct?.product}
							placeholder="Product"
							class="input input-neutral w-full"
						/>
						<input
							type="text"
							name="serialnumber"
							value={inboundProduct?.serialnumber}
							placeholder="Serialnumber"
							class="input input-neutral w-full"
						/>
						<input
							type="text"
							name="value"
							value={inboundProduct?.value}
							placeholder="Value"
							class="input input-neutral w-full"
						/>
						<PrimaryBtn type={'submit'} onclick={handleUpdateInboundProduct}>Update</PrimaryBtn>
					</form>
				{/if}
			{/each}
		</section>
		<section class=" max-w-sm justify-center rounded-lg bg-gray-900/40 shadow-md">
			{#each inboundProducts as inboundProduct}
				{#if inboundProduct.id === Number(params.id)}
					<section class=" items-center rounded-lg bg-gray-900/40 p-4 shadow-md">
						<h1 class="pb-4 text-center font-bold">Sticker</h1>
						<InboundProductBarcode {inboundProduct} {inbound} />
					</section>
				{/if}
			{/each}
		</section>

		<section class="flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>
