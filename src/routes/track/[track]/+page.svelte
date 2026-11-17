<script lang="ts">
	import DataLoader from '#lib/components/DataLoader.svelte';
	import TrackView from '#lib/components/TrackView.svelte';
	import { clock } from '#lib/clock.svelte';
	import { TRACK_NAMES } from '#lib/tracks';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{TRACK_NAMES[data.trackId] ?? 'Track'} · Wardogs Progression Tracker</title>
</svelte:head>

<DataLoader>
	{#snippet children(app)}
		{@const track = app.tracks.find((entry) => entry.id === data.trackId)}
		{#if track}
			<TrackView {track} data={app} now={clock.now} />
		{:else}
			<p class="text-slate-400">Unknown track.</p>
		{/if}
	{/snippet}
</DataLoader>
