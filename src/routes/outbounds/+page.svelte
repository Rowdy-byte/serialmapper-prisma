<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye, Search } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { invalidate } from '$app/navigation';
	import BackToTop from '$lib/components/BackToTop.svelte';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');

	const clients = data.clients;
	const outbounds = data.outbounds;

	// Maak de lijst reactive zodat hij herberekend wordt bij wijziging van 'search'
	let filterdoutbounds = $state(outbounds);

	$effect(() => {
		filterdoutbounds = outbounds.filter((outbound) => {
			if (searchQuery.trim()) {
				return (
					(outbound.clientName &&
						outbound.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
					(outbound.description &&
						outbound.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
					outbound.outboundNumber.toString().toLowerCase().includes(searchQuery.toLowerCase())
				);
			}
			return true;
		});
	});

	function handleCreateOutbound(event: Event) {
		if (!confirm('Are you sure you want to create this inbound?')) {
			event.preventDefault();
		}
		invalidate('outbounds');
	}

	if (form?.success) {
		toast.success(form?.message, {
			duration: 3000,
			style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
		});
	}
	if (form?.issues) {
		for (const issue of form.issues) {
			toast.error(issue.message, {
				duration: 3000,
				style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	}
</script>

<BackToTop scrollTo="scroll to top" />

<h1 class="py-4 text-lg font-bold">Outbounds</h1>

<main class="max-auto flex max-w-3xl flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-4 font-bold">Create Outbound</h1>

		<form class="flex flex-col gap-4" action="?/createOutbound" method="post">
			<select
				disabled={form?.success}
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				name="clientName"
				required
			>
				<option value="">-- Select Client --</option>
				{#each clients as client}
					<option value={client.name}>{client.name}</option>
				{/each}
			</select>

			<input
				disabled={form?.success}
				type="text"
				name="description"
				placeholder="Description"
				class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				required
			/>
			<button
				disabled={form?.success}
				onclick={handleCreateOutbound}
				type="submit"
				class="rounded-md bg-orange-500 p-3 text-sm hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
			>
				Create Outbound
			</button>
		</form>
	</section>

	<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<section class="flex items-center justify-between">
			<h1 class="text-center font-bold">List</h1>

			<!-- Search filter -->
			<form class="relative py-1">
				<input
					bind:value={searchQuery}
					type="text"
					name="search"
					placeholder="Search outbounds"
					class="w-full rounded border bg-gray-950 py-2 pr-4 pl-10 text-sm"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
		</section>

		<table class="w-full text-left text-sm">
			<thead>
				<tr class="text-gray-500">
					<th class="border border-gray-500 p-2">No</th>
					<th class="border border-gray-500 p-2">Client</th>
					<th class="hidden border border-gray-500 p-2 md:table-cell">Description</th>
					<th class="hidden border border-gray-500 p-2 md:table-cell">Created</th>
					<th class="border border-gray-500 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filterdoutbounds as outbound}
					<tr in:fly={{ y: 20 }} out:slide class="hover:bg-orange-800/20">
						<td class="border border-gray-500 p-2">{outbound.outboundNumber}</td>
						<td class="border border-gray-500 p-2">{outbound.clientName}</td>
						<td class="hidden border border-gray-500 p-2 md:table-cell">{outbound.description}</td>
						<td class="hidden border border-gray-500 p-2 md:table-cell">
							{new Date(outbound.createdAt).toLocaleDateString()}
						</td>
						<td class="border border-gray-500 p-2">
							<a
								href={`/outbounds/${outbound.id}`}
								class="text-blue-500 underline"
								title="View Inbound"
							>
								<Eye size="16" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if outbounds.length === 0}
			<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No outbounds found.</p>
		{/if}
	</section>
</main>
