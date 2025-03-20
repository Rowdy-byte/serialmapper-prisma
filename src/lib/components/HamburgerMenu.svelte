<script lang="ts">
	import { Hamburger } from 'svelte-hamburgers';

	let open = $state(false);
</script>

<Hamburger bind:open --layer-width="24px" --layer-height="1px" --color="white" />

{#if open}
	<nav
		class="absolute top-24 left-0 z-10 flex w-full items-center justify-center border-b-1 border-slate-500 bg-gray-950 text-white"
	>
		<div class="flex flex-col items-center gap-1 p-4 text-xl font-bold">
			<a href="/inbounds">Inbounds</a>
			<a href="/clients">Clients</a>
			<a href="/products">Products</a>
		</div>
	</nav>
{/if}
