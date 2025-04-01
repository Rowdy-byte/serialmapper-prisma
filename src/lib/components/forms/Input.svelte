<script lang="ts">
	let {
		value,
		disabled,
		name,
		type,
		checked
	}: {
		value: string | undefined | null;

		disabled?: boolean;
		name: string;
		type: string;
		checked?: boolean | null | undefined;
	} = $props();
</script>

<input
	{disabled}
	{type}
	{name}
	{checked}
	bind:value
	class={type === 'checkbox' ? 'checkbox checkbox-xs chat-bubble-neutral' : 'input input-neutral'}
/>
