<script lang="ts">
	import '../../global.css';
	let { children } = $props();
</script>

<div class="prose mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	{@render children()}
</div>
