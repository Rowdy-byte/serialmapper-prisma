<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { MoveRight } from '@lucide/svelte';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const inboundId = urlArray[2];

	const { data }: PageProps = $props();
	let { inboundProducts } = data;

	function handleUpdateInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to update this inbound product?')) {
			event.preventDefault();
		}
	}

	function handleDeleteInboundProduct(event: Event) {
		if (!confirm('Are you sure you want to delete this inbound product?')) {
			event.preventDefault();
			return;
		}
		goto(`/inbounds/${inboundId}`);
	}
</script>

<!-- replace h1 navigation with daisy ui breadcrums -->
<section class="breadcrums text-md mb-2 rounded-lg bg-gray-900 p-4 shadow-md">
	<ul class="flex items-center gap-2">
		<li>
			<a href={`/inbounds/${inboundId}`} class="text-gray-500 hover:text-blue-500">
				Inbound {inboundId}</a
			>
		</li>
		<li>
			<MoveRight size="24" class="px-1" />
		</li>
		<li>
			<p class="text-gray-500">
				Inbound Product {params.id}
			</p>
		</li>
	</ul>
</section>
<main class="flex flex-col gap-12">
	<section class="max-w-sm rounded-lg bg-gray-900 p-4 shadow-md">
		<h1 class="pb-6 font-bold">Inbound Product</h1>
		{#each inboundProducts as inboundProduct}
			{#if inboundProduct.id === Number(params.id)}
				<form class="flex flex-col gap-4" method="post">
					<input
						type="text"
						name="product"
						value={inboundProduct?.product}
						placeholder="Product"
						class="rounded-md border
            border-gray-300 p-2 text-gray-800"
					/>
					<input
						type="text"
						name="serialnumber"
						value={inboundProduct?.serialnumber}
						placeholder="Serialnumber"
						class="rounded-md border
            border-gray-300 p-2 text-gray-800"
					/>

					<button
						formaction="?/updateInboundProduct"
						onclick={handleUpdateInboundProduct}
						class="rounded-md bg-green-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-green-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
						type="submit">Update</button
					>
				</form>
			{/if}
		{/each}
	</section>

	<section class="rounded-lg bg-gray-900 p-4 shadow-md">
		<fieldset class="flex items-center gap-2 border border-gray-500 p-2">
			<legend>Delete Product from Inbound</legend>
			<form method="post">
				<button
					formaction="?/deleteInboundProduct"
					onclick={handleDeleteInboundProduct}
					class="rounded-md bg-red-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Delete</button
				>
			</form>
			<p>This will permanently delete this product from this inbound!</p>
		</fieldset>
	</section>
</main>
