<script lang="ts">
	import { Printer, Copy, QrCode } from '@lucide/svelte';
	import JsBarcode from 'jsbarcode';
	import jsPDF from 'jspdf';
	import toast from 'svelte-french-toast';
	import SecondaryBtn from '../SecondaryBtn.svelte';
	import PrimaryBtn from '../PrimaryBtn.svelte';
	import { toastStyleErr, toastStyleSucc } from '../toast/toastStyle';

	let { inboundProduct, inbound } = $props();

	let svgElement: SVGElement | null = $state(null);
	let isPrinting = $state(false);

	function generateBarcode() {
		if (svgElement && inboundProduct?.barcode) {
			// Clear previous barcode
			svgElement.innerHTML = '';

			JsBarcode(svgElement, inboundProduct.barcode, {
				format: 'CODE128',
				displayValue: true,
				lineColor: '#000',
				background: 'transparent',
				width: 1.5,
				height: 35,
				margin: 0,
				fontSize: 10,
				fontOptions: 'bold'
			});
		}
	}

	async function printSticker() {
		if (!inboundProduct?.barcode) {
			toast.error('No barcode available for printing!', toastStyleErr);
			return;
		}

		isPrinting = true;

		try {
			// Create PDF optimized for label printing (62mm x 29mm)
			const doc = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
				format: [62, 29]
			});

			// Set background to white
			doc.setFillColor(255, 255, 255);
			doc.rect(0, 0, 62, 29, 'F');

			// Product name (truncated to fit)
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(8);
			const productName =
				inboundProduct.product.length > 25
					? inboundProduct.product.substring(0, 22) + '...'
					: inboundProduct.product;
			doc.text(productName, 2, 4);

			// Serial and Inbound info
			doc.setFont('helvetica', 'normal');
			doc.setFontSize(6);
			doc.text(`SN: ${inboundProduct.serialnumber}`, 2, 8);
			doc.text(`IN: ${inbound.inboundNumber}`, 2, 11);

			// Generate barcode for PDF
			const barcodeCanvas = document.createElement('canvas');
			JsBarcode(barcodeCanvas, inboundProduct.barcode, {
				format: 'CODE128',
				displayValue: true,
				lineColor: '#000',
				background: '#fff',
				width: 1.2,
				height: 25,
				margin: 0,
				fontSize: 8,
				fontOptions: 'bold'
			});

			// Convert canvas to image and add to PDF
			const barcodeImage = barcodeCanvas.toDataURL('image/png', 1.0);
			doc.addImage(barcodeImage, 'PNG', 2, 14, 58, 12, undefined, 'FAST');

			// Save with timestamp for unique filenames
			const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			doc.save(`sticker_${inboundProduct.serialnumber}_${timestamp}.pdf`);

			toast.success('Sticker PDF generated successfully!', toastStyleSucc);
		} catch (error) {
			console.error('Print failed:', error);
			toast.error('Failed to generate sticker PDF', toastStyleErr);
		} finally {
			isPrinting = false;
		}
	}

	function copyBarcode() {
		if (inboundProduct?.barcode) {
			navigator.clipboard
				.writeText(inboundProduct.barcode)
				.then(() => {
					toast.success('Barcode copied to clipboard', toastStyleSucc);
				})
				.catch(() => {
					toast.error('Failed to copy barcode', toastStyleErr);
				});
		}
	}

	$effect(() => {
		generateBarcode();
	});
</script>

<!-- Print-optimized Sticker Preview -->
<div class="mx-auto space-y-4">
	<!-- Actual size sticker preview (62mm x 29mm scaled for screen) -->
	<div class="mx-auto">
		<h3 class="mb-2 text-center text-sm font-medium text-gray-300">Sticker Preview</h3>

		<!-- Sticker container - scaled representation of 62mm x 29mm -->
		<div
			class="relative mx-auto border-2 border-gray-300 bg-white shadow-lg"
			style="width: 248px; height: 116px; transform-origin: center;"
		>
			<!-- Print guidelines (visible only in preview) -->
			<div class="absolute inset-0 border border-dashed border-gray-200 opacity-50"></div>

			<!-- Sticker content -->
			<div class="flex h-full flex-col justify-between p-2">
				<!-- Product info section -->
				<div class="space-y-0.5">
					<p class="truncate text-[11px] leading-tight font-bold text-black">
						{inboundProduct.product}
					</p>
					<p class="font-mono text-[9px] text-black">SN: {inboundProduct.serialnumber}</p>
					<p class="font-mono text-[9px] text-black">IN: {inbound.inboundNumber}</p>
				</div>

				<!-- Barcode section -->
				<div class="flex flex-1 items-end justify-center">
					<svg bind:this={svgElement} class="h-auto max-w-[220px]" style="max-height: 45px;"></svg>
				</div>
			</div>
		</div>

		<!-- Size indicator -->
		<p class="mt-1 text-center text-xs text-gray-500">62mm × 29mm (actual size)</p>
	</div>

	<!-- Barcode value display -->
	{#if inboundProduct?.barcode}
		<div class="flex justify-center">
			<div class="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
				<QrCode class="h-4 w-4 text-gray-400" />
				<span class="font-mono text-sm text-gray-300">{inboundProduct.barcode}</span>
				<button
					onclick={copyBarcode}
					class="text-gray-400 transition-colors hover:text-white"
					title="Copy Barcode"
				>
					<Copy class="h-4 w-4" />
				</button>
			</div>
		</div>
	{/if}

	<!-- Action buttons -->
	<div class="flex justify-center gap-3">
		<PrimaryBtn
			onclick={printSticker}
			disabled={isPrinting || !inboundProduct?.barcode}
			class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
		>
			{#if isPrinting}
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				></div>
				Generating...
			{:else}
				<Printer class="h-4 w-4" />
				Print Sticker
			{/if}
		</PrimaryBtn>

		<SecondaryBtn
			onclick={copyBarcode}
			disabled={!inboundProduct?.barcode}
			class="flex items-center gap-2"
		>
			<Copy class="h-4 w-4" />
			Copy Code
		</SecondaryBtn>
	</div>

	<!-- Print instructions -->
	<div class="space-y-1 text-center text-xs text-gray-500">
		<p><strong>Print Instructions:</strong></p>
		<p>• Use 62mm × 29mm label paper</p>
		<p>• Print at 100% scale (no fit to page)</p>
		<p>• Compatible with thermal label printers</p>
	</div>
</div>

<style>
	/* Ensure barcode renders properly */
	svg {
		display: block;
		margin: 0 auto;
	}

	/* Print media query for actual printing */
	@media print {
		* {
			visibility: hidden;
		}

		.sticker-content {
			visibility: visible;
			position: absolute;
			left: 0;
			top: 0;
			width: 62mm;
			height: 29mm;
			background: white;
			border: none;
			box-shadow: none;
		}
	}
</style>
