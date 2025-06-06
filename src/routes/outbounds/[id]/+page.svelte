<script lang="ts">
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { applyAction, enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { Copy, Eye, Printer, QrCode, Search, Sheet, Trash2 } from '@lucide/svelte';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import ChartPieOutboundProducts from '$lib/components/charts/ChartPieOutboundProducts.svelte';
	import jsPDF from 'jspdf';
	import JsBarcode from 'jsbarcode';
	import QRCode from 'qrcode';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';
	import { fade } from 'svelte/transition';

	let { data, form }: PageProps = $props();

	let isUpdatingOutbound = $state(false);
	let isAddingOutboundProduct = $state(false);
	let isAddingBatchOutboundProduct = $state(false);

	const clients = $state(data.clients);
	let outbound = $state(data.outbound);
	const products = $state(data.products);
	const outboundProducts = $state(data.outboundProducts);

	let searchQuery = $state('');
	let loading = $state(false);

	let selectedClientName = $state('');

	let refreshKey = $state<number>(0);

	function updateOutboundNumber(newNumber: string) {
		if (outbound) {
			outbound = {
				id: outbound.id,
				description: outbound.description,
				clientName: outbound.clientName,
				outboundNumber: newNumber,
				createdAt: outbound.createdAt,
				client: outbound.client
			};
			refreshKey++;
		}
	}

	// Initialize selectedClientName after state declaration
	$effect(() => {
		selectedClientName = outbound?.clientName ?? '';
	});

	let productValue = $state(0);
	let productRevenue = $state(0);

	let timeSaved = $state(0);
	let timeSavedPerSerial = $state(0);
	let euroPerMinute = $state(0);
	let outboundProductIds = $state<number[]>([]);

	let limit = $state<number>();
	let limitedOutboundProducts = $state<typeof outboundProducts>([]);

	type QrCodeData = {
		image: string;
		count: number;
	};

	let qrCodeImages = $state<QrCodeData[]>([]);
	let qrCodeLimit = $state<number | undefined>(); // gebruikersinput voor aantal items per QR
	let inboundProductId = $state<number | null>(null);

	let qrModalRef = $state<HTMLDialogElement | null>(null);

	let qrCodeImage = $state<string | null>(null);

	// Initialize filteredOutboundProducts from the initial outboundProducts state
	let filteredOutboundProducts = $state(
		outboundProducts?.filter(
			(product: { outboundId: number }) => product.outboundId === Number(outbound?.id)
		)
	);

	function chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			result.push(array.slice(i, i + chunkSize));
		}
		return result;
	}

	async function generateQRCodeForOutbound() {
		if (!outboundProducts || outboundProducts.length === 0) {
			toast.error('No serial numbers found for this outbound.', toastStyleErr);
			return;
		}

		const allSerials = outboundProducts
			.filter((product) => product.outboundId === outbound?.id)
			.map((product) => product.serialnumber)
			.filter((sn): sn is string => typeof sn === 'string' && sn.trim() !== '');

		if (allSerials.length === 0) {
			toast.error('No serials found for this outbound.', toastStyleErr);
			return;
		}

		const validLimit = Math.max(1, Math.min(500, qrCodeLimit || 100));
		const serialChunks = chunkArray(allSerials, validLimit);

		if (serialChunks.length > 1) {
			toast.success(
				`There are ${allSerials.length} serial numbers. Generating ${serialChunks.length} QR codes (max ${validLimit} per QR).`,
				toastStyleSucc
			);
		}

		qrCodeImages = [];

		for (const chunk of serialChunks) {
			const serialString = chunk.join(', ');
			try {
				const qrCodeData = await QRCode.toDataURL(serialString, {
					color: {
						dark: '#030712',
						light: '#f8fafc'
					}
				});
				qrCodeImages.push({
					image: qrCodeData,
					count: chunk.length
				});
			} catch (error) {
				console.error(
					'Error generating QR code for chunk:',
					error instanceof Error ? error.message : error
				);
				toast.error('Error generating one of the QR codes', toastStyleErr);
			}
		}

		qrModalRef?.showModal();
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
		const labelHeight = 50;

		selectedProducts.forEach((outboundProduct, index: number) => {
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(10);

			doc.text(`Product: ${outboundProduct.product}`, 5, yOffset);
			doc.text(`Serial: ${outboundProduct.serialnumber}`, 5, yOffset + 10);
			doc.text(`Outbound: ${outbound?.outboundNumber || ''}`, 5, yOffset + 20);

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
		});

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

	// Reactive effect for handling form success (updates and moves) and reloading the page
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
		if (!outbound?.id || !outboundProducts) return;

		const inboundForThis = outboundProducts.filter((product) => product.outboundId === outbound.id);

		productValue = inboundForThis.reduce(
			(sum, product) => sum + (parseFloat(product.value ?? '0') || 0),
			0
		);
		productRevenue = parseFloat((inboundForThis.length * 0.1).toFixed(2));
		timeSaved = 30 - 3;
		timeSavedPerSerial =
			inboundForThis.length > 0 ? parseFloat((timeSaved / inboundForThis.length).toFixed(2)) : 0;
		euroPerMinute = inboundForThis.length > 0 ? parseFloat((productRevenue / 3).toFixed(2)) : 0;

		filteredOutboundProducts = inboundForThis.filter((product) => {
			const matchesSearch =
				searchQuery.trim() === '' ||
				product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.status?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		});
	});

	// Reactive effect to limit the number of displayed products
	$effect(() => {
		limitedOutboundProducts = filteredOutboundProducts?.slice(0, limit) || [];
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
</script>

<BackToTop scrollTo="scroll to top" />

{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<span class="loader"></span>
	</div>
{/if}

<div class="container mx-auto px-4 py-4">
	<section
		class="breadcrums text-md mb-4 flex items-center justify-between rounded-lg bg-gray-900/40 p-4 shadow-md"
	>
		<ul class="text-gray-500">
			<li class="font-bold">
				<a href="/outbounds" class="transition-all hover:text-blue-500">
					Outbound:
					{#key refreshKey}
						<span
							transition:fade
							class={`hover:text-blue-500 ${outbound?.outboundNumber === '' ? 'text-[8px] font-normal text-orange-500 italic' : ''}`}
						>
							{outbound?.outboundNumber === ''
								? 'Update Inbound to generate number'
								: outbound?.outboundNumber}
						</span>
					{/key}
				</a>
			</li>
		</ul>
		<div>
			<form
				onsubmit={handleDeleteOutbound}
				method="post"
				action="?/deleteOutbound"
				use:enhance={() => {
					return async ({ result, update }) => {
						try {
							if (result.type === 'failure') {
								if (
									result.data?.issues &&
									Array.isArray(result.data.issues) &&
									result.data.issues.length > 0
								) {
									toast.error(
										result.data.issues
											.map((issue: { message: string }) => issue.message)
											.join(', '),
										toastStyleErr
									);
								} else if (
									result.data?.issues &&
									typeof result.data.issues === 'object' &&
									'message' in result.data.issues
								) {
									toast.error(result.data.issues.message as string, toastStyleErr);
								} else {
									toast.error('Inbound Has Products', toastStyleErr);
								}
							}
							if (result.type === 'success') {
								toast.success('Outbound deleted successfully', toastStyleSucc);
								await invalidateAll();
								await goto('/outbounds');
								window.location.reload();
							}
						} finally {
							setTimeout(() => {
								loading = false;
							}, 3000);
						}
					};
				}}
			>
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
		<section
			class="order-3 grid grid-cols-2 gap-2 rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-4"
		>
			<Stats statsName="VALUE" statsValue={productValue} prefix="€ " />
			<Stats statsName="OLD REV" statsValue={productRevenue} prefix="€ " />
			<Stats statsName="T-SAVED / SN" statsValue={timeSavedPerSerial} suffix=" min" />
			<Stats statsName="EURO / MIN" statsValue={euroPerMinute} prefix="€ " />
		</section>

		<section class="order-1 flex flex-col rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-2">
			<h1 class="flex items-center justify-between pb-4 font-bold">Outbound</h1>
			<form
				class="flex flex-col gap-4"
				action="?/updateOutbound"
				method="post"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
						loading = true;
						try {
							if (result.type === 'failure') {
								if (
									result.data?.issues &&
									Array.isArray(result.data.issues) &&
									result.data.issues.length > 0
								) {
									toast.error(
										result.data.issues
											.map((issue: { message: string }) => issue.message)
											.join(', '),
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
							} else if (result.type === 'success') {
								toast.success('Inbound updated successfully', toastStyleSucc);
								localStorage.setItem('selectedClientName', selectedClientName);
								if (result.data && result.data.inbound) {
									outbound = result.data.inbound;
									refreshKey++;
								}
							} else {
								await applyAction(result);
							}
						} finally {
							setTimeout(() => {
								loading = false;
							}, 1000);
							await invalidateAll();
							window.location.reload();
						}
					};
				}}
			>
				<select
					disabled={isUpdatingOutbound}
					class="select select-neutral w-full text-gray-300"
					name="clientName"
					bind:value={selectedClientName}
				>
					<option value="">-- Select Client --</option>
					{#each clients || [] as client}
						<option value={client.name}>{client.name}</option>
					{/each}
				</select>
				<input
					disabled={isUpdatingOutbound}
					type="text"
					name="description"
					value={outbound?.description}
					class="input input-neutral w-full"
				/>
				<PrimaryBtn disabled={isUpdatingOutbound} type={'submit'} onclick={handleUpdateOutbound}
					>Update</PrimaryBtn
				>
			</form>
		</section>

		<section class="order-2 flex flex-col rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-3">
			<h1 class="flex items-center justify-between pb-4 font-bold">
				Move Batch of Products to Outbound
			</h1>
			<form action="?/moveBatchToOutbound" method="post" class="flex flex-col gap-4">
				<input type="hidden" name="outboundNumber" value={outbound?.outboundNumber} />
				<textarea
					disabled={isAddingBatchOutboundProduct}
					name="batch"
					placeholder="Batch Serialnumbers"
					class="textarea textarea-neutral h-32 w-full"
				></textarea>
				<p class="text-xs text-gray-500">Outbound #: {outbound?.outboundNumber}</p>
				<PrimaryBtn disabled={isAddingBatchOutboundProduct} type="submit" onclick={handleAddBatch}
					>Batch</PrimaryBtn
				>
			</form>
		</section>
		<section
			class="chart-status-section order-5 flex flex-col items-center justify-center rounded-lg bg-gray-900/40 p-4 shadow-md"
		>
			{#if filteredOutboundProducts && filteredOutboundProducts.length > 0}
				<ChartPieOutboundProducts {filteredOutboundProducts} />
			{:else}
				<h1 class="text-300">No Chart Yet...</h1>
			{/if}
		</section>
		<section
			class="bg-950 order-8 flex flex-col items-center justify-center rounded-lg p-4 shadow-md"
		>
			<dialog id="qr_modal" class="modal" bind:this={qrModalRef}>
				<div class="modal-box bg-gray-950 text-white">
					<h3 class="mb-4 text-lg font-bold">QR Codes</h3>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each qrCodeImages as { image, count }, i}
							<div class="flex flex-col items-center gap-2 rounded bg-white/5 p-4">
								<img src={image} alt="QR Code {i + 1}" class="w-32" />
								<span class="text-sm text-gray-300">QR {i + 1} – {count} pcs</span>
							</div>
						{/each}
					</div>
					<div class="modal-action mt-6">
						<form method="dialog">
							<button class="btn">Close</button>
						</form>
					</div>
				</div>
			</dialog>
		</section>
	</main>

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
			<form
				action="?/deleteOutboundProducts"
				method="post"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							// ✅ update de lokale UI state direct
							const deletedIds = Array.isArray(result.data?.deletedIds)
								? result.data.deletedIds
								: (JSON.parse(
										typeof result.data?.deletedIds === 'string' ? result.data.deletedIds : '[]'
									) as number[]);

							// Verwijder lokaal uit state
							if (outboundProducts) {
								// Update the state arrays using array methods instead of reassignment
								outboundProducts.splice(
									0,
									outboundProducts.length,
									...outboundProducts.filter((p) => !deletedIds.includes(p.id))
								);
								filteredOutboundProducts =
									filteredOutboundProducts?.filter((p) => !deletedIds.includes(p.id)) || [];
								limitedOutboundProducts =
									limitedOutboundProducts?.filter((p) => !deletedIds.includes(p.id)) || [];
							}
							outboundProductIds = [];

							toast.success('Deleted selected products', toastStyleSucc);
						} else {
							await applyAction(result);
						}

						await update();
					};
				}}
			>
				<input type="hidden" name="productIds" value={JSON.stringify(outboundProductIds)} />
				<input type="hidden" name="inboundId" value={outbound?.id} />
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
				title="Generate QR Code for Outbound Products"
				onclick={generateQRCodeForOutbound}
				class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
			>
				<QrCode />
			</button>
		</div>
		<div class=" flex items-center justify-center gap-1">
			<input
				type="number"
				id="limit"
				min="1"
				max={filteredOutboundProducts?.length || 1}
				placeholder="Show Qty"
				bind:value={limit}
				class="input input-neutral w-24 rounded-full text-gray-300"
			/>
		</div>
		<div class=" flex items-center justify-center gap-1">
			<input
				id="qrLimit"
				type="number"
				min="1"
				max="500"
				placeholder="QR Qty"
				bind:value={qrCodeLimit}
				class="input input-neutral w-24 rounded-full text-gray-300"
			/>
		</div>

		<form class="relative">
			<input
				bind:value={searchQuery}
				type="text"
				name="search"
				placeholder="Search Products"
				class="input input-neutral w-full rounded-full pl-10 text-gray-300"
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

	<!-- Map Serialnumbers & Delete Section -->
</div>

<style>
	.loader {
		transform: rotateZ(45deg);
		perspective: 1000px;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		color: #e5e7eb;
	}
	.loader:before,
	.loader:after {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: inherit;
		height: inherit;
		border-radius: 50%;
		transform: rotateX(70deg);
		animation: 1s spin linear infinite;
	}
	.loader:after {
		color: #f97316;
		transform: rotateY(70deg);
		animation-delay: 0.4s;
	}

	@keyframes rotate {
		0% {
			transform: translate(-50%, -50%) rotateZ(0deg);
		}
		100% {
			transform: translate(-50%, -50%) rotateZ(360deg);
		}
	}

	@keyframes rotateccw {
		0% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		100% {
			transform: translate(-50%, -50%) rotate(-360deg);
		}
	}

	@keyframes spin {
		0%,
		100% {
			box-shadow: 0.2em 0px 0 0px currentcolor;
		}
		12% {
			box-shadow: 0.2em 0.2em 0 0 currentcolor;
		}
		25% {
			box-shadow: 0 0.2em 0 0px currentcolor;
		}
		37% {
			box-shadow: -0.2em 0.2em 0 0 currentcolor;
		}
		50% {
			box-shadow: -0.2em 0 0 0 currentcolor;
		}
		62% {
			box-shadow: -0.2em -0.2em 0 0 currentcolor;
		}
		75% {
			box-shadow: 0px -0.2em 0 0 currentcolor;
		}
		87% {
			box-shadow: 0.2em -0.2em 0 0 currentcolor;
		}
	}
</style>
