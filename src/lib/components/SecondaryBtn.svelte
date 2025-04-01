<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		children,
		onclick,
		dataTooltip,
		tooltipTitle,
		type,
		disabled,
		formaction
	}: {
		children: Snippet;
		onclick?: MouseEventHandler<HTMLButtonElement>;
		dataTooltip: string;
		tooltipTitle: string;
		type: 'button' | 'submit' | 'reset' | null | undefined;
		disabled?: boolean;
		formaction?: string;
	} = $props();
</script>

<button
	{onclick}
	{type}
	{disabled}
	{formaction}
	data-tooltip={dataTooltip}
	title={tooltipTitle}
	class="btn btn-soft rounded-full"
>
	{@render children()}
</button>
