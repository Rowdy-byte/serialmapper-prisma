<script lang="ts">
	import Stats from '$lib/components/statics/Stats.svelte';
</script>

<h1 class="text-xl font-bold">Homepage</h1>

<main
	class="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
>
	<Stats statsName="Total Users" statsValue="100" />
	<Stats statsName="Total Posts" statsValue="1000" />
	<Stats statsName="Total Comments" statsValue="10000" />
	<Stats statsName="Total Likes" statsValue="100000" />
</main>
