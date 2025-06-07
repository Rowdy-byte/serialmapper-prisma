<script lang="ts">
	import type { PageProps } from './$types';

	type Client = {
		id: number;
		name: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		createdAt: Date;
	};
	import {
		Eye,
		Search,
		Plus,
		Users,
		Star,
		UserCheck,
		Building2,
		Mail,
		Phone,
		Calendar,
		Edit3,
		Trash2,
		Crown
	} from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { invalidateAll } from '$app/navigation';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import { applyAction, enhance } from '$app/forms';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	let filteredClients = $state(data.clients);
	let loading = $state(false);
	let showCreateForm = $state(false);

	function handleCreateClient(event: Event) {
		if (!confirm('Are you sure you want to create this client?')) {
			event.preventDefault();
		}
	}

	function handleDeleteClient(event: Event) {
		if (!confirm('Are you sure you want to delete this client?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		filteredClients = data.clients.filter((client) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesName = client.name.toLowerCase().includes(query);
				const matchesEmail = client.email?.toLowerCase().includes(query);
				const matchesPhone = client.phone?.toLowerCase().includes(query);

				return matchesName || matchesEmail || matchesPhone;
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
					toast.success('Client created successfully', toastStyleSucc);
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
					toast.success('Client deleted successfully', toastStyleSucc);
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error('Failed to delete client', toastStyleErr);
				}
			} finally {
				loading = false;
				await update();
			}
		};
	}

	// Calculate stats
	const stats = {
		total: data.clients.length,

		withEmail: data.clients.filter((c) => c.email).length,
		withPhone: data.clients.filter((c) => c.phone).length
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
					<h1 class="text-3xl font-bold tracking-tight text-white">Client Management</h1>
					<p class="mt-1 text-sm text-gray-400">
						Manage your client relationships and subscriptions
					</p>
				</div>
				<div class="flex items-center gap-2 text-sm text-gray-400">
					<Users class="h-4 w-4" />
					<span>{stats.total} Total Clients</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
		<div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">Total Clients</span>
				<div class="rounded-lg bg-blue-500/20 p-2">
					<Users class="h-4 w-4 text-blue-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.total}</p>
		</div>

		<!-- <div class="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">T1 Subscribers</span>
				<div class="rounded-lg bg-purple-500/20 p-2">
					<Crown class="h-4 w-4 text-purple-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.t1Subscribers}</p>
			<div class="mt-2 flex items-center gap-2">
				<div class="h-1.5 w-full rounded-full bg-gray-700">
					<div
						class="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
						style="width: {subscriptionRate}%"
					></div>
				</div>
				<span class="text-xs text-purple-400">{subscriptionRate}%</span>
			</div>
		</div> -->

		<div class="rounded-xl border border-green-500/20 bg-green-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">With Email</span>
				<div class="rounded-lg bg-green-500/20 p-2">
					<Mail class="h-4 w-4 text-green-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.withEmail}</p>
		</div>

		<div class="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-400">With Phone</span>
				<div class="rounded-lg bg-orange-500/20 p-2">
					<Phone class="h-4 w-4 text-orange-400" />
				</div>
			</div>
			<p class="mt-2 text-2xl font-bold text-white">{stats.withPhone}</p>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-6 lg:grid-cols-12">
		<!-- Create Client Form - Sidebar -->
		<aside class="lg:col-span-4 xl:col-span-3">
			<div
				class="sticky top-6 rounded-xl border border-gray-700/50 bg-gray-900/40 p-6 shadow-lg backdrop-blur-sm"
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-blue-500/10 p-2">
							<Plus class="h-5 w-5 text-blue-400" />
						</div>
						<h2 class="text-lg font-semibold text-white">Create Client</h2>
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
						action="?/createClient"
						onsubmit={handleCreateClient}
						method="post"
						use:enhance={enhanceForm}
					>
						<div>
							<label for="name" class="mb-2 block text-sm font-medium text-gray-300">
								Client Name *
							</label>
							<input
								id="name"
								disabled={form?.success || loading}
								type="text"
								name="name"
								placeholder="Enter client name"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label for="email" class="mb-2 block text-sm font-medium text-gray-300">
								Email Address
							</label>
							<input
								id="email"
								disabled={form?.success || loading}
								type="email"
								name="email"
								placeholder="client@example.com"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label for="phone" class="mb-2 block text-sm font-medium text-gray-300">
								Phone Number
							</label>
							<input
								id="phone"
								disabled={form?.success || loading}
								type="tel"
								name="phone"
								placeholder="+1 (555) 123-4567"
								class="input input-neutral w-full border-gray-600 bg-gray-800/50 text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>

						<!-- <div class="flex items-center gap-3 rounded-lg bg-gray-800/30 p-4">
							<input type="checkbox" name="isSubscribed" value="on" class="checkbox checkbox-sm" />
							<div>
								<label class="text-sm font-medium text-gray-300">T1 Subscription</label>
								<p class="text-xs text-gray-500">Premium client tier with additional benefits</p>
							</div>
						</div> -->

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
								Create Client
							{/if}
						</PrimaryBtn>
					</form>
				</div>
			</div>
		</aside>

		<!-- Clients List - Main Content -->
		<main class="lg:col-span-8 xl:col-span-9">
			<div class="rounded-xl border border-gray-700/50 bg-gray-900/40 shadow-lg backdrop-blur-sm">
				<!-- Search Header -->
				<div class="border-b border-gray-700/50 p-6">
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h3 class="text-lg font-semibold text-white">Client Directory</h3>

						<!-- Search Form -->
						<div class="relative w-full max-w-md sm:w-auto">
							<input
								bind:value={searchQuery}
								type="text"
								name="search"
								placeholder="Search clients..."
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
								<th class="px-6 py-4 text-left font-medium text-gray-300">Client</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Contact</th>
								<!-- <th class="px-6 py-4 text-left font-medium text-gray-300">Subscription</th> -->
								<th class="px-6 py-4 text-left font-medium text-gray-300">Created</th>
								<th class="px-6 py-4 text-left font-medium text-gray-300">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredClients as client, index (client.id)}
								<tr
									class="border-b border-gray-700/30 transition-colors hover:bg-gray-800/50"
									in:fade={{ delay: index * 50 }}
								>
									<td class="px-6 py-4">
										<div class="flex items-center gap-3">
											<div class="flex-shrink-0">
												<div class="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-2">
													<span class="text-sm font-bold text-white">
														{client.name.charAt(0).toUpperCase()}
													</span>
												</div>
											</div>
											<div>
												<div class="font-medium text-gray-300">{client.name}</div>
												<div class="text-xs text-gray-500">Client ID: {client.id}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 text-gray-400">
										<div class="space-y-1">
											{#if client.email}
												<div class="flex items-center gap-2">
													<Mail class="h-3 w-3 text-gray-500" />
													<span class="text-sm">{client.email}</span>
												</div>
											{/if}
											{#if client.phone}
												<div class="flex items-center gap-2">
													<Phone class="h-3 w-3 text-gray-500" />
													<span class="text-sm">{client.phone}</span>
												</div>
											{/if}
											{#if !client.email && !client.phone}
												<span class="text-xs text-gray-500 italic">No contact info</span>
											{/if}
										</div>
									</td>
									<!-- <td class="px-6 py-4">
										<span
											class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium {client.isSubscribed
												? 'bg-purple-500/20 text-purple-400'
												: 'bg-gray-500/20 text-gray-400'}"
										>
											{#if client.isSubscribed}
												<Crown class="h-3 w-3" />
												T1 Premium
											{:else}
												<Building2 class="h-3 w-3" />
												EXA Standard
											{/if}
										</span>
									</td> -->
									<td class="px-6 py-4 text-gray-400">
										<div class="flex items-center gap-2">
											<Calendar class="h-3 w-3 text-gray-500" />
											<span class="text-sm">{new Date(client.createdAt).toLocaleDateString()}</span>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="flex items-center gap-2">
											<a
												href="/clients/{client.id}"
												class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
												title="View Client Details"
											>
												<Eye class="h-4 w-4" />
												View
											</a>

											<form
												method="post"
												action="?/deleteClient"
												use:enhance={enhanceDeleteForm}
												class="inline"
											>
												<input type="hidden" name="clientId" value={client.id} />
												<button
													type="submit"
													onclick={handleDeleteClient}
													class="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-600/20"
													title="Delete Client"
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
					{#each filteredClients as client, index (client.id)}
						<div
							class="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4"
							in:fly={{ y: 20, delay: index * 100 }}
						>
							<div class="mb-3 flex items-start justify-between">
								<div class="flex items-center gap-3">
									<div class="flex-shrink-0">
										<div class="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-2">
											<span class="text-sm font-bold text-white">
												{client.name.charAt(0).toUpperCase()}
											</span>
										</div>
									</div>
									<div>
										<div class="font-medium text-gray-300">{client.name}</div>
										<div class="text-xs text-gray-500">ID: {client.id}</div>
									</div>
								</div>
								<!-- <span
									class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {client.isSubscribed
										? 'bg-purple-500/20 text-purple-400'
										: 'bg-gray-500/20 text-gray-400'}"
								>
									{#if client.isSubscribed}
										<Crown class="h-3 w-3" />
										T1
									{:else}
										EXA
									{/if}
								</span> -->
							</div>

							<div class="mb-4 space-y-2 text-sm">
								{#if client.email}
									<div class="flex items-center gap-2">
										<Mail class="h-3 w-3 text-gray-500" />
										<span class="text-gray-400">{client.email}</span>
									</div>
								{/if}
								{#if client.phone}
									<div class="flex items-center gap-2">
										<Phone class="h-3 w-3 text-gray-500" />
										<span class="text-gray-400">{client.phone}</span>
									</div>
								{/if}
								<div class="flex items-center gap-2">
									<Calendar class="h-3 w-3 text-gray-500" />
									<span class="text-gray-400"
										>{new Date(client.createdAt).toLocaleDateString()}</span
									>
								</div>
							</div>

							<div class="flex gap-2">
								<a
									href="/clients/{client.id}"
									class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
								>
									<Eye class="h-4 w-4" />
									View Details
								</a>

								<form
									method="post"
									action="?/deleteClient"
									use:enhance={enhanceDeleteForm}
									class="inline"
								>
									<input type="hidden" name="clientId" value={client.id} />
									<button
										type="submit"
										onclick={handleDeleteClient}
										class="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-600/10 p-2 text-red-400 transition-colors hover:bg-red-600/20"
										title="Delete Client"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>

				<!-- Empty State -->
				{#if filteredClients.length === 0}
					<div class="p-12 text-center">
						<Users class="mx-auto mb-4 h-12 w-12 text-gray-500" />
						<h3 class="mb-2 text-lg font-medium text-gray-300">No clients found</h3>
						<p class="mb-6 text-sm text-gray-500">
							{searchQuery
								? 'Try adjusting your search criteria'
								: 'Get started by creating your first client'}
						</p>
						{#if !searchQuery}
							<button
								onclick={() => {
									showCreateForm = true;
									document.getElementById('name')?.focus();
								}}
								class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
							>
								<Plus class="h-4 w-4" />
								Create First Client
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
