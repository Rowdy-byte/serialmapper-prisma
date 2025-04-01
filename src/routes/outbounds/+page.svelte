<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye, Search } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { invalidate } from '$app/navigation';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');

	const clients = data.clients;
	const outbounds = data.outbounds;

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

<div class="container mx-auto py-4">
	<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md">
		<h1 class="py-4 text-lg font-bold">Outbounds</h1>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Create Outbound</h1>

			<form class="flex flex-col gap-4" action="?/createOutbound" method="post">
				<select
					disabled={form?.success}
					class="select select-neutral w-full"
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
					class="input input-neutral w-full"
					required
				/>
				<PrimaryBtn disabled={form?.success} type={'submit'} onclick={handleCreateOutbound}>
					Create Outbound
				</PrimaryBtn>
			</form>
		</section>

		<section class="flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 pt-6 pb-6 shadow-md">
			<section class="">
				<form class="relative py-1">
					<input
						bind:value={searchQuery}
						type="text"
						name="search"
						placeholder="Search outbounds"
						class="input input-neutral rounded-full pl-10"
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
							<td class="hidden border border-gray-500 p-2 md:table-cell">{outbound.description}</td
							>
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
				<p class="mt-2 rounded-full bg-gray-500 p-1 text-sm">No outbounds found.</p>
			{/if}
		</section>
		<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>
