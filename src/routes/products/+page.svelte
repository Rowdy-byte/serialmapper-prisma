<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { Eye } from '@lucide/svelte';
	import toast from 'svelte-french-toast';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';

	let { data, form }: PageProps = $props();

	const products = data.products;

	function handleCreateProduct(event: Event) {
		if (!confirm('Are you sure you want to create this product?')) {
			event.preventDefault();
		}
		goto('/products');
	}

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
	<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md">
		<h1 class="py-4 text-xl font-bold">Products</h1>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Create Product</h1>
			<form class="flex flex-col gap-4" action="?/createProduct" method="post">
				<input type="text" name="name" placeholder="Name" class="input input-neutral w-full" />
				<input
					type="text"
					name="description"
					placeholder="Description"
					class="input input-neutral w-full"
				/>
				<input type="text" name="number" placeholder="Number" class="input input-neutral w-full" />
				<input
					type="text"
					name="value"
					placeholder="Value (€)"
					class="input input-neutral w-full"
				/>
				<PrimaryBtn type={'submit'} onclick={handleCreateProduct}>Create Product</PrimaryBtn>
			</form>
		</section>
		<section class="rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Products List</h1>
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left text-sm font-bold text-gray-400">
						<th class="border border-gray-500 p-2">Name</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Description</th>
						<th class="border border-gray-500 p-2">Number</th>
						<th class="border border-gray-500 p-2">Value (€)</th>
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each products as product}
						<tr class="hover:bg-slate-800">
							<td class="border border-gray-500 p-2">{product.name}</td>
							<td class="hidden border border-gray-500 p-2 md:table-cell">{product.description}</td>
							<td class="border border-gray-500 p-2">{product.number}</td>
							<td class="border border-gray-500 p-2">{product.value}</td>
							<td class="border border-gray-500 p-2">
								<a class="text-blue-500 underline" href={`products/${product.id}`}>
									<Eye size="16" />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
		<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>
