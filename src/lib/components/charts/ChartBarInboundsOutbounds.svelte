<script lang="ts">
	import { Chart } from 'chart.js/auto';

	// Expecting clients as an array of objects from Prisma
	// Each client is assumed to have a 'createdAt' property
	const { inbounds, outbounds } = $props();

	let chart: Chart<'bar', number[], string> | null = $state(null);
	let chartBarInboundsOutbounds: HTMLCanvasElement | null = $state(null);

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
	const inboundCounts = new Array(12).fill(0);
	const outboundCounts = new Array(12).fill(0);

	// Process each client object to increment the count for its corresponding month
	inbounds.forEach((inboundProduct: { createdAt: string }) => {
		const date = new Date(inboundProduct.createdAt);
		const month = date.getMonth(); // 0 for January, 11 for December
		inboundCounts[month]++;
	});

	outbounds.forEach((outboundProduct: { createdAt: string }) => {
		const date = new Date(outboundProduct.createdAt);
		const month = date.getMonth(); // 0 for January, 11 for December
		outboundCounts[month]++;
	});

	$effect.pre(() => {
		if (chartBarInboundsOutbounds) {
			const existingChart = Chart.getChart(chartBarInboundsOutbounds);
			if (existingChart) {
				existingChart.destroy();
			}
		}
		if (chartBarInboundsOutbounds) {
			chart = new Chart(chartBarInboundsOutbounds, {
				type: 'bar',
				data: {
					labels: monthLabels,
					datasets: [
						{
							label: 'Number of Inbounds',
							data: inboundCounts,

							backgroundColor: 'rgba(249, 115, 22, 1)'
						},
						{
							label: 'Number of Outbounds',
							data: outboundCounts,

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

<canvas
	bind:this={chartBarInboundsOutbounds}
	id="chartBarInboundsOutbounds"
	class="mx-auto max-h-60 rounded-lg bg-gray-900 p-3 shadow-2xl xl:max-h-96"
></canvas>
