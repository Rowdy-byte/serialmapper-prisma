<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const { params, url } = page;
	const urlArray = url.pathname.split('/');
	const inboundId = urlArray[2];

	const { data, form }: PageProps = $props();
	let { inboundProducts } = data;

	function handleUpdateInboundProduct() {
		form?.success;
	}

	function handleDeleteInboundProduct() {
		if (confirm('Are you sure you want to delete this inbound product?')) {
			form?.success;
			goto(`/inbounds/${inboundId}`);
		}
	}

	console.log(data);
</script>

<h1 class="py-4 text-xl font-bold">
	<!-- link to inbound -->
	Inbound >
	<a href={`/inbounds/${inboundId}`}
		><span class="rounded-lg bg-orange-500 px-4"> {inboundId}</span></a
	>
	| product >
	<span class="rounded-lg bg-yellow-500 px-4"> {params.id}</span>
</h1>

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
		<fieldset class="flex items-center gap-2 border border-gray-300 p-2">
			<legend>Delete Product from Inbound</legend>
			<form method="post">
				<button
					formaction="?/deleteInboundProduct"
					onclick={handleDeleteInboundProduct}
					class="rounded-md bg-red-500 p-2 text-white hover:cursor-pointer hover:border-gray-400 hover:bg-red-800 hover:text-gray-800 hover:shadow-md hover:transition-all"
					type="submit">Delete</button
				>
			</form>
			<p>This will permanently delete this product from inbound!</p>
		</fieldset>
	</section>
</main>
