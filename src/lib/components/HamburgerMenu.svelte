<script lang="ts">
	import { Hamburger } from 'svelte-hamburgers';

	let open = $state(false);
</script>

<Hamburger bind:open --layer-width="24px" --layer-height="1px" --color="white" />

{#if open}
	<nav
		class=" absolute top-24 left-0 z-10 flex w-full border-b-1 border-slate-500 bg-gray-950 text-white"
	>
		<div class="flex flex-col gap-1 p-4 text-start text-xl font-bold">
			<a class="transition-all hover:text-blue-500" href="/inbounds">Inbounds</a>
			<a class="transition-all hover:text-blue-500" href="/clients">Clients</a>
			<a class="transition-all hover:text-blue-500" href="/products">Products</a>
		</div>
	</nav>
{/if}
