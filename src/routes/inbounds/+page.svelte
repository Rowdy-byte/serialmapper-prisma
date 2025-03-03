<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	let { data, form }: PageProps = $props();
	const clients = data.clients;
	const inbounds = data.inbounds;

	console.log(data);
</script>

<h1 class="py-4 text-xl font-bold">Inbounds</h1>

<main class="flex flex-col gap-4">
	<section class="max-w-sm">
		<h1 class="font-bold">Create Inbound</h1>
		<form class="flex flex-col gap-4" action="?/createInbound" method="post">
			<select
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
				name="client"
				><option value="selectClient">--Select Client--</option>
				<!-- fetch data from db with sveltekit loadfunction -->
				{#each clients as client}
					<option value={client.id}>{client.name}</option>
				{/each}
			</select>
			<input
				type="text"
				name="description"
				placeholder="Description"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>

			<button
				class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create</button
			>
		</form>
	</section>
	<section>
		<h1 class="font-bold">Inbounds List</h1>
		<table class="w-full">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Client</th>
					<th class="border border-gray-300 p-2">Description</th>
					<th class="border border-gray-300 p-2">Created</th>
					<th class="border border-gray-300 p-2">details</th>
				</tr>
			</thead>
			<tbody>
				{#each inbounds as inbound}
					<tr>
						<td class="border border-gray-300 p-2">{inbound.clientName}</td>
						<td class="border border-gray-300 p-2">{inbound.description}</td>
						<td class="border border-gray-300 p-2">{inbound.createdAt}</td>
						<td class="border border-gray-300 p-2">
							<a href={`inbounds/${inbound.id}`}>Details</a>
						</td></tr
					>
				{/each}
			</tbody>
		</table>
	</section>
</main>
