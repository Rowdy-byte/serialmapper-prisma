<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { CircleHelp } from '@lucide/svelte';
	import toast from 'svelte-french-toast';

	let { data, form }: PageProps = $props();

	const product = data.product;

	let deleteSectionOpen = $state(false);

	function handleDeleteProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this product?')) {
			event.preventDefault();
		}
	}

	function handleUpdateProduct(event: Event) {
		if (!confirm('Are you sure you want to update this product?')) {
			event.preventDefault();
			return;
		}
	}

	if (form?.success) {
		if (form.message) {
			toast.success(form.message, {
				duration: 3000,
				style: 'background-color: #4CAF50; color: #fff; padding: 10px; border-radius: 5px;'
			});
		}
	}

	if (form?.success === false && form.message) {
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

<h1 class="py-4 text-lg font-bold">Product Details</h1>

<main class="flex flex-col gap-4">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-4 font-bold">Product</h1>
		<form class="flex flex-col gap-4" method="post">
			<input
				type="text"
				name="name"
				value={product?.name}
				placeholder="Name"
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
			/>
			<input
				type="text"
				name="description"
				value={product?.description}
				placeholder="Description"
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
			/>
			<input
				type="text"
				name="number"
				value={product?.number}
				placeholder="Number"
				class="rounded-md border
            border-gray-300 p-3 text-sm text-gray-800"
			/>

			<button
				formaction="?/updateProduct"
				onclick={handleUpdateProduct}
				class="rounded-md bg-green-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Update</button
			>
		</form>
	</section>
	<section class="flex max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="flex w-full items-center justify-between font-bold">
			Delete Product<CircleHelp
				class="transition-all hover:cursor-pointer hover:text-yellow-500"
				onclick={() => (deleteSectionOpen = !deleteSectionOpen)}
				size="14"
			/>
		</h1>
		<form method="post" class="flex gap-2">
			<button
				formaction="?/deleteProduct"
				onclick={handleDeleteProduct}
				class=" rounded-md bg-red-500 p-3 text-sm text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
				type="submit">Delete</button
			>
			<div>
				<ul class="pt-4 pl-3 text-xs text-yellow-500" class:hidden={!deleteSectionOpen}>
					<li class="pb-1">
						<p class="text-sm">This will permanently delete this product!</p>
					</li>
				</ul>
			</div>
		</form>
	</section>
</main>
