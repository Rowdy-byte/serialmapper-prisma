<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { CircleHelp, Eye, Search } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';

	let { data, form }: PageProps = $props();

	let inboundsProducts = data.outboundProducts;

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

	let productValue = $state(0);
	let productRevenue = $state(0);
	let productStatusIn = $state();
	let productStatusOut = $state();
	let productsCount = $state<number>(0);
	let serialnumbersCount = $state<number>(0);

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
		utils.book_append_sheet(workbook, worksheet, 'Outbound Products');
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

			// case form?.addBatchToOutboundSuccess:
			// 	toast.success(form?.message, {
			// 		duration: 4000,
			// 		style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
			// 	});
			// 	window.location.reload();
			// 	break;

			// case form?.addBatchToOutboundSuccess === false:
			// 	toast.error(form?.message, {
			// 		duration: 4000,
			// 		style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			// 	});
			// 	break;
		}

		productValue = (
			outboundProducts?.filter((product) => product.outboundId === outbound?.id) || []
		).reduce((sum, product) => sum + (parseFloat((product as any).value ?? '0') || 0), 0);

		productRevenue = parseFloat(
			(
				(outboundProducts?.filter((product) => product.outboundId === outbound?.id) || []).length *
				0.1
			).toFixed(2)
		);

		// Status counts: number of products with status 'IN' and 'OUT'
	});
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto px-4 py-4">
	<!-- Breadcrumbs -->
	<section class="breadcrums text-md mb-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<ul class="text-gray-500">
			<li class="font-bold">
				<a href="/outbounds" class="transition-all hover:text-blue-500">
					Outbound: {outbound?.outboundNumber}
				</a>
			</li>
		</ul>
	</section>

	<!-- Main Grid Layout -->
	<main class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Section 1: Outbound Form -->
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Outbound
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
					<p>4. Outbound number is generated on the details page. Follow next step.</p>
				</li>
			</ul>
			<form class="flex flex-col gap-4" method="post">
				<select
					disabled={isUpdatingOutbound}
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
					name="clientName"
				>
					<option value="clientName">{outbound?.clientName}</option>
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
		<section class="grid grid-cols-2 gap-2 rounded-lg bg-gray-900 p-4 shadow-md">
			<Stats statsName="Products" statsValue={outboundProducts?.length ?? 0} />
			<Stats statsName="Serialnumbers" statsValue={outboundProducts?.length ?? 0} />
			<Stats statsName="Value" statsValue={productValue} prefix="€" />
			<Stats statsName="Revenue" statsValue={productRevenue} prefix="€ " />

			<!-- <Stats statsName="Value" statsValue={outboundValue} /> -->
		</section>

		<!-- Section 2: Move Inbound Product to Outbound -->
		<section class="rounded-lg bg-gray-900 p-4 shadow-md">
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
				<input
					id="serial"
					type="text"
					name="serial"
					placeholder="Enter Serialnumber"
					required
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>

				<input
					id="outboundNumber"
					type="text"
					name="outboundNumber"
					placeholder="Enter Outbound Number"
					required
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>

				<button
					type="submit"
					class="rounded-md bg-blue-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				>
					Move Product
				</button>
			</form>
		</section>

		<section class="grid gap-4 rounded-lg bg-gray-900 p-4 shadow-md sm:grid-cols-2">
			<div>
				<h1 class="pb-4 font-bold">Map to Worksheet</h1>
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
			</div>
			<div
				class="max-h-48 border-t-1 border-gray-500 pt-4 sm:border-t-0 sm:border-l-1 sm:pt-0 sm:pl-4"
			>
				<h1 class="flex items-center justify-between pb-4 font-bold">Delete Outbound</h1>
				<form use:enhance method="post" class="flex flex-col gap-4">
					<button
						formaction="?/deleteOutbound"
						onclick={handleDeleteOutbound}
						class="rounded-md bg-red-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit"
					>
						Delete
					</button>
				</form>
			</div>
		</section>
	</main>

	<!-- List Section with Search Filter -->
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
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if filteredOutboundProducts}
						{#each filteredOutboundProducts as outboundProduct, i}
							<tr class="hover:bg-slate-600">
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
		</div>
		{#if filteredOutboundProducts?.length === 0}
			<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No products found.</p>
		{/if}
	</section>

	<!-- Map Serialnumbers & Delete Section -->
</div>
