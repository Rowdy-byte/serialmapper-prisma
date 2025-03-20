<script lang="ts">
	import type { PageProps, SubmitFunction } from './$types';
	import { Eye } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { fade, fly, slide } from 'svelte/transition';
	import Toast from '$lib/components/Toast.svelte';
	import toast from 'svelte-french-toast';

	let { data, form }: PageProps = $props();

	let loading = $state(false);

	const clients = data.clients;
	const inbounds = data.inbounds;

	function handleCreateInbound(event: Event) {
		if (!confirm('Are you sure you want to create this inbound?')) {
		}
		window.location.reload();
	}

	// const submitCreateInbound: SubmitFunction = async ({
	// 	formElement,
	// 	formData,
	// 	action,
	// 	cancel,
	// 	submitter
	// }) => {
	// 	// const { clientName, description } = Object.fromEntries(formData);
	// 	loading = true;

	// 	return async ({ result, update }) => {
	// 		loading = false;

	// 		await update();

	// 		window.location.reload();
	// 	};
	// };
</script>

{#if loading}
	<Toast text="Inbound Succesful Created!" backgroundColor="bg-green-500" />
{/if}

<h1 class="py-4 text-xl font-bold">Inbounds</h1>

<main class="max-auto flex max-w-3xl flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-6 font-bold">Create Inbound</h1>

		<form class="flex flex-col gap-4" action="?/createInbound" method="post">
			<select
				disabled={loading}
				class="rounded-md border border-gray-300 p-2 text-gray-800"
				name="clientName"
				required
			>
				<option value="">-- Select Client --</option>
				{#each clients as client}
					<option value={client.name}>{client.name}</option>
				{/each}
			</select>

			<input
				disabled={loading}
				type="text"
				name="description"
				placeholder="Description"
				class="rounded-md border border-gray-300 p-2 text-gray-800"
				required
			/>
			<button
				disabled={loading}
				onclick={handleCreateInbound}
				type="submit"
				class="rounded-md bg-blue-500 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				class:hover:text-white={loading}
			>
				{loading ? 'Successful!' : 'Create Inbound'}
			</button>
		</form>
	</section>

	<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-6 font-bold">Inbounds List</h1>
		<table class="table w-full border border-gray-300">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Client</th>
					<th class="border border-gray-300 p-2">Description</th>
					<th class="border border-gray-300 p-2">Created</th>
					<th class="border border-gray-300 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each inbounds as inbound}
					<tr in:fly={{ y: 20 }} out:slide class="hover:bg-slate-800">
						<td class="border border-gray-300 p-2">{inbound.clientName}</td>
						<td class="border border-gray-300 p-2">{inbound.description}</td>
						<td class="border border-gray-300 p-2"
							>{new Date(inbound.createdAt).toLocaleDateString()}</td
						>
						<td class="border border-gray-300 p-2">
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
			<p class="mt-2 border border-gray-300 p-2">No inbounds found.</p>
		{/if}
	</section>
</main>
