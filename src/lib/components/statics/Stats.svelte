<script lang="ts">
	type StatsProps = {
		statsName: string;
		statsValue: string;
	};

	let { statsName, statsValue }: StatsProps = $props();
</script>

<section>
	<h1>{statsName}</h1>
	<p>{statsValue}</p>
</section>
