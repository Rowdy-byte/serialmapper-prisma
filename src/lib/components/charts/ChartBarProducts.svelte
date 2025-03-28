<script lang="ts">
	import { Chart } from 'chart.js/auto';

	// Expecting clients as an array of objects from Prisma
	// Each client is assumed to have a 'createdAt' property
	const { products } = $props<{ products: { createdAt: string }[] }>();

	let chart: Chart<'bar', number[], string> | null = $state(null);
	let chartCanvas: HTMLCanvasElement | null = $state(null);

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
	products.forEach((product: { createdAt: string }) => {
		const date = new Date(product.createdAt);
		const month = date.getMonth(); // 0 for January, 11 for December
		clientCountsPerMonth[month]++;
	});

	$effect.pre(() => {
		if (chartCanvas) {
			chart = new Chart(chartCanvas, {
				type: 'bar',
				data: {
					labels: monthLabels,
					datasets: [
						{
							label: 'Number of Products',
							data: clientCountsPerMonth,

							backgroundColor: 'rgba(59, 130, 246, 1)'
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

<canvas bind:this={chartCanvas} class="mx-auto max-h-60 rounded-lg bg-gray-900 p-3 shadow-2xl"
></canvas>
