<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		children,
		disabled,
		onclick,
		formaction,
		type
	}: {
		children: Snippet;
		disabled?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement>;
		formaction?: string;
		type?: 'button' | 'submit' | 'reset' | null | undefined;
	} = $props();
</script>

<button {disabled} {onclick} {formaction} {type} class="btn btn-soft rounded-full">
	{@render children()}
</button>
