<script lang="ts">
	import type { PageProps } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		Eye,
		Search,
		Plus,
		Package,
		Hash,
		Euro,
		Calendar,
		Edit3,
		Trash2,
		TrendingUp,
		DollarSign,
		Box
	} from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import { applyAction, enhance } from '$app/forms';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr, toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	let filteredProducts = $state(data.products);
	let loading = $state(false);
	let showCreateForm = $state(false);

	function handleCreateProduct(event: Event) {
		if (!confirm('Are you sure you want to create this product?')) {
			event.preventDefault();
		}
	}

	function handleDeleteProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this product?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		filteredProducts = data.products.filter((product) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesName = product.name.toLowerCase().includes(query);
				const matchesDescription = product.description?.toLowerCase().includes(query);
				const matchesNumber = product.number?.toLowerCase().includes(query);

				return matchesName || matchesDescription || matchesNumber;
			}
			return true;
		});
	});

	function enhanceForm() {
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
						toast.error('An error occurred', toastStyleErr);
					}
				} else if (result.type === 'success') {
					toast.success('Product created successfully', toastStyleSucc);
					showCreateForm = false;
					await invalidateAll();
				} else {
					await applyAction(result);
				}
			} finally {
				setTimeout(() => {
					loading = false;
				}, 1500);
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
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to delete product', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	// Calculate stats
	const stats = {
		total: data.products.length,
		totalValue: data.products.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0),
		withDescription: data.products.filter((p) => p.description).length
	};
</script>

<BackToTop scrollTo="scroll to top" />

<!-- Loading Overlay -->
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="flex items-center gap-3 rounded-lg bg-gray-900 px-6 py-4 shadow-xl">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-purple-500"
			></div>
			<span class="text-gray-300">Processing...</span>
		</div>
	</div>
{/if}

<div class="container mx-auto max-w-7xl px-4 py-6">
	<!-- Page Header -->
	<div class="mb-8">
		<div class="border-b border-gray-700 pb-6">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-3xl font-bold tracking-tight text-white">Product Management</h1>
					<p class="mt-1 text-sm text-gray-400">Manage your product catalog and inventory</p>
				</div>
				<div class="flex items-center gap-2 text-sm text-gray-400">
					<Package class="h-4 w-4" />
					<span>{stats.total} Total Products</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
		<div class="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">Total Products</span>
				<div class="rounded-lg bg-purple-500/20 p-2">
					<Package class="h-4 w-4 text-purple-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.total}</p>
		</div>

		<div class="rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">Total Value</span>
				<div class="rounded-lg bg-green-500/20 p-2">
					<Euro class="h-4 w-4 text-green-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">€{stats.totalValue.toLocaleString()}</p>
		</div>

		<div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">With Description</span>
				<div class="rounded-lg bg-blue-500/20 p-2">
					<TrendingUp class="h-4 w-4 text-blue-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.withDescription}</p>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Create Product Form - Sidebar -->
		<aside class="lg:col-span-4 xl:col-span-3">
			<div
				class="sticky top-6 rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-purple-500/10 p-2">
							<Plus class="h-5 w-5 text-purple-400" />
						</div>
						<h2 class="text-lg font-semibold text-white">Create Product</h2>
					</div>
					<button
						onclick={() => (showCreateForm = !showCreateForm)}
						class="rounded-lg bg-gray-800/50 p-2 text-gray-400 transition-colors hover:text-white lg:hidden"
					>
						{#if showCreateForm}
							<Plus class="h-4 w-4 rotate-45" />
						{:else}
							<Plus class="h-4 w-4" />
						{/if}
					</button>
				</div>

				<div class="lg:block {showCreateForm ? 'block' : 'hidden'}">
					<form
						class="space-y-4"
						action="?/createProduct"
						onsubmit={handleCreateProduct}
						method="post"
						use:enhance={enhanceForm}
					>
						<div>
							<label for="name" class="mb-2 block text-sm font-medium text-gray-300">
								Product Name *
							</label>
							<input
								id="name"
								disabled={form?.success || loading}
								type="text"
								name="name"
								placeholder="Enter product name"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
								required
							/>
						</div>

						<div>
							<label for="description" class="mb-2 block text-sm font-medium text-gray-300">
								Description
							</label>
							<textarea
								id="description"
								disabled={form?.success || loading}
								name="description"
								placeholder="Product description"
								rows="3"
								class="input input-neutral w-full resize-none border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
							></textarea>
						</div>

						<div>
							<label for="number" class="mb-2 block text-sm font-medium text-gray-300">
								Product Number
							</label>
							<input
								id="number"
								disabled={form?.success || loading}
								type="text"
								name="number"
								placeholder="SKU or product number"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
							/>
						</div>

						<div>
							<label for="value" class="mb-2 block text-sm font-medium text-gray-300">
								Value (€)
							</label>
							<input
								id="value"
								disabled={form?.success || loading}
								type="number"
								step="0.01"
								name="value"
								placeholder="0.00"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
							/>
						</div>

						<PrimaryBtn
							disabled={form?.success || loading}
							type="submit"
							class="flex w-full items-center justify-center gap-2"
						>
							{#if loading}
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
								></div>
								Creating...
							{:else}
								<Plus class="h-4 w-4" />
								Create Product
							{/if}
						</PrimaryBtn>
					</form>
				</div>
			</div>
		</aside>

		<!-- Products List - Main Content -->
		<main class="lg:col-span-8 xl:col-span-9">
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 shadow-lg backdrop-blur-sm">
				<!-- Search Header -->
				<div class="border-b border-gray-700/50 p-6">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h3 class="text-lg font-semibold text-white">Product Catalog</h3>

						<!-- Search Form -->
						<div class="relative w-full max-w-md sm:w-auto">
							<input
								bind:value={searchQuery}
								type="text"
								name="search"
								placeholder="Search products..."
								class="input input-neutral w-full rounded-full border-gray-600 bg-gray-800/50 pr-4 pl-10 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
							/>
							<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
						</div>
					</div>
				</div>

				<!-- Desktop Table View -->
				<div class="hidden overflow-x-auto lg:block">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-gray-700/50 bg-gray-800/30">
								<th class="px-6 py-4 text-left font-medium text-gray-300">Product</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Description</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Number</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Value</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredProducts as product, index (product.id)}
								<tr
									class="border-b border-gray-700/30 transition-colors hover:bg-gray-800/50"
									in:fade={{ delay: index * 50 }}
								>
									<td class="px-6 py-4">
										<div class="flex items-center gap-3">
											<div class="flex-shrink-0">
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600"
												>
													<span class="text-xs font-bold text-white">
														{product.name.charAt(0).toUpperCase()}
													</span>
												</div>
											</div>
											<div>
												<div class="font-medium text-gray-300">{product.name}</div>
												<div class="text-xs text-gray-500">ID: {product.id}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 text-gray-400">
										<span class="max-w-xs truncate">
											{product.description || 'No description'}
										</span>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<Hash class="h-3 w-3 text-gray-500" />
											<span class="font-mono text-sm text-gray-300">
												{product.number || 'N/A'}
											</span>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<Euro class="h-3 w-3 text-gray-500" />
											<span class="text-sm font-medium text-gray-300">
												{parseFloat(product.value || '0').toLocaleString()}
											</span>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<a
												href="/products/{product.id}"
												class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-700"
												title="View Product Details"
											>
												<Eye class="h-4 w-4" />
												View
											</a>

											<form
												method="post"
												action="?/deleteProduct"
												use:enhance={enhanceDeleteForm}
												class="inline"
											>
												<input type="hidden" name="productId" value={product.id} />
												<button
													type="submit"
													onclick={handleDeleteProduct}
													class="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-600/20"
													title="Delete Product"
												>
													<Trash2 class="h-4 w-4" />
												</button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Card View -->
				<div class="block space-y-4 p-6 lg:hidden">
					{#each filteredProducts as product, index (product.id)}
						<div
							class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
							in:fly={{ y: 20, delay: index * 100 }}
						>
							<div class="mb-3 flex items-start justify-between">
								<div class="flex items-center gap-3">
									<div class="flex-shrink-0">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600"
										>
											<span class="text-xs font-bold text-white">
												{product.name.charAt(0).toUpperCase()}
											</span>
										</div>
									</div>
									<div>
										<div class="font-medium text-gray-300">{product.name}</div>
										<div class="text-xs text-gray-500">ID: {product.id}</div>
									</div>
								</div>
								<span
									class="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400"
								>
									<Euro class="h-3 w-3" />
									{parseFloat(product.value || '0').toLocaleString()}
								</span>
							</div>

							<div class="mb-4 space-y-2 text-sm">
								<div class="text-gray-400">
									{product.description || 'No description provided'}
								</div>
								{#if product.number}
									<div class="flex items-center gap-2">
										<Hash class="h-3 w-3 text-gray-500" />
										<span class="font-mono text-gray-400">{product.number}</span>
									</div>
								{/if}
							</div>

							<div class="flex gap-2">
								<a
									href="/products/{product.id}"
									class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white transition-colors hover:bg-purple-700"
								>
									<Eye class="h-4 w-4" />
									View Details
								</a>

								<form
									method="post"
									action="?/deleteProduct"
									use:enhance={enhanceDeleteForm}
									class="inline"
								>
									<input type="hidden" name="productId" value={product.id} />
									<button
										type="submit"
										onclick={handleDeleteProduct}
										class="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-600/10 p-2 text-red-400 transition-colors hover:bg-red-600/20"
										title="Delete Product"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>

				<!-- Empty State -->
				{#if filteredProducts.length === 0}
					<div class="p-12 text-center">
						<Package class="mx-auto mb-4 h-12 w-12 text-gray-500" />
						<h3 class="mb-2 text-lg font-medium text-gray-300">No products found</h3>
						<p class="mb-6 text-sm text-gray-500">
							{searchQuery
								? 'Try adjusting your search criteria'
								: 'Get started by creating your first product'}
						</p>
						{#if !searchQuery}
							<button
								onclick={() => {
									showCreateForm = true;
									document.getElementById('name')?.focus();
								}}
								class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
							>
								<Plus class="h-4 w-4" />
								Create First Product
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>

<style>
	/* Custom focus styles */
	:global(.input:focus, .select:focus, .textarea:focus) {
		outline: none;
		border-color: #8b5cf6;
		box-shadow: 0 0 0 1px #8b5cf6;
	}

	/* Smooth transitions */
	:global(.transition-colors) {
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
</style>
