<script lang="ts">
	import orig_rotations from '$lib/sample-data/atl320-feb.json';
	import tippy from 'tippy.js';
	import type { Attachment } from 'svelte/attachments';

	import 'tippy.js/dist/tippy.css'; // optional for styling

	function tooltip(content: string): Attachment {
		return (element) => {
			const tooltip = tippy(element, { content, placement: 'bottom-start' });
			return tooltip.destroy;
		};
	}

	const _rotations = Object.values(
		Object.groupBy(orig_rotations, ({ rotationNumber }) => rotationNumber)
	).flat(1);

	const earliest = new Date(Math.min(..._rotations.map((r) => new Date(`${r.checkIn}Z`))));
	const latest = new Date(Math.max(..._rotations.map((r) => new Date(`${r.release}Z`))));

	console.log('Earliest check-in:', earliest.toISOString());
	console.log('Latest release:  ', latest.toISOString());

	const getColumnKey = (date) => `m${date.getMonth()}d${date.getDate()}`;

	const dateBounds = [earliest, latest];
	const dateToColumn = {};
	let currCol = 0;
	let currentDate = dateBounds[0];
	while (currentDate <= dateBounds[1]) {
		const date = new Date(currentDate);
		dateToColumn[getColumnKey(date)] = currCol++;
		date.setDate(date.getDate() + 1);
		currentDate = date;
	}
	const daysInMonth = Object.keys(dateToColumn).length;

	// TODO: should dates be normalized to UTC?
	// const rotations = [
	// 	{
	// 		start: '2026-02-05T14:30:00',
	// 		end: '2026-02-06T05:30:00'
	// 	},
	// 	{
	// 		start: '2026-02-15T14:30:00',
	// 		end: '2026-02-16T05:30:00'
	// 	}
	// ];
	// console.log(Map.groupBy(_rotations, ({ rotationNumber }) => rotationNumber));
	let rotations = Object.values(
		Object.groupBy(_rotations, ({ rotationNumber }) => rotationNumber)
	).map((g) =>
		g.toSorted((a, b) => {
			if (a.checkIn === b.checkIn) {
				return 0;
			} else if (a.checkIn > b.checkIn) {
				return 1;
			} else {
				return -1;
			}
		})
	);
	rotations = rotations
		.toSorted((a, b) => {
			if (a.at(0).checkIn === b.at(0).checkIn) {
				return 0;
			} else if (a.at(0).checkIn > b.at(0).checkIn) {
				return 1;
			} else {
				return -1;
			}
		})
		.flat(1);
	console.log(rotations);

	type Rotation = (typeof _rotations)[number];

	let lastUsedRow = 1;
	const getCurrentRow = (prev: Rotation, curr: Rotation) => {
		if (!prev) return lastUsedRow;
		if (prev.release < curr?.checkIn) {
			return lastUsedRow;
		} else {
			return (lastUsedRow += 1);
		}
	};
</script>

<main>
	<section id="rotation-grid" style="--days-in-range: {daysInMonth}">
		{#each rotations as rotation, i}
			{@const currentRow = getCurrentRow(rotations[i - 1], rotation)}
			{@const startDate = new Date(rotation.checkIn)}
			{@const endDate = new Date(rotation.release)}
			{@const startDayOfRange = dateToColumn[getColumnKey(startDate)]}
			{@const endDayOfRange = dateToColumn[getColumnKey(endDate)]}
			{@const startHour = startDate.getHours()}
			{@const endHour = endDate.getHours()}
			{@const startCol = startDayOfRange * 24 + startHour}
			{@const endCol = endDayOfRange * 24 + endHour}
			<div
				class="bg-amber-500"
				style="grid-column: hour {startCol} / hour {endCol}; grid-row-start: {currentRow};"
				{@attach tooltip(
					JSON.stringify(
						{ startDayOfRange, endDayOfRange, startHour, endHour, startCol, endCol, ...rotation },
						null,
						2
					)
				)}
			>
				{rotation.rotationNumber}
			</div>
		{/each}
	</section>
</main>

<style>
	#rotation-grid {
		display: grid;
		gap: 2px;
		grid-template-columns: repeat(calc(var(--days-in-range) * 24), [hour] 1fr);
		grid-auto-rows: 25px;

		/* Non-essential */
		height: 100vh;
	}
</style>
