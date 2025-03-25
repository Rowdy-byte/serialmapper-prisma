<script lang="ts">
	import { Hamburger } from 'svelte-hamburgers';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

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

	function clickOutside(node: HTMLElement) {
		function handleClick(event: MouseEvent) {
			if (!node.contains(event.target as Node)) {
				open = false;
			}
		}

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	$effect(() => {
		pathname = page.url.pathname;
	});
</script>

<Hamburger bind:open --layer-width="24px" --layer-height="1px" --color="white" />

{#if open}
	<nav
		use:clickOutside
		transition:fade={{ duration: 200 }}
		class=" absolute top-20 left-0 z-10 flex h-96 w-full items-center justify-center border-b-1 border-slate-500 bg-gray-950 text-white"
	>
		<div class="flex flex-col gap-1 p-4 text-start text-xl font-bold">
			{#each links as { linkName, linkPath }}
				{#if pathname !== linkPath}
					<a onclick={toggle} class="transition-all hover:text-blue-500" href={linkPath}
						>{linkName}</a
					>
				{/if}
				{#if pathname === linkPath}
					<a
						onclick={toggle}
						class="rounded-md bg-gray-800 p-2 text-blue-500 hover:cursor-pointer"
						href={linkPath}
						class:selected={pathname === linkPath}>{linkName}</a
					>
				{/if}
			{/each}
		</div>
	</nav>
{/if}
