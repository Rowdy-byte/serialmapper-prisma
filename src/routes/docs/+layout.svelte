<script lang="ts">
	import '../../global.css';
	let { children } = $props();
</script>

<div
	class="prose container mx-auto mb-4 flex flex-col gap-4 rounded-lg bg-gray-900/40 p-4 shadow-md"
>
	{@render children()}
</div>
