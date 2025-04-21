<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Html5Qrcode } from 'html5-qrcode';
	import type { Html5QrcodeCameraScanConfig, Html5QrcodeResult } from 'html5-qrcode';

	let scannedResults = '';
	let scanning = false;
	let html5QrCode: Html5Qrcode;
	let cameras: { id: string; label: string }[] = [];
	let selectedCameraId: string | null = null;

	// ophalen van camera’s bij mount
	onMount(async () => {
		try {
			const devices = await Html5Qrcode.getCameras();
			cameras = devices;
			if (devices.length > 0) {
				selectedCameraId = devices[0].id;
			}
		} catch (err) {
			console.error('Camera ophalen faalde:', err);
		}
	});

	async function startScanner() {
		if (!selectedCameraId) return;

		html5QrCode = new Html5Qrcode('reader');
		const config: Html5QrcodeCameraScanConfig = {
			fps: 10,
			qrbox: { width: 250, height: 250 }
		};

		try {
			await html5QrCode.start(
				{ deviceId: { exact: selectedCameraId } },
				config,
				(decodedText: string, decodedResult: Html5QrcodeResult) => {
					if (!scannedResults.includes(decodedText)) {
						scannedResults += decodedText + '\n';
					}
				},
				(errorMessage: string) => {
					console.warn(errorMessage);
				}
			);
			scanning = true;
		} catch (err) {
			console.error('Start scanner faalde:', err);
		}
	}

	async function stopScanner() {
		if (html5QrCode && scanning) {
			await html5QrCode.stop();
			await html5QrCode.clear();
			scanning = false;
		}
	}

	onDestroy(() => {
		stopScanner();
	});
</script>

<div class="scanner-ui">
	{#if cameras.length > 0}
		<label for="camera-select">Choose Camera:</label>
		<select
			id="camera-select"
			bind:value={selectedCameraId}
			disabled={scanning}
			class="select select-neutral mb-4"
		>
			{#each cameras as cam}
				<option value={cam.id}>{cam.label || 'Camera without name'}</option>
			{/each}
		</select>
	{:else}
		<p>No camera found or no permission.</p>
	{/if}

	<div id="reader" class="mx-auto w-full max-w-md rounded border"></div>

	<div class="controls mt-4 text-center">
		{#if !scanning}
			<button on:click={startScanner} class="btn btn-neutral">Start scanner</button>
		{:else}
			<button on:click={stopScanner} class="btn btn-neutral">Stop scanner</button>
		{/if}
	</div>

	<textarea
		bind:value={scannedResults}
		rows="6"
		class="textarea textarea-neutral mx-auto mt-4 block w-full max-w-md rounded border p-2"
	></textarea>
</div>
