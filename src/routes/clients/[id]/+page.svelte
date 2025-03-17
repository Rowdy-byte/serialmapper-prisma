<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();

	let client = data.client;
	let success = form?.success;

	function handleDelete() {
		if (confirm('Are you sure you want to delete this client?')) {
			form?.success;
			goto('/clients');
		}
	}

	function handleUpdate() {
		if (confirm('Are you sure you want to update this client?')) {
			form?.success;
			goto('/clients');
		}
	}
</script>

<main class="flex flex-col gap-12">
	<section class="max-w-sm">
		<h1 class="font-bold">Edit Client</h1>
		<form class="flex flex-col gap-4" method="post">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
				value={client?.name}
			/>
			<button
				formaction="?/updateClient"
				onclick={handleUpdate}
				class="rounded-md bg-green-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>
	<section>
		<fieldset class="flex items-center gap-2 border border-gray-300 p-2">
			<legend>Delete Client</legend>
			<form method="post">
				<button
					onclick={handleDelete}
					formaction="?/deleteClient"
					class="rounded-md bg-red-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Delete</button
				>
			</form>
			<p>This will permanently delete this Client!</p>
		</fieldset>
	</section>
</main>
