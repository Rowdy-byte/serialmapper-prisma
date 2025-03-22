<script lang="ts">
	import { goto } from '$app/navigation';
	import { CircleHelp } from '@lucide/svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();

	let client = data.client;
	let success = form?.success;

	let deleteSectionOpen = $state(false);

	function handleDeleteClient(event: Event) {
		if (!confirm('Are you sure you want to delete this client?')) {
			event.preventDefault();
		}
		goto('/clients');
	}

	function handleUpdateClient(event: Event) {
		if (!confirm('Are you sure you want to update this client?')) {
			event.preventDefault();
			return;
		}
		goto('/clients');
	}
</script>

<h1 class="py-4 text-lg font-bold">Client Details</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-4 font-bold">Edit Client</h1>
		<form class="flex flex-col gap-4" method="post">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
				value={client?.name}
			/>
			<button
				formaction="?/updateClient"
				onclick={handleUpdateClient}
				class="rounded-md bg-green-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">
			Delete Client<CircleHelp
				class="transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (deleteSectionOpen = !deleteSectionOpen)}
				size="14"
			/>
		</h1>
		<form method="post" class="flex gap-2">
			<button
				formaction="?/deleteClient"
				onclick={handleDeleteClient}
				class=" rounded-md bg-red-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Delete</button
			>
			<div>
				<ul class="pt-4 pl-3 text-xs text-yellow-500" class:hidden={!deleteSectionOpen}>
					<li class="pb-1">
						<p class="text-sm">
							This will permanently delete this client and all inbounds from this client!
						</p>
					</li>
				</ul>
			</div>
		</form>
	</section>
</main>
