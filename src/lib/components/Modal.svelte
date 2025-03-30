<script lang="ts">
	let {
		show = false,
		message = 'Are You Sure?',
		onConfirm,
		onCancel
	}: { show: boolean; message: string; onConfirm: () => void; onCancel: () => void } = $props();
</script>

{#if show}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md space-y-4 rounded-2xl bg-gray-900 p-6 shadow-lg">
			<p class="text-lg font-medium">{message}</p>
			<div class="flex justify-end space-x-4">
				<button class="rounded bg-green-500 px-4 py-2 hover:bg-green-600" onclick={onCancel}>
					Cancel
				</button>
				<button
					class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					onclick={onConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
