<script lang="ts">
	let { show, message, onConfirm, onCancel } = $props();
</script>

{#if show}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/80">
		<div class="w-full max-w-md space-y-4 rounded-2xl bg-gray-900 p-6 shadow-lg">
			<p class="text-lg font-medium">{message}</p>
			<div class="flex justify-end space-x-4">
				<button onclick={onCancel} class="rounded bg-green-500 px-4 py-2 hover:bg-green-600">
					Cancel
				</button>
				<button
					onclick={onConfirm}
					class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
