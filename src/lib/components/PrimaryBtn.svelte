<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		children,
		disabled,
		onclick,
		formaction
	}: {
		children: Snippet;
		disabled: boolean;
		onclick: MouseEventHandler<HTMLButtonElement>;
		formaction: string;
	} = $props();
</script>

<button
	{disabled}
	{onclick}
	{formaction}
	type="submit"
	class="rounded-full bg-gray-500 p-3 text-sm font-bold hover:cursor-pointer hover:border-gray-400 hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
>
	{@render children()}
</button>
