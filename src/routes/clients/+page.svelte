<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye } from '@lucide/svelte';

	let { data }: PageProps = $props();

	let clients = data.clients;

	function handleCreateClient(event: Event) {
		if (!confirm('Are you sure you want to create this client?')) {
			event.preventDefault();
		}
	}
</script>

<h1 class="py-4 text-xl font-bold">Clients</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Create New Client</h1>
		<form class="flex flex-col gap-4" action="" method="post">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<button
				onclick={handleCreateClient}
				class="rounded-md
            bg-blue-500 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create</button
			>
		</form>
	</section>
	<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Clients List</h1>
		<!-- show clientlist in a table -->
		<table class="w-full border text-sm">
			<thead>
				<tr class="text-gray-500">
					<th class="border border-gray-300 p-2">Name</th>
					<th class="border border-gray-300 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each clients as client}
					<tr class="hover:bg-slate-800">
						<td class="border border-gray-300 p-2">{client.name}</td>
						<td class="border border-gray-300 p-2">
							<a
								href="/clients/{client.id}"
								class="text-blue-500 hover:cursor-pointer hover:text-blue-800"
							>
								<Eye size="16" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>
