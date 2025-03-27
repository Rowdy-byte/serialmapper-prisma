<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { Copy, Eye, QrCode, RefreshCcw, Search, Sheet, Trash2 } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';

	let { data, form }: PageProps = $props();

	let isUpdatingInbound = $state(false);
	let isAddingInboundProduct = $state(false);
	let isAddingBatchInboundProduct = $state(false);

	const clients = data.clients;
	const inbound = data.inbound;
	const products = data.products;
	const inboundProducts = data.inboundProducts;

	let searchQuery = $state('');

	let productValue = $state(0);
	let productRevenue = $state(0);
	let productStatusIn = $state();
	let productStatusOut = $state();

	let productsCount = $state(0);
	let serialnumbersCount = $state(0);
	let timeSaved = $state(0);
	let euroPerMinute = $state(0);
	let timeSavedPerSerial = $state(0);

	let inboundProductIds = $state<number[]>([]);

	let filteredInboundProducts = $state(
		inboundProducts?.filter((product) => product.inboundId === inbound?.id)
	);

	$effect(() => {});

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
		const worksheet = utils.json_to_sheet(inboundProducts || []);
		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'Inbound Products');
		writeFileXLSX(workbook, `${inbound?.inboundNumber}-products.xlsx`);
	}

	function copySelectedSerialsToClipboard() {
		const selectedSerials = (filteredInboundProducts || [])
			.filter((product) => inboundProductIds.includes(product.id))
			.map((product) => product.serialnumber)
			.join('\n');

		navigator.clipboard
			.writeText(selectedSerials)
			.then(() => {
				toast.success('Copy successfull!');
			})
			.catch((err) => {
				toast.error('Copy error!');
				console.error('Clipboard copy error:', err);
			});
		window.location.reload();
	}

	// Calculate time saved per serial, for showing in the Stats component
	function calculateTimeSavedPerSerial(oldMinutes: number, newMinutes: number, serials: number) {
		return (oldMinutes * 60) / serials - (newMinutes * 60) / serials;
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
			case form?.success:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.success === false:
				toast.error(form?.message, {
					duration: 4000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;

			case form?.success:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.success:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.success === false:
				toast.error(form?.message, {
					duration: 4000,
					style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
				});
				break;
		}

		filteredInboundProducts = inboundProducts?.filter(
			(product) =>
				product.inboundId === inbound?.id &&
				(searchQuery.trim() === '' ||
					product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.status?.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	});

	$effect(() => {
		// Filter inbound products for the current inbound
		const inboundForThis =
			inboundProducts?.filter((product) => product.inboundId === inbound?.id) || [];

		// PRODUCTS: count distinct products (unique product names)
		productsCount = new Set(inboundForThis.map((product) => product.product)).size;

		// SERIALS: total number of inbound products
		serialnumbersCount = inboundForThis.length;

		// Sum the product values
		productValue = inboundForThis.reduce(
			(sum, product) => sum + (parseFloat(product.value ?? '0') || 0),
			0
		);

		// OLD REV: revenue calculated as 0.1 per inbound product
		productRevenue = parseFloat((inboundForThis.length * 0.1).toFixed(2));

		// Count statuses
		productStatusIn = inboundForThis.filter((product) => product.status === 'IN').length;
		productStatusOut = inboundForThis.filter((product) => product.status === 'OUT').length;

		// Define fixed times (in minutes) for the batch process
		const oldTime = 30; // old total time in minutes
		const newTime = 3; // new total time in minutes

		// Total time saved remains constant for the batch
		timeSaved = oldTime - newTime; // 27 minutes

		// Time saved per serial in minutes
		timeSavedPerSerial =
			inboundForThis.length > 0 ? parseFloat((timeSaved / inboundForThis.length).toFixed(2)) : 0;

		// Euro per minute based on the new process time
		euroPerMinute =
			inboundForThis.length > 0 ? parseFloat((productRevenue / newTime).toFixed(2)) : 0;

		// Filter products based on the search query
		filteredInboundProducts = inboundForThis.filter(
			(product) =>
				searchQuery.trim() === '' ||
				product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.status?.toLowerCase().includes(searchQuery.toLowerCase())
		);

		inboundProductIds = inboundForThis.map((product) => product.inboundId);
	});
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto py-4">
	<section class="breadcrums text-md mb-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<ul class="text-gray-500">
			<li class="font-bold">
				<a href="/inbounds" class="transition-all">
					<span class="hover:text-blue-500"> Inbound </span>: {inbound?.inboundNumber}
				</a>
			</li>
		</ul>
	</section>
	<main class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		<section
			class="grid grid-cols-3 gap-2 rounded-lg bg-gray-900 p-4 shadow-md md:grid-cols-3 lg:grid-cols-4"
		>
			<Stats statsName="PRODUCTS" statsValue={productsCount} />
			<Stats statsName="SERIALS" statsValue={serialnumbersCount} />
			<Stats statsName="IN / OUT" statsValue={`${productStatusIn}/${productStatusOut} `} />
			<Stats statsName="VALUE" statsValue={productValue} prefix="€ " />
			<Stats statsName="OLD REV" statsValue={productRevenue} prefix="€ " />
			<Stats statsName="T-SAVED / SN" statsValue={timeSavedPerSerial} suffix=" min" />
			<Stats statsName="EURO / MIN" statsValue={euroPerMinute} prefix="€ " />
		</section>
		<section class="flex flex-col rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Options</h1>

			<div class="flex gap-4">
				<form action="?/mapSerialnumbersToWorksheet" method="post">
					<input hidden type="text" name="inboundId" value={inbound?.id} />
					<button
<<<<<<< HEAD
						class="w-full rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
=======
						class="flex h-11 w-11 items-center justify-center rounded-full border border-orange-500 bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
						data-tooltip="Map Serialnumbers to Worksheet"
						title="Map Serialnumbers to Worksheet"
>>>>>>> development
						onclick={handleMapSerialToWorksheet}
						type="button"
					>
						<Sheet />
					</button>
				</form>
<<<<<<< HEAD
			</div>
			<div class="border-t-1 border-gray-500 pt-4 sm:border-t-0 sm:border-l-1 sm:pt-0 sm:pl-4">
				<h1 class=" pb-4 font-bold">Delete Inbound</h1>
				<form use:enhance method="post" action="?/deleteInbound" class="flex flex-col gap-2">
					<button
						onclick={handleDeleteInbound}
						class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
=======

				<form use:enhance method="post" action="?/deleteInbound">
					<button
						onclick={handleDeleteInbound}
						data-tooltip="Delete Inbound"
						title="Delete Inbound"
						class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
>>>>>>> development
						type="submit"
					>
						<Trash2 />
					</button>
				</form>
			</div>
		</section>
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex items-center justify-between pb-4 font-bold">Inbound</h1>
			<form class="flex flex-col gap-4" method="post">
				<select
					disabled={isUpdatingInbound}
					class=" rounded-md bg-gray-950 p-3 text-sm text-gray-500"
					name="clientName"
				>
					<option value="clientName">{inbound?.clientName}</option>
					{#if clients}
						{#each clients as client}
							<option value={client.name}>{client.name}</option>
						{/each}
					{/if}
				</select>
				<input
					disabled={isUpdatingInbound}
					type="text"
					name="description"
					value={inbound?.description}
					class=" rounded-md bg-gray-950 p-3 text-sm text-gray-500"
				/>

				<fieldset class="rounded-lg border border-gray-500 p-3">
					<legend class="text-sm font-bold text-gray-500">Customs</legend>
					<input
						type="checkbox"
						name="isSubscribed"
						checked={inbound?.isSubscribed}
						value="on"
						class="checkbox checkbox-xs chat-bubble-neutral"
					/>
				</fieldset>
				<button
					disabled={isUpdatingInbound}
					formaction="?/updateInbound"
					onclick={handleUpdateInbound}
					data-tooltip="Update Inbound"
					title="Update Inbound"
					class=" rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					Update Inbound
				</button>
			</form>
		</section>
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Add Single Product to Inbound
			</h1>

			<form class="flex flex-col gap-4" action="?/addInboundProductToInbound" method="post">
				<input hidden type="text" name="inboundId" value={inbound?.id} />
				<select
					disabled={isAddingInboundProduct}
					class="rounded-md bg-gray-950 p-3 text-sm text-gray-500"
					name="product"
				>
					<option value="products">-- Select Product --</option>
					{#if products}
						{#each products as product}
							<option value={product.name}>{product.number}</option>
						{/each}
					{/if}
				</select>
				<input
					type="text"
					name="value"
					placeholder="Value €"
					class="rounded-md bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<textarea
					disabled={isAddingInboundProduct}
					name="serialnumber"
					placeholder="Serialnumber"
					class="rounded-md bg-gray-950 p-3 text-sm text-gray-500"
				></textarea>
				<button
					disabled={isAddingInboundProduct}
					class="w-full rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					onclick={handleAddSingle}
					type="submit"
				>
					Add Single
				</button>
				<section class="flex flex-col gap-4 pt-8">
					<textarea
						disabled={isAddingBatchInboundProduct}
						name="batch"
						placeholder="Batch Serialnumbers"
						class="rounded-lg bg-gray-950 p-3 text-sm text-gray-500"
					></textarea>
					<div class="flex justify-center gap-4">
						<button
							disabled={isAddingBatchInboundProduct}
							formaction="?/addBatchInboundProductToInbound"
							onclick={handleAddBatch}
							class="w-full rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
							type="submit"
						>
							Add Batch
						</button>
						<button
							type="button"
							data-tooltip="Scan Barcode to Single"
							title="Scan Barcode to Single"
							onclick={handleScanQr}
							class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:border-gray-400 hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
						>
							<QrCode />
						</button>
					</div>
				</section>
			</form>
		</section>
	</main>
	<section class="mt-4">
		<section class="mb-4 flex items-center justify-between">
			<form class="relative py-1">
				<input
					bind:value={searchQuery}
					type="text"
					name="search"
					placeholder="Search Products"
					class="w-full rounded-full bg-gray-950 py-2 pr-4 pl-10 text-sm"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
			<div>
				<button
					onclick={copySelectedSerialsToClipboard}
					data-tooltip="Copy selected serialnumbers to clipboard"
					title="Copy selected serialnumbers to clipboard"
					class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					><Copy size="24" strokeWidth="1px" /></button
				>
			</div>
		</section>
		<section class="overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2"></th>
						<th class="border border-gray-500 p-2">Product</th>
						<th class="border border-gray-500 p-2">Serialnumber</th>
						<th class="border border-gray-500 p-2">Value €</th>
						<th class="border border-gray-500 p-2">Status</th>
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if filteredInboundProducts}
						{#each filteredInboundProducts as inboundProduct, i}
							<tr class="hover:bg-orange-500/20">
								<td class="flex justify-between border border-gray-500 p-2">
									<input
										type="checkbox"
										bind:group={inboundProductIds}
										value={inboundProduct.id}
										class="checkbox chat-bubble-neutral checkbox-xs"
									/>{i + 1}
								</td>
								<td class="border border-gray-500 p-2">{inboundProduct.product}</td>
								<td class="border border-gray-500 p-2">{inboundProduct.serialnumber}</td>
								<td class="border border-gray-500 p-2">{inboundProduct.value}</td>
								<td class="border border-gray-500 p-2">{inboundProduct.status}</td>
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
					{/if}
				</tbody>
			</table>
		</section>
		{#if filteredInboundProducts?.length === 0}
			<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No products found.</p>
		{/if}
	</section>
</div>
