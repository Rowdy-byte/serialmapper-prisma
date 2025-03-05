<script lang="ts">
	import Stats from '$lib/components/statics/Stats.svelte';
</script>

<h1 class="text-xl font-bold">Homepage</h1>

<main
	class="absolute top-1/2 left-1/2 grid w-full -translate-x-1/2 -translate-y-1/2 justify-center gap-4 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:max-w-5xl"
>
	<Stats statsName="Inbounds" statsValue="100" />
	<Stats statsName="Clients" statsValue="1000" />
	<Stats statsName="Products In" statsValue="10000" />
	<Stats statsName="Products" statsValue="100000" />
</main>
