<script lang="ts">
	import { Chart } from 'chart.js/auto';

	let { filteredOutboundProducts } = $props();

	let chart: Chart<'pie', number[], string> | null = $state(null);
	let chartCanvas: HTMLCanvasElement | undefined = $state();

	$effect.pre(() => {
		if (chartCanvas) {
			const existingChart = Chart.getChart(chartCanvas);
			if (existingChart) {
				existingChart.destroy();
			}
		}

		if (!chartCanvas) return;
		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		// Aggregeer het aantal per product uit de inbound producten
		const outboundProductsForChart = filteredOutboundProducts || [];
		const productCounts: { [key: string]: number } = {};

		outboundProductsForChart.forEach((product: { product?: string }) => {
			const productName = product.product || 'Onbekend';
			productCounts[productName] = (productCounts[productName] || 0) + 1;
		});

		const labels = Object.keys(productCounts);
		const dataValues = Object.values(productCounts);

		// Maak een pie chart met de geaggregeerde data
		chart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Products',
						data: dataValues,
						backgroundColor: [
							'rgba(59, 130, 246, 1)',
							'rgba(34, 197, 94, 1)',
							'rgba(75, 192, 192, 1)',
							'rgba(153, 102, 255, 1)',
							'rgba(255, 159, 64, 1)'
						],
						borderColor: [
							// 'rgba(255,99,132,1)',
							// 'rgba(54, 162, 235, 1)',
							// 'rgba(255, 206, 86, 1)',
							// 'rgba(75, 192, 192, 1)',
							// 'rgba(153, 102, 255, 1)',
							// 'rgba(255, 159, 64, 1)'
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
	bind:this={chartCanvas}
	id="chartPieOutboundProducts"
	class="mx-auto max-h-60 rounded-lg bg-gray-900/0 p-3"
></canvas>
