<script lang="ts">
	import { Chart } from 'chart.js/auto';

	// Expecting clients as an array of objects from Prisma
	// Each client is assumed to have a 'createdAt' property
	const { inboundProducts } = $props<{ inboundProducts: { createdAt: string }[] }>();

	let chart: Chart<'bar', number[], string> | null = $state(null);
	let chartBarInboundProducts: HTMLCanvasElement | null = $state(null);

	// Month labels for the x-axis
	const monthLabels = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Initialize an array for 12 months with zeros
	const inboundProductCountsPerMonth = new Array(12).fill(0);

	// Process each client object to increment the count for its corresponding month
	inboundProducts.forEach((inboundProduct: { createdAt: string }) => {
		const date = new Date(inboundProduct.createdAt);
		const month = date.getMonth(); // 0 for January, 11 for December
		inboundProductCountsPerMonth[month]++;
	});

	$effect.pre(() => {
		if (chartBarInboundProducts) {
			const existingChart = Chart.getChart(chartBarInboundProducts);
			if (existingChart) {
				existingChart.destroy();
			}
		}
		if (chartBarInboundProducts) {
			chart = new Chart(chartBarInboundProducts, {
				type: 'bar',
				data: {
					labels: monthLabels,
					datasets: [
						{
							label: 'Number of Inbound Products',
							data: inboundProductCountsPerMonth,
							borderColor: 'rgba(249, 115, 22, 1)',
							backgroundColor: 'rgba(249, 115, 22, 1)'
						}
					]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		}
	});
</script>

<canvas
	bind:this={chartBarInboundProducts}
	id="chartBarInboundProducts"
	class="xl:max-h-96rounded-lg mx-auto max-h-60 bg-gray-900 p-3 shadow-2xl"
></canvas>
