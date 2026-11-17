<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { loadData } from '#lib/data';
	import type { AppData } from '#lib/types';

	let { children }: { children: Snippet<[AppData]> } = $props();

	let data = $state<AppData | null>(null);
	let error = $state<string | null>(null);

	onMount(() => {
		loadData()
			.then((value) => (data = value))
			.catch((cause) => (error = cause instanceof Error ? cause.message : String(cause)));
	});
</script>

{#if error}
	<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
		Failed to load tracker data: {error}
	</div>
{:else if data}
	{@render children(data)}
{:else}
	<div class="flex items-center gap-3 p-6 text-slate-500">
		<span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500"
		></span>
		Loading tracker data…
	</div>
{/if}
