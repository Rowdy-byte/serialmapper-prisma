<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	import { CircleHelp, Eye } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	import { utils, writeFileXLSX } from 'xlsx';

	let { data, form }: PageProps = $props();

	let singleSectionOpen = $state(false);
	let multiSectionOpen = $state(false);
	let deleteSectionOpen = $state(false);

	let isUpdatingInbound = $state(false);
	let isAddingInboundProduct = $state(false);
	let isAddingBatchInboundProduct = $state(false);

	const clients = data.clients;
	const inbound = data.inbound;
	const products = data.products;
	const inboundProducts = data.inboundProducts;

	const filteredInboundProducts = inboundProducts.filter(
		(product) => product.inboundId === inbound?.id
	);

	function handleDeleteInbound(event: Event) {
		if (!confirm('Are you sure you want to delete this inbound?')) {
			event.preventDefault();
			return;
		}

		goto('/inbounds');
	}

	function handleUpdateInbound(event: Event) {
		if (!confirm('Are you sure you want to update this inbound?')) {
			event.preventDefault();
			return;
		}
	}

	function handleAddSingle(event: Event) {
		if (!confirm('Are you sure you want to add this product to this inbound?')) {
			event.preventDefault();
		}
	}

	function handleAddBatch(event: Event) {
		if (!confirm('Are you sure you want to add this batch to this inbound?')) {
			event.preventDefault();
		}
	}

	function scanBarcodetoSingleTextarea() {}

	function scanBarcodetoBatchTextarea() {}

	function handleMapSerialToWorksheet(event: Event) {
		if (!confirm('Are you sure you want to map the serialnumbers to a worksheet?')) {
			event.preventDefault();
		}
		mapSerialToWorksheet();
	}

	function mapSerialToWorksheet() {
		const worksheet = utils.json_to_sheet(inboundProducts);
		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'Inbound Products');
		writeFileXLSX(workbook, `${inbound?.inboundNumber}-products.xlsx`);
	}

	$effect(() => {
		switch (true) {
			case form?.inboundUpdateSuccess:
				toast.success(form?.message, {
					duration: 3000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.duplicateSuccess === false:
				toast.error(form?.message, {
					duration: 3000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;

			case form?.addProductToInboundSuccess:
				toast.success(form?.message, {
					duration: 3000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
			case form?.addBatchToInboundSuccess:
				toast.success(form?.message, {
					duration: 3000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
			case form?.addBatchToInboundSuccess === false:
				toast.error(form?.message, {
					duration: 3000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;
		}
	});
</script>

<section class="breadcrums text-md mb-2 rounded-lg bg-gray-900 p-4 shadow-md">
	<ul class="text-gray-500">
		<li class="font-bold">Inbound: {inbound?.inboundNumber}</li>
	</ul>
</section>
<main class="flex flex-col gap-2">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Inbound</h1>
		<form
			class="flex flex-col gap-4"
			method="post"
			use:enhance={() => {
				isUpdatingInbound = true;

				return async ({ update }) => {
					await update();
					await invalidate('inbound');
					isUpdatingInbound = false;
				};
			}}
		>
			<select
				disabled={isUpdatingInbound}
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
				name="clientName"
			>
				<option value="clientName">{inbound?.clientName}</option>
				<!-- fetch data from db with sveltekit loadfunction -->
				{#each clients as client}
					<option value={client.name}>{client.name}</option>
				{/each}
			</select>
			<input
				disabled={isUpdatingInbound}
				type="text"
				name="description"
				value={inbound?.description}
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
			/>

			<button
				disabled={isUpdatingInbound}
				formaction="?/updateInbound"
				onclick={handleUpdateInbound}
				class="rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit"
			>
				Update
			</button>
		</form>
	</section>
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="flex items-center justify-between pb-4 font-bold">
			Add single Product to Inbound
			<CircleHelp
				class="transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (singleSectionOpen = !singleSectionOpen)}
				size="14"
			/>
		</h1>
		<ul class=" pb-4 pl-3 text-xs text-yellow-500" class:hidden={!singleSectionOpen}>
			<li class="pb-1">
				<p>1. Select the product you want to add.</p>
			</li>
			<li class="pb-1">
				<p>2. Enter the serialnumber of the product.</p>
			</li>
			<li class="pb-1">
				<p>3. Click on Add.</p>
			</li>
		</ul>
		<form class="flex flex-col gap-4" action="?/addInboundProductToInbound" method="post">
			<input hidden type="text" name="inboundId" value={inbound?.id} />
			<select
				disabled={isAddingInboundProduct}
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
				name="product"
			>
				<option value="products">-- Select Product --</option>
				{#each products as product}
					<option value={product.name}>{product.number}</option>
				{/each}
			</select>
			<textarea
				disabled={isAddingInboundProduct}
				name="serialnumber"
				placeholder="Serialnumber"
				class="rounded-md border
			border-gray-300 p-3 text-sm text-gray-800"
			></textarea>

			<button
				disabled={isAddingInboundProduct}
				class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				onclick={handleAddSingle}
				type="submit"
			>
				Add Single
			</button>

			<section class="flex max-w-sm flex-col gap-4 pt-8">
				<div>
					<h1 class="flex items-center justify-between font-bold">
						Add multiple Products to Inbound
						<CircleHelp
							class="transition-all hover:cursor-pointer hover:text-yellow-500"
							onclick={() => (multiSectionOpen = !multiSectionOpen)}
							size="14"
						/>
					</h1>

					<ul class="pt-4 pl-3 text-xs text-yellow-500" class:hidden={!multiSectionOpen}>
						<li class="pb-1">
							<p>1. Select the product you want to add.</p>
						</li>
						<li class="pb-1">
							<p>2. Enter the serialnumbers of the product, separated by a space.</p>
						</li>
						<li class="pb-1">
							<p>3. Click on Add Batch.</p>
						</li>
					</ul>
				</div>

				<textarea
					disabled={isAddingBatchInboundProduct}
					name="batch"
					placeholder="Batch Serialnumbers "
					class="rounded-md border
	border-gray-300 p-3 text-sm text-gray-800"
				></textarea>
				<div class="flex gap-4">
					<button
						disabled={isAddingBatchInboundProduct}
						formaction="?/addBatchInboundProductToInbound"
						onclick={handleAddBatch}
						class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit"
					>
						Add Batch
					</button>
					<button
						class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						>Scan QR code</button
					>
				</div>
			</section>
		</form>
	</section>

	<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class="font-bold">Products in this Inbound</h1>

		<table class="w-full text-left text-sm">
			<thead>
				<tr class="text-left text-sm text-gray-500">
					<th class="border border-gray-500 p-2"></th>
					<th class="border border-gray-500 p-2">Product</th>
					<th class="border border-gray-500 p-2">Serialnumber</th>
					<th class="border border-gray-500 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredInboundProducts as inboundProduct, i}
					<tr class="text-sm hover:bg-slate-600">
						<td class="border border-gray-500 p-2">{i + 1}</td>
						<td class="border border-gray-500 p-2">{inboundProduct.product}</td>
						<td class="border border-gray-500 p-2">{inboundProduct.serialnumber}</td>
						<td class="border border-gray-500 p-2">
							<a
								class="text-blue-500 underline"
								href={`/inbounds/${inbound?.id}/inbound-product/${inboundProduct.id}`}
								title="View Product Details"
							>
								<Eye size="16" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if inboundProducts.filter((product) => product.inboundId === inbound?.id).length === 0}
			<p class="mt-2 border border-gray-300 p-2 text-sm">No products found.</p>
		{/if}
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class=" font-bold">Map Serialnumbers to Worksheet</h1>

		<form class="flex flex-col gap-4" action="?/mapSerialnumbersToWorksheet" method="post">
			<input hidden type="text" name="inboundId" value={inbound?.id} />

			<button
				class="rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				onclick={handleMapSerialToWorksheet}
				type="button">Map</button
			>
		</form>
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">
			Delete Inbound<CircleHelp
				class="transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (deleteSectionOpen = !deleteSectionOpen)}
				size="14"
			/>
		</h1>
		<form use:enhance method="post" class="flex gap-2">
			<button
				formaction="?/deleteInbound"
				onclick={handleDeleteInbound}
				class=" rounded-md bg-red-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Delete</button
			>
			<div>
				<ul class="pt-4 pl-3 text-xs text-yellow-500" class:hidden={!deleteSectionOpen}>
					<li class="pb-1">
						<p class="text-sm">This will permanently delete this Inbound!</p>
					</li>
				</ul>
			</div>
		</form>
	</section>
</main>
