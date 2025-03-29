<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { Copy, Eye, Printer, QrCode, ScanQrCode, Search, Sheet, Trash2 } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import ChartPieInboundProducts from '$lib/components/charts/ChartPieInboundProducts.svelte';
	import ChartPieStatus from '$lib/components/charts/ChartPieStatus.svelte';
	import jsPDF from 'jspdf';
	import JsBarcode from 'jsbarcode';
	import QRCode from 'qrcode';

	let { data, form }: PageProps = $props();

	let isUpdatingInbound = $state(false);
	let isAddingInboundProduct = $state(false);
	let isAddingBatchInboundProduct = $state(false);

	const clients = data.clients;
	const inbound = data.inbound;
	const products = data.products;
	const inboundProducts = data.inboundProducts;

	const inboundProduct =
		data.inboundProducts?.map((product) => (product.inboundId === inbound?.id ? product : null)) ||
		[];

	let searchQuery = $state('');

	let productValue = $state(0);
	let productRevenue = $state(0);
	let productStatusIn = $state();
	let productStatusOut = $state();

	let timeSaved = $state(0);
	let euroPerMinute = $state(0);
	let timeSavedPerSerial = $state(0);

	let inboundProductIds = $state<number[]>([]);

	let qrCodeImage = $state(null);

	async function generateQRCodeForInbound() {
		if (!inboundProducts || inboundProducts.length === 0) {
			toast.error('No serial numbers found for this inbound.');
			return;
		}

		const serialNumbers = inboundProducts.map((product) => product.serialnumber).join(' ');
		try {
			const qrCodeData = await QRCode.toDataURL(serialNumbers, {
				color: {
					dark: '#030712', // Oranje (Foreground)
					light: '#f8fafc' // Donkergrijs (Background)
				}
			});
			qrCodeImage = qrCodeData; // Update de variabele voor weergave
		} catch (error) {
			console.error('Error generating QR code:', error);
			toast.error('Error generating QR code');
		}
	}

	function printSelectedLabels() {
		const selectedProducts = (filteredInboundProducts || []).filter((product) =>
			inboundProductIds.includes(product.id)
		);

		if (selectedProducts.length === 0) {
			toast.error('Select at least one product to print labels.');
			return;
		}

		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4'
		});

		let yOffset = 10;
		const labelHeight = 50; // Adjust to ensure proper spacing between labels

		selectedProducts.forEach((inboundProduct, index) => {
			// Apply the same font settings
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(10);

			// Text formatting
			doc.text(`Product: ${inboundProduct.product}`, 5, yOffset);
			doc.text(`Serial: ${inboundProduct.serialnumber}`, 5, yOffset + 10);
			doc.text(`Inbound: ${inbound?.inboundNumber || ''}`, 5, yOffset + 20);

			// Generate barcode
			const barcodeCanvas = document.createElement('canvas');
			JsBarcode(barcodeCanvas, inboundProduct.barcode || inboundProduct.serialnumber || '', {
				format: 'CODE128',
				displayValue: false,
				width: 1.2,
				height: 40
			});

			// Add barcode image
			const barcodeImage = barcodeCanvas.toDataURL('image/png');
			doc.addImage(barcodeImage, 'PNG', 5, yOffset + 25, 80, 20);

			// Move to the next label position
			yOffset += labelHeight;

			// If the labels reach the page limit, create a new page
			if (yOffset > 270 && index !== selectedProducts.length - 1) {
				doc.addPage();
				yOffset = 10;
			}
		});

		// Save the bulk labels PDF
		doc.save(`bulk_stickers_${inbound?.inboundNumber}.pdf`);
	}

	let filteredInboundProducts = $state(
		inboundProducts?.filter((product) => product.inboundId === inbound?.id)
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

	function calculateTimeSavedPerSerial(oldMinutes: number, newMinutes: number, serials: number) {
		return (oldMinutes * 60) / serials - (newMinutes * 60) / serials;
	}

	function toggleSelectAll() {
		if (inboundProductIds.length === filteredInboundProducts?.length) {
			inboundProductIds = [];
		} else {
			inboundProductIds =
				filteredInboundProducts?.map((product) => product.id ?? 0).filter((id) => id !== 0) || [];
		}
	}

	function toggleSelection(id: number) {
		if (inboundProductIds.includes(id)) {
			inboundProductIds = inboundProductIds.filter((productId) => productId !== id);
		} else {
			inboundProductIds = [...inboundProductIds, id];
		}
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
	});

	$effect(() => {
		const lowerCaseQuery = searchQuery.trim().toLowerCase();

		filteredInboundProducts = inboundProducts?.filter(
			(product) =>
				product.inboundId === inbound?.id &&
				(lowerCaseQuery === '' ||
					Object.values({
						serialnumber: product.serialnumber,
						product: product.product,
						status: product.status
					}).some((value) => value?.toLowerCase().includes(lowerCaseQuery)))
		);
	});

	$effect(() => {
		const inboundForThis =
			inboundProducts?.filter((product) => product.inboundId === inbound?.id) || [];

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
				product.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.value?.toString().includes(searchQuery.toLowerCase())
		);

		// inboundProductIds = inboundForThis.map((product) => product.inboundId);
	});
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto py-4">
	<section
		class="breadcrums text-md mb-4 flex items-center justify-between rounded-lg bg-gray-900 p-4 shadow-md"
	>
		<ul class="text-gray-500">
			<li class="text-center">
				<a href="/inbounds" class="font-bold transition-all">
					<span class="hover:text-blue-500"> Inbound </span>: {inbound?.inboundNumber}
				</a>
			</li>
		</ul>

		<div class="flex items-center gap-4">
			<button
				onclick={generateQRCodeForInbound}
				class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
			>
				<QrCode />
			</button>
			<form use:enhance method="post" action="?/deleteInbound">
				<button
					onclick={handleDeleteInbound}
					data-tooltip="Delete Inbound"
					title="Delete Inbound"
					class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					<Trash2 />
				</button>
			</form>
			<div class="flex items-center gap-4">
				<section>
					{#if qrCodeImage}
						<section class="">
							<img
								src={qrCodeImage}
								alt="QR Code for Inbound Products"
								class="mx-auto w-20 rounded-lg"
							/>
						</section>
					{/if}
				</section>
			</div>
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
			<h1 class="flex items-center justify-between pb-4 font-bold">Inbound</h1>
			<form class="flex flex-col gap-4" method="post" use:enhance>
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

				<fieldset class="rounded-lg border border-gray-500 bg-gray-950 p-3">
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
		<section class="order-4 rounded-lg bg-gray-900 p-4 shadow-md lg:order-3">
			<section class="rounded-lg bg-gray-900 shadow-md">
				<h1 class="flex items-center justify-between pb-4 font-bold">Add Product to Inbound</h1>

				<form
					class="flex flex-col gap-4"
					action="?/addInboundProductToInbound"
					use:enhance
					method="post"
				>
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
						placeholder="Enter One Serialnumber"
						class="rounded-md bg-gray-950 p-3 text-sm text-gray-500"
					></textarea>
					<button
						disabled={isAddingInboundProduct}
						class="w-full rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
						onclick={handleAddSingle}
						type="submit"
					>
						Add One
					</button>
					<section class="flex flex-col gap-4 pt-8">
						<textarea
							disabled={isAddingBatchInboundProduct}
							name="batch"
							placeholder="Paste or Enter Batch Serialnumbers"
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
								data-tooltip="Scan qrcode"
								title="Scan Barcode to Single"
								onclick={handleScanQr}
								class="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:border-gray-400 hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
							>
								<ScanQrCode />
							</button>
						</div>
					</section>
				</form>
			</section>
		</section>
		<section
			class="chart-status-section order-6 flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4 shadow-md"
		>
			<ChartPieInboundProducts {filteredInboundProducts} />
		</section>
		<section
			class="chart-status-section order-7 flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4 shadow-md"
		>
			<ChartPieStatus {productStatusIn} {productStatusOut} />
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
			<div class="flex gap-2">
				<button
					onclick={copySelectedSerialsToClipboard}
					data-tooltip="Copy selected serialnumbers to clipboard"
					title="Copy selected serialnumbers to clipboard"
					class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					><Copy size="24" strokeWidth="2px" /></button
				>
				<button
					onclick={printSelectedLabels}
					data-tooltip="Print selected labels"
					title="Copy selected serialnumbers to clipboard"
					class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					><Printer size="24" strokeWidth="2px" /></button
				>
				<form action="?/deleteInboundProducts" use:enhance method="post">
					<input type="hidden" name="productIds" value={JSON.stringify(inboundProductIds)} />
					<button
						type="submit"
						disabled={inboundProductIds.length === 0}
						class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					>
						<Trash2 size="24" strokeWidth="2px" />
					</button>
				</form>

				<form action="?/mapSerialnumbersToWorksheet" method="post" use:enhance>
					<input hidden type="text" name="inboundId" value={inbound?.id} /><button
						data-tooltip="Map selected serialnumbers to worksheet"
						title="Copy selected serialnumbers to clipboard"
						class="flex w-full rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
						onclick={handleMapSerialToWorksheet}
						type="button"
					>
						<Sheet />
					</button>
				</form>
			</div>
		</section>

		<section class="order-5 overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2">
							<input
								type="checkbox"
								onchange={toggleSelectAll}
								checked={inboundProductIds.length === (filteredInboundProducts?.length || 0)}
								class="checkbox chat-bubble-neutral checkbox-xs ml-1 border-0"
							/>
						</th>
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
								<td class="table-cell-flex justify-evenly space-x-2 border border-gray-500 p-2">
									<input
										type="checkbox"
										onchange={() => toggleSelection(inboundProduct.id)}
										checked={inboundProductIds.includes(inboundProduct.id)}
										class="checkbox chat-bubble-neutral checkbox-xs ml-1 border-0"
									/>
									{i + 1}
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
