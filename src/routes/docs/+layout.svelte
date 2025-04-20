<script lang="ts">
	import '../../global.css';
	let { children } = $props();
</script>

<div class="prose mx-auto max-w-4xl px-4 py-8">
	{@render children()}
</div>
