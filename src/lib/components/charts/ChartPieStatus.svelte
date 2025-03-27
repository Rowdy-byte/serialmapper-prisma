<script lang="ts">
	import { Chart } from 'chart.js/auto';

	let { productStatusIn, productStatusOut } = $props();

	let chartStatus: Chart<'doughnut', (number | object)[], string> | null = $state(null);
	let chartStatusCanvas: HTMLCanvasElement | undefined = $state();

	function initStatusChart() {
		if (!chartStatusCanvas) return;
		const ctx = chartStatusCanvas.getContext('2d');
		if (!ctx) return;

		// Use your computed product status values
		const inStatus = productStatusIn || 0;
		const outStatus = productStatusOut || 0;

		chartStatus = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['IN', 'OUT'],
				datasets: [
					{
						label: 'Product Status Distribution',
						data: [inStatus, outStatus],
						backgroundColor: ['rgba(255, 105, 0, 1)', 'rgba(43, 127, 255, 1)'],
						borderColor: [],
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'top'
					},
					tooltip: {
						enabled: true
					}
				}
			}
		});
	}

	$effect.pre(() => {
		initStatusChart();
	});
</script>

<canvas
	id="statusChart"
	bind:this={chartStatusCanvas}
	class="mx-auto h-50 w-full rounded-lg bg-gray-950 p-3"
></canvas>
