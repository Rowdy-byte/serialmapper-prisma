<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';
	import type { PageProps } from './$types';
	import {
		Copy,
		Eye,
		Printer,
		QrCode,
		ScanQrCode,
		Search,
		Sheet,
		Trash2,
		Upload
	} from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import { utils, writeFileXLSX } from 'xlsx';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import Stats from '$lib/components/statics/Stats.svelte';
	import ChartPieInboundProducts from '$lib/components/charts/ChartPieInboundProducts.svelte';
	import ChartPieStatus from '$lib/components/charts/ChartPieStatus.svelte';
	import jsPDF from 'jspdf';
	import JsBarcode from 'jsbarcode';
	import QRCode from 'qrcode';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import QrScanner from '$lib/components/barcodes/QrScanner.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import type { Html5QrcodeCameraScanConfig, Html5QrcodeResult } from 'html5-qrcode';

	let scannedResults = $state('');
	let scanning = $state(false);
	let html5QrCode: Html5Qrcode | undefined = $state();
	let cameras = $state<Array<{ id: string; label: string }>>([]);
	let selectedCameraId = $state<string | null>(null);

	let { data }: PageProps = $props();

	let isUpdatingInbound = $state(false);
	let isAddingInboundProduct = $state(false);
	let isAddingBatchInboundProduct = $state(false);
	let loading = $state(false);

	let clients = $state(data.clients);
	let inbound = $state(data.inbound);
	let products = $state(data.products);
	let inboundProducts = $state(data.inboundProducts);

	let refreshKey = $state<number>(0);

	function updateInboundNumber(newNumber: string) {
		if (inbound) {
			inbound = {
				id: inbound.id,
				description: inbound.description,
				clientName: inbound.clientName,
				inboundNumber: newNumber,
				isSubscribed: inbound.isSubscribed,
				createdAt: inbound.createdAt,
				clientId: inbound.clientId
			};
			refreshKey++;
		}
	}

	let searchQuery = $state('');

	let productValue = $state(0);
	let productRevenue = $state(0);
	let productStatusIn = $state();
	let productStatusOut = $state();

	let timeSaved = $state(0);
	let euroPerMinute = $state(0);
	let timeSavedPerSerial = $state(0);
	let inboundProductIds = $state<number[]>([]);

	let limit = $state<number>() as undefined | number;
	let limitedInboundProducts = $state<typeof inboundProducts>([]);

	type QrCodeData = {
		image: string;
		count: number;
	};

	let qrCodeImages = $state<QrCodeData[]>([]);
	let qrCodeLimit = $state<number | undefined>(); // gebruikersinput voor aantal items per QR
	let inboundProductId = $state<number | null>(null);

	let qrModalRef = $state<HTMLDialogElement | null>(null);

	let selectedSerials = $state<string>('');

	let selectedClientName = $state('');

	// Initialize selectedClientName after state declaration
	$effect(() => {
		selectedClientName = inbound?.clientName ?? '';
	});

	// Haal client naam uit localStorage bij laden
	$effect(() => {
		const saved = localStorage.getItem('selectedClientName');
		if (saved) selectedClientName = saved;
	});

	// Sla nieuwe client naam op na wijziging
	$effect(() => {
		if (selectedClientName) {
			localStorage.setItem('selectedClientName', selectedClientName);
		}
	});

	function chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			result.push(array.slice(i, i + chunkSize));
		}
		return result;
	}

	async function generateQRCodeForInbound() {
		if (!inboundProducts || inboundProducts.length === 0) {
			toast.error('No serial numbers found for this inbound.', toastStyleErr);
			return;
		}

		const allSerials = inboundProducts
			.filter((product) => product.inboundId === inbound?.id)
			.map((product) => product.serialnumber)
			.filter((sn): sn is string => typeof sn === 'string' && sn.trim() !== '');

		if (allSerials.length === 0) {
			toast.error('No serials found for this inbound.', toastStyleErr);
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

	const inboundProduct =
		data.inboundProducts?.map((product) => (product.inboundId === inbound?.id ? product : null)) ||
		[];

	function printSelectedLabels() {
		const selectedProducts = (filteredInboundProducts || []).filter((product) =>
			inboundProductIds.includes(product.id)
		);

		if (selectedProducts.length === 0) {
			toast.error('Select at least one product to print labels.', toastStyleErr);
			return;
		}

		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4'
		});

		let yOffset = 10;
		const labelHeight = 50;

		selectedProducts.forEach((inboundProduct, index) => {
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(10);

			doc.text(`Product: ${inboundProduct.product}`, 5, yOffset);
			doc.text(`Serial: ${inboundProduct.serialnumber}`, 5, yOffset + 10);
			doc.text(`Inbound: ${inbound?.inboundNumber || ''}`, 5, yOffset + 20);

			const barcodeCanvas = document.createElement('canvas');
			JsBarcode(barcodeCanvas, inboundProduct.barcode || inboundProduct.serialnumber || '', {
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

		doc.save(`bulk_stickers_${inbound?.inboundNumber}.pdf`);
	}

	let filteredInboundProducts = $state<typeof inboundProducts>([]);

	$effect(() => {
		filteredInboundProducts =
			inboundProducts?.filter((product) => product.inboundId === inbound?.id) || [];
	});

	function handleDeleteInbound(event: Event) {
		if (!confirm('Are you sure you want to delete this inbound?')) {
			event.preventDefault();
			return;
		}
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
		selectedSerials = (filteredInboundProducts || [])
			.filter((product) => inboundProductIds.includes(product.id))
			.map((product) => product.serialnumber)
			.join('\n');

		navigator.clipboard
			.writeText(selectedSerials)
			.then(() => {
				toast.success('Copy successfull!', toastStyleSucc);
			})
			.catch((err) => {
				toast.error('Copy error!', toastStyleErr);
				console.error('Clipboard copy error:', err);
			});
		window.location.reload();
	}

	function calculateTimeSavedPerSerial(oldMinutes: number, newMinutes: number, serials: number) {
		return (oldMinutes * 60) / serials - (newMinutes * 60) / serials;
	}

	function toggleSelectAll() {
		if (
			limitedInboundProducts &&
			limitedInboundProducts.length > 0 &&
			limitedInboundProducts.every((p) => inboundProductIds.includes(p.id))
		) {
			inboundProductIds = [];
		} else {
			inboundProductIds =
				limitedInboundProducts?.map((product) => product.id ?? 0).filter((id) => id !== 0) || [];
		}
	}

	function toggleSelection(id: number) {
		if (inboundProductIds.includes(id)) {
			inboundProductIds = inboundProductIds.filter((productId) => productId !== id);
		} else {
			inboundProductIds = [...inboundProductIds, id];
		}
	}

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

	onMount(async () => {
		try {
			const devices = await Html5Qrcode.getCameras();
			cameras = devices;
			if (devices.length > 0) {
				selectedCameraId = devices[0].id;
			}
		} catch (err) {
			console.error('Camera ophalen faalde:', err);
		}
	});

	async function startScanner() {
		if (!selectedCameraId) return;

		html5QrCode = new Html5Qrcode('reader');
		const config: Html5QrcodeCameraScanConfig = {
			fps: 10,
			qrbox: { width: 250, height: 250 }
		};

		try {
			await html5QrCode.start(
				{ deviceId: { exact: selectedCameraId } },
				config,
				(decodedText: string, decodedResult: Html5QrcodeResult) => {
					if (!scannedResults.split(/[\s,\n]+/).includes(decodedText.trim())) {
						scannedResults +=
							scannedResults.trim().length > 0 ? '\n' + decodedText.trim() : decodedText.trim();
					}
				},
				(errorMessage: string) => {
					console.warn(errorMessage);
				}
			);
			scanning = true;
		} catch (err) {
			console.error('Start scanner faalde:', err);
		}
	}

	async function stopScanner() {
		if (html5QrCode && scanning) {
			await html5QrCode.stop();
			await html5QrCode.clear();
			scanning = false;
		}
	}

	onDestroy(() => {
		stopScanner();
	});

	$effect(() => {
		const inboundForThis =
			inboundProducts?.filter((product) => product.inboundId === inbound?.id) || [];

		productValue = inboundForThis.reduce(
			(sum, product) => sum + (parseFloat(product.value ?? '0') || 0),
			0
		);

		productRevenue = parseFloat((inboundForThis.length * 0.1).toFixed(2));

		productStatusIn = inboundForThis.filter((product) => product.status === 'IN').length;
		productStatusOut = inboundForThis.filter((product) => product.status === 'OUT').length;

		const oldTime = 30;
		const newTime = 3;

		timeSaved = oldTime - newTime;

		timeSavedPerSerial =
			inboundForThis.length > 0
				? parseFloat(calculateTimeSavedPerSerial(30, 3, inboundForThis.length).toFixed(2))
				: 0;

		euroPerMinute =
			inboundForThis.length > 0 ? parseFloat((productRevenue / newTime).toFixed(2)) : 0;

		filteredInboundProducts = inboundForThis.filter(
			(product) =>
				searchQuery.trim() === '' ||
				product.serialnumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.value?.toString().includes(searchQuery.toLowerCase())
		);
	});

	$effect(() => {
		// Convert limit to number and ensure it's a positive number
		const numLimit = typeof limit === 'number' && limit > 0 ? limit : 10;
		limitedInboundProducts = filteredInboundProducts?.slice(0, numLimit) || [];
	});
</script>

<BackToTop scrollTo="scroll to top" />
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<span class="loader"></span>
	</div>
{/if}

<div class="container mx-auto py-4">
	<section
		class="breadcrums text-md mb-4 flex items-center justify-between rounded-lg bg-gray-900/40 p-4 shadow-md"
	>
		<ul class="text-gray-500">
			<li class="text-center">
				<a href="/inbounds" class="font-bold transition-all">
					<span class={`hover:text-blue-500 `}> Inbound: </span>
					{#key refreshKey}
						<span
							transition:fade
							class={`hover:text-blue-500 ${inbound?.inboundNumber === '' ? 'text-[8px] font-normal text-orange-500 italic' : ''}`}
						>
							{inbound?.inboundNumber === ''
								? 'Update Inbound to generate number'
								: inbound?.inboundNumber}
						</span>
					{/key}
				</a>
			</li>
		</ul>
		<div class="flex items-center gap-2">
			<form
				method="post"
				onsubmit={handleDeleteInbound}
				action="?/deleteInbound"
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
								console.log(result);
								toast.success('Inbound deleted successfully', toastStyleSucc);
								goto('/inbounds');
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
					dataTooltip={'Delete Inbound'}
					tooltipTitle={'Delete Inbound'}
					type={'submit'}
				>
					<Trash2 />
				</SecondaryBtn>
			</form>
			<div class="flex items-center gap-4"></div>
		</div>
	</section>
	<main class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		<section class="order-1 flex flex-col rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-2">
			<h1 class="flex items-center justify-between pb-4 font-bold text-gray-300">Inbound</h1>
			<form
				class="flex flex-col gap-4"
				method="post"
				onsubmit={handleUpdateInbound}
				action="?/updateInbound"
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
									inbound = result.data.inbound;
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
					disabled={isUpdatingInbound}
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
					disabled={isUpdatingInbound}
					type="text"
					name="description"
					value={inbound?.description}
					class="input input-neutral w-full text-gray-300"
				/>

				<fieldset class=" flex items-center rounded-lg bg-[#1d232a] p-4">
					<legend class="text-sm text-gray-300">Customs</legend>
					<input
						type="checkbox"
						name="isSubscribed"
						checked={inbound?.isSubscribed}
						value="on"
						class="checkbox checkbox-xs chat-bubble-neutral"
					/>
				</fieldset>
				<PrimaryBtn disabled={isUpdatingInbound} type={'submit'}>Update Inbound</PrimaryBtn>
			</form>
		</section>
		<section class="order-2 rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-3">
			<section class="rounded-lg bg-gray-900/0 shadow-md">
				<h1 class="flex items-center justify-between pb-4 font-bold text-gray-300">
					Add Product to Inbound
				</h1>
				<form
					class="flex flex-col gap-4"
					action="?/addInboundProductToInbound"
					enctype="multipart/form-data"
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
									// Zorg ervoor dat de server de bijgewerkte inbound teruggeeft
									if (result.data && result.data.inbound) {
										inbound = result.data.inbound;
										// Verhoog de refreshKey om de key-block geforceerd te her-renderen
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
							}
						};
					}}
				>
					<input hidden type="text" name="inboundId" value={inbound?.id} />
					<!-- <input hidden type="text" name="inboundNumber" value={inbound?.inboundNumber} /> -->
					<select
						disabled={isAddingInboundProduct}
						class="select select-neutral w-full text-gray-300"
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
						class="input input-neutral w-full text-gray-300"
					/>

					<textarea
						disabled={isAddingBatchInboundProduct}
						bind:value={scannedResults}
						name="batch"
						placeholder="Paste or Enter Batch Serialnumbers (space separated)"
						class="textarea textarea-neutral h-24 w-full"
					></textarea>
					<div>
						<PrimaryBtn
							disabled={isAddingBatchInboundProduct}
							type={'submit'}
							formaction="?/addBatchInboundProductToInbound"
							onclick={handleAddBatch}
						>
							Add Batch
						</PrimaryBtn>
					</div>

					<div class="scanner-ui">
						{#if cameras.length > 0}
							<label
								for="camera-select"
								class="flex items-center justify-between pb-4 font-bold text-gray-300"
								>Choose Camera:</label
							>
							<select
								id="camera-select"
								bind:value={selectedCameraId}
								disabled={scanning}
								class="select select-neutral mb-4"
							>
								{#each cameras as cam}
									<option value={cam.id}>{cam.label || 'Camera without name'}</option>
								{/each}
							</select>
						{:else}
							<p>No camera found or no permission.</p>
						{/if}

						<div id="reader" class="mx-auto w-full max-w-md rounded border"></div>

						<div class="controls mt-4 text-center">
							{#if !scanning}
								<button onclick={startScanner} class="btn btn-neutral">Start scanner</button>
							{:else}
								<button onclick={stopScanner} class="btn btn-neutral">Stop scanner</button>
							{/if}
						</div>
					</div>
				</form>
			</section>
		</section>

		<section
			class="order-3 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 text-gray-300 shadow-md"
		>
			<h1 class="flex pb-4 font-bold text-gray-300">Upload from Excel</h1>
			<form
				action="?/uploadExcelInboundProducts"
				enctype="multipart/form-data"
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
								toast.error(
									result.data?.message ? String(result.data.message) : 'An unknown error occurred',
									toastStyleErr
								);
							}
						}
						if (result.type === 'success') {
							console.log(result);
							const message =
								typeof result.data?.message === 'string'
									? result.data.message
									: 'Upload successful';

							// Update the local state with new data if available
							if (result.data?.newProducts && Array.isArray(result.data.newProducts)) {
								inboundProducts = [...(inboundProducts || []), ...result.data.newProducts];
								// Force refresh the filtered products
								filteredInboundProducts = inboundProducts.filter(
									(product) => product.inboundId === inbound?.id
								);
								// Update the limited display
								limitedInboundProducts = filteredInboundProducts.slice(0, limit);
							}

							toast.success(message, toastStyleSucc);
							await invalidateAll();
						} else {
							await applyAction(result);
						}
						await update();
					};
				}}
			>
				<div class="">
					<input
						class="file-input file-input-neutral mb-4 rounded-full text-gray-300"
						type="file"
						name="excel"
						accept=".xlsx"
					/>
				</div>
				<div>
					<SecondaryBtn
						disabled={isAddingBatchInboundProduct}
						type={'submit'}
						dataTooltip={'Upload with Excel'}
						tooltipTitle={'Upload with Excel'}
					>
						<Upload />
					</SecondaryBtn>
				</div>
			</form>
		</section>
		<section
			class="order-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-900/40 p-4 shadow-md lg:order-4"
		>
			<Stats statsName="VALUE" statsValue={productValue} prefix="€ " />
			<Stats statsName="OLD REV" statsValue={productRevenue} prefix="€ " />
			<Stats statsName="T-SAVED / SN" statsValue={timeSavedPerSerial} suffix=" min" />
			<Stats statsName="EURO / MIN" statsValue={euroPerMinute} prefix="€ " />
		</section>
		<section
			class="chart-status-section order-6 flex flex-col items-center justify-center rounded-lg bg-gray-900/40 p-4 shadow-md"
		>
			{#if filteredInboundProducts && filteredInboundProducts.length > 0}
				<ChartPieInboundProducts {filteredInboundProducts} />
			{:else}
				<h1 class="text-300">No Chart Yet...</h1>
			{/if}
		</section>
		<section
			class="chart-status-section order-7 flex flex-col items-center justify-center rounded-lg bg-gray-900/40 p-4 shadow-md"
		>
			{#if productStatusIn && productStatusOut}
				<ChartPieStatus {productStatusIn} {productStatusOut} />
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
				action="?/deleteInboundProducts"
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
							if (inboundProducts) {
								// Update the state arrays using array methods instead of reassignment
								inboundProducts.splice(
									0,
									inboundProducts.length,
									...inboundProducts.filter((p) => !deletedIds.includes(p.id))
								);
								filteredInboundProducts =
									filteredInboundProducts?.filter((p) => !deletedIds.includes(p.id)) || [];
								limitedInboundProducts =
									limitedInboundProducts?.filter((p) => !deletedIds.includes(p.id)) || [];
							}
							inboundProductIds = [];

							toast.success('Deleted selected products', toastStyleSucc);
						} else {
							await applyAction(result);
						}

						await update();
					};
				}}
			>
				<input type="hidden" name="productIds" value={JSON.stringify(inboundProductIds)} />
				<input type="hidden" name="inboundId" value={inbound?.id} />
				<button
					data-tooltip="Delete selected products"
					title="Delete selected products"
					type="submit"
					disabled={inboundProductIds.length === 0}
					class="flex rounded-full bg-gray-900 p-2 text-sm font-bold text-blue-500 hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all
						"
				>
					<Trash2 size="24" strokeWidth="2px" />
				</button>
			</form>

			<form action="?/mapSerialnumbersToWorksheet" method="post">
				<input hidden type="text" name="inboundId" value={inbound?.id} />
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
		<div class=" flex items-center justify-center gap-1">
			<input
				type="number"
				id="limit"
				min="1"
				max={filteredInboundProducts?.length || 1}
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

	<section class="mb-4 flex flex-col gap-4 overflow-x-auto rounded-lg bg-gray-900/40 p-4 shadow-md">
		<table class=" table min-w-full text-left text-sm">
			<thead>
				<tr class="text-gray-500">
					<th class="border border-gray-500 p-2">
						<input
							type="checkbox"
							onchange={toggleSelectAll}
							checked={(limitedInboundProducts ?? []).length > 0 &&
								limitedInboundProducts?.every((p) => inboundProductIds.includes(p.id))}
							class="checkbox chat-bubble-neutral checkbox-xs ml-1"
						/>
					</th>
					<th class="border border-gray-500 p-2">Product</th>
					<th class="border border-gray-500 p-2">Serialnumber</th>
					<th class="hidden border border-gray-500 p-2 md:table-cell">Value €</th>
					<th class="border border-gray-500 p-2">Status</th>
					<th class="border border-gray-500 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if limitedInboundProducts && limitedInboundProducts.length > 0}
					{#each limitedInboundProducts as inboundProduct, i}
						<tr class="hover:bg-gray-500/20" transition:fade>
							<td
								class="table-cell-flex justify-evenly space-x-2 border border-gray-500 p-2 text-gray-300"
							>
								<input
									type="checkbox"
									onchange={() => toggleSelection(inboundProduct.id)}
									checked={inboundProductIds.includes(inboundProduct.id)}
									class="checkbox chat-bubble-neutral checkbox-xs mr-1 ml-1"
								/>
								{i + 1}
							</td>
							<td class="border border-gray-500 p-2 text-gray-300">{inboundProduct.product}</td>
							<td class="border border-gray-500 p-2 text-gray-300">{inboundProduct.serialnumber}</td
							>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{inboundProduct.value}</td
							>
							<td class="border border-gray-500 p-2 text-gray-300">{inboundProduct.status}</td>
							<td class="border border-gray-500 p-2 text-gray-300">
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
