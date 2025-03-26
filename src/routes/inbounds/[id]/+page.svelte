<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { CircleHelp, Eye, Search } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import InboundSectionOpen from '$lib/components/SectionIsOpen.svelte';

	let { data, form }: PageProps = $props();

	let SectionOpen = $state(false);
	let singleSectionOpen = $state(false);
	let multiSectionOpen = $state(false);

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

	let productsCount = $state<number>(0);
	let serialnumbersCount = $state<number>(0);

	let inboundProductId = $state();

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
			case form?.inboundUpdateSuccess:
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

			case form?.addProductToInboundSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.addBatchToInboundSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;

			case form?.addBatchToInboundSuccess === false:
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

		$effect(() => {
			inboundProductId = inboundProducts?.map((product) => product.inboundId);
			productsCount =
				inboundProducts?.filter((product) => product.inboundId === inbound?.id).length || 0;
			serialnumbersCount =
				inboundProducts?.filter((product) => product.inboundId === inbound?.id).length || 0;

			productValue = (
				inboundProducts?.filter((product) => product.inboundId === inbound?.id) || []
			).reduce((sum, product) => sum + (parseFloat(product.value ?? '0') || 0), 0);

			productRevenue = parseFloat(
				(
					(inboundProducts?.filter((product) => product.inboundId === inbound?.id) || []).length *
					0.1
				).toFixed(2)
			);

			productStatusIn =
				inboundProducts?.filter(
					(product) => product.inboundId === inbound?.id && product.status === 'IN'
				).length || 0;

			productStatusOut =
				inboundProducts?.filter(
					(product) => product.inboundId === inbound?.id && product.status === 'OUT'
				).length || 0;
		});
	});
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto px-4 py-4">
	<section class="breadcrums text-md mb-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<ul class="text-gray-500">
			<li class="font-bold">
				<a href="/inbounds" class="transition-all">
					<span class="hover:text-blue-500"> Inbound </span>: {inbound?.inboundNumber}
				</a>
			</li>
		</ul>
	</section>
	<main class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<section
			class="grid grid-cols-3 gap-2 rounded-lg bg-gray-900 p-4 shadow-md md:grid-cols-4 lg:grid-cols-5"
		>
			<Stats statsName="PRODUCTS" statsValue={productsCount} />
			<Stats statsName="SERIALS" statsValue={serialnumbersCount} />
			<Stats statsName="VALUE" statsValue={productValue} prefix="€ " />
			<Stats statsName="REVENUE" statsValue={productRevenue} prefix="€ " />
			<Stats statsName="IN/OUT" statsValue={`${productStatusIn}/${productStatusOut} `} />
		</section>
		<section class="grid gap-4 rounded-lg bg-gray-900 p-4 shadow-md sm:grid-cols-2">
			<div>
				<h1 class="pb-4 font-bold">Map to Worksheet</h1>
				<form
					class="flex w-full flex-col gap-4"
					action="?/mapSerialnumbersToWorksheet"
					method="post"
				>
					<input hidden type="text" name="inboundId" value={inbound?.id} />
					<button
						class="w-full rounded-md bg-gray-500 p-3 text-sm text-white hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						onclick={handleMapSerialToWorksheet}
						type="button"
					>
						Map
					</button>
				</form>
			</div>
			<div class="border-t-1 border-gray-500 pt-4 sm:border-t-0 sm:border-l-1 sm:pt-0 sm:pl-4">
				<h1 class=" pb-4 font-bold">Delete Inbound</h1>
				<form use:enhance method="post" class="flex flex-col gap-2">
					<button
						formaction="?/deleteInbound"
						onclick={handleDeleteInbound}
						class="rounded-md bg-gray-500 p-3 text-sm text-white hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit"
					>
						Delete
					</button>
				</form>
			</div>
		</section>
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex items-center justify-between pb-4 font-bold">Inbound</h1>
			<form class="flex flex-col gap-4" method="post">
				<select
					disabled={isUpdatingInbound}
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
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
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>

				<fieldset class="rounded-lg border border-gray-500 p-3">
					<legend class="text-sm text-gray-500">Customs</legend>
					<input type="checkbox" name="isSubscribed" checked={inbound?.isSubscribed} value="on" />
				</fieldset>
				<button
					disabled={isUpdatingInbound}
					formaction="?/updateInbound"
					onclick={handleUpdateInbound}
					class="rounded-md bg-gray-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					Update
				</button>
			</form>
		</section>
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Add Single Product to Inbound
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
			<form class="flex flex-col gap-4" action="?/addInboundProductToInbound" method="post">
				<input hidden type="text" name="inboundId" value={inbound?.id} />
				<select
					disabled={isAddingInboundProduct}
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
				<input
					type="text"
					name="value"
					placeholder="Value €"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>

				<textarea
					disabled={isAddingInboundProduct}
					name="serialnumber"
					placeholder="Serialnumber"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				></textarea>
				<button
					disabled={isAddingInboundProduct}
					class="w-full rounded-md bg-gray-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					onclick={handleAddSingle}
					type="submit"
				>
					Add Single
				</button>
				<section class="flex flex-col gap-4 pt-8">
					<div>
						<h1 class="flex items-center justify-between font-bold">
							Add Multiple Products to Inbound
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
						placeholder="Batch Serialnumbers"
						class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					></textarea>
					<div class="flex gap-4">
						<button
							disabled={isAddingBatchInboundProduct}
							formaction="?/addBatchInboundProductToInbound"
							onclick={handleAddBatch}
							class="w-full rounded-md bg-gray-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
							type="submit"
						>
							Add Batch
						</button>
						<button
							type="button"
							onclick={handleScanQr}
							class="w-full rounded-md bg-gray-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						>
							Scan QR code
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
					class="w-full rounded border bg-gray-950 py-2 pr-4 pl-10 text-sm"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
		</section>
		<div class="overflow-x-auto">
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
								<td class="border border-gray-500 p-2">{i + 1}</td>
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
		</div>
		{#if filteredInboundProducts?.length === 0}
			<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No products found.</p>
		{/if}
	</section>
</div>
