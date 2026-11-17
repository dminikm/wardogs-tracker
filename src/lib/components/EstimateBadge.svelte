<script lang="ts">
	import type { Estimate } from '#lib/estimation';
	import { formatDate, formatDuration, formatTime } from '#lib/format';

	let { estimate }: { estimate: Estimate } = $props();
</script>

{#if estimate.at === null || estimate.inHours === null || !Number.isFinite(estimate.inHours)}
	<span class="text-slate-400">—</span>
{:else}
	<span class="block text-sm whitespace-nowrap">
		<span class="font-semibold text-sky-700">{formatDate(estimate.at)}</span>
		<span class="text-slate-400">{formatTime(estimate.at)}</span>
	</span>
	<span class="block text-xs text-slate-400">in ~{formatDuration(estimate.inHours)}</span>
{/if}
