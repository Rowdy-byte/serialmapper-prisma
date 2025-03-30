<script lang="ts">
	import { Chart } from 'chart.js/auto';

	// Expecting clients as an array of objects from Prisma
	// Each client is assumed to have a 'createdAt' property
	const { clients } = $props<{ clients: { createdAt: string }[] }>();

	let chart: Chart<'bar', number[], string> | null = $state(null);
	let chartBarClientCanvas: HTMLCanvasElement | null = $state(null);

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
	const clientCountsPerMonth = new Array(12).fill(0);

	// Process each client object to increment the count for its corresponding month
	clients.forEach((client: { createdAt: string }) => {
		const date = new Date(client.createdAt);
		const month = date.getMonth(); // 0 for January, 11 for December
		clientCountsPerMonth[month]++;
	});

	$effect.pre(() => {
		if (chartBarClientCanvas) {
			const existingChart = Chart.getChart(chartBarClientCanvas);
			if (existingChart) {
				existingChart.destroy();
			}
		}
		if (chartBarClientCanvas) {
			chart = new Chart(chartBarClientCanvas, {
				type: 'bar',
				data: {
					labels: monthLabels,
					datasets: [
						{
							label: 'Number of Clients',
							data: clientCountsPerMonth,
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
	bind:this={chartBarClientCanvas}
	id="chartBarClient"
	class="mx-auto max-h-60 rounded-lg bg-gray-900 p-3 shadow-2xl"
></canvas>
