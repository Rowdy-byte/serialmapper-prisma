<script lang="ts">
	let { children, disabled, name } = $props();
</script>

<select {disabled} class=" rounded-md bg-gray-950 p-3 text-sm text-gray-500" {name}>
	{@render children()}
</select>
