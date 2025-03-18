<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { Eye } from '@lucide/svelte';

	let { data, form }: PageProps = $props();

	const products = data.products;

	function handleCreateProduct(event: Event) {
		if (!confirm('Are you sure you want to create this product?')) {
			event.preventDefault();
		}
		goto('/products');
	}
</script>

<h1 class="py-4 text-xl font-bold">Products</h1>

<main class="flex flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-6 font-bold">Create Product</h1>
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
				onclick={handleCreateProduct}
				class="rounded-md
            bg-blue-500 p-2 hover:cursor-pointer hover:border-gray-400 hover:bg-blue-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Create Product</button
			>
		</form>
	</section>
	<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-6 font-bold">Products List</h1>
		<table class="table w-full">
			<thead>
				<tr>
					<th class="border border-gray-300 p-2">Name</th>
					<th class="border border-gray-300 p-2">Description</th>
					<th class="border border-gray-300 p-2">Number</th>
					<th class="border border-gray-300 p-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each products as product}
					<tr class="hover:bg-slate-800">
						<td class="border border-gray-300 p-2">{product.name}</td>
						<td class="border border-gray-300 p-2">{product.description}</td>
						<td class="border border-gray-300 p-2">{product.number}</td>
						<td class="border border-gray-300 p-2">
							<a class="text-blue-500 underline" href={`products/${product.id}`}>
								<Eye size="16" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>
