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
	class="flex aspect-square flex-col items-center justify-center rounded-lg bg-gray-900 text-gray-500 shadow-2xl sm:max-w-28 md:max-w-32 lg:max-w-36 xl:max-w-40 2xl:max-w-44"
>
	<h1 class="sm:text-md text-xs font-bold">{statsName}</h1>

	<p class="text-lg font-bold text-blue-500 md:text-xl xl:text-2xl">
		<span class="text-sm">{prefix}</span>{statsValue}<span class="text-xs">{suffix}</span>
	</p>
</section>
