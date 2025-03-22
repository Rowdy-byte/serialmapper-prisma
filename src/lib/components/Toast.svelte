<script lang="ts">
	type ToastProps = {
		text: string;
		backgroundColor?: string;
		textColor?: string;
	};

	let { text, backgroundColor, textColor }: ToastProps = $props();
</script>

<main
	class="bg-opacity-50 absolute top-14 left-1/2 z-50 hidden -translate-x-1/2 transform bg-gray-900 md:inline"
>
	<section
		class={`relative flex w-80 items-center justify-center rounded-lg border-2 border-green-700 p-3 font-bold shadow-md ${backgroundColor} `}
	>
		<p class={`text-sm ${textColor}`}>
			{text}
		</p>
	</section>
</main>
