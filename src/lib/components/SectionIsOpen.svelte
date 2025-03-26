<script lang="ts">
	type Props = {
		SectionOpen: boolean;
		lineOne?: string;
		lineTwo?: string;
		lineThree?: string;
		lineFour?: string;
	};

	let { SectionOpen, lineOne, lineTwo, lineThree, lineFour }: Props = $props();
</script>

<ul class="pb-4 pl-3 text-xs text-orange-500" class:hidden={!SectionOpen}>
	<li class="pb-1">
		<p>{lineOne}</p>
	</li>
	<li class="pb-1">
		<p>{lineTwo}</p>
	</li>
	<li class="pb-1">
		<p>{lineThree}</p>
	</li>
	<li class="pb-1">
		<p>{lineFour}</p>
	</li>
</ul>
