<script lang="ts">
	import { Printer } from '@lucide/svelte';
	import JsBarcode from 'jsbarcode';
	import jsPDF from 'jspdf';
	import toast from 'svelte-french-toast';
	import SecondaryBtn from '../SecondaryBtn.svelte';

	let { inboundProduct, inbound } = $props();

	let svgElement: SVGElement | null = $state(null);

	function generateBarcode() {
		if (svgElement && inboundProduct?.barcode) {
			JsBarcode(svgElement, inboundProduct.barcode, {
				format: 'CODE128',
				displayValue: true,
				lineColor: '#000',
				width: 1.2,
				height: 40,
				margin: 5
			});
		}
	}

	function printSticker() {
		if (!inboundProduct) {
			toast.error('No product data available!');
			return;
		}

		const doc = new jsPDF();

		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.text(`Product: ${inboundProduct.product}`, 5, 10);
		doc.text(`Serial: ${inboundProduct.serialnumber}`, 5, 20);
		doc.text(`Inbound: ${inbound.inboundNumber}`, 5, 30);

		const barcodeCanvas = document.createElement('canvas');
		JsBarcode(barcodeCanvas, inboundProduct.barcode, {
			format: 'CODE128',
			displayValue: true,
			lineColor: '#000',
			width: 1.2,
			height: 40,
			margin: 5
		});

		const barcodeImage = barcodeCanvas.toDataURL('image/png');
		doc.addImage(barcodeImage, 'PNG', 5, 40, 80, 20);

		doc.save(`${inbound.inboundNumber}_${inboundProduct.serialnumber}.pdf`);

		toast.success('Sticker printed successfully!');
	}

	$effect(() => {
		generateBarcode();
	});
</script>

<div
	class=" mx-auto mb-4 flex h-[120px] w-[240px] flex-col items-center justify-center rounded-md border border-gray-500 bg-white p-2 shadow-md"
>
	<p class="text-xs font-bold text-black">{inboundProduct.product}</p>
	<p class="text-xs text-black">Serial: {inboundProduct.serialnumber}</p>
	<p>Inbound: {inbound.inboundNumber}</p>
	<svg class="flex h-auto w-[200px]" bind:this={svgElement}></svg>
</div>
<div class="flex w-full items-center justify-center gap-2">
	<SecondaryBtn
		onclick={printSticker}
		dataTooltip={'Print Sticker'}
		tooltipTitle={'Print Sticker'}
		type={'button'}
	>
		<Printer />
	</SecondaryBtn>
</div>

<style>
	svg {
		max-width: 200px; /* Prevent overly wide barcodes */
		height: auto;
	}
</style>
