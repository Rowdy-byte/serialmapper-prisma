<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	let { data, form }: PageProps = $props();

	const products = data.products;

	console.log(data);
</script>

<h1 class="py-4 text-xl font-bold">Products</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm">
		<h1 class="font-bold">Create Product</h1>
		<form class="flex flex-col gap-4" action="?/createProduct" method="post">
			<input
				type="text"
				name="name"
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<input
				type="text"
				name="description"
				placeholder="Description"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<input
				type="text"
				name="number"
				placeholder="Number"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<button
				class="rounded-md border
            border-gray-300 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create Product</button
			>
		</form>
	</section>
	<section>
		<h1 class="font-bold">Products List</h1>
		<table class="w-full">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Name</th>
					<th class="border border-gray-300 p-2">Description</th>
					<th class="border border-gray-300 p-2">Number</th>
					<th class="border border-gray-300 p-2">details</th>
				</tr>
			</thead>
			<tbody>
				{#each products as product}
					<tr>
						<td class="border border-gray-300 p-2">{product.name}</td>
						<td class="border border-gray-300 p-2">{product.description}</td>
						<td class="border border-gray-300 p-2">{product.number}</td>
						<td class="border border-gray-300 p-2">
							<a href={`products/${product.id}`}>Details</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>
