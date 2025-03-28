<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	let { data, form }: PageProps = $props();

	let clients = data.clients;

	function handleCreateClient(event: Event) {
		if (!confirm('Are you sure you want to create this client?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		if (form?.success) {
			toast.success(form.message, {
				duration: 3000,
				style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
		if (form?.success === false) {
			toast.error(form.message, {
				duration: 3000,
				style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	});

	if (form?.issues) {
		for (const issue of form.issues) {
			toast.error(issue.message, {
				duration: 3000,
				style: 'background-color: #f44336; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	}
</script>

<div class="container mx-auto py-4">
	<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="py-4 text-lg font-bold">Clients</h1>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
			<h1 class="pb-4 font-bold">Create New Client</h1>
			<form class="flex flex-col gap-4" action="" method="post">
				<input
					type="text"
					name="name"
					placeholder="Name"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<input
					type="text"
					name="phone"
					placeholder="Phone"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<input
					type="text"
					name="address"
					placeholder="Address"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<input
					type="text"
					name="city"
					placeholder="City"
					class="rounded-md border border-gray-500 bg-gray-950 p-3 text-sm text-gray-500"
				/>
				<button
					onclick={handleCreateClient}
					class="rounded-full bg-orange-500
	            p-3 text-sm font-bold hover:cursor-pointer hover:bg-green-800 hover:text-orange-600 hover:shadow-md hover:transition-all"
					type="submit">Create</button
				>
			</form>
		</section>
		<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
			<h1 class="pb-4 font-bold">Clients List</h1>
			<table class="w-full border text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2">Name</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Email</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Phone</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Address</th>
						<th class="border border-gray-500 p-2">City</th>
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each clients as client}
						<tr class="hover:bg-slate-800">
							<td class=" border border-gray-500 p-2">{client.name}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{client.email}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{client.phone}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{client.address}</td>
							<td class="border border-gray-500 p-2">{client.city}</td>
							<td class="border border-gray-500 p-2">
								<a
									href={`/clients/${client.id}`}
									class="text-blue-500 hover:cursor-pointer hover:text-blue-800"
								>
									<Eye size="16" />
								</a>
							</td></tr
						>
					{/each}
				</tbody>
			</table>
			{#if clients.length === 0}
				<p class="mt-2 rounded-md bg-gray-500 p-1 text-sm">No clients found.</p>
			{/if}
		</section>
		<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md"></section>
	</main>
</div>
