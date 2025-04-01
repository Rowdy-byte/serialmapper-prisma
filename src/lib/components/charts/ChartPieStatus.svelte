<script lang="ts">
	import { Chart } from 'chart.js/auto';

	let { productStatusIn, productStatusOut } = $props();

	let chartStatus: Chart<'pie', (number | object)[], string> | null = $state(null);
	let chartStatusCanvas: HTMLCanvasElement | undefined = $state();

	$effect.pre(() => {
		if (chartStatusCanvas) {
			const existingChart = Chart.getChart(chartStatusCanvas);
			if (existingChart) {
				existingChart.destroy();
			}
		}

		if (!chartStatusCanvas) return;
		const ctx = chartStatusCanvas.getContext('2d');
		if (!ctx) return;

		// Use your computed product status values
		const inStatus = productStatusIn || 0;
		const outStatus = productStatusOut || 0;

		chartStatus = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: ['IN', 'OUT'],
				datasets: [
					{
						label: 'Product Status',
						data: [inStatus, outStatus],
						backgroundColor: [
							'rgba(5, 150, 105, 1)',
							'rgba(59, 130, 246, 1)',
							'rgba(34, 197, 94,1)'
						],
						borderColor: [
							// 'rgba(249, 115, 22,1)',
							// 'rgba(59, 130, 246, 1)',
							// 'rgba(34, 197, 94, 1)'
						],
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
	});
</script>

<canvas
	bind:this={chartStatusCanvas}
	id="chartStatus"
	class="mx-auto max-h-60 rounded-lg bg-gray-900/0 p-3 shadow-lg"
></canvas>
