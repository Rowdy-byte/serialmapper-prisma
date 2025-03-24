<script lang="ts">
	import { page } from '$app/state';

	const pathname = page.url.pathname;
	const path = pathname.split('/');
	const segement = path[path.length - 1];
	const navigateToPath = pathname.replace(`/${segement}`, '');
</script>

{#if page.status === 404}
	<section
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-gray-500"
	>
		<h1 class="font-bold">You must be lost...</h1>
		<a class="text-blue-500" href={navigateToPath}>Go back</a>
	</section>
{:else if page.status === 500}
	<section
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-gray-500"
	>
		<h1>Whoops. We weren't expecting that.</h1>
		<p>We're investigating the issue.</p>
	</section>
{/if}
