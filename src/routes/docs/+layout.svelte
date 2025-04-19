<script lang="ts">
	import '../../global.css';
	let { children } = $props();
</script>

<div
	class="prose mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-4 bg-gray-950 p-4 text-white"
>
	{@render children()}
</div>
