<script lang="ts">
	import { onMount } from 'svelte';
	import { Html5QrcodeScanner } from 'html5-qrcode';

	function onScanSuccess(decodedText: string) {
		console.log('✅ QR Code gevonden:', decodedText);
		// hier kun je evt. redirect of actie doen
	}

	function onScanFailure(error: string) {
		// console.warn("⛔ Scan fout:", error); // optioneel
	}

	onMount(() => {
		const scanner = new Html5QrcodeScanner(
			'reader',
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			false // verbose logging aan/uit
		);

		scanner.render(onScanSuccess, onScanFailure);
	});
</script>

<div id="reader" class="mx-auto" style="width: 100%; max-width: 400px;"></div>
