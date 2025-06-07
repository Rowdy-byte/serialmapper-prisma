<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		Package2,
		BarChart3,
		Clock,
		DollarSign,
		Edit3,
		Save,
		X,
		CheckCircle,
		AlertCircle,
		Copy,
		Trash2,
		Settings,
		TrendingUp,
		Building2,
		MoveRight,
		QrCode,
		Eye,
		Hash,
		Tag
	} from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { toastStyleErr, toastStyleSucc } from '$lib/components/toast/toastStyle';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import InboundProductBarcode from '$lib/components/barcodes/InboundProductBarcode.svelte';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const inboundId = urlArray[2];

	let { data, form }: PageProps = $props();
	let { inboundProducts, inbound } = data;

	let loading = $state(false);
	let editing = $state(false);

	// Find the current product
	const currentProduct = inboundProducts.find((product) => product.id === Number(params.id));

	// Get product index for navigation
	const filteredInboundProducts = inboundProducts.filter(
		(product) => product.inboundId === inbound?.id
	);
	const currentIndex = filteredInboundProducts.findIndex(
		(product) => product.id === Number(params.id)
	);

	let editForm = $state({
		product: currentProduct?.product || '',
		serialnumber: currentProduct?.serialnumber || '',
		value: currentProduct?.value?.toString() || ''
	});

	// Update form when product changes
	$effect(() => {
		if (currentProduct) {
			editForm = {
				product: currentProduct.product || '',
				serialnumber: currentProduct.serialnumber || '',
				value: currentProduct.value?.toString() || ''
			};
		}
	});

	// Calculate stats for overview cards
	const productValue = parseFloat(currentProduct?.value?.toString() || '0');

	const stats = [
		{
			title: 'Product Index',
			value: `${currentIndex + 1} of ${filteredInboundProducts.length}`,
			subtitle: 'Position in inbound',
			icon: Hash,
			color: 'text-blue-400',
			bgColor: 'bg-blue-500/10',
			borderColor: 'border-blue-500/20'
		},
		{
			title: 'Product Value',
			value: `€${productValue.toFixed(2)}`,
			subtitle: 'Current value',
			icon: DollarSign,
			color: 'text-green-400',
			bgColor: 'bg-green-500/10',
			borderColor: 'border-green-500/20'
		},
		{
			title: 'Status',
			value: currentProduct?.status || 'IN',
			subtitle: 'Current status',
			icon: currentProduct?.status === 'IN' ? CheckCircle : AlertCircle,
			color: currentProduct?.status === 'IN' ? 'text-green-400' : 'text-red-400',
			bgColor: currentProduct?.status === 'IN' ? 'bg-green-500/10' : 'bg-red-500/10',
			borderColor: currentProduct?.status === 'IN' ? 'border-green-500/20' : 'border-red-500/20'
		},
		{
			title: 'Barcode',
			value: currentProduct?.barcode ? 'Generated' : 'Missing',
			subtitle: 'Barcode status',
			icon: QrCode,
			color: currentProduct?.barcode ? 'text-purple-400' : 'text-gray-400',
			bgColor: currentProduct?.barcode ? 'bg-purple-500/10' : 'bg-gray-500/10',
			borderColor: currentProduct?.barcode ? 'border-purple-500/20' : 'border-gray-500/20'
		}
	];

	function startEditing() {
		editing = true;
	}

	function cancelEditing() {
		editing = false;
		if (currentProduct) {
			editForm = {
				product: currentProduct.product || '',
				serialnumber: currentProduct.serialnumber || '',
				value: currentProduct.value?.toString() || ''
			};
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast.success('Copied to clipboard', toastStyleSucc);
			})
			.catch(() => {
				toast.error('Failed to copy', toastStyleErr);
			});
	}

	function handleUpdateInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to update this inbound product?')) {
			event.preventDefault();
		}
	}

	function handleDeleteInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this inbound product?')) {
			event.preventDefault();
		}
	}

	function enhanceUpdateForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success('Product updated successfully', toastStyleSucc);
					editing = false;
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to update product', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	function enhanceDeleteForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success('Product deleted successfully', toastStyleSucc);
					goto(`/inbounds/${inboundId}`);
				} else if (result.type === 'failure') {
					toast.error('Failed to delete product', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	// Handle form success/error messages
	$effect(() => {
		if (form?.success) {
			toast.success(form.message, toastStyleSucc);
		}
		if (form?.success === false) {
			toast.error(form.message, toastStyleErr);
		}
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
						href="/inbounds/{inboundId}"
						class="rounded-lg bg-gray-800/50 p-2 text-gray-400 transition-colors hover:text-white"
						title="Back to Inbound"
					>
						<ArrowLeft class="h-5 w-5" />
					</a>
					<div class="">
						<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
							<span class="">{inbound?.inboundNumber}</span>
							<MoveRight class="h-4 w-4" />
							<span class="flex items-center gap-2"
								>Product <MoveRight class="h-4 w-4" /> {currentIndex + 1}</span
							>
						</h1>
						<div class="mt-1 flex items-center gap-2 text-sm text-gray-400">
							Inbound Product Details
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<!-- Product Status Badge -->
					<span
						class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {currentProduct?.status ===
						'IN'
							? 'bg-green-500/20 text-green-400'
							: 'bg-red-500/20 text-red-400'}"
					>
						{currentProduct?.status || 'IN'}
					</span>

					<!-- Edit Toggle Button -->
					{#if !editing}
						<button
							onclick={startEditing}
							class="rounded-lg border border-blue-500/20 bg-blue-600/10 p-2 text-blue-400 transition-colors hover:bg-blue-600/20"
							title="Edit Product"
						>
							<Edit3 class="h-4 w-4" />
						</button>
					{:else}
						<button
							onclick={cancelEditing}
							class="rounded-lg border border-gray-500/20 bg-gray-600/10 p-2 text-gray-400 transition-colors hover:bg-gray-600/20"
							title="Cancel Edit"
						>
							<X class="h-4 w-4" />
						</button>
					{/if}

					<!-- Delete Button -->
					<form method="post" action="?/deleteInboundProduct" use:enhance={enhanceDeleteForm}>
						<button
							type="submit"
							onclick={handleDeleteInboundProduct}
							class="rounded-lg border border-red-500/20 bg-red-600/10 p-2 text-red-400 transition-colors hover:bg-red-600/20"
							title="Delete Product"
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
			<div
				class="rounded-xl border {stat.borderColor} {stat.bgColor} p-4 backdrop-blur-sm"
				in:fly={{ y: 20, delay: index * 100 }}
			>
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<p class="text-sm text-gray-400">{stat.title}</p>
						<p class="mt-1 truncate text-xl font-bold text-white">{stat.value}</p>
						<p class="text-xs text-gray-500">{stat.subtitle}</p>
					</div>
					<div class="rounded-lg {stat.bgColor} p-2">
						<svelte:component this={stat.icon} class="h-4 w-4 {stat.color}" />
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Left Panel - Product Details -->
		<div class="space-y-6 lg:col-span-8">
			<!-- Product Information -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-6 flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<Package2 class="h-5 w-5 text-blue-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Product Information</h2>
				</div>

				{#if editing}
					<!-- Edit Form -->
					<form
						method="post"
						action="?/updateInboundProduct"
						use:enhance={enhanceUpdateForm}
						class="space-y-6"
						in:slide
					>
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="sm:col-span-2">
								<label for="product" class="mb-2 block text-sm font-medium text-gray-300"
									>Product Name</label
								>
								<input
									id="product"
									bind:value={editForm.product}
									name="product"
									type="text"
									placeholder="Product name"
									class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
									required
								/>
							</div>

							<div>
								<label for="serialnumber" class="mb-2 block text-sm font-medium text-gray-300"
									>Serial Number</label
								>
								<input
									id="serialnumber"
									bind:value={editForm.serialnumber}
									name="serialnumber"
									type="text"
									placeholder="Serial number"
									class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
									required
								/>
							</div>

							<div>
								<label for="value" class="mb-2 block text-sm font-medium text-gray-300"
									>Value (€)</label
								>
								<input
									id="value"
									bind:value={editForm.value}
									name="value"
									type="number"
									step="0.01"
									placeholder="0.00"
									class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
									required
								/>
							</div>
						</div>

						<div class="flex gap-3 pt-4">
							<PrimaryBtn type="submit" disabled={loading} onclick={handleUpdateInboundProduct}>
								{#if loading}
									<div
										class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
									></div>
									Saving...
								{:else}
									<Save class="h-4 w-4" />
									Save Changes
								{/if}
							</PrimaryBtn>

							<SecondaryBtn
								onclick={cancelEditing}
								type="button"
								dataTooltip="cancel-edit"
								tooltipTitle="Cancel editing"
							>
								<X class="h-4 w-4" />
								Cancel
							</SecondaryBtn>
						</div>
					</form>
				{:else}
					<!-- View Mode -->
					<div class="space-y-6" in:fade>
						<div class="grid gap-6 sm:grid-cols-2">
							<!-- Product Details -->
							<div class="space-y-4">
								<div class="rounded-lg bg-gray-800/30 p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-gray-400">Product Name</span>
										<button
											onclick={() => copyToClipboard(currentProduct?.product || '')}
											class="text-gray-400 transition-colors hover:text-white"
											title="Copy Product Name"
										>
											<Copy class="h-4 w-4" />
										</button>
									</div>
									<p class="text-lg font-semibold text-white">
										{currentProduct?.product || 'Unknown'}
									</p>
								</div>

								<div class="rounded-lg bg-gray-800/30 p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-gray-400">Serial Number</span>
										<button
											onclick={() => copyToClipboard(currentProduct?.serialnumber || '')}
											class="text-gray-400 transition-colors hover:text-white"
											title="Copy Serial Number"
										>
											<Copy class="h-4 w-4" />
										</button>
									</div>
									<p class="font-mono text-lg text-white">
										{currentProduct?.serialnumber || 'Unknown'}
									</p>
								</div>
							</div>

							<!-- Value and Status -->
							<div class="space-y-4">
								<div class="rounded-lg bg-gray-800/30 p-4">
									<span class="text-sm text-gray-400">Product Value</span>
									<p class="text-lg font-semibold text-green-400">€{productValue.toFixed(2)}</p>
								</div>

								<div class="rounded-lg bg-gray-800/30 p-4">
									<span class="text-sm text-gray-400">Barcode</span>
									<div class="mt-2 flex items-center gap-2">
										{#if currentProduct?.barcode}
											<span
												class="rounded bg-gray-700/50 px-2 py-1 font-mono text-sm text-gray-300"
											>
												{currentProduct.barcode}
											</span>
											<button
												onclick={() => copyToClipboard(currentProduct?.barcode || '')}
												class="text-gray-400 transition-colors hover:text-white"
												title="Copy Barcode"
											>
												<Copy class="h-4 w-4" />
											</button>
										{:else}
											<span class="text-gray-500 italic">No barcode available</span>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Timestamps -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="rounded-lg bg-gray-800/30 p-4">
								<span class="text-sm text-gray-400">Created At</span>
								<p class="text-white">
									{new Date(currentProduct?.createdAt || Date.now()).toLocaleString()}
								</p>
							</div>

							<div class="rounded-lg bg-gray-800/30 p-4">
								<span class="text-sm text-gray-400">Last Updated</span>
								<p class="text-white">
									{new Date(currentProduct?.createdAt || Date.now()).toLocaleString()}
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Barcode Section -->
			{#if currentProduct}
				<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
					<div class="mb-6 flex items-center gap-3">
						<div class="rounded-lg bg-purple-500/10 p-2">
							<QrCode class="h-5 w-5 text-purple-400" />
						</div>
						<h2 class="text-lg font-semibold text-white">Product Barcode & Sticker</h2>
					</div>

					<InboundProductBarcode inboundProduct={currentProduct} {inbound} />
				</div>
			{/if}
		</div>

		<!-- Right Panel - Navigation and Actions -->
		<div class="space-y-6 lg:col-span-4">
			<!-- Quick Actions -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<Settings class="h-5 w-5 text-blue-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Quick Actions</h2>
				</div>

				<div class="space-y-3">
					<button
						onclick={() => copyToClipboard(currentProduct?.serialnumber || '')}
						class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
					>
						<Copy class="h-4 w-4 text-blue-400" />
						<span class="text-gray-300">Copy Serial Number</span>
					</button>

					{#if currentProduct?.barcode}
						<button
							onclick={() => copyToClipboard(currentProduct?.barcode || '')}
							class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
						>
							<QrCode class="h-4 w-4 text-purple-400" />
							<span class="text-gray-300">Copy Barcode</span>
						</button>
					{/if}

					<a
						href="/inbounds/{inboundId}"
						class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
					>
						<Eye class="h-4 w-4 text-green-400" />
						<span class="text-gray-300">View All Products</span>
					</a>
				</div>
			</div>

			<!-- Product Navigation -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-orange-500/10 p-2">
						<Package2 class="h-5 w-5 text-orange-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Navigation</h2>
				</div>

				<div class="space-y-3">
					<div class="text-center text-sm text-gray-400">
						Product {currentIndex + 1} of {filteredInboundProducts.length}
					</div>

					<div class="flex gap-2">
						{#if currentIndex > 0}
							<a
								href="/inbounds/{inboundId}/inbound-product/{filteredInboundProducts[
									currentIndex - 1
								].id}"
								class="flex-1 rounded-lg border border-blue-500/20 bg-blue-600/10 p-2 text-center text-blue-400 transition-colors hover:bg-blue-600/20"
							>
								← Previous
							</a>
						{/if}

						{#if currentIndex < filteredInboundProducts.length - 1}
							<a
								href="/inbounds/{inboundId}/inbound-product/{filteredInboundProducts[
									currentIndex + 1
								].id}"
								class="flex-1 rounded-lg border border-blue-500/20 bg-blue-600/10 p-2 text-center text-blue-400 transition-colors hover:bg-blue-600/20"
							>
								Next →
							</a>
						{/if}
					</div>
				</div>
			</div>

			<!-- Product Summary -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-green-500/10 p-2">
						<BarChart3 class="h-5 w-5 text-green-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Summary</h2>
				</div>

				<div class="space-y-4">
					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Product Value</span>
						<p class="text-2xl font-bold text-green-400">€{productValue.toFixed(2)}</p>
					</div>

					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Status</span>
						<p class="text-lg text-white">{currentProduct?.status || 'IN'}</p>
					</div>

					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Inbound</span>
						<p class="font-mono text-lg text-white">{inbound?.inboundNumber}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

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
