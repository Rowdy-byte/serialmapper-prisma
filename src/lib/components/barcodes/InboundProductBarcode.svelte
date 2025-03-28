<script lang="ts">
	import { Printer } from '@lucide/svelte';
	import JsBarcode from 'jsbarcode';
	import jsPDF from 'jspdf';
	import toast from 'svelte-french-toast';

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
		doc.text(`Value: €${inboundProduct.value}`, 5, 30);

		const barcodeCanvas = document.createElement('canvas');
		JsBarcode(barcodeCanvas, inboundProduct.barcode, {
			format: 'CODE128',
			displayValue: false, // Hide text under barcode
			width: 1.2,
			height: 40
		});

		const barcodeImage = barcodeCanvas.toDataURL('image/png');
		doc.addImage(barcodeImage, 'PNG', 5, 35, 80, 20);

		doc.save(`sticker-${inboundProduct.serialnumber}.pdf`);
		toast.success('Sticker printed successfully!');
	}

	$effect(() => {
		generateBarcode();
	});
</script>

<div
	class=" mb-2 flex h-[120px] w-[240px] flex-col items-center justify-center rounded-md border border-gray-500 bg-white p-2 shadow-md"
>
	<p class="text-xs font-bold text-black">{inboundProduct.product}</p>
	<p class="text-xs text-black">Serial: {inboundProduct.serialnumber}</p>
	<p>Inbound: {inbound.inboundNumber}</p>
	<svg class="h-auto w-[200px]" bind:this={svgElement}></svg>
</div>
<button
	onclick={printSticker}
	class="rounded-full bg-orange-500 p-3 text-sm font-bold text-white hover:cursor-pointer hover:bg-orange-600 hover:text-gray-800 hover:shadow-md hover:transition-all"
	><Printer /></button
>

<style>
	svg {
		max-width: 200px; /* Prevent overly wide barcodes */
		height: auto;
	}
</style>
