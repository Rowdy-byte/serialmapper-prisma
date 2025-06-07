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
		Eye,
		Copy,
		Trash2,
		Settings,
		TrendingDown,
		Building2,
		Plus,
		Search,
		Calendar,
		User,
		FileText,
		MoveRight,
		QrCode,
		Upload,
		Package,
		Filter,
		SortAsc,
		SortDesc,
		MoreVertical
	} from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import toast from 'svelte-french-toast';
	import { toastStyleErr, toastStyleSucc } from '$lib/components/toast/toastStyle';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';

	const { params, url } = page;

	let { data, form }: PageProps = $props();
	let { outbound, outboundProducts, clients, client } = data;

	let loading = $state(false);
	let editing = $state(false);
	let showMoveProductForm = $state(false);
	let showBatchMoveForm = $state(false);
	let selectedProducts = $state<number[]>([]);
	let searchQuery = $state('');
	let sortField = $state<'product' | 'serialnumber' | 'value' | 'barcode'>('product');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let viewMode = $state<'table' | 'cards'>('table');

	let editForm = $state({
		description: outbound?.description || '',
		clientName: outbound?.clientName || ''
	});

	let moveProductForm = $state({
		serial: '',
		outboundNumber: outbound?.outboundNumber || ''
	});

	let batchMoveForm = $state({
		batch: '',
		outboundNumber: outbound?.outboundNumber || ''
	});

	// Update forms when outbound changes
	$effect(() => {
		if (outbound) {
			editForm = {
				description: outbound.description || '',
				clientName: outbound.clientName || ''
			};
			moveProductForm.outboundNumber = outbound.outboundNumber || '';
			batchMoveForm.outboundNumber = outbound.outboundNumber || '';
		}
	});

	// Filter and sort products
	let filteredAndSortedProducts = $state(outboundProducts);

	$effect(() => {
		let filtered = outboundProducts.filter((product) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				return (
					product.product?.toLowerCase().includes(query) ||
					product.serialnumber?.toLowerCase().includes(query) ||
					product.barcode?.toLowerCase().includes(query) ||
					product.value?.toString().toLowerCase().includes(query)
				);
			}
			return true;
		});

		// Sort products
		filtered.sort((a, b) => {
			let aValue = '';
			let bValue = '';

			switch (sortField) {
				case 'product':
					aValue = a.product || '';
					bValue = b.product || '';
					break;
				case 'serialnumber':
					aValue = a.serialnumber || '';
					bValue = b.serialnumber || '';
					break;
				case 'value':
					aValue = parseFloat(a.value?.toString() || '0').toString();
					bValue = parseFloat(b.value?.toString() || '0').toString();
					break;
				case 'barcode':
					aValue = a.barcode || '';
					bValue = b.barcode || '';
					break;
			}

			if (sortField === 'value') {
				const numA = parseFloat(aValue);
				const numB = parseFloat(bValue);
				return sortDirection === 'asc' ? numA - numB : numB - numA;
			}

			const result = aValue.localeCompare(bValue);
			return sortDirection === 'asc' ? result : -result;
		});

		filteredAndSortedProducts = filtered;
	});

	// Calculate stats for overview cards
	const totalValue = outboundProducts.reduce(
		(sum, op) => sum + parseFloat(op.value?.toString() || '0'),
		0
	);

	const stats = [
		{
			title: 'Products Count',
			value: outboundProducts.length.toString(),
			subtitle: 'Items in outbound',
			icon: Package2,
			color: 'text-orange-400',
			bgColor: 'bg-orange-500/10',
			borderColor: 'border-orange-500/20'
		},
		{
			title: 'Total Value',
			value: `€${totalValue.toFixed(2)}`,
			subtitle: 'Combined value',
			icon: DollarSign,
			color: 'text-green-400',
			bgColor: 'bg-green-500/10',
			borderColor: 'border-green-500/20'
		},
		{
			title: 'Status',
			value: outbound?.outboundNumber ? 'Completed' : 'Pending',
			subtitle: 'Current status',
			icon: outbound?.outboundNumber ? CheckCircle : AlertCircle,
			color: outbound?.outboundNumber ? 'text-green-400' : 'text-red-400',
			bgColor: outbound?.outboundNumber ? 'bg-green-500/10' : 'bg-red-500/10',
			borderColor: outbound?.outboundNumber ? 'border-green-500/20' : 'border-red-500/20'
		},
		{
			title: 'Created',
			value: new Date(outbound?.createdAt || Date.now()).toLocaleDateString(),
			subtitle: 'Creation date',
			icon: Clock,
			color: 'text-blue-400',
			bgColor: 'bg-blue-500/10',
			borderColor: 'border-blue-500/20'
		}
	];

	function startEditing() {
		editing = true;
	}

	function cancelEditing() {
		editing = false;
		if (outbound) {
			editForm = {
				description: outbound.description || '',
				clientName: outbound.clientName || ''
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

	function toggleProductSelection(productId: number) {
		if (selectedProducts.includes(productId)) {
			selectedProducts = selectedProducts.filter((id) => id !== productId);
		} else {
			selectedProducts = [...selectedProducts, productId];
		}
	}

	function selectAllProducts() {
		selectedProducts = filteredAndSortedProducts.map((p) => p.id);
	}

	function clearSelection() {
		selectedProducts = [];
	}

	function handleSort(field: typeof sortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
	}

	function handleUpdateOutbound(event: Event) {
		if (!confirm('Are you sure you want to update this outbound?')) {
			event.preventDefault();
		}
	}

	function handleDeleteOutbound(event: Event) {
		if (!confirm('Are you sure you want to delete this outbound?')) {
			event.preventDefault();
		}
	}

	function handleDeleteSelectedProducts(event: Event) {
		if (selectedProducts.length === 0) {
			event.preventDefault();
			toast.error('No products selected', toastStyleErr);
			return;
		}
		if (!confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
			event.preventDefault();
		}
	}

	function enhanceUpdateForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success('Outbound updated successfully', toastStyleSucc);
					editing = false;
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to update outbound', toastStyleErr);
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
					toast.success('Outbound deleted successfully', toastStyleSucc);
					goto('/outbounds');
				} else if (result.type === 'failure') {
					toast.error('Failed to delete outbound', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	function enhanceMoveProductForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success('Product moved successfully', toastStyleSucc);
					moveProductForm.serial = '';
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to move product', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	function enhanceBatchMoveForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success('Batch moved successfully', toastStyleSucc);
					batchMoveForm.batch = '';
					showBatchMoveForm = false;
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to move batch', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	function enhanceDeleteProductsForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'success') {
					toast.success(`${selectedProducts.length} products deleted successfully`, toastStyleSucc);
					selectedProducts = [];
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to delete products', toastStyleErr);
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
				class="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"
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
						href="/outbounds"
						class="rounded-lg bg-gray-800/50 p-2 text-gray-400 transition-colors hover:text-white"
						title="Back to Outbounds"
					>
						<ArrowLeft class="h-5 w-5" />
					</a>
					<div>
						<h1 class="text-3xl font-bold tracking-tight text-white">
							{#key outbound?.outboundNumber}
								<span transition:fade>
									{outbound?.outboundNumber === '' ? 'Pending Inbound' : outbound?.outboundNumber}
								</span>
							{/key}
						</h1>
						<p class="mt-1 text-sm text-gray-400">
							{outbound?.description || 'No description'}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<!-- Client Type Badge -->
					<span
						class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {outbound
							?.client?.isSubscribed
							? 'bg-blue-500/20 text-blue-400'
							: 'bg-gray-500/20 text-gray-400'}"
					>
						{outbound?.client?.isSubscribed ? 'T1 Client' : 'EXA Client'}
					</span>

					<!-- Edit Toggle Button -->
					{#if !editing}
						<button
							onclick={startEditing}
							class="rounded-lg border border-orange-500/20 bg-orange-600/10 p-2 text-orange-400 transition-colors hover:bg-orange-600/20"
							title="Edit Outbound"
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
					<form method="post" action="?/deleteOutbound" use:enhance={enhanceDeleteForm}>
						<button
							type="submit"
							onclick={handleDeleteOutbound}
							class="rounded-lg border border-red-500/20 bg-red-600/10 p-2 text-red-400 transition-colors hover:bg-red-600/20"
							title="Delete Outbound"
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
		<!-- Left Panel - Outbound Details -->
		<div class="space-y-6 lg:col-span-8">
			<!-- Outbound Information -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-6 flex items-center gap-3">
					<div class="rounded-lg bg-orange-500/10 p-2">
						<TrendingDown class="h-5 w-5 text-orange-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Outbound Information</h2>
				</div>

				{#if editing}
					<!-- Edit Form -->
					<form
						method="post"
						action="?/updateOutbound"
						use:enhance={enhanceUpdateForm}
						class="space-y-6"
						in:slide
					>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-300">Client Name</label>
								<select
									bind:value={editForm.clientName}
									name="clientName"
									class="select select-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300"
									required
								>
									<option value="">Select Client</option>
									{#each clients as client}
										<option value={client.name}>{client.name}</option>
									{/each}
								</select>
							</div>

							<div class="sm:col-span-2">
								<label class="mb-2 block text-sm font-medium text-gray-300">Description</label>
								<input
									bind:value={editForm.description}
									name="description"
									type="text"
									placeholder="Outbound description"
									class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
									required
								/>
							</div>
						</div>

						<div class="flex gap-3 pt-4">
							<PrimaryBtn
								type="submit"
								disabled={loading}
								class="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
								onclick={handleUpdateOutbound}
							>
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

							<SecondaryBtn onclick={cancelEditing} type="button" class="flex items-center gap-2">
								<X class="h-4 w-4" />
								Cancel
							</SecondaryBtn>
						</div>
					</form>
				{:else}
					<!-- View Mode -->
					<div class="space-y-6" in:fade>
						<div class="grid gap-6 sm:grid-cols-2">
							<!-- Outbound Details -->
							<div class="space-y-4">
								<div class="rounded-lg bg-gray-800/30 p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-gray-400">Outbound Number</span>
										<button
											onclick={() => copyToClipboard(outbound?.outboundNumber || '')}
											class="text-gray-400 transition-colors hover:text-white"
											title="Copy Outbound Number"
										>
											<Copy class="h-4 w-4" />
										</button>
									</div>
									{#if outbound?.outboundNumber}
										<p class="font-mono text-lg text-white">{outbound.outboundNumber}</p>
									{:else}
										<p class="text-lg text-red-400 italic">Update Required</p>
									{/if}
								</div>

								<div class="rounded-lg bg-gray-800/30 p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-sm text-gray-400">Client Name</span>
										<button
											onclick={() => copyToClipboard(outbound?.clientName || '')}
											class="text-gray-400 transition-colors hover:text-white"
											title="Copy Client Name"
										>
											<Copy class="h-4 w-4" />
										</button>
									</div>
									<p class="text-lg font-semibold text-white">
										{outbound?.clientName || 'Unknown'}
									</p>
								</div>
							</div>

							<!-- Description and Status -->
							<div class="space-y-4">
								<div class="rounded-lg bg-gray-800/30 p-4">
									<span class="text-sm text-gray-400">Description</span>
									<p class="text-lg text-white">{outbound?.description || 'No description'}</p>
								</div>

								<div class="rounded-lg bg-gray-800/30 p-4">
									<span class="text-sm text-gray-400">Status</span>
									<div class="mt-2 flex items-center gap-2">
										<span
											class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {outbound?.outboundNumber
												? 'bg-green-500/20 text-green-400'
												: 'bg-red-500/20 text-red-400'}"
										>
											{outbound?.outboundNumber ? 'Completed' : 'Pending'}
										</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Timestamps -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="rounded-lg bg-gray-800/30 p-4">
								<span class="text-sm text-gray-400">Created At</span>
								<p class="text-white">
									{new Date(outbound?.createdAt || Date.now()).toLocaleString()}
								</p>
							</div>

							<div class="rounded-lg bg-gray-800/30 p-4">
								<span class="text-sm text-gray-400">Last Updated</span>
								<p class="text-white">
									{new Date(
										outbound?.updatedAt || outbound?.createdAt || Date.now()
									).toLocaleString()}
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Outbound Products -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-purple-500/10 p-2">
							<Package2 class="h-5 w-5 text-purple-400" />
						</div>
						<h2 class="text-lg font-semibold text-white">Products in Outbound</h2>
					</div>

					<div class="flex items-center gap-2">
						{#if selectedProducts.length > 0}
							<!-- Delete Selected Button -->
							<form
								method="post"
								action="?/deleteOutboundProducts"
								use:enhance={enhanceDeleteProductsForm}
								class="inline"
							>
								<input type="hidden" name="productIds" value={JSON.stringify(selectedProducts)} />
								<button
									type="submit"
									onclick={handleDeleteSelectedProducts}
									class="rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/20"
									title="Delete Selected Products"
								>
									<Trash2 class="mr-2 inline h-4 w-4" />
									Delete ({selectedProducts.length})
								</button>
							</form>
						{/if}

						<!-- Move Product Buttons -->
						<button
							onclick={() => (showMoveProductForm = !showMoveProductForm)}
							class="rounded-lg border border-green-500/20 bg-green-600/10 p-2 text-green-400 transition-colors hover:bg-green-600/20"
							title="Move Single Product"
						>
							<Plus class="h-4 w-4" />
						</button>

						<button
							onclick={() => (showBatchMoveForm = !showBatchMoveForm)}
							class="rounded-lg border border-blue-500/20 bg-blue-600/10 p-2 text-blue-400 transition-colors hover:bg-blue-600/20"
							title="Move Batch"
						>
							<Upload class="h-4 w-4" />
						</button>
					</div>
				</div>

				<!-- Move Single Product Form -->
				{#if showMoveProductForm}
					<div class="mb-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4" in:slide>
						<h3 class="mb-4 text-sm font-medium text-gray-300">Move Single Product to Outbound</h3>
						<form
							method="post"
							action="?/moveInboundProductToOutbound"
							use:enhance={enhanceMoveProductForm}
							class="flex gap-4"
						>
							<input type="hidden" name="outboundNumber" value={moveProductForm.outboundNumber} />
							<input
								bind:value={moveProductForm.serial}
								name="serial"
								type="text"
								placeholder="Enter serial number"
								class="input input-neutral flex-1 border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
								required
							/>
							<PrimaryBtn type="submit" class="bg-green-600 hover:bg-green-700">Move</PrimaryBtn>
							<SecondaryBtn onclick={() => (showMoveProductForm = false)} type="button">
								Cancel
							</SecondaryBtn>
						</form>
					</div>
				{/if}

				<!-- Move Batch Form -->
				{#if showBatchMoveForm}
					<div class="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4" in:slide>
						<h3 class="mb-4 text-sm font-medium text-gray-300">Move Batch to Outbound</h3>
						<form
							method="post"
							action="?/moveBatchToOutbound"
							use:enhance={enhanceBatchMoveForm}
							class="space-y-4"
						>
							<input type="hidden" name="outboundNumber" value={batchMoveForm.outboundNumber} />
							<textarea
								bind:value={batchMoveForm.batch}
								name="batch"
								placeholder="Enter serial numbers (one per line)"
								rows="6"
								class="textarea textarea-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500"
								required
							></textarea>
							<div class="flex gap-3">
								<PrimaryBtn type="submit" class="bg-blue-600 hover:bg-blue-700">
									Move Batch
								</PrimaryBtn>
								<SecondaryBtn onclick={() => (showBatchMoveForm = false)} type="button">
									Cancel
								</SecondaryBtn>
							</div>
						</form>
					</div>
				{/if}

				<!-- Search and Filter Bar -->
				<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex items-center gap-4">
						<!-- Search Input -->
						<div class="relative">
							<input
								bind:value={searchQuery}
								type="text"
								placeholder="Search products..."
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 pl-10 text-gray-300 placeholder-gray-500 sm:w-80"
							/>
							<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						</div>

						<!-- View Mode Toggle -->
						<div class="flex rounded-lg bg-gray-800/50 p-1">
							<button
								onclick={() => (viewMode = 'table')}
								class="rounded-md px-3 py-1 text-sm transition-colors {viewMode === 'table'
									? 'bg-orange-600 text-white'
									: 'text-gray-400 hover:text-gray-300'}"
							>
								Table
							</button>
							<button
								onclick={() => (viewMode = 'cards')}
								class="rounded-md px-3 py-1 text-sm transition-colors {viewMode === 'cards'
									? 'bg-orange-600 text-white'
									: 'text-gray-400 hover:text-gray-300'}"
							>
								Cards
							</button>
						</div>
					</div>

					<!-- Results Count -->
					<div class="text-sm text-gray-400">
						{filteredAndSortedProducts.length} of {outboundProducts.length} products
					</div>
				</div>

				<!-- Products Content -->
				{#if filteredAndSortedProducts.length > 0}
					<!-- Selection Controls -->
					<div class="mb-4 flex items-center justify-between">
						<div class="flex items-center gap-4">
							<button onclick={selectAllProducts} class="text-sm text-blue-400 hover:text-blue-300">
								Select All
							</button>
							<button onclick={clearSelection} class="text-sm text-gray-400 hover:text-gray-300">
								Clear Selection
							</button>
							{#if selectedProducts.length > 0}
								<span class="text-sm text-gray-400">
									{selectedProducts.length} selected
								</span>
							{/if}
						</div>
					</div>

					{#if viewMode === 'table'}
						<!-- Desktop Table View -->
						<div class="hidden overflow-x-auto lg:block">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-gray-700/50 bg-gray-800/30">
										<th class="px-4 py-3 text-left">
											<input
												type="checkbox"
												checked={selectedProducts.length === filteredAndSortedProducts.length &&
													filteredAndSortedProducts.length > 0}
												onchange={(e) => {
													if (e.currentTarget.checked) {
														selectAllProducts();
													} else {
														clearSelection();
													}
												}}
												class="checkbox checkbox-sm"
											/>
										</th>
										<th class="px-4 py-3 text-left">
											<button
												onclick={() => handleSort('product')}
												class="flex items-center gap-2 font-medium text-gray-300 hover:text-white"
											>
												Product
												{#if sortField === 'product'}
													{#if sortDirection === 'asc'}
														<SortAsc class="h-4 w-4" />
													{:else}
														<SortDesc class="h-4 w-4" />
													{/if}
												{/if}
											</button>
										</th>
										<th class="px-4 py-3 text-left">
											<button
												onclick={() => handleSort('serialnumber')}
												class="flex items-center gap-2 font-medium text-gray-300 hover:text-white"
											>
												Serial Number
												{#if sortField === 'serialnumber'}
													{#if sortDirection === 'asc'}
														<SortAsc class="h-4 w-4" />
													{:else}
														<SortDesc class="h-4 w-4" />
													{/if}
												{/if}
											</button>
										</th>
										<th class="px-4 py-3 text-left">
											<button
												onclick={() => handleSort('value')}
												class="flex items-center gap-2 font-medium text-gray-300 hover:text-white"
											>
												Value
												{#if sortField === 'value'}
													{#if sortDirection === 'asc'}
														<SortAsc class="h-4 w-4" />
													{:else}
														<SortDesc class="h-4 w-4" />
													{/if}
												{/if}
											</button>
										</th>
										<th class="px-4 py-3 text-left">
											<button
												onclick={() => handleSort('barcode')}
												class="flex items-center gap-2 font-medium text-gray-300 hover:text-white"
											>
												Barcode
												{#if sortField === 'barcode'}
													{#if sortDirection === 'asc'}
														<SortAsc class="h-4 w-4" />
													{:else}
														<SortDesc class="h-4 w-4" />
													{/if}
												{/if}
											</button>
										</th>
										<th class="px-4 py-3 text-left font-medium text-gray-300">Actions</th>
									</tr>
								</thead>
								<tbody>
									{#each filteredAndSortedProducts as product, index (product.id)}
										<tr
											class="border-b border-gray-700/30 transition-colors hover:bg-gray-800/50"
											in:fade={{ delay: index * 50 }}
										>
											<td class="px-4 py-3">
												<input
													type="checkbox"
													checked={selectedProducts.includes(product.id)}
													onchange={() => toggleProductSelection(product.id)}
													class="checkbox checkbox-sm"
												/>
											</td>
											<td class="px-4 py-3">
												<span class="font-medium text-gray-300">{product.product}</span>
											</td>
											<td class="px-4 py-3">
												<span class="font-mono text-gray-400">{product.serialnumber}</span>
											</td>
											<td class="px-4 py-3">
												<span class="text-green-400"
													>€{parseFloat(product.value?.toString() || '0').toFixed(2)}</span
												>
											</td>
											<td class="px-4 py-3">
												{#if product.barcode}
													<span
														class="rounded bg-gray-700/50 px-2 py-1 font-mono text-xs text-gray-300"
													>
														{product.barcode}
													</span>
												{:else}
													<span class="text-gray-500 italic">No barcode</span>
												{/if}
											</td>
											<td class="px-4 py-3">
												<div class="flex items-center gap-2">
													<button
														onclick={() => copyToClipboard(product.serialnumber)}
														class="rounded-lg bg-gray-700/50 p-1.5 text-gray-400 transition-colors hover:text-white"
														title="Copy Serial Number"
													>
														<Copy class="h-3 w-3" />
													</button>

													{#if product.barcode}
														<button
															onclick={() => copyToClipboard(product.barcode)}
															class="rounded-lg bg-gray-700/50 p-1.5 text-gray-400 transition-colors hover:text-white"
															title="Copy Barcode"
														>
															<QrCode class="h-3 w-3" />
														</button>
													{/if}
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- Mobile Table View -->
						<div class="block space-y-3 lg:hidden">
							{#each filteredAndSortedProducts as product, index (product.id)}
								<div
									class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
									in:fade={{ delay: index * 50 }}
								>
									<div class="flex items-start gap-3">
										<input
											type="checkbox"
											checked={selectedProducts.includes(product.id)}
											onchange={() => toggleProductSelection(product.id)}
											class="checkbox checkbox-sm mt-1"
										/>

										<div class="flex-1 space-y-2">
											<div class="flex items-start justify-between">
												<span class="font-medium text-gray-300">{product.product}</span>
												<span class="text-sm text-green-400"
													>€{parseFloat(product.value?.toString() || '0').toFixed(2)}</span
												>
											</div>

											<div class="text-sm text-gray-400">
												<div class="flex items-center gap-2">
													<span class="font-mono">{product.serialnumber}</span>
													<button
														onclick={() => copyToClipboard(product.serialnumber)}
														class="text-gray-500 hover:text-gray-300"
													>
														<Copy class="h-3 w-3" />
													</button>
												</div>
											</div>

											{#if product.barcode}
												<div class="flex items-center gap-2 text-xs">
													<span class="rounded bg-gray-700/50 px-2 py-1 font-mono text-gray-300">
														{product.barcode}
													</span>
													<button
														onclick={() => copyToClipboard(product.barcode)}
														class="text-gray-500 hover:text-gray-300"
													>
														<QrCode class="h-3 w-3" />
													</button>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Cards View -->
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each filteredAndSortedProducts as product, index (product.id)}
								<div
									class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
									in:fade={{ delay: index * 50 }}
								>
									<div class="flex items-start gap-3">
										<input
											type="checkbox"
											checked={selectedProducts.includes(product.id)}
											onchange={() => toggleProductSelection(product.id)}
											class="checkbox checkbox-sm mt-1"
										/>

										<div class="flex-1 space-y-3">
											<div>
												<h3 class="font-medium text-gray-300">{product.product}</h3>
												<p class="font-mono text-sm text-gray-400">{product.serialnumber}</p>
											</div>

											<div class="flex items-center justify-between">
												<span class="font-medium text-green-400"
													>€{parseFloat(product.value?.toString() || '0').toFixed(2)}</span
												>

												<div class="flex items-center gap-2">
													<button
														onclick={() => copyToClipboard(product.serialnumber)}
														class="rounded-lg bg-gray-700/50 p-1.5 text-gray-400 transition-colors hover:text-white"
														title="Copy Serial Number"
													>
														<Copy class="h-3 w-3" />
													</button>

													{#if product.barcode}
														<button
															onclick={() => copyToClipboard(product.barcode)}
															class="rounded-lg bg-gray-700/50 p-1.5 text-gray-400 transition-colors hover:text-white"
															title="Copy Barcode"
														>
															<QrCode class="h-3 w-3" />
														</button>
													{/if}
												</div>
											</div>

											{#if product.barcode}
												<div class="text-xs">
													<span class="rounded bg-gray-700/50 px-2 py-1 font-mono text-gray-300">
														{product.barcode}
													</span>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<!-- Empty State -->
					<div class="py-12 text-center">
						<Package2 class="mx-auto mb-4 h-12 w-12 text-gray-500" />
						<h3 class="mb-2 text-lg font-medium text-gray-300">
							{searchQuery ? 'No products match your search' : 'No products in outbound'}
						</h3>
						<p class="mb-6 text-sm text-gray-500">
							{searchQuery
								? 'Try adjusting your search criteria'
								: outbound?.outboundNumber
									? 'Add products by moving them from inbound inventory'
									: 'Complete the outbound setup first'}
						</p>
						{#if !searchQuery && outbound?.outboundNumber}
							<button
								onclick={() => (showMoveProductForm = true)}
								class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
							>
								<Plus class="h-4 w-4" />
								Move First Product
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Panel - Actions and Info -->
		<div class="space-y-6 lg:col-span-4">
			<!-- Quick Actions -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-orange-500/10 p-2">
						<Settings class="h-5 w-5 text-orange-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Quick Actions</h2>
				</div>

				<div class="space-y-3">
					<button
						onclick={() => copyToClipboard(outbound?.outboundNumber || '')}
						class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
					>
						<Copy class="h-4 w-4 text-orange-400" />
						<span class="text-gray-300">Copy Outbound Number</span>
					</button>

					<button
						onclick={() => copyToClipboard(outbound?.clientName || '')}
						class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
					>
						<Copy class="h-4 w-4 text-green-400" />
						<span class="text-gray-300">Copy Client Name</span>
					</button>

					<a
						href="/outbounds"
						class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-left transition-colors hover:bg-gray-800/70"
					>
						<Eye class="h-4 w-4 text-purple-400" />
						<span class="text-gray-300">View All Outbounds</span>
					</a>
				</div>
			</div>

			<!-- Outbound Summary -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<BarChart3 class="h-5 w-5 text-blue-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Summary</h2>
				</div>

				<div class="space-y-4">
					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Total Products</span>
						<p class="text-2xl font-bold text-white">{outboundProducts.length}</p>
					</div>

					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Total Value</span>
						<p class="text-2xl font-bold text-green-400">€{totalValue.toFixed(2)}</p>
					</div>

					<div class="rounded-lg bg-gray-800/30 p-4">
						<span class="text-sm text-gray-400">Client</span>
						<p class="text-lg text-white">{outbound?.clientName || 'Unknown'}</p>
					</div>

					{#if searchQuery}
						<div class="rounded-lg bg-gray-800/30 p-4">
							<span class="text-sm text-gray-400">Filtered Results</span>
							<p class="text-lg text-white">{filteredAndSortedProducts.length} products</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Activity History -->
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 backdrop-blur-sm">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-yellow-500/10 p-2">
						<Clock class="h-5 w-5 text-yellow-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Activity</h2>
				</div>

				<div class="space-y-3">
					<div class="flex items-center gap-3 text-sm">
						<div class="h-2 w-2 rounded-full bg-green-400"></div>
						<span class="text-gray-400">Created</span>
						<span class="ml-auto text-gray-300">
							{new Date(outbound?.createdAt || Date.now()).toLocaleDateString()}
						</span>
					</div>

					{#if outbound?.updatedAt && outbound.updatedAt !== outbound.createdAt}
						<div class="flex items-center gap-3 text-sm">
							<div class="h-2 w-2 rounded-full bg-blue-400"></div>
							<span class="text-gray-400">Updated</span>
							<span class="ml-auto text-gray-300">
								{new Date(outbound.updatedAt).toLocaleDateString()}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom focus styles and transitions */
	:global(.input:focus, .select:focus, .textarea:focus) {
		outline: none;
		border-color: #ea580c;
		box-shadow: 0 0 0 1px #ea580c;
	}

	:global(.transition-colors) {
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
</style>
