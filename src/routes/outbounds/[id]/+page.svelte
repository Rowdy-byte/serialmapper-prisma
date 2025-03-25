<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	import { CircleHelp, Eye, Search } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';

	let { data, form }: PageProps = $props();

	let outboundSectionOpen = $state(false);
	let singleSectionOpen = $state(false);
	let multiSectionOpen = $state(false);
	let deleteSectionOpen = $state(false);

	let isUpdatingOutbound = $state(false);
	let isAddingOutboundProduct = $state(false);
	let isAddingBatchOutboundProduct = $state(false);

	const clients = data.clients;
	const outbound = data.outbound;
	const products = data.products;
	const outboundProducts = data.outboundProducts;

	let searchQuery = $state('');

	console.log(outboundProducts);

	let filteredOutboundProducts = $state(
		outboundProducts?.filter(
			(product: { outboundId: number }) => product.outboundId === Number(outbound?.id)
		)
	);

	$effect(() => {
		filteredOutboundProducts = outboundProducts?.filter(
			(product: { outboundId: number; serialnumber?: string; product?: string }) =>
				product.outboundId === Number(outbound?.id) &&
				(searchQuery.trim() === '' ||
					product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.product?.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	});

	function handleDeleteOutbound(event: Event) {
		if (!confirm('Are you sure you want to delete this outbound?')) {
			event.preventDefault();
			return;
		}

		goto('/outbounds');
	}

	function handleUpdateOutbound(event: Event) {
		if (!confirm('Are you sure you want to update this outbound?')) {
			event.preventDefault();
			return;
		}
	}

	function handleAddSingle(event: Event) {
		if (!confirm('Are you sure you want to add this product to this outbound?')) {
			event.preventDefault();
		}
	}

	function handleAddBatch(event: Event) {
		if (!confirm('Are you sure you want to add this batch to this outbound?')) {
			event.preventDefault();
		}
	}

	function scanBarcodetoSingleTextarea() {}

	function scanBarcodetoBatchTextarea() {}

	function handleScanQr() {
		alert('Buy Pro!');
	}

	function handleMapSerialToWorksheet(event: Event) {
		if (!confirm('Are you sure you want to map the serialnumbers to a worksheet?')) {
			event.preventDefault();
		}
		mapSerialToWorksheet();
	}

	function mapSerialToWorksheet() {
		const worksheet = utils.json_to_sheet(outboundProducts || []);
		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'outbound Products');
		writeFileXLSX(workbook, `${outbound?.outboundNumber}-products.xlsx`);
	}

	if (form?.issues) {
		for (const issue of form.issues) {
			toast.error(issue.message, {
				duration: 3000,
				style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	}

	$effect(() => {
		switch (true) {
			case form?.outboundUpdateSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.duplicateSuccess === false:
				toast.error(form?.message, {
					duration: 4000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;

			case form?.addProductTooutboundSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
			case form?.addBatchTooutboundSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
			case form?.addBatchTooutboundSuccess === false:
				toast.error(form?.message, {
					duration: 4000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;
		}
	});
</script>

<BackToTop scrollTo="scroll to top" />

<section class="breadcrums text-md mb-2 rounded-lg bg-gray-900 p-4 shadow-md">
	<ul class="text-gray-500">
		<li class="font-bold">
			<a href="/outbounds">
				<span class="transition-all hover:text-blue-500">outbound:</span>
				{outbound?.outboundNumber}
			</a>
		</li>
	</ul>
</section>
<main class="flex flex-col gap-2">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="flex items-center justify-between pb-4 font-bold">
			outbound
			<CircleHelp
				class="text-gray-500 transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (outboundSectionOpen = !outboundSectionOpen)}
				size="14"
			/>
		</h1>
		<ul class="pb-4 pl-3 text-xs text-yellow-500" class:hidden={!outboundSectionOpen}>
			<li class="pb-1">
				<p>1. Select the client.</p>
			</li>
			<li class="pb-1">
				<p>2. Enter outbound description.</p>
			</li>
			<li class="pb-1">
				<p>3. Click on Add.</p>
			</li>
			<li class="pb-1">
				<p>4. outbound number is generated on the details page. Follow next step.</p>
			</li>
		</ul>

		<form class="flex flex-col gap-4" method="post">
			<select
				disabled={isUpdatingOutbound}
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				name="clientName"
			>
				<option value="clientName">{outbound?.clientName}</option>
				<!-- fetch data from db with sveltekit load function -->
				{#if clients}
					{#each clients as client}
						<option value={client.name}>{client.name}</option>
					{/each}
				{/if}
			</select>
			<input
				disabled={isUpdatingOutbound}
				type="text"
				name="description"
				value={outbound?.description}
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
			/>

			<button
				disabled={isUpdatingOutbound}
				formaction="?/updateOutbound"
				onclick={handleUpdateOutbound}
				class="rounded-md bg-green-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit"
			>
				Update
			</button>
		</form>
	</section>

	<!-- Nieuwe sectie: Move Inbound Product to Outbound -->
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="flex items-center justify-between pb-4 font-bold">
			Move Inbound Product to Outbound
			<CircleHelp
				class="text-gray-500 transition-all hover:cursor-pointer hover:text-yellow-500"
				size="14"
			/>
		</h1>
		<form
			class="flex flex-col gap-4"
			action="?/moveInboundProductToOutbound"
			method="post"
			use:enhance
		>
			<div>
				<label for="serial" class="text-sm">Inbound Product Serial:</label>
				<input
					id="serial"
					type="text"
					name="serial"
					placeholder="Enter serial"
					required
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
			</div>
			<div>
				<label for="outboundNumber" class="text-sm">Outbound Number:</label>
				<input
					id="outboundNumber"
					type="text"
					name="outboundNumber"
					placeholder="Enter outbound number"
					required
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
			</div>
			<button
				type="submit"
				class="rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
			>
				Move Product
			</button>
		</form>
	</section>

	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="flex items-center justify-between pb-4 font-bold">
			Add single Product to outbound
			<CircleHelp
				class="text-gray-500 transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (singleSectionOpen = !singleSectionOpen)}
				size="14"
			/>
		</h1>
		<ul class="pb-4 pl-3 text-xs text-yellow-500" class:hidden={!singleSectionOpen}>
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
		<form class="flex flex-col gap-4" action="?/addoutboundProductTooutbound" method="post">
			<input hidden type="text" name="outboundId" value={outbound?.id} />
			<select
				disabled={isAddingOutboundProduct}
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				name="product"
			>
				<option value="products">-- Select Product --</option>
				{#if products}
					{#each products as product}
						<option value={product.name}>{product.number}</option>
					{/each}
				{/if}
			</select>
			<textarea
				disabled={isAddingOutboundProduct}
				name="serialnumber"
				placeholder="Serialnumber"
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
			></textarea>
			<button
				disabled={isAddingOutboundProduct}
				class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				onclick={handleAddSingle}
				type="submit"
			>
				Add Single
			</button>
			<section class="flex max-w-sm flex-col gap-4 pt-8">
				<div>
					<h1 class="flex items-center justify-between font-bold">
						Add multiple Products to outbound
						<CircleHelp
							class="text-gray-500 transition-all hover:cursor-pointer hover:text-yellow-500"
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
					disabled={isAddingBatchOutboundProduct}
					name="batch"
					placeholder="Batch Serialnumbers "
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				></textarea>
				<div class="flex gap-4">
					<button
						disabled={isAddingBatchOutboundProduct}
						formaction="?/addBatchoutboundProductTooutbound"
						onclick={handleAddBatch}
						class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit"
					>
						Add Batch
					</button>
					<button
						type="button"
						onclick={handleScanQr}
						class="w-full rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					>
						Scan QR code
					</button>
				</div>
			</section>
		</form>
	</section>

	<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<section class="flex items-center justify-between">
			<h1 class="text-center font-bold">List</h1>
			<!-- Search filter -->
			<form class="relative py-1">
				<input
					bind:value={searchQuery}
					type="text"
					name="search"
					placeholder="Search Products"
					class="w-full rounded border bg-gray-950 py-2 pr-4 pl-10 text-sm"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
		</section>
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
				{#if filteredOutboundProducts}
					{#each filteredOutboundProducts as outboundProduct, i}
						<tr class="text-sm hover:bg-slate-600">
							<td class="border border-gray-500 p-2">{i + 1}</td>
							<td class="border border-gray-500 p-2">{outboundProduct.product}</td>
							<td class="border border-gray-500 p-2">{outboundProduct.serialnumber}</td>
							<td class="border border-gray-500 p-2">
								<a
									class="text-blue-500 underline"
									href={`/outbounds/${outbound?.id}/outbound-product/${outboundProduct.id}`}
									title="View Product Details"
								>
									<Eye size="16" />
								</a>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
		{#if filteredOutboundProducts?.length === 0}
			<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No products found.</p>
		{/if}
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class="font-bold">Map Serialnumbers to Worksheet</h1>
		<form class="flex flex-col gap-4" action="?/mapSerialnumbersToWorksheet" method="post">
			<input hidden type="text" name="outboundId" value={outbound?.id} />
			<button
				class="rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				onclick={handleMapSerialToWorksheet}
				type="button"
			>
				Map
			</button>
		</form>
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">
			Delete outbound
			<CircleHelp
				class="transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (deleteSectionOpen = !deleteSectionOpen)}
				size="14"
			/>
		</h1>
		<form use:enhance method="post" class="flex gap-2">
			<button
				formaction="?/deleteoutbound"
				onclick={handleDeleteOutbound}
				class="rounded-md bg-red-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit"
			>
				Delete
			</button>
			<div>
				<ul class="pt-4 pl-3 text-xs text-yellow-500" class:hidden={!deleteSectionOpen}>
					<li class="pb-1">
						<p class="text-sm">This will permanently delete this outbound!</p>
					</li>
				</ul>
			</div>
		</form>
	</section>
</main>
