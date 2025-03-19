<script lang="ts">
	type ToastProps = {
		text: string;
		backgroundColor?: string;
		textColor?: string;
	};

	let { text, backgroundColor, textColor }: ToastProps = $props();
</script>

<main class="bg-opacity-50 absolute top-14 left-1/2 -translate-x-1/2 transform bg-gray-900">
	<section
		class={`relative flex w-80 items-center justify-center font-bold ${backgroundColor} rounded-lg p-3 shadow-md`}
	>
		<p class={`text-sm ${textColor}`}>
			{text}
		</p>
	</section>
</main>
