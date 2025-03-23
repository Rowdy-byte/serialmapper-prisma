// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		ScanbotSDK: {
			initialize: (options: { licenseKey: string; engine?: 'legacy' | 'nextgen' }) => Promise<ScanbotSDKInstance>;
		};
	}

	interface ScanbotSDKInstance {
		createBarcodeScanner: (options: {
			container: HTMLElement;
			onBarcodesDetected: (result: { barcodes: DetectedBarcode[] }) => void;
			onError: (error: Error) => void;
			style?: unknown;
		}) => Promise<void>;
		// eventueel andere methods hier
	}

	interface DetectedBarcode {
		text: string;
		format: string;
		// andere velden zoals bounding box kun je toevoegen als je ze gebruikt
	}
	namespace App {

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
