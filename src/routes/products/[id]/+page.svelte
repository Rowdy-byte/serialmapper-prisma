<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	let { data, form }: PageProps = $props();

	const product = data.product;

	function handleDeleteProduct() {
		if (confirm('Are you sure you want to delete this product?')) {
			form?.success;
			goto('/products');
		}
	}

	function handleUpdateProduct() {
		if (confirm('Are you sure you want to update this product?')) {
			form?.success;
			goto('/products');
		}
	}

	console.log(data);
</script>

<h1 class="py-4 text-xl font-bold">Product Details</h1>

<main class="flex flex-col gap-4">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<h1 class="pb-6 font-bold">Product</h1>
		<form class="flex flex-col gap-4" method="post">
			<input
				type="text"
				name="name"
				value={product?.name}
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<input
				type="text"
				name="description"
				value={product?.description}
				placeholder="Description"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>
			<input
				type="text"
				name="number"
				value={product?.number}
				placeholder="Number"
				class="rounded-md border
            border-gray-300 p-2 text-gray-800"
			/>

			<button
				formaction="?/updateProduct"
				onclick={handleUpdateProduct}
				class="rounded-md bg-green-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>
	<section class="rounded-lg bg-gray-900 p-4 pb-6 shadow-md">
		<fieldset class="flex items-center gap-2 border border-gray-300 p-2">
			<legend>Delete Product</legend>
			<form method="post">
				<button
					onclick={handleDeleteProduct}
					formaction="?/deleteProduct"
					class="rounded-md bg-red-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Delete</button
				>
			</form>
			<p>This will permanently delete this product!</p>
		</fieldset>
	</section>
</main>
