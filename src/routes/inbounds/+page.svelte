<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye } from '@lucide/svelte';
	import { fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { goto, invalidate } from '$app/navigation';

	let { data, form }: PageProps = $props();

	const clients = data.clients;
	const inbounds = data.inbounds;

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
</script>

<h1 class="py-4 text-lg font-bold">Inbounds</h1>

<main class="max-auto flex max-w-3xl flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-4 font-bold">Create Inbound</h1>

		<form class="flex flex-col gap-4" action="?/createInbound" method="post">
			<select
				disabled={form?.success}
				class="rounded-md border border-gray-300 p-3 text-sm text-gray-800"
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
				class="rounded-md border border-gray-300 p-3 text-sm text-gray-800"
				required
			/>
			<button
				disabled={form?.success}
				onclick={handleCreateInbound}
				type="submit"
				class="rounded-md bg-blue-500 p-3 text-sm hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
			>
				Create Inbound
			</button>
		</form>
	</section>

	<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Inbounds List</h1>
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
				{#each inbounds as inbound}
					<tr in:fly={{ y: 20 }} out:slide class="hover:bg-gray-800">
						<td class="border border-gray-500 p-2">{inbound.inboundNumber}</td>
						<td class="border border-gray-500 p-2">{inbound.clientName}</td>
						<td class="hidden border border-gray-500 p-2 md:table-cell">{inbound.description}</td>
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
		{#if inbounds.length === 0}
			<p class="mt-2 border border-gray-300 p-2 text-sm">No inbounds found.</p>
		{/if}
	</section>
</main>
