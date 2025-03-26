<script lang="ts">
	type StatsProps = {
		statsName: string;
		statsValue?: number | string;
	};

	let { statsName, statsValue }: StatsProps = $props();
</script>

<section
	class="flex aspect-square w-full flex-col items-center justify-center rounded-lg bg-gray-900 p-4 text-gray-500 shadow-2xl"
>
	<h1 class="text-sm font-bold">{statsName}</h1>
	<p class="text-3xl font-bold">{statsValue}</p>
</section>
