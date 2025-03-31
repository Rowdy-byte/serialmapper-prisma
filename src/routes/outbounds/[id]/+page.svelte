<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { applyAction, enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { Copy, Eye, Printer, QrCode, Search, Sheet, Trash2 } from '@lucide/svelte';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import ChartPieStatus from '$lib/components/charts/ChartPieStatus.svelte';
	import ChartPieOutboundProducts from '$lib/components/charts/ChartPieOutboundProducts.svelte';
	import jsPDF from 'jspdf';
	import JsBarcode from 'jsbarcode';
	import QRCode from 'qrcode';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let isUpdatingOutbound = $state(false);
	let isAddingOutboundProduct = $state(false);
	let isAddingBatchOutboundProduct = $state(false);

	const clients = $state(data.clients);
	const outbound = $state(data.outbound);
	const products = $state(data.products);
	const outboundProducts = $state(data.outboundProducts);

	let searchQuery = $state('');

	let productValue = $state(0);
	let productRevenue = $state(0);

	let timeSaved = $state(0);
	let timeSavedPerSerial = $state(0);
	let euroPerMinute = $state(0);
	let outboundProductIds = $state<number[]>([]);

	let limit = $state(100);
	let limitedOutboundProducts = $state<typeof outboundProducts>([]);

	let qrCodeImage = $state<string | null>(null);

	let filteredOutboundProducts = $state(
		outboundProducts?.filter(
			(product: { outboundId: number }) => product.outboundId === Number(outbound?.id)
		)
	);

	async function generateQRCodeForInbound() {
		if (!outboundProducts || outboundProducts.length === 0) {
			toast.error('No serial numbers found for this inbound.');
			return;
		}

		const serialNumbers = outboundProducts.map((product) => product.serialnumber).join(' ');
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
		const selectedProducts = (filteredOutboundProducts || []).filter((product) =>
			outboundProductIds.includes(product.id)
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

		selectedProducts.forEach(
			(
				outboundProduct: { product: string; serialnumber: string; barcode?: string },
				index: number
			) => {
				// Apply the same font settings
				doc.setFont('helvetica', 'bold');
				doc.setFontSize(10);

				// Text formatting
				doc.text(`Product: ${outboundProduct.product}`, 5, yOffset);
				doc.text(`Serial: ${outboundProduct.serialnumber}`, 5, yOffset + 10);
				doc.text(`Inbound: ${outbound?.outboundNumber || ''}`, 5, yOffset + 20);

				// Generate barcode
				const barcodeCanvas = document.createElement('canvas');
				JsBarcode(barcodeCanvas, outboundProduct.barcode || outboundProduct.serialnumber || '', {
					format: 'CODE128',
					displayValue: false,
					width: 1.2,
					height: 40
				});

				const barcodeImage = barcodeCanvas.toDataURL('image/png');
				doc.addImage(barcodeImage, 'PNG', 5, yOffset + 25, 80, 20);

				yOffset += labelHeight;

				if (yOffset > 270 && index !== selectedProducts.length - 1) {
					doc.addPage();
					yOffset = 10;
				}
			}
		);

		doc.save(`bulk_stickers_${outbound?.outboundNumber}.pdf`);
	}

	function copySelectedSerialsToClipboard() {
		const selectedSerials = (filteredOutboundProducts || [])
			.filter((product) => outboundProductIds.includes(product.id))
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

	function toggleSelectAll() {
		if (
			limitedOutboundProducts &&
			limitedOutboundProducts.length > 0 &&
			limitedOutboundProducts.every((p) => outboundProductIds.includes(p.id))
		) {
			outboundProductIds = [];
		} else {
			outboundProductIds =
				limitedOutboundProducts?.map((product) => product.id ?? 0).filter((id) => id !== 0) || [];
		}
	}

	function toggleSelection(id: number) {
		if (outboundProductIds.includes(id)) {
			outboundProductIds = outboundProductIds.filter((productId) => productId !== id);
		} else {
			outboundProductIds = [...outboundProductIds, id];
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

		outboundProductIds = inboundForThis.map((product) => product.outboundId);
	});

	$effect(() => {
		limitedOutboundProducts = filteredOutboundProducts?.slice(0, limit) || [];
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
					Outbound: <span class="">{outbound?.outboundNumber}</span>
				</a>
			</li>
		</ul>
		<div>
			<form onsubmit={handleDeleteOutbound} action="?/deleteOutbound" use:enhance>
				<SecondaryBtn
					dataTooltip={'Delete Outbound'}
					tooltipTitle={'Delete Outbound'}
					type={'submit'}
				>
					<Trash2 />
				</SecondaryBtn>
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
			<form
				class="flex flex-col gap-4"
				action="?/updateOutbound"
				method="post"
				use:enhance={() => {
					return async ({ result, update }) => {
						console.log(result);
						if (result.type === 'failure') {
							if (
								result.data?.issues &&
								Array.isArray(result.data.issues) &&
								result.data.issues.length > 0
							) {
								toast.error(
									result.data.issues.map((issue: { message: string }) => issue.message).join(', '),
									toastStyleErr
								);
							} else if (
								result.data?.issues &&
								typeof result.data.issues === 'object' &&
								'message' in result.data.issues
							) {
								toast.error(result.data.issues.message as string, toastStyleErr);
							} else {
								toast.error('An error occurred');
							}
						}
						if (result.type === 'success') {
							console.log(result);
							toast.success('Inbound Updated Successfully', toastStyleSucc);
							await invalidateAll();
						} else {
							await applyAction(result);
						}
					};
				}}
			>
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
				<PrimaryBtn disabled={isUpdatingOutbound} type={'submit'} onclick={handleUpdateOutbound}
					>Update</PrimaryBtn
				>
			</form>
		</section>

		<section class="order-5 flex flex-col rounded-lg bg-gray-900 p-4 shadow-md lg:order-3">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Move Batch of Products to Outbound
			</h1>
			<form action="?/moveBatchToOutbound" method="post" class="flex flex-col gap-4">
				<input type="hidden" name="outboundNumber" value={outbound?.outboundNumber} />
				<textarea
					disabled={isAddingBatchOutboundProduct}
					name="batch"
					placeholder="Batch Serialnumbers"
					class="rounded-lg bg-gray-950 p-3 text-sm text-gray-500"
				></textarea>
				<p class="text-xs text-gray-500">Outbound #: {outbound?.outboundNumber}</p>
				<PrimaryBtn disabled={isAddingBatchOutboundProduct} type="submit" onclick={handleAddBatch}
					>Batch</PrimaryBtn
				>
			</form>
		</section>
		<section
			class="chart-status-section order-5 flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4 shadow-md"
		>
			<ChartPieOutboundProducts {filteredOutboundProducts} />
		</section>
	</main>

	<section class="mt-4">
		<section class="mb-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
			<div class="flex gap-2">
				<button
					onclick={copySelectedSerialsToClipboard}
					data-tooltip="Copy selected serialnumbers to clipboard"
					title="Copy selected serialnumbers to clipboard"
					class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					><Copy size="24" strokeWidth="2px" /></button
				>
				<button
					onclick={printSelectedLabels}
					data-tooltip="Print selected labels"
					title="Print selected labels"
					class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
					><Printer size="24" strokeWidth="2px" /></button
				>
				<form action="?/deleteOutboundProducts" method="post" use:enhance>
					<input type="hidden" name="productIds" value={JSON.stringify(outboundProductIds)} />
					<button
						data-tooltip="Delete selected products"
						title="Delete selected products"
						type="submit"
						disabled={outboundProductIds.length === 0}
						class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all
						"
					>
						<Trash2 size="24" strokeWidth="2px" />
					</button>
				</form>

				<form action="?/mapSerialnumbersToWorksheet" method="post">
					<input hidden type="text" name="inboundId" value={outbound?.id} />
					<button
						data-tooltip="Map selected serialnumbers to worksheet"
						title="Map selected serialnumbers to worksheet"
						class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
						onclick={handleMapSerialToWorksheet}
						type="button"
					>
						<Sheet />
					</button>
				</form>
				<button
					data-tooltip="Generate QR"
					title="Generate QR Code for Inbound Products"
					onclick={generateQRCodeForInbound}
					class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
				>
					<QrCode />
				</button>
			</div>
			<div class="mb-4 flex flex-col items-center justify-center gap-1">
				<label for="limit" class="text-sm text-gray-400">Show Amount:</label>
				<input
					type="number"
					id="limit"
					min="1"
					max={filteredOutboundProducts?.length || 1}
					bind:value={limit}
					class="w-24 rounded bg-gray-950 px-2 py-1 text-sm text-gray-200"
				/>
			</div>

			<form class="relative">
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
		</section>

		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2">
							<input
								type="checkbox"
								onchange={toggleSelectAll}
								checked={(limitedOutboundProducts ?? []).length > 0 &&
									limitedOutboundProducts?.every((p) => outboundProductIds.includes(p.id))}
								class="checkbox chat-bubble-neutral checkbox-xs ml-1 border-0"
							/>
						</th>
						<th class="border border-gray-500 p-2">Product</th>
						<th class="border border-gray-500 p-2">Serialnumber</th>
						<th class="border border-gray-500 p-2">Value</th>
						<th class="rounded-tr-lg border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if limitedOutboundProducts && limitedOutboundProducts.length > 0}
						{#each limitedOutboundProducts as outboundProduct, i (outboundProduct.id)}
							<tr class="hover:bg-slate-600">
								<td class="table-cell-flex justify-evenly space-x-2 border border-gray-500 p-2">
									<input
										type="checkbox"
										onchange={() => toggleSelection(outboundProduct.id)}
										checked={outboundProductIds.includes(outboundProduct.id)}
										class="checkbox chat-bubble-neutral checkbox-xs ml-1 border-0"
									/>
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
