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
				class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create</button
			>
		</form>
	</section>
	<section>
		<h1 class="font-bold">Client List</h1>
		<ul class="flex flex-col gap-2">
			{#each clients as client, i}
				<li class="flex flex-row gap-2">
					<span>{i + 1}</span>
					<a href="/clients/{client.id}" aria-label="link-to-details"><span>{client.name}</span></a>
				</li>
			{/each}
		</ul>
	</section>
</main>
