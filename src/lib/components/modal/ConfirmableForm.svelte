<script lang="ts">
	import Modal from '$lib/components/modal/Modal.svelte';

	let {
		children,
		message = 'Are You Sure',
		action = '?',
		method = 'post' as 'dialog' | 'post' | 'get'
	} = $props();

	let show = $state(false);
	let formEl: HTMLFormElement | undefined = $state();

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		show = true;
	}

	function confirm() {
		show = false;
		formEl?.submit();
	}

	function cancel() {
		show = false;
	}
</script>

<form bind:this={formEl} {method} {action} onsubmit={handleSubmit}>
	{@render children()}
</form>

<Modal {show} {message} onConfirm={confirm} onCancel={cancel} />
