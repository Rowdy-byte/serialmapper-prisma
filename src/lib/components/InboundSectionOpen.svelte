<script lang="ts">
	let { inboundSectionOpen } = $props();
</script>

<ul class="pb-4 pl-3 text-xs text-yellow-500" class:hidden={!inboundSectionOpen}>
	<li class="pb-1">
		<p>1. Select the client.</p>
	</li>
	<li class="pb-1">
		<p>2. Enter inbound description.</p>
	</li>
	<li class="pb-1">
		<p>3. Click on Add.</p>
	</li>
	<li class="pb-1">
		<p>4. Inbound number is generated on de details pagina. Volg de volgende stap.</p>
	</li>
</ul>
