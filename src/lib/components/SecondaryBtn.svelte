<script lang="ts">
	let { children, onclick, dataTooltip, tooltipTitle } = $props();
</script>

<button
	{onclick}
	data-tooltip={dataTooltip}
	title={tooltipTitle}
	class="flex w-full rounded-full bg-gray-950 p-2 text-sm font-bold text-blue-500 shadow-lg hover:cursor-pointer hover:border-gray-400 hover:text-blue-800 hover:shadow-md hover:transition-all"
>
	{@render children()}
</button>
