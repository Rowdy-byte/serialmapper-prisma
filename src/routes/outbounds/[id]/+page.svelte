<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { Eye, Search, Sheet, Trash2 } from '@lucide/svelte';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import ChartPie from '$lib/components/charts/ChartPieInboundProducts.svelte';
	import ChartPieStatus from '$lib/components/charts/ChartPieStatus.svelte';
	import ChartBarOutboundProducts from '$lib/components/charts/ChartPieOutboundProducts.svelte';
	import ChartPieOutboundProducts from '$lib/components/charts/ChartPieOutboundProducts.svelte';

	let { data, form }: PageProps = $props();

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

	let timeSaved = $state(0);
	let timeSavedPerSerial = $state(0);
	let euroPerMinute = $state(0);

	let inboundProductIds = $state<number[]>([]);

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
		invalidate('outbound');
	}

	function handleMoveToOutbound(event: Event) {
		if (!confirm('Are you sure you want to move this product to this outbound?')) {
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
			case form?.movedBatchSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
			case form?.movedSingleSuccess:
				toast.success(form?.message, {
					duration: 4000,
					style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
				});
				window.location.reload();
				break;
		}
	});

	$effect(() => {
		const inboundForThis =
			outboundProducts?.filter((product) => product.outboundId === outbound?.id) || [];

		productValue = inboundForThis.reduce(
			(sum, product) => sum + (parseFloat(product.value ?? '0') || 0),
			0
		);

		productRevenue = parseFloat((inboundForThis.length * 0.1).toFixed(2));

		const oldTime = 30; // old total time in minutes
		const newTime = 3; // new total time in minutes

		timeSaved = oldTime - newTime; // 27 minutes

		timeSavedPerSerial =
			inboundForThis.length > 0 ? parseFloat((timeSaved / inboundForThis.length).toFixed(2)) : 0;

		euroPerMinute =
			inboundForThis.length > 0 ? parseFloat((productRevenue / newTime).toFixed(2)) : 0;

		filteredOutboundProducts = inboundForThis.filter(
			(product) =>
				searchQuery.trim() === '' ||
				product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.status?.toLowerCase().includes(searchQuery.toLowerCase())
		);

		inboundProductIds = inboundForThis.map((product) => product.outboundId);
	});
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto px-4 py-4">
	<section
		class="breadcrums text-md mb-4 flex items-center justify-between rounded-lg bg-gray-900 p-4 shadow-md"
	>
		<ul class="text-gray-500">
			<li class="font-bold">
				<a href="/outbounds" class="transition-all hover:text-blue-500">
					Outbound: {outbound?.outboundNumber}
				</a>
			</li>
		</ul>
		<div>
			<form use:enhance method="post" action="?/deleteInbound">
				<button
					onclick={handleDeleteOutbound}
					data-tooltip="Delete Inbound"
					title="Delete Inbound"
					class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					<Trash2 />
				</button>
			</form>
		</div>
	</section>
	<main class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		<section class="order-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-900 p-4 shadow-md lg:order-4">
			<Stats statsName="VALUE" statsValue={productValue} prefix="€ " />
			<Stats statsName="OLD REV" statsValue={productRevenue} prefix="€ " />
			<Stats statsName="T-SAVED / SN" statsValue={timeSavedPerSerial} suffix=" min" />
			<Stats statsName="EURO / MIN" statsValue={euroPerMinute} prefix="€ " />
		</section>

		<section class="order-3 flex flex-col rounded-lg bg-gray-900 p-4 shadow-md lg:order-2">
			<h1 class="flex items-center justify-between pb-4 font-bold">Outbound</h1>
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
					class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					Update
				</button>
			</form>
		</section>
		<section class="order-4 rounded-lg bg-gray-900 p-4 shadow-md lg:order-3">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Move Inbound Product to Outbound
			</h1>
			<form
				class="flex flex-col gap-4"
				action="?/moveInboundProductToOutbound"
				method="post"
				use:enhance
			>
				<input
					id="outboundNumber"
					type="text"
					name="outboundNumber"
					placeholder="Enter Outbound Number"
					required
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<input
					id="serial"
					type="text"
					name="serial"
					placeholder="Enter Serialnumber"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<button
					type="submit"
					onclick={handleMoveToOutbound}
					class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
				>
					Move
				</button>
				<textarea
					disabled={isAddingBatchOutboundProduct}
					name="batch"
					placeholder="Batch Serialnumbers"
					class="rounded-lg bg-gray-950 p-3 text-sm text-gray-500"
				></textarea>
				<button
					type="submit"
					formaction="?/moveBatchToOutbound"
					onclick={handleMoveToOutbound}
					class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
				>
					Move Batch
				</button>
			</form>
		</section>
		<section
			class="chart-status-section order-5 flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4 shadow-md"
		>
			<ChartPieOutboundProducts {filteredOutboundProducts} />
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
			<form action="?/mapSerialnumbersToWorksheet" method="post">
				<input hidden type="text" name="inboundId" value={outbound?.id} />
				<button
					class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					data-tooltip="Map Serialnumbers to Worksheet"
					title="Map Serialnumbers to Worksheet"
					onclick={handleMapSerialToWorksheet}
					type="button"
				>
					<Sheet />
				</button>
			</form>
		</section>

		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="rounded-tl-lg border border-gray-500 p-2"></th>
						<th class="border border-gray-500 p-2">Product</th>
						<th class="border border-gray-500 p-2">Serialnumber</th>
						<th class="border border-gray-500 p-2">Value</th>
						<th class="rounded-tr-lg border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if filteredOutboundProducts}
						{#each filteredOutboundProducts as outboundProduct, i (outboundProduct.id)}
							<tr class="hover:bg-slate-600">
								<td
									class="border border-gray-500 p-2 {i === filteredOutboundProducts.length - 1
										? 'rounded-bl-lg'
										: ''}"
								>
									{i + 1}
								</td>
								<td class="border border-gray-500 p-2">{outboundProduct.product}</td>
								<td class="border border-gray-500 p-2">{outboundProduct.serialnumber}</td>
								<td class="border border-gray-500 p-2">{outboundProduct.value}</td>
								<td
									class="border border-gray-500 p-2 {i === filteredOutboundProducts.length - 1
										? 'rounded-br-lg'
										: ''}"
								>
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
