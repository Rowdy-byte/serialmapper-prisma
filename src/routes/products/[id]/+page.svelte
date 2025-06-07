<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import {
		ArrowLeft,
		Edit3,
		Trash2,
		Hash,
		Euro,
		Calendar,
		Package,
		Save,
		X,
		TrendingUp,
		Box,
		FileText
	} from '@lucide/svelte';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import { fade, fly } from 'svelte/transition';
	import { enhance, applyAction } from '$app/forms';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr, toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let product = data.product;
	let loading = $state(false);
	let editMode = $state(false);

	function handleDeleteProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
			event.preventDefault();
			return;
		}
	}

	function handleUpdateProduct(event: Event) {
		if (!confirm('Are you sure you want to update this product?')) {
			event.preventDefault();
			return;
		}
	}

	function enhanceUpdateForm() {
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
					toast.success('Product updated successfully', toastStyleSucc);
					editMode = false;
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
					goto('/products');
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
		if (form?.issues) {
			for (const issue of form.issues) {
				toast.error(issue.message, toastStyleErr);
			}
		}
	});

	// Calculate product stats (placeholder - you can add real data)
	const stats = {
		totalOrders: 0, // Replace with actual data
		inStock: 1, // Replace with actual data
		totalValue: parseFloat(product?.value || '0')
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
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<a
						href="/products"
						class="rounded-lg bg-gray-800/50 p-2 text-gray-400 transition-colors hover:text-white"
						title="Back to Products"
					>
						<ArrowLeft class="h-5 w-5" />
					</a>
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600"
						>
							<span class="text-lg font-bold text-white">
								{product?.name?.charAt(0).toUpperCase() || 'P'}
							</span>
						</div>
						<div>
							<h1 class="text-3xl font-bold tracking-tight text-white">
								{product?.name || 'Product'}
							</h1>
							<p class="mt-1 text-sm text-gray-400">Product ID: {product?.id}</p>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					{#if !editMode}
						<button
							onclick={() => (editMode = true)}
							class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
						>
							<Edit3 class="h-4 w-4" />
							Edit Product
						</button>
					{:else}
						<button
							onclick={() => (editMode = false)}
							class="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/50"
						>
							<X class="h-4 w-4" />
							Cancel
						</button>
					{/if}

					<form
						method="post"
						action="?/deleteProduct"
						use:enhance={enhanceDeleteForm}
						class="inline"
					>
						<button
							type="submit"
							onclick={handleDeleteProduct}
							class="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/20"
							title="Delete Product"
						>
							<Trash2 class="h-4 w-4" />
							Delete
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div
			class="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm"
			in:fly={{ y: 20, delay: 0 }}
		>
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm text-gray-400">Product Value</p>
					<p class="mt-1 text-2xl font-bold text-white">€{stats.totalValue.toLocaleString()}</p>
					<p class="text-xs text-gray-500">Current value</p>
				</div>
				<div class="rounded-lg bg-purple-500/20 p-2">
					<Euro class="h-4 w-4 text-purple-400" />
				</div>
			</div>
		</div>

		<div
			class="rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm"
			in:fly={{ y: 20, delay: 100 }}
		>
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm text-gray-400">Stock Status</p>
					<p class="mt-1 text-2xl font-bold text-white">{stats.inStock}</p>
					<p class="text-xs text-gray-500">Units available</p>
				</div>
				<div class="rounded-lg bg-green-500/20 p-2">
					<Package class="h-4 w-4 text-green-400" />
				</div>
			</div>
		</div>

		<div
			class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-sm"
			in:fly={{ y: 20, delay: 200 }}
		>
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm text-gray-400">Total Orders</p>
					<p class="mt-1 text-2xl font-bold text-white">{stats.totalOrders}</p>
					<p class="text-xs text-gray-500">All time</p>
				</div>
				<div class="rounded-lg bg-blue-500/20 p-2">
					<TrendingUp class="h-4 w-4 text-blue-400" />
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Product Information - Main Content -->
		<main class="lg:col-span-8">
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 shadow-lg backdrop-blur-sm">
				<div class="border-b border-gray-700/50 p-6">
					<h2 class="text-lg font-semibold text-white">
						{editMode ? 'Edit Product Information' : 'Product Information'}
					</h2>
					<p class="mt-1 text-sm text-gray-400">
						{editMode
							? 'Update product details and specifications'
							: 'View and manage product details'}
					</p>
				</div>

				<div class="p-6">
					{#if editMode}
						<!-- Edit Form -->
						<form
							class="space-y-6"
							method="post"
							action="?/updateProduct"
							use:enhance={enhanceUpdateForm}
							in:fade
						>
							<div class="grid gap-6 sm:grid-cols-2">
								<div>
									<label for="name" class="mb-2 block text-sm font-medium text-gray-300">
										Product Name *
									</label>
									<input
										id="name"
										type="text"
										name="name"
										value={product?.name || ''}
										placeholder="Enter product name"
										disabled={loading}
										class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
										required
									/>
								</div>

								<div>
									<label for="number" class="mb-2 block text-sm font-medium text-gray-300">
										Product Number
									</label>
									<input
										id="number"
										type="text"
										name="number"
										value={product?.number || ''}
										placeholder="SKU or product number"
										disabled={loading}
										class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
									/>
								</div>

								<div>
									<label for="value" class="mb-2 block text-sm font-medium text-gray-300">
										Value (€)
									</label>
									<input
										id="value"
										type="number"
										step="0.01"
										name="value"
										value={product?.value || ''}
										placeholder="0.00"
										disabled={loading}
										class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
									/>
								</div>
							</div>

							<div>
								<label for="description" class="mb-2 block text-sm font-medium text-gray-300">
									Description
								</label>
								<textarea
									id="description"
									name="description"
									value={product?.description || ''}
									placeholder="Enter product description"
									disabled={loading}
									rows="4"
									class="input input-neutral w-full resize-none border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
								></textarea>
							</div>

							<div class="flex gap-3 pt-4">
								<PrimaryBtn
									type="submit"
									onclick={handleUpdateProduct}
									disabled={loading}
									class="flex items-center gap-2"
								>
									{#if loading}
										<div
											class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
										></div>
										Updating...
									{:else}
										<Save class="h-4 w-4" />
										Update Product
									{/if}
								</PrimaryBtn>

								<button
									type="button"
									onclick={() => (editMode = false)}
									disabled={loading}
									class="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/50 disabled:opacity-50"
								>
									<X class="h-4 w-4" />
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<!-- View Mode -->
						<div class="space-y-6" in:fade>
							<div class="grid gap-6 sm:grid-cols-2">
								<div class="space-y-4">
									<div>
										<div class="mb-2 flex items-center gap-2">
											<Package class="h-4 w-4 text-gray-500" />
											<span class="text-sm font-medium text-gray-400">Product Name</span>
										</div>
										<p class="text-lg text-gray-200">{product?.name || 'Not provided'}</p>
									</div>

									<div>
										<div class="mb-2 flex items-center gap-2">
											<Hash class="h-4 w-4 text-gray-500" />
											<span class="text-sm font-medium text-gray-400">Product Number</span>
										</div>
										<p class="font-mono text-lg text-gray-200">
											{product?.number || 'Not provided'}
										</p>
									</div>

									<div>
										<div class="mb-2 flex items-center gap-2">
											<Euro class="h-4 w-4 text-gray-500" />
											<span class="text-sm font-medium text-gray-400">Value</span>
										</div>
										<p class="text-lg text-gray-200">
											€{parseFloat(product?.value || '0').toLocaleString()}
										</p>
									</div>
								</div>

								<div class="space-y-4">
									<div>
										<div class="mb-2 flex items-center gap-2">
											<FileText class="h-4 w-4 text-gray-500" />
											<span class="text-sm font-medium text-gray-400">Description</span>
										</div>
										<p class="text-lg text-gray-200">
											{product?.description || 'No description provided'}
										</p>
									</div>

									<div>
										<div class="mb-2 flex items-center gap-2">
											<Calendar class="h-4 w-4 text-gray-500" />
											<span class="text-sm font-medium text-gray-400">Created</span>
										</div>
										<p class="text-lg text-gray-200">
											{product?.createdAt
												? new Date(product.createdAt).toLocaleDateString()
												: 'Not available'}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</main>

		<!-- Quick Actions Sidebar -->
		<aside class="lg:col-span-4">
			<div class="sticky top-6 space-y-6">
				<!-- Quick Actions -->
				<div
					class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 shadow-lg backdrop-blur-sm"
				>
					<div class="mb-4 flex items-center gap-3">
						<div class="rounded-lg bg-purple-500/10 p-2">
							<Box class="h-5 w-5 text-purple-400" />
						</div>
						<h3 class="text-lg font-semibold text-white">Quick Actions</h3>
					</div>

					<div class="space-y-3">
						<a
							href="/inbounds?product={product?.name}"
							class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-gray-300 transition-colors hover:bg-gray-700/50"
						>
							<Package class="h-4 w-4 text-blue-400" />
							<span>View in Inbounds</span>
						</a>

						<a
							href="/outbounds?product={product?.name}"
							class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-gray-300 transition-colors hover:bg-gray-700/50"
						>
							<TrendingUp class="h-4 w-4 text-orange-400" />
							<span>View in Outbounds</span>
						</a>

						<button
							onclick={() => (editMode = !editMode)}
							class="flex w-full items-center gap-3 rounded-lg bg-gray-800/50 p-3 text-gray-300 transition-colors hover:bg-gray-700/50"
						>
							<Edit3 class="h-4 w-4 text-green-400" />
							<span>{editMode ? 'Cancel Edit' : 'Edit Product'}</span>
						</button>
					</div>
				</div>

				<!-- Product Summary -->
				<div
					class="rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 shadow-lg backdrop-blur-sm"
				>
					<div class="mb-4 flex items-center gap-3">
						<div class="rounded-lg bg-green-500/10 p-2">
							<Package class="h-5 w-5 text-green-400" />
						</div>
						<h3 class="text-lg font-semibold text-white">Product Summary</h3>
					</div>

					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-400">Status</span>
							<span
								class="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400"
							>
								Active
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Category</span>
							<span class="text-gray-200">General</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Has Number</span>
							<span class="text-gray-200">
								{product?.number ? 'Yes' : 'No'}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Has Description</span>
							<span class="text-gray-200">
								{product?.description ? 'Yes' : 'No'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
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
