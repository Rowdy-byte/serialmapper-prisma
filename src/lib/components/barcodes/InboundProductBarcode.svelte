<script lang="ts">
	import JsBarcode from 'jsbarcode';

	let { value, format } = $props();

	let svgElement: SVGElement | null = $state(null);

	function generateBarcode() {
		if (svgElement && value) {
			JsBarcode(svgElement, value, {
				format,
				displayValue: true,
				lineColor: '#000',
				width: 2,
				height: 50
			});
		}
	}

	$effect(() => {
		generateBarcode();
	});
</script>

<div class="barcode-container">
	<svg bind:this={svgElement}></svg>
</div>
