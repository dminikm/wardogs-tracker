<script lang="ts">
	import { remainingHours, seasonProgress } from '#lib/estimation';
	import { formatDay, formatDuration } from '#lib/format';
	import type { Season } from '#lib/types';

	let { season, now }: { season: Season; now: number } = $props();

	const progress = $derived(seasonProgress(season, now));
	const remaining = $derived(remainingHours(season, now));
	const percent = $derived(Math.round(progress * 100));
</script>

<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<h2 class="text-sm font-semibold tracking-wide text-slate-700 uppercase">{season.name}</h2>
		<p class="text-xs text-slate-500">
			{formatDay(season.start)} → {formatDay(season.end)}
			<span class="text-slate-400">·</span>
			{formatDuration(remaining)} left
		</p>
	</div>
	<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
		<div
			class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
			style="width:{percent}%"
		></div>
	</div>
	<p class="mt-1 text-right text-xs text-slate-500">{percent}% elapsed</p>
</section>
