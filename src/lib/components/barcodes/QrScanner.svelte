<script lang="ts">
	import { Html5QrcodeScanner } from 'html5-qrcode';
	import { onMount, onDestroy } from 'svelte';

	let scannedResults = '';

	function onScanSuccess(decodedText: string) {
		if (!scannedResults.includes(decodedText)) {
			scannedResults += decodedText + '\n';
		}
	}

	function onScanFailure(error: string) {
		// meestal negeren
	}

	let scanner: Html5QrcodeScanner;

	onMount(() => {
		scanner = new Html5QrcodeScanner(
			'reader',
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			false
		);

		scanner.render(onScanSuccess, onScanFailure);
	});

	onDestroy(() => {
		if (scanner) {
			scanner.clear().catch((e) => console.error('Error clearing scanner', e));
		}
	});
</script>

<div id="reader"></div>

<textarea class="textarea textarea-neutral" readonly bind:value={scannedResults}></textarea>

<style>
	textarea {
		width: 100%;
		max-width: 400px;
		height: 200px;
		margin: 1rem auto;
		display: block;
		font-family: monospace;
		white-space: pre;
	}

	#reader {
		margin: auto;
		max-width: 400px;
	}
</style>
