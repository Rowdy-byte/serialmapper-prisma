<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	let { data, form }: PageProps = $props();
	const clients = data.clients;
	const inbounds = data.inbounds;

	console.log(data);
</script>

<h1 class=" py-4 text-xl font-bold">Inbounds</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm">
		<h1 class="font-bold">Create Inbound</h1>
		<form class="flex flex-col gap-4" action="?/createInbound" method="post">
			<select class="rounded-md border border-gray-300 p-2 text-gray-800" name="clientName">
				<option value="">-- Select Client --</option>
				{#each clients as client}
					<option value={client.name}>{client.name}</option>
				{/each}
			</select>
			<input
				type="text"
				name="description"
				placeholder="Description"
				class="rounded-md border border-gray-300 p-2 text-gray-800"
			/>
			<button type="submit" class="rounded-md bg-blue-500 p-2 text-white">Create Inbound</button>
		</form>
	</section>

	<section>
		<h1 class="font-bold">Inbounds List</h1>
		<table class="w-full border border-gray-300">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Client</th>
					<th class="border border-gray-300 p-2">Description</th>
					<th class="border border-gray-300 p-2">Created</th>
					<th class="border border-gray-300 p-2">Details</th>
				</tr>
			</thead>
			<tbody>
				{#each inbounds as inbound}
					<tr>
						<td class="border border-gray-300 p-2">{inbound.clientName}</td>
						<td class="border border-gray-300 p-2">{inbound.description}</td>
						<td class="border border-gray-300 p-2"
							>{new Date(inbound.createdAt).toLocaleDateString()}</td
						>
						<td class="border border-gray-300 p-2">
							<a href={`/inbounds/${inbound.id}`} class="text-blue-500 underline">Details</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>
