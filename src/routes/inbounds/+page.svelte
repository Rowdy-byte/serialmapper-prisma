<script lang="ts">
	import type { PageProps } from './$types';
	import { Eye, Search } from '@lucide/svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import toast from 'svelte-french-toast';
	import { invalidateAll } from '$app/navigation';
	import BackToTop from '$lib/components/navigation/BackToTop.svelte';
	import { applyAction, enhance } from '$app/forms';
	import PrimaryBtn from '$lib/components/PrimaryBtn.svelte';
	import { toastStyleErr } from '$lib/components/toast/toastStyle';
	import { toastStyleSucc } from '$lib/components/toast/toastStyle';

	let { data, form }: PageProps = $props();

	let searchQuery = $state('');

	const clients = $state(data.clients);

	let filterdInbounds = $state(data.inbounds);

	let loading = $state(false);

	function handleCreateInbound(event: Event) {
		if (!confirm('Are you sure you want to create this inbound?')) {
			event.preventDefault();
		}
	}

	$effect(() => {
		filterdInbounds = data.inbounds.filter((inbound) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();

				const matchesClientName = inbound.clientName.toLowerCase().includes(query);
				const matchesDescription = inbound.description?.toLowerCase().includes(query);
				const matchesNumber = inbound.inboundNumber.toString().toLowerCase().includes(query);
				const matchesT1 = query === 't1' && inbound.isSubscribed;
				const matchesExa = query === 'exa' && !inbound.isSubscribed;

				return matchesClientName || matchesDescription || matchesNumber || matchesT1 || matchesExa;
			}
			return true;
		});
	});

	function enhanceForm() {
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = true;
			try {
				if (result.type === 'failure') {
					if (
						result.data?.issues &&
						Array.isArray(result.data.issues) &&
						result.data.issues.length > 0
					) {
						toast.error(
							result.data.issues.map((issue: { message: string }) => issue.message).join(', '),
							toastStyleErr
						);
					} else if (
						result.data?.issues &&
						typeof result.data.issues === 'object' &&
						'message' in result.data.issues
					) {
						toast.error(result.data.issues.message as string, toastStyleErr);
					} else {
						toast.error('An error occurred');
					}
				} else if (result.type === 'success') {
					toast.success('Inbound Created Successfully', toastStyleSucc);
					await invalidateAll();
				} else {
					await applyAction(result);
				}
			} finally {
				setTimeout(() => {
					loading = false;
				}, 3000);

				await update();
			}
		};
	}
</script>

<BackToTop scrollTo="scroll to top" />

{#if loading}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<span class="loader"></span>
	</div>
{/if}

<div class="container mx-auto py-4">
	<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md">
		<h1 class="py-4 text-lg font-bold text-gray-300">Inbounds</h1>
	</section>
	<main class="flex flex-col gap-4">
		<section class="max-w-sm rounded-lg bg-gray-900/40 p-4 shadow-md">
			<h1 class="pb-4 font-bold text-gray-300">Create Inbound</h1>
			<form
				class="flex flex-col gap-4"
				action="?/createInbound"
				onsubmit={handleCreateInbound}
				method="post"
				use:enhance={enhanceForm}
			>
				<select
					disabled={form?.success}
					class="select select-neutral w-full text-gray-300"
					name="clientName"
					required
				>
					<option value="">-- Select Client --</option>
					{#each clients as client}
						<option value={client.name}>{client.name}</option>
					{/each}
				</select>
				<input
					disabled={form?.success}
					type="text"
					name="description"
					placeholder="Description"
					class="input input-neutral w-full text-gray-300"
					required
				/>

				<PrimaryBtn disabled={form?.success ?? false} type={'submit'}>Create Inbound</PrimaryBtn>
			</form>
		</section>
		<section class="flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 pt-6 pb-6 shadow-md">
			<form class="relative py-1">
				<input
					bind:value={searchQuery}
					type="text"
					name="search"
					placeholder="Search Inbounds"
					class="input input-neutral rounded-full pl-10"
				/>
				<div
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
				>
					<Search size="18" />
				</div>
			</form>
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="text-gray-500">
						<th class="border border-gray-500 p-2">No</th>
						<th class="border border-gray-500 p-2">Client</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Description</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Customs</th>
						<th class="hidden border border-gray-500 p-2 md:table-cell">Created</th>
						<th class="border border-gray-500 p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filterdInbounds as inbound}
						<tr transition:fade class="hover:bg-gray-500/20">
							<td
								class={`border border-gray-500 p-2 text-gray-300 ${
									inbound.inboundNumber === '' ? 'text-[8px] text-orange-500 italic' : ''
								}`}
							>
								{inbound.inboundNumber === ''
									? 'Update Required (details page)'
									: inbound.inboundNumber}
							</td>

							<td class="border border-gray-500 p-2 text-gray-300">{inbound.clientName}</td>
							<td class="hidden border border-gray-500 p-2 text-gray-300 md:table-cell"
								>{inbound.description}</td
							>
							<td class="hidden border border-gray-500 p-2 text-gray-300 md:table-cell"
								>{inbound.isSubscribed ? 'T1' : 'EXA'}</td
							>
							<td class="hidden border border-gray-500 p-2 text-gray-300 md:table-cell">
								{new Date(inbound.createdAt).toLocaleDateString()}
							</td>
							<td class="border border-gray-500 p-2 text-gray-300">
								<a
									href={`/inbounds/${inbound.id}`}
									class="text-blue-500 underline"
									title="View Inbound"
								>
									<Eye size="16" />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if data.inbounds.length === 0}
				<p class="mt-2 rounded-full bg-gray-500 p-1 px-2 text-sm">No inbounds found.</p>
			{/if}
		</section>
		<section class="mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"></section>
	</main>
</div>

<style>
	.loader {
		transform: rotateZ(45deg);
		perspective: 1000px;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		color: #e5e7eb;
	}
	.loader:before,
	.loader:after {
		content: '';
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: inherit;
		height: inherit;
		border-radius: 50%;
		transform: rotateX(70deg);
		animation: 1s spin linear infinite;
	}
	.loader:after {
		color: #f97316;
		transform: rotateY(70deg);
		animation-delay: 0.4s;
	}

	@keyframes rotate {
		0% {
			transform: translate(-50%, -50%) rotateZ(0deg);
		}
		100% {
			transform: translate(-50%, -50%) rotateZ(360deg);
		}
	}

	@keyframes rotateccw {
		0% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		100% {
			transform: translate(-50%, -50%) rotate(-360deg);
		}
	}

	@keyframes spin {
		0%,
		100% {
			box-shadow: 0.2em 0px 0 0px currentcolor;
		}
		12% {
			box-shadow: 0.2em 0.2em 0 0 currentcolor;
		}
		25% {
			box-shadow: 0 0.2em 0 0px currentcolor;
		}
		37% {
			box-shadow: -0.2em 0.2em 0 0 currentcolor;
		}
		50% {
			box-shadow: -0.2em 0 0 0 currentcolor;
		}
		62% {
			box-shadow: -0.2em -0.2em 0 0 currentcolor;
		}
		75% {
			box-shadow: 0px -0.2em 0 0 currentcolor;
		}
		87% {
			box-shadow: 0.2em -0.2em 0 0 currentcolor;
		}
	}
</style>
