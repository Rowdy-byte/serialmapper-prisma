<script lang="ts">
	type StatsProps = {
		statsName: string;
		statsValue?: number | string;
		prefix?: string;
		emptyString?: string;
	};

	let { statsName, statsValue, prefix, emptyString }: StatsProps = $props();
</script>

<section
	class="flex aspect-square flex-col items-center justify-center rounded-lg bg-gray-900 p-4 text-gray-500 shadow-2xl sm:max-w-28"
>
	<h1 class="text-xs font-bold">{statsName}</h1>
	<p class="text--500 text-xl font-bold"></p>
	<p class="text-xl font-bold text-blue-500">
		<span class="text-sm">{prefix}{emptyString}</span>{statsValue}
	</p>
</section>
