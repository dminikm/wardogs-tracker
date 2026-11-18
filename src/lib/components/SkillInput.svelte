<script lang="ts">
	import { levelForXp, xpForLevel } from '#lib/estimation';
	import { formatXp } from '#lib/format';
	import { progress } from '#lib/progress.svelte';
	import type { SkillId } from '#lib/tracks';
	import type { Levels } from '#lib/types';

	let { id, name, levels }: { id: SkillId; name: string; levels: Levels } = $props();

	const xp = $derived(progress.xp[id]);
	const level = $derived(levelForXp(xp, levels.xp));
	const nextXp = $derived(xpForLevel(level + 1, levels.xp));
	// Start of the previous level (i.e. drop exactly one level).
	const prevXp = $derived(xpForLevel(level - 1, levels.xp) ?? 0);

	function onInput(event: Event) {
		progress.set(id, Number((event.currentTarget as HTMLInputElement).value));
	}
</script>

<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
	<div class="flex items-center justify-between gap-2">
		<h3 class="font-semibold text-slate-900">{name}</h3>
		<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Level {level}</span>
	</div>

	<label class="mt-3 block text-xs text-slate-500">
		Total XP
		<input
			type="number"
			min="0"
			step="1"
			value={xp}
			disabled={!progress.editable}
			oninput={onInput}
			class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
		/>
	</label>

	<div class="mt-2 flex items-center gap-2">
		<button
			type="button"
			class="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
			disabled={level === 0 || !progress.editable}
			onclick={() => progress.set(id, prevXp)}
		>
			← Prev level
		</button>
		<button
			type="button"
			class="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
			disabled={nextXp === null || !progress.editable}
			onclick={() => nextXp !== null && progress.set(id, nextXp)}
		>
			Next level →
		</button>
	</div>

	{#if nextXp !== null}
		<p class="mt-2 text-right text-xs text-slate-500">
			{formatXp(Math.max(0, nextXp - xp))} XP to level {level + 1}
		</p>
	{/if}
</div>
