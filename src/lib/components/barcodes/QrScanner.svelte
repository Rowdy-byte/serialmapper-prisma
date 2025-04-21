<script lang="ts">
	import { Html5Qrcode } from 'html5-qrcode';
	import { onDestroy } from 'svelte';

	let qrScanner: Html5Qrcode | null = $state(null);
	let scannerElementId = 'qr-reader';

	function onScanSuccess(decodedText: string) {
		console.log('QR Code gescand:', decodedText);
		// Hier kun je bijvoorbeeld een store updaten of een fetch doen
	}

	$effect(() => {
		qrScanner = new Html5Qrcode(scannerElementId);

		qrScanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: 250 },
			onScanSuccess,
			(errorMessage) => {
				console.warn('Scan error:', errorMessage);
			}
		);

		return () => {
			qrScanner?.stop().then(() => {
				qrScanner?.clear();
			});
		};
	});

	onDestroy(() => {
		qrScanner?.stop().then(() => {
			qrScanner?.clear();
		});
	});
</script>

<div id={scannerElementId}></div>

<style>
	#qr-reader {
		width: 100%;
		max-width: 400px;
		margin: auto;
	}
</style>
