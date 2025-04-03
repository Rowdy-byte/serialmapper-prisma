<script lang="ts">
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import type { PageProps } from './$types';
	import { Trash2 } from '@lucide/svelte';
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

<div class="container mx-auto py-4">
	<section
		class="mb-4 flex items-center justify-between gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"
	>
		<h1 class="py-4 text-lg font-bold">Product Details</h1>
		<form method="post" action="?/deleteProduct" class="flex gap-2">
			<SecondaryBtn
				type={'button'}
				onclick={handleDeleteProduct}
				dataTooltip="Delete Product"
				tooltipTitle="Delete Product"
			>
				<Trash2 />
			</SecondaryBtn>
		</form>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Product</h1>
			<form class="flex flex-col gap-4" method="post" action="?/updateProduct">
				<input
					type="text"
					name="name"
					value={product?.name}
					placeholder="Name"
					class="input input-neutral w-full"
				/>
				<input
					type="text"
					name="description"
					value={product?.description}
					placeholder="Description"
					class="input input-neutral w-full"
				/>
				<input
					type="text"
					name="number"
					value={product?.number}
					placeholder="Number"
					class="input input-neutral w-full"
				/>
				<PrimaryBtn type={'submit'} onclick={handleUpdateProduct}>Update</PrimaryBtn>
			</form>
		</section>

		<section class="flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>
