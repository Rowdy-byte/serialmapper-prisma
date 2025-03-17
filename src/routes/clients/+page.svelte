<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let clients = data.clients;
</script>

<h1 class="py-4 text-xl font-bold">Clients</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm">
		<h1 class="font-bold">Create New Client</h1>
		<form class="flex flex-col gap-4" action="" method="post">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<button
				class="rounded-md border border-gray-300
            bg-blue-500 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create</button
			>
		</form>
	</section>
	<section>
		<h1 class="font-bold">Clients List</h1>
		<!-- show clientlist in a table -->
		<table class="w-full">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Name</th>
					<th class="border border-gray-300 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each clients as client}
					<tr>
						<td class="border border-gray-300 p-2">{client.name}</td>
						<td class="border border-gray-300 p-2">
							<a
								href="/clients/{client.id}"
								class="text-blue-500 hover:cursor-pointer hover:text-blue-800">View</a
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>
