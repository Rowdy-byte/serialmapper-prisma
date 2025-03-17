<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();

	const client = data.client;
	const clients = data.clients;
	const inbound = data.inbound;
	const products = data.products;
	const inboundProducts = data.inboundProducts;

	console.log(data);

	function handleDeleteInbound() {
		if (confirm('Are you sure you want to delete this inbound?')) {
			form?.success;
			goto('/inbounds');
		}
	}

	function handleUpdateInbound() {
		if (confirm('Are you sure you want to update this inbound?')) {
			form?.success;
			goto('/inbounds');
		}
	}

	function handleAddBatch() {
		if (confirm('Are you sure you want to add this batch to this inbound?')) {
			form?.success;
			goto('/inbounds');
		}
	}
</script>

<h1 class="py-4 text-xl font-bold">Inbound Details</h1>

<main class="flex flex-col gap-2">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Inbound</h1>
		<form class="flex flex-col gap-4" method="post">
			<select
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
				name="clientName"
			>
				<option value="clientName">{client?.clientName}</option>
				<!-- fetch data from db with sveltekit loadfunction -->
				{#each clients as client}
					<option value={client.name}>{client.name}</option>
				{/each}
			</select>
			<input
				type="text"
				name="description"
				value={inbound?.description}
				placeholder="Description"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>

			<button
				formaction="?/updateInbound"
				onclick={handleUpdateInbound}
				class="rounded-md bg-green-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>

	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-4 font-bold">Add single Product to Inbound</h1>
		<form class="flex flex-col gap-4" action="?/addInboundProductToInbound" method="post">
			<input hidden type="text" name="inboundId" value={inbound?.id} />

			<select
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
				name="product"
			>
				<option value="products">-- Select Product --</option>
				<!-- fetch data from db with sveltekit loadfunction -->
				{#each products as product}
					<option value={product.name}>{product.number}</option>
				{/each}
			</select>
			<!-- input for quantity -->

			<textarea
				name="serialnumber"
				placeholder="Serialnumber"
				class="rounded-md border
			border-gray-300 p-2 text-gray-800"
			></textarea>
			<button
				class="rounded-md bg-blue-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Add</button
			>
			<section class="flex max-w-sm flex-col gap-4 pt-8">
				<h1 class="font-bold">Add multiple Products to Inbound</h1>
				<textarea
					name="batch"
					placeholder="Batch Serialnumbers "
					class="rounded-md border
	border-gray-300 p-2 text-gray-800"
				></textarea>
				<button
					formaction="?/addBatchInboundProductToInbound"
					onclick={handleAddBatch}
					class="rounded-md bg-blue-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Add Batch</button
				>
			</section>
		</form>
	</section>

	<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<h1 class="py-6 font-bold">Products in this Inbound</h1>

		<table class="table w-full">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2"></th>
					<th class="border border-gray-300 p-2">Product</th>
					<th class="border border-gray-300 p-2">Serialnumbers</th>
					<th class="border border-gray-300 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				<!-- only products with inboundId -->
				{#each inboundProducts as inboundProduct, i}
					{#if inboundProduct.inboundId === inbound?.id}
						<tr class="hover:bg-slate-600">
							<td class="border border-gray-300 p-2">{i + 1}</td>
							<td class="border border-gray-300 p-2">{inboundProduct.product}</td>
							<td class="border border-gray-300 p-2">{inboundProduct.serialnumber}</td>
							<td class="border border-gray-300 p-2">
								<a
									class="text-blue-500 underline"
									href={`/inbounds/${inbound.id}/inbound-product/${inboundProduct.id}`}>View</a
								>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
		{#if inboundProducts.length === 0}
			<p class="mt-2 border border-gray-300 p-2">No products found.</p>
		{/if}
	</section>
	<section class="flex flex-col gap-4 rounded-lg bg-gray-900 p-4 pt-6 pb-6 shadow-md">
		<fieldset class="flex items-center gap-2 border border-gray-300 p-2">
			<legend>Delete Inbound</legend>
			<form method="post">
				<button
					formaction="?/deleteInbound"
					onclick={handleDeleteInbound}
					class="rounded-md bg-red-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Delete</button
				>
			</form>
			<p>This will permanently delete this Inbound!</p>
		</fieldset>
	</section>
</main>
