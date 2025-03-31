<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye, Search } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import { applyAction, enhance } from '$app/forms';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');
	const clients = data.clients;

	let filterdInbounds = $state(data.inbounds);

	function handleCreateInbound(event: Event) {
		if (!confirm('Are you sure you want to create this inbound?')) {
			event.preventDefault();
		}
		invalidate('inbounds');
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

	$effect(() => {
		filterdInbounds = data.inbounds.filter((inbound) => {
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
</script>

<BackToTop scrollTo="scroll to top" />

<div class="container mx-auto py-4">
	<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="py-4 text-lg font-bold">Inbounds</h1>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Create Inbound</h1>

			<form
				class="flex flex-col gap-4"
				action="?/createInbound"
				onsubmit={handleCreateInbound}
				method="post"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							await invalidateAll();
							toast.success('Inbound Created Successfully');
						} else {
							await applyAction(result);
						}
					};
				}}
			>
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
				<PrimaryBtn disabled={form?.success ?? false} type={'submit'}>Create Inbound</PrimaryBtn>
			</form>
		</section>

		<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
			<form class="relative py-1">
				<input
					bind:value={searchQuery}
					type="text"
					name="search"
					placeholder="Search Inbounds"
					class="w-full max-w-sm rounded-full border bg-gray-950 py-2 pl-10 text-sm"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2">No</th>
						<th class="border border-gray-500 p-2">Client</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Description</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Customs</th>

						<th class="hidden border border-gray-500 p-2 md:table-cell">Created</th>
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filterdInbounds as inbound}
						<tr in:fly={{ y: 20 }} out:slide class="hover:bg-gray-500/20">
							<td class="border border-gray-500 p-2">{inbound.inboundNumber}</td>
							<td class="border border-gray-500 p-2">{inbound.clientName}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{inbound.description}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell"
								>{inbound.isSubscribed ? 'T1' : 'EXA'}</td
							>
							<td class="hidden border border-gray-500 p-2 md:table-cell">
								{new Date(inbound.createdAt).toLocaleDateString()}
							</td>
							<td class="border border-gray-500 p-2">
								<a
									href={`/inbounds/${inbound.id}`}
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
			{#if data.inbounds.length === 0}
				<p class="mt-2 rounded-full bg-gray-500 p-1 px-2 text-sm">No inbounds found.</p>
			{/if}
		</section>
	</main>
</div>
