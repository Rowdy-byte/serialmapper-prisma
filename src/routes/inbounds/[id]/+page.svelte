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
		Search,
		Sheet,
		Trash2,
		Upload,
		Package,
		TrendingUp,
		Users,
		DollarSign,
		Clock,
		BarChart3,
		Camera,
		Settings,
		ArrowLeft,
		CheckCircle,
		AlertCircle
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
	import { fade, fly } from 'svelte/transition';
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
	let qrCodeImages = $state<Array<{ image: string; count: number }>>([]);
	let qrCodeLimit = $state<number | undefined>();
	let qrModalRef = $state<HTMLDialogElement | null>(null);
	let selectedSerials = $state<string>('');
	let selectedClientName = $state('');
	let filteredInboundProducts = $state<typeof inboundProducts>([]);

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

	$effect(() => {
		filteredInboundProducts =
			inboundProducts?.filter((product) => product.inboundId === inbound?.id) || [];
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

	// Calculate stats for overview cards - moved to reactive derivation
	let stats = $state([
		{
			title: 'Total Products',
			value: 0,
			subtitle: 'Items in inbound',
			icon: Package,
			color: 'text-blue-400',
			bgColor: 'bg-blue-500/10',
			borderColor: 'border-blue-500/20'
		},
		{
			title: 'Total Value',
			value: '€0.00',
			subtitle: 'Inventory value',
			icon: DollarSign,
			color: 'text-green-400',
			bgColor: 'bg-green-500/10',
			borderColor: 'border-green-500/20'
		},
		{
			title: 'Time Saved',
			value: '0min',
			subtitle: 'Per serial number',
			icon: Clock,
			color: 'text-purple-400',
			bgColor: 'bg-purple-500/10',
			borderColor: 'border-purple-500/20'
		},
		{
			title: 'Selected Items',
			value: 0,
			subtitle: 'Ready for action',
			icon: CheckCircle,
			color: 'text-orange-400',
			bgColor: 'bg-orange-500/10',
			borderColor: 'border-orange-500/20'
		}
	]);

	// Update stats reactively
	$effect(() => {
		stats = [
			{
				title: 'Total Products',
				value: filteredInboundProducts?.length || 0,
				subtitle: 'Items in inbound',
				icon: Package,
				color: 'text-blue-400',
				bgColor: 'bg-blue-500/10',
				borderColor: 'border-blue-500/20'
			},
			{
				title: 'Total Value',
				value: `€${productValue.toFixed(2)}`,
				subtitle: 'Inventory value',
				icon: DollarSign,
				color: 'text-green-400',
				bgColor: 'bg-green-500/10',
				borderColor: 'border-green-500/20'
			},
			{
				title: 'Time Saved',
				value: `${timeSavedPerSerial}min`,
				subtitle: 'Per serial number',
				icon: Clock,
				color: 'text-purple-400',
				bgColor: 'bg-purple-500/10',
				borderColor: 'border-purple-500/20'
			},
			{
				title: 'Selected Items',
				value: inboundProductIds.length,
				subtitle: 'Ready for action',
				icon: CheckCircle,
				color: 'text-orange-400',
				bgColor: 'bg-orange-500/10',
				borderColor: 'border-orange-500/20'
			}
		];
	});
</script>

<BackToTop scrollTo="scroll to top" />

<!-- Loading Overlay -->
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="flex items-center gap-3 rounded-lg bg-gray-900 px-6 py-4 shadow-xl">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"
			></div>
			<span class="text-gray-300">Processing...</span>
		</div>
	</div>
{/if}

<div class="container mx-auto max-w-7xl px-4 py-6">
	<!-- Page Header -->
	<div class="mb-8">
		<div class="border-b border-gray-700 pb-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<a
						href="/inbounds"
						class="rounded-lg bg-gray-800/50 p-2 text-gray-400 transition-colors hover:text-white"
					>
						<ArrowLeft class="h-5 w-5" />
					</a>
					<div>
						<h1 class="text-3xl font-bold tracking-tight text-white">
							{#key refreshKey}
								<span transition:fade>
									{inbound?.inboundNumber === '' ? 'Pending Inbound' : inbound?.inboundNumber}
								</span>
							{/key}
						</h1>
						<p class="mt-1 text-sm text-gray-400">
							{inbound?.description || 'No description'}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {inbound?.isSubscribed
							? 'bg-blue-500/20 text-blue-400'
							: 'bg-gray-500/20 text-gray-400'}"
					>
						{inbound?.isSubscribed ? 'T1 Client' : 'EXA Client'}
					</span>

					<!-- Delete Button -->
					<form
						method="post"
						action="?/deleteInbound"
						use:enhance={() => {
							return async ({ result, update }) => {
								try {
									if (result.type === 'failure') {
										toast.error('Cannot delete inbound with products', toastStyleErr);
									}
									if (result.type === 'success') {
										toast.success('Inbound deleted successfully', toastStyleSucc);
										goto('/inbounds');
									}
								} finally {
									loading = false;
								}
							};
						}}
					>
						<button
							type="submit"
							onclick={(e) => {
								if (!confirm('Are you sure you want to delete this inbound?')) {
									e.preventDefault();
								}
							}}
							class="rounded-lg border border-red-500/20 bg-red-600/10 p-2 text-red-400 transition-colors hover:bg-red-600/20"
							title="Delete Inbound"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each stats as stat, index}
			{@const IconComponent = stat.icon}
			<div
				class="rounded-xl border {stat.borderColor} {stat.bgColor} p-4 backdrop-blur-sm"
				in:fly={{ y: 20, delay: index * 100 }}
			>
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<p class="text-sm text-gray-400">{stat.title}</p>
						<p class="mt-1 text-2xl font-bold text-white">{stat.value}</p>
						<p class="text-xs text-gray-500">{stat.subtitle}</p>
					</div>
					<div class="rounded-lg {stat.bgColor} p-2">
						<IconComponent class="h-4 w-4 {stat.color}" />
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Left Sidebar - Forms -->
		<aside class="space-y-6 lg:col-span-4">
			<!-- Update Inbound Form -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<Settings class="h-5 w-5 text-blue-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Update Inbound</h2>
				</div>

				<form
					class="space-y-4"
					method="post"
					action="?/updateInbound"
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							try {
								if (result.type === 'success') {
									toast.success('Inbound updated successfully', toastStyleSucc);
									if (
										result.data?.inbound &&
										typeof result.data.inbound === 'object' &&
										result.data.inbound !== null &&
										'id' in result.data.inbound
									) {
										const updatedInbound = result.data.inbound as typeof inbound;
										if (
											updatedInbound &&
											'description' in updatedInbound &&
											'clientName' in updatedInbound &&
											'inboundNumber' in updatedInbound
										) {
											inbound = updatedInbound;
											refreshKey++;
										}
									}
								} else if (result.type === 'failure') {
									toast.error('Update failed', toastStyleErr);
								}
							} finally {
								loading = false;
								await invalidateAll();
							}
						};
					}}
				>
					<div>
						<label for="clientName" class="mb-2 block text-sm font-medium text-gray-300"
							>Client</label
						>
						<select
							id="clientName"
							disabled={isUpdatingInbound}
							class="select select-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
							name="clientName"
							bind:value={selectedClientName}
						>
							<option value="">-- Select Client --</option>
							{#each clients || [] as client}
								<option value={client.name}>{client.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="description" class="mb-2 block text-sm font-medium text-gray-300"
							>Description</label
						>
						<input
							id="description"
							disabled={isUpdatingInbound}
							type="text"
							name="description"
							value={inbound?.description}
							class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
							placeholder="Enter description"
						/>
					</div>

					<div class="flex items-center gap-3 rounded-lg bg-gray-800/30 p-4">
						<input
							type="checkbox"
							id="isSubscribed"
							name="isSubscribed"
							checked={inbound?.isSubscribed}
							value="on"
							class="checkbox checkbox-sm"
						/>
						<label for="isSubscribed" class="text-sm text-gray-300">T1 Subscription</label>
					</div>

					<div class="w-full">
						<PrimaryBtn disabled={isUpdatingInbound} type="submit">Update Inbound</PrimaryBtn>
					</div>
				</form>
			</div>

			<!-- Add Product Form -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-green-500/10 p-2">
						<Package class="h-5 w-5 text-green-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Add Products</h2>
				</div>

				<form
					class="space-y-4"
					action="?/addInboundProductToInbound"
					method="post"
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							try {
								if (result.type === 'success') {
									toast.success('Product added successfully', toastStyleSucc);
									if (
										result.data?.inbound &&
										typeof result.data.inbound === 'object' &&
										result.data.inbound !== null &&
										'id' in result.data.inbound
									) {
										const updatedInbound = result.data.inbound as typeof inbound;
										if (
											updatedInbound &&
											'description' in updatedInbound &&
											'clientName' in updatedInbound &&
											'inboundNumber' in updatedInbound
										) {
											inbound = updatedInbound;
											refreshKey++;
										}
									}
								} else if (result.type === 'failure') {
									toast.error('Failed to add product', toastStyleErr);
								}
							} finally {
								loading = false;
								await invalidateAll();
							}
						};
					}}
				>
					<input hidden type="text" name="inboundId" value={inbound?.id} />

					<div>
						<label for="product" class="mb-2 block text-sm font-medium text-gray-300">Product</label
						>
						<select
							id="product"
							disabled={isAddingInboundProduct}
							class="select select-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
							name="product"
						>
							<option value="">-- Select Product --</option>
							{#if products}
								{#each products as product}
									<option value={product.name}>{product.number}</option>
								{/each}
							{/if}
						</select>
					</div>

					<div>
						<label for="value" class="mb-2 block text-sm font-medium text-gray-300">Value (€)</label
						>
						<input
							id="value"
							type="number"
							step="0.01"
							name="value"
							placeholder="0.00"
							class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
						/>
					</div>

					<div>
						<label for="batch" class="mb-2 block text-sm font-medium text-gray-300"
							>Batch Serial Numbers</label
						>
						<textarea
							id="batch"
							disabled={isAddingBatchInboundProduct}
							bind:value={scannedResults}
							name="batch"
							placeholder="Enter serial numbers (one per line or space separated)"
							class="textarea textarea-neutral h-24 w-full border-gray-600 bg-gray-800/50 text-gray-300"
						></textarea>
					</div>

					<PrimaryBtn
						disabled={isAddingBatchInboundProduct}
						type="submit"
						formaction="?/addBatchInboundProductToInbound"
					>
						Add Batch
					</PrimaryBtn>
				</form>

				<!-- QR Scanner Section -->
				<div class="mt-6 space-y-4">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-purple-500/10 p-2">
							<Camera class="h-5 w-5 text-purple-400" />
						</div>
						<h3 class="font-medium text-white">QR Scanner</h3>
					</div>

					{#if cameras.length > 0}
						<select
							bind:value={selectedCameraId}
							disabled={scanning}
							class="select select-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
						>
							{#each cameras as cam}
								<option value={cam.id}>{cam.label || 'Camera'}</option>
							{/each}
						</select>

						<div id="reader" class="overflow-hidden rounded-lg border border-gray-600"></div>

						<div class="flex gap-2">
							{#if !scanning}
								<PrimaryBtn onclick={startScanner} type="button">Start Scanner</PrimaryBtn>
							{:else}
								<SecondaryBtn onclick={stopScanner} type="button" dataTooltip="" tooltipTitle="">
									Stop Scanner
								</SecondaryBtn>
							{/if}
						</div>
					{:else}
						<p class="text-sm text-gray-400">No cameras available</p>
					{/if}
				</div>
			</div>

			<!-- Upload Excel -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-orange-500/10 p-2">
						<Upload class="h-5 w-5 text-orange-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Upload Excel</h2>
				</div>

				<form
					action="?/uploadExcelInboundProducts"
					enctype="multipart/form-data"
					method="post"
					class="space-y-4"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								toast.success('Excel uploaded successfully', toastStyleSucc);
								await invalidateAll();
							} else if (result.type === 'failure') {
								toast.error('Upload failed', toastStyleErr);
							}
							await update();
						};
					}}
				>
					<input
						class="file-input file-input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
						type="file"
						name="excel"
						accept=".xlsx"
					/>
					<PrimaryBtn type="submit">Upload File</PrimaryBtn>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="space-y-6 lg:col-span-8">
			<!-- Charts Section -->
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Product Distribution Chart -->
				<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-center gap-3">
						<div class="rounded-lg bg-blue-500/10 p-2">
							<BarChart3 class="h-5 w-5 text-blue-400" />
						</div>
						<h3 class="text-lg font-semibold text-white">Product Distribution</h3>
					</div>
					{#if filteredInboundProducts && filteredInboundProducts.length > 0}
						<ChartPieInboundProducts {filteredInboundProducts} />
					{:else}
						<div class="flex h-32 items-center justify-center text-gray-400">
							<p>No data available</p>
						</div>
					{/if}
				</div>

				<!-- Status Chart -->
				<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
					<div class="mb-4 flex items-center gap-3">
						<div class="rounded-lg bg-green-500/10 p-2">
							<TrendingUp class="h-5 w-5 text-green-400" />
						</div>
						<h3 class="text-lg font-semibold text-white">Status Overview</h3>
					</div>
					{#if productStatusIn && productStatusOut}
						<ChartPieStatus {productStatusIn} {productStatusOut} />
					{:else}
						<div class="flex h-32 items-center justify-center text-gray-400">
							<p>No status data</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Products Table -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm">
				<!-- Table Header -->
				<div class="border-b border-gray-700/50 p-6">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h3 class="text-lg font-semibold text-white">Products</h3>

						<!-- Controls -->
						<div class="flex flex-wrap items-center gap-3">
							<!-- Search -->
							<div class="relative">
								<input
									bind:value={searchQuery}
									type="text"
									placeholder="Search products..."
									class="input input-neutral w-full rounded-full border-gray-600 bg-gray-800/50 pr-4 pl-10 text-gray-300"
								/>
								<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							</div>

							<!-- Limit -->
							<input
								type="number"
								min="1"
								max={filteredInboundProducts?.length || 1}
								placeholder="Limit"
								bind:value={limit}
								class="input input-neutral w-20 border-gray-600 bg-gray-800/50 text-gray-300"
							/>

							<!-- QR Limit -->
							<input
								type="number"
								min="1"
								max="500"
								placeholder="QR Qty"
								bind:value={qrCodeLimit}
								class="input input-neutral w-24 border-gray-600 bg-gray-800/50 text-gray-300"
							/>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="mt-4 flex flex-wrap gap-2">
						<button
							onclick={copySelectedSerialsToClipboard}
							class="btn btn-sm btn-outline gap-2"
							title="Copy selected serial numbers"
						>
							<Copy class="h-4 w-4" />
							Copy
						</button>

						<button
							onclick={printSelectedLabels}
							class="btn btn-sm btn-outline gap-2"
							title="Print selected labels"
						>
							<Printer class="h-4 w-4" />
							Print
						</button>

						<button
							onclick={generateQRCodeForInbound}
							class="btn btn-sm btn-outline gap-2"
							title="Generate QR codes"
						>
							<QrCode class="h-4 w-4" />
							QR Code
						</button>

						<button
							onclick={mapSerialToWorksheet}
							class="btn btn-sm btn-outline gap-2"
							title="Export to Excel"
						>
							<Sheet class="h-4 w-4" />
							Export
						</button>

						<!-- Delete Selected -->
						<form
							action="?/deleteInboundProducts"
							method="post"
							class="inline"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										toast.success('Products deleted', toastStyleSucc);
										inboundProductIds = [];
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="productIds" value={JSON.stringify(inboundProductIds)} />
							<input type="hidden" name="inboundId" value={inbound?.id} />
							<button
								type="submit"
								disabled={inboundProductIds.length === 0}
								class="btn btn-sm btn-error gap-2"
								title="Delete selected products"
							>
								<Trash2 class="h-4 w-4" />
								Delete
							</button>
						</form>
					</div>
				</div>

				<!-- Desktop Table -->
				<div class="hidden overflow-x-auto md:block">
					<table class="table w-full">
						<thead>
							<tr class="border-b border-gray-700/50">
								<th class="p-4">
									<input
										type="checkbox"
										onchange={toggleSelectAll}
										checked={(limitedInboundProducts ?? []).length > 0 &&
											limitedInboundProducts?.every((p) => inboundProductIds.includes(p.id))}
										class="checkbox checkbox-sm"
									/>
								</th>
								<th class="p-4 text-left font-medium text-gray-300">#</th>
								<th class="p-4 text-left font-medium text-gray-300">Product</th>
								<th class="p-4 text-left font-medium text-gray-300">Serial Number</th>
								<th class="p-4 text-left font-medium text-gray-300">Value</th>
								<th class="p-4 text-left font-medium text-gray-300">Status</th>
								<th class="p-4 text-left font-medium text-gray-300">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#if limitedInboundProducts && limitedInboundProducts.length > 0}
								{#each limitedInboundProducts as product, i (product.id)}
									<tr
										class="border-b border-gray-700/30 transition-colors hover:bg-gray-800/50"
										transition:fade
									>
										<td class="p-4">
											<input
												type="checkbox"
												onchange={() => toggleSelection(product.id)}
												checked={inboundProductIds.includes(product.id)}
												class="checkbox checkbox-sm"
											/>
										</td>
										<td class="p-4 text-gray-300">{i + 1}</td>
										<td class="p-4 text-gray-300">{product.product}</td>
										<td class="p-4 font-mono text-sm text-gray-300">{product.serialnumber}</td>
										<td class="p-4 text-gray-300">€{product.value || '0.00'}</td>
										<td class="p-4">
											<span
												class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {product.status ===
												'IN'
													? 'bg-green-500/20 text-green-400'
													: 'bg-red-500/20 text-red-400'}"
											>
												{product.status}
											</span>
										</td>
										<td class="p-4">
											<a
												href="/inbounds/{inbound?.id}/inbound-product/{product.id}"
												class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
											>
												<Eye class="h-4 w-4" />
												View
											</a>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Mobile Cards -->
				<div class="block space-y-4 p-6 md:hidden">
					{#if limitedInboundProducts && limitedInboundProducts.length > 0}
						{#each limitedInboundProducts as product, i (product.id)}
							<div
								class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
								transition:fly={{ y: 20, delay: i * 50 }}
							>
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-3">
										<input
											type="checkbox"
											onchange={() => toggleSelection(product.id)}
											checked={inboundProductIds.includes(product.id)}
											class="checkbox checkbox-sm"
										/>
										<span class="text-sm text-gray-400">#{i + 1}</span>
									</div>
									<span
										class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {product.status ===
										'IN'
											? 'bg-green-500/20 text-green-400'
											: 'bg-red-500/20 text-red-400'}"
									>
										{product.status}
									</span>
								</div>

								<div class="mb-4 space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-gray-400">Product:</span>
										<span class="text-gray-300">{product.product}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-400">Serial:</span>
										<span class="font-mono text-gray-300">{product.serialnumber}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-400">Value:</span>
										<span class="text-gray-300">€{product.value || '0.00'}</span>
									</div>
								</div>

								<a
									href="/inbounds/{inbound?.id}/inbound-product/{product.id}"
									class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
								>
									<Eye class="h-4 w-4" />
									View Details
								</a>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Empty State -->
				{#if filteredInboundProducts?.length === 0}
					<div class="p-12 text-center">
						<Package class="mx-auto mb-4 h-12 w-12 text-gray-500" />
						<h3 class="mb-2 text-lg font-medium text-gray-300">No products found</h3>
						<p class="text-sm text-gray-500">
							{searchQuery
								? 'Try adjusting your search criteria'
								: 'Start by adding products to this inbound'}
						</p>
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>

<!-- QR Code Modal -->
<dialog id="qr_modal" class="modal" bind:this={qrModalRef}>
	<div class="modal-box max-w-4xl border border-gray-700 bg-gray-900 text-white">
		<h3 class="mb-4 text-lg font-bold">QR Codes for Inbound</h3>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each qrCodeImages as { image, count }, i}
				<div class="flex flex-col items-center gap-2 rounded-lg bg-white/5 p-4">
					<img src={image} alt="QR Code {i + 1}" class="h-32 w-32" />
					<span class="text-sm text-gray-300">QR {i + 1} – {count} items</span>
				</div>
			{/each}
		</div>
		<div class="modal-action mt-6">
			<form method="dialog">
				<button class="btn btn-outline">Close</button>
			</form>
		</div>
	</div>
</dialog>

<style>
	/* Custom focus styles and transitions */
	:global(.input:focus, .select:focus, .textarea:focus) {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	:global(.transition-colors) {
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
</style>
