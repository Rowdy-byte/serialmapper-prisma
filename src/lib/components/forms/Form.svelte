<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';

	let { children, action }: { children: Snippet; action?: string } = $props();
</script>

<form {action} method="post" use:enhance class="flex flex-col gap-4">
	{@render children()}
</form>
