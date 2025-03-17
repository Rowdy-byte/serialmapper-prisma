<script lang="ts">
	type StatsProps = {
		statsName: string;
		statsValue: number;
	};

	let { statsName, statsValue }: StatsProps = $props();
</script>

<section
	class="flex aspect-square w-full flex-col items-center justify-center rounded-lg p-4 shadow-md"
>
	<h1>{statsName}</h1>
	<p class="text-4xl">{statsValue}</p>
</section>
