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

<main>
	<section>
		<h1 class="font-bold">Edit Client</h1>
		<form method="post">
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
				class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>
	<section>
		<h1 class="font-bold">Delete Client</h1>
		<form method="post">
			<button
				onclick={handleDelete}
				formaction="?/deleteClient"
				class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Delete</button
			>
		</form>
	</section>
</main>
<h1 class="py-4 text-xl font-bold">Client Details</h1>
