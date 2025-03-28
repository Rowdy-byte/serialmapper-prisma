<script lang="ts">
	import { goto } from '$app/navigation';
	import { CircleHelp, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
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
	            bg-gray-950 p-3 text-sm text-gray-500"
					value={client?.name}
				/>
				<button
					formaction="?/updateClient"
					onclick={handleUpdateClient}
					class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:border-gray-400 hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Update</button
				>
			</form>
		</section>
		<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
			<h1 class="flex w-full items-center justify-between font-bold">Delete Client</h1>
			<form method="post" class="flex gap-2">
				<button
					formaction="?/deleteClient"
					onclick={handleDeleteClient}
					class=" rounded-full bg-orange-500 p-3 text-sm text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit"
				>
					<Trash2 />
				</button>
			</form>
		</section>
	</main>
</div>
