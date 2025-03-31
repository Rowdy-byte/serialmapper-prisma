<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		children,
		onclick,
		dataTooltip,
		tooltipTitle,
		type
	}: {
		children: Snippet;
		onclick?: MouseEventHandler<HTMLButtonElement>;
		dataTooltip: string;
		tooltipTitle: string;
		type: 'button' | 'submit' | 'reset' | null | undefined;
	} = $props();
</script>

<button
	{onclick}
	{type}
	data-tooltip={dataTooltip}
	title={tooltipTitle}
	class="flex rounded-full bg-gray-950 p-2 text-sm font-bold text-blue-500 shadow-lg hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
>
	{@render children()}
</button>
