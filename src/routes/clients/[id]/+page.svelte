<script lang="ts">
	import { goto } from '$app/navigation';
	import { CircleHelp, Trash2 } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import toast from 'svelte-french-toast';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import SecondaryBtn from '$lib/components/SecondaryBtn.svelte';
	import { Trash } from 'lucide-svelte';
	let { data, form }: PageProps = $props();

	let client = data.client;
	let success = form?.success;

	let deleteSectionOpen = $state(false);

	function handleDeleteClient(event: Event) {
		if (!confirm('Are you sure you want to delete this client?')) {
			event.preventDefault();
		}
		goto('/clients');
	}

	function handleUpdateClient(event: Event) {
		if (!confirm('Are you sure you want to update this client?')) {
			event.preventDefault();
			return;
		}
	}

	$effect(() => {
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
	});

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
		<h1 class="py-4 text-lg font-bold">Client Details</h1>
		<form method="post" class="flex" action="?/deleteClient">
			<SecondaryBtn
				type={'submit'}
				onclick={handleDeleteClient}
				dataTooltip={'Delete Client'}
				tooltipTitle={'Delete Client'}
			>
				<Trash2 />
			</SecondaryBtn>
		</form>
	</section>

	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold">Edit Client</h1>
			<form class="flex flex-col gap-4" method="post" action="?/updateClient">
				<input
					type="text"
					name="name"
					placeholder="Name"
					class="input input-neutral w-full"
					value={client?.name}
				/>
				<input
					type="email"
					name="email"
					value={client?.email}
					placeholder="Email"
					class="input input-neutral w-full"
				/>
				<input
					type="text"
					name="phone"
					value={client?.phone}
					placeholder="Phone"
					class="input input-neutral w-full"
				/>
				<input
					type="text"
					name="address"
					value={client?.address}
					placeholder="Address"
					class="input input-neutral w-full"
				/>
				<input
					type="text"
					name="city"
					value={client?.city}
					placeholder="City"
					class="input input-neutral w-full"
				/>
				<PrimaryBtn type={'submit'} onclick={handleUpdateClient}>Update</PrimaryBtn>
			</form>
		</section>

		<section class="flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>
