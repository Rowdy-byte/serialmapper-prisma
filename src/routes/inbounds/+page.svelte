<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye, Search, Plus, Package2, AlertCircle } from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { invalidateAll } from '$app/navigation';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import { applyAction, enhance } from '$app/forms';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	const clients = $state(data.clients);
	let filteredInbounds = $state(data.inbounds);
	let loading = $state(false);

	function handleCreateInbound(event: Event) {
		if (!confirm('Are you sure you want to create this inbound?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		filteredInbounds = data.inbounds.filter((inbound) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();

				const matchesClientName = inbound.clientName.toLowerCase().includes(query);
				const matchesDescription = inbound.description?.toLowerCase().includes(query);
				const matchesNumber = inbound.inboundNumber.toString().toLowerCase().includes(query);
				const matchesT1 = query === 't1' && inbound.isSubscribed;
				const matchesExa = query === 'exa' && !inbound.isSubscribed;

				return matchesClientName || matchesDescription || matchesNumber || matchesT1 || matchesExa;
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
					toast.success('Inbound Created Successfully', toastStyleSucc);
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

	// Calculate stats
	const stats = {
		total: data.inbounds.length,
		t1: data.inbounds.filter((i) => i.isSubscribed).length,
		pendingUpdate: data.inbounds.filter((i) => i.inboundNumber === '').length
	};
</script>

<BackToTop scrollTo="scroll to top" />

<!-- Loading Overlay -->
{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
		<div class="flex items-center gap-3 rounded-lg bg-gray-900 px-6 py-4 shadow-xl">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"
			></div>
			<span class="text-gray-300">Creating inbound...</span>
		</div>
	</div>
{/if}

<div class="container mx-auto max-w-7xl px-4 py-6">
	<!-- Page Header -->
	<div class="mb-8">
		<div class="border-b border-gray-700 pb-6">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-3xl font-bold tracking-tight text-white">Inbound Management</h1>
					<p class="mt-1 text-sm text-gray-400">Track and manage incoming inventory shipments</p>
				</div>
				<div class="flex items-center gap-2 text-sm text-gray-400">
					<Package2 class="h-4 w-4" />
					<span>{stats.total} Total Inbounds</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">Total Inbounds</span>
				<div class="rounded-lg bg-blue-500/20 p-2">
					<Package2 class="h-4 w-4 text-blue-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.total}</p>
		</div>

		<div class="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">T1 Clients</span>
				<div class="rounded-lg bg-purple-500/20 p-2">
					<span class="text-xs font-bold text-purple-400">T1</span>
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.t1}</p>
		</div>

		<div class="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">Needs Update</span>
				<div class="rounded-lg bg-orange-500/20 p-2">
					<AlertCircle class="h-4 w-4 text-orange-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.pendingUpdate}</p>
		</div>
	</div>
	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Create Inbound Form - Sidebar -->
		<aside class="lg:col-span-4 xl:col-span-3">
			<div
				class="sticky top-6 rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-blue-500/10 p-2">
						<Plus class="h-5 w-5 text-blue-400" />
					</div>
					<h2 class="text-lg font-semibold text-white">Create Inbound</h2>
				</div>

				<form
					class="space-y-4"
					action="?/createInbound"
					onsubmit={handleCreateInbound}
					method="post"
					use:enhance={enhanceForm}
				>
					<div>
						<label for="clientName" class="mb-2 block text-sm font-medium text-gray-300">
							Client
						</label>
						<select
							id="clientName"
							disabled={form?.success || loading}
							class="select select-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 focus:border-blue-500 focus:ring-blue-500"
							name="clientName"
							required
						>
							<option value="">-- Select Client --</option>
							{#each clients as client}
								<option value={client.name}>{client.name}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="description" class="mb-2 block text-sm font-medium text-gray-300">
							Description
						</label>
						<input
							id="description"
							disabled={form?.success || loading}
							type="text"
							name="description"
							placeholder="Enter shipment description"
							class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					</div>

					<PrimaryBtn disabled={form?.success || loading} type="submit">
						{#if loading}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
							></div>
							Creating...
						{:else}
							<Plus class="h-4 w-4" />
							Create Inbound
						{/if}
					</PrimaryBtn>
				</form>
			</div>
		</aside>

		<!-- Inbounds List - Main Content -->
		<main class="lg:col-span-8 xl:col-span-9">
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 shadow-lg backdrop-blur-sm">
				<!-- Search Header -->
				<div class="border-b border-gray-700/50 p-6">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h3 class="text-lg font-semibold text-white">Inbound Records</h3>

						<!-- Search Form -->
						<div class="relative w-full max-w-md sm:w-auto">
							<input
								bind:value={searchQuery}
								type="text"
								name="search"
								placeholder="Search inbounds..."
								class="input input-neutral w-full rounded-full border-gray-600 bg-gray-800/50 pr-4 pl-10 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
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
								<th class="px-6 py-4 text-left font-medium text-gray-300">Number</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Client</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Description</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Type</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Created</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredInbounds as inbound, index (inbound.id)}
								<tr
									class="border-b border-gray-700/30 transition-colors hover:bg-gray-800/50"
									in:fade={{ delay: index * 50 }}
								>
									<td class="px-6 py-4">
										{#if inbound.inboundNumber === ''}
											<div class="flex items-center gap-2">
												<AlertCircle class="h-4 w-4 text-orange-400" />
												<span class="text-xs text-orange-400 italic">Update Required</span>
											</div>
										{:else}
											<span class="font-mono text-gray-300">{inbound.inboundNumber}</span>
										{/if}
									</td>
									<td class="px-6 py-4 text-gray-300">{inbound.clientName}</td>
									<td class="px-6 py-4 text-gray-400">{inbound.description}</td>
									<td class="px-6 py-4">
										<span
											class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {inbound.isSubscribed
												? 'bg-blue-500/20 text-blue-400'
												: 'bg-gray-500/20 text-gray-400'}"
										>
											{inbound.isSubscribed ? 'T1' : 'EXA'}
										</span>
									</td>
									<td class="px-6 py-4 text-gray-400">
										{new Date(inbound.createdAt).toLocaleDateString()}
									</td>
									<td class="px-6 py-4">
										<a
											href="/inbounds/{inbound.id}"
											class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
											title="View Inbound Details"
										>
											<Eye class="h-4 w-4" />
											View
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Card View -->
				<div class="block space-y-4 p-6 lg:hidden">
					{#each filteredInbounds as inbound, index (inbound.id)}
						<div
							class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
							in:fly={{ y: 20, delay: index * 100 }}
						>
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-2">
									{#if inbound.inboundNumber === ''}
										<AlertCircle class="h-4 w-4 text-orange-400" />
										<span class="text-xs text-orange-400 italic">Update Required</span>
									{:else}
										<span class="font-mono text-sm text-gray-300">{inbound.inboundNumber}</span>
									{/if}
								</div>
								<span
									class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {inbound.isSubscribed
										? 'bg-blue-500/20 text-blue-400'
										: 'bg-gray-500/20 text-gray-400'}"
								>
									{inbound.isSubscribed ? 'T1' : 'EXA'}
								</span>
							</div>

							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-gray-400">Client:</span>
									<span class="text-gray-300">{inbound.clientName}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Description:</span>
									<span class="text-right text-gray-300">{inbound.description}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Created:</span>
									<span class="text-gray-300"
										>{new Date(inbound.createdAt).toLocaleDateString()}</span
									>
								</div>
							</div>

							<div class="mt-4 flex justify-end">
								<a
									href="/inbounds/{inbound.id}"
									class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
								>
									<Eye class="h-4 w-4" />
									View Details
								</a>
							</div>
						</div>
					{/each}
				</div>

				<!-- Empty State -->
				{#if filteredInbounds.length === 0}
					<div class="p-12 text-center">
						<Package2 class="mx-auto mb-4 h-12 w-12 text-gray-500" />
						<h3 class="mb-2 text-lg font-medium text-gray-300">No inbounds found</h3>
						<p class="mb-6 text-sm text-gray-500">
							{searchQuery
								? 'Try adjusting your search criteria'
								: 'Get started by creating your first inbound'}
						</p>
						{#if !searchQuery}
							<button
								onclick={() => document.getElementById('clientName')?.focus()}
								class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
							>
								<Plus class="h-4 w-4" />
								Create First Inbound
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
	:global(.input:focus, .select:focus) {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	/* Smooth transitions */
	:global(.transition-colors) {
		transition-property: color, background-color, border-color;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}
</style>
