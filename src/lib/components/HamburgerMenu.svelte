<script lang="ts">
	import { Hamburger } from 'svelte-hamburgers';
	import { page } from '$app/state';

	let open = $state(false);

	let pathname = $state();

	const links = [
		{ linkName: 'Inbounds', linkPath: '/inbounds' },
		{ linkName: 'Clients', linkPath: '/clients' },
		{ linkName: 'Products', linkPath: '/products' }
	];

	function toggle() {
		open = !open;
	}

	$effect(() => {
		pathname = page.url.pathname;
	});
</script>

<Hamburger bind:open --layer-width="24px" --layer-height="1px" --color="white" />

{#if open}
	<nav
		class=" absolute top-24 left-0 z-10 flex w-full border-b-1 border-slate-500 bg-gray-950 text-white"
	>
		<div class="flex flex-col gap-1 p-4 text-start text-xl font-bold">
			{#each links as { linkName, linkPath }}
				{#if pathname !== linkPath}
					<a onclick={toggle} class="transition-all hover:text-blue-500" href={linkPath}
						>{linkName}</a
					>
				{/if}
			{/each}
		</div>
	</nav>
{/if}
