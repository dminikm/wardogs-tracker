<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ALL_TRACK_IDS, TRACK_NAMES } from '#lib/tracks';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const nav = [...ALL_TRACK_IDS];
	const pathname = $derived(page.url.pathname);

	function isActive(id: string): boolean {
		return pathname.endsWith(`/track/${id}`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Wardogs Progression Tracker</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-900">
	<header class="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
			<a href={resolve('/')} class="text-sm font-bold tracking-wide text-amber-600 uppercase">
				Wardogs Tracker
			</a>
			<nav class="flex flex-wrap gap-1 text-sm">
				{#each nav as id (id)}
					<a
						href={resolve('/track/[track]', { track: id })}
						class="rounded-md px-2.5 py-1 transition-colors {isActive(id)
							? 'bg-slate-100 text-slate-900'
							: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}"
					>
						{TRACK_NAMES[id] ?? id}
					</a>
				{/each}
			</nav>
		</div>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-6">
		{@render children()}
	</main>
	<footer class="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-500">
		Progress is stored locally in your browser. Estimates are rough: the date and duration are
		projected from your average XP pace since the season started, so they won't always line up
		exactly.
	</footer>
</div>
