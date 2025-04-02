<script lang="ts">
	type StatsProps = {
		statsName: string;
		statsValue?: number | string;
		prefix?: string;
		suffix?: string;
	};

	let { statsName, statsValue, prefix, suffix }: StatsProps = $props();
</script>

<section
	class="flex aspect-square flex-col items-center justify-center rounded-lg bg-gray-950 text-gray-300 shadow-2xl"
>
	<h1 class="sm:text-md text-xs font-bold">{statsName}</h1>

	<p class="sm:4xl text-3xl font-bold text-blue-500 xl:text-4xl">
		<span class="text-sm">{prefix}</span>{statsValue}<span class="text-xs">{suffix}</span>
	</p>
</section>
