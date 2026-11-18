<script lang="ts">
	import EstimateBadge from './EstimateBadge.svelte';
	import ItemIcon from './ItemIcon.svelte';
	import {
		elapsedHours,
		estimateSkill,
		estimateWardog,
		levelForXp,
		wardogLevel,
		xpForLevel
	} from '#lib/estimation';
	import { formatXp } from '#lib/format';
	import { progress } from '#lib/progress.svelte';
	import { isSkillId } from '#lib/tracks';
	import type { AppData, Item, Track } from '#lib/types';

	let { track, data, now }: { track: Track; data: AppData; now: number } = $props();

	let showAllLevels = $state(false);

	const skillId = $derived(isSkillId(track.id) ? track.id : null);
	const currentXp = $derived(skillId ? progress.xp[skillId] : progress.total);
	const currentLevel = $derived(
		skillId
			? levelForXp(progress.xp[skillId], data.levels.xp)
			: wardogLevel(progress.xp, data.levels)
	);
	const elapsed = $derived(elapsedHours(data.season, now));
	const rate = $derived(elapsed > 0 ? currentXp / elapsed : 0);
	const nextXp = $derived(skillId ? xpForLevel(currentLevel + 1, data.levels.xp) : null);
	const prevXp = $derived(skillId ? (xpForLevel(currentLevel - 1, data.levels.xp) ?? 0) : 0);

	function onXpInput(event: Event) {
		if (!skillId) return;
		progress.set(skillId, Number((event.currentTarget as HTMLInputElement).value));
	}

	function makeRow(level: number, items: Item[]) {
		const threshold = xpForLevel(level, data.levels.xp);
		const reached = skillId
			? threshold !== null && progress.xp[skillId] >= threshold
			: currentLevel >= level;
		const estimate = skillId
			? estimateSkill(progress.xp[skillId], threshold ?? Number.POSITIVE_INFINITY, data.season, now)
			: estimateWardog(progress.xp, level, data.levels, data.season, now);
		const totalXpAt =
			!skillId && estimate.inHours !== null && Number.isFinite(estimate.inHours)
				? progress.total + estimate.rate * estimate.inHours
				: null;
		return { level, items, threshold, reached, estimate, totalXpAt };
	}

	const unlockRows = $derived.by(() =>
		track.levels.map((entry) => makeRow(entry.level, entry.items))
	);

	const maxDisplayLevel = $derived.by(() => {
		const lastUnlock = track.levels.at(-1)?.level ?? 0;
		return Math.max(lastUnlock, currentLevel, 1);
	});

	const rows = $derived.by(() => {
		if (!showAllLevels) return unlockRows;
		const itemsByLevel = new Map(track.levels.map((entry) => [entry.level, entry.items]));
		return Array.from({ length: maxDisplayLevel }, (_, index) => {
			const level = index + 1;
			return makeRow(level, itemsByLevel.get(level) ?? []);
		});
	});

	const nextUnlock = $derived(unlockRows.find((row) => !row.reached) ?? null);
</script>

<section class="space-y-4">
	<header class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-xl font-bold text-slate-900">{track.name}</h1>
				<p class="text-sm text-slate-500">
					{#if track.kind === 'skill'}
						Progression track · {track.levels.length} unlock levels
					{:else}
						Overall track · sum of all progression track levels
					{/if}
				</p>
				{#if nextUnlock}
					<p class="mt-2 text-sm text-slate-500">
						Next unlock at level <span class="font-semibold text-slate-800">{nextUnlock.level}</span
						>
						{#if skillId && nextUnlock.threshold !== null}
							· {formatXp(Math.max(0, nextUnlock.threshold - currentXp))} XP to go
						{:else}
							· {nextUnlock.level - currentLevel} wardog levels to go
						{/if}
					</p>
				{:else}
					<p class="mt-2 text-sm text-emerald-600">All tracked unlocks reached.</p>
				{/if}
			</div>
			<div class="flex gap-6 text-right">
				<div>
					<p class="text-xs tracking-wide text-slate-500 uppercase">
						{track.kind === 'skill' ? 'Level' : 'Wardog level'}
					</p>
					<p class="text-2xl font-bold text-amber-600">{currentLevel}</p>
				</div>
				<div class="w-48 text-left">
					<p class="text-xs tracking-wide text-slate-500 uppercase">Total XP</p>
					{#if skillId}
						<input
							type="number"
							min="0"
							step="1"
							aria-label="Total XP"
							value={currentXp}
							disabled={!progress.editable}
							oninput={onXpInput}
							class="mt-0.5 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-left text-lg font-bold text-slate-900 outline-none focus:border-amber-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
						/>
						<div class="mt-1 flex items-center gap-1">
							<button
								type="button"
								class="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs whitespace-nowrap text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
								disabled={currentLevel === 0 || !progress.editable}
								onclick={() => skillId && progress.set(skillId, prevXp)}
							>
								← Prev level
							</button>
							<button
								type="button"
								class="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs whitespace-nowrap text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
								disabled={nextXp === null || !progress.editable}
								onclick={() => skillId && nextXp !== null && progress.set(skillId, nextXp)}
							>
								Next level →
							</button>
						</div>
						<p class="mt-1 text-xs text-slate-500">
							{#if nextXp !== null}
								{formatXp(Math.max(0, nextXp - currentXp))} XP to level {currentLevel + 1}
							{:else}
								Max level reached
							{/if}
						</p>
					{:else}
						<p class="text-2xl font-bold text-slate-900">{formatXp(currentXp)}</p>
					{/if}
				</div>
				<div>
					<p class="text-xs tracking-wide text-slate-500 uppercase">Pace</p>
					<p class="text-2xl font-bold text-slate-900">
						{formatXp(rate)}<span class="text-sm font-normal text-slate-500">/h</span>
					</p>
				</div>
			</div>
		</div>
	</header>

	<div class="flex justify-end">
		<label class="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
			<input
				type="checkbox"
				bind:checked={showAllLevels}
				class="h-4 w-4 rounded border-slate-300 accent-amber-600"
			/>
			Show levels without unlocks
		</label>
	</div>

	<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full min-w-[680px] border-collapse text-sm">
			<thead class="bg-slate-100 text-left text-xs tracking-wide text-slate-500 uppercase">
				<tr>
					<th class="px-3 py-2 font-medium">Level</th>
					<th class="px-3 py-2 font-medium">Items</th>
					<th class="px-3 py-2 font-medium">
						{track.kind === 'skill' ? 'XP required' : 'Total XP (est.)'}
					</th>
					<th class="px-3 py-2 font-medium">Status</th>
					<th
						class="px-3 py-2 text-center font-medium"
						title="Rough projection from your average XP pace"
					>
						Estimate
					</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.level)}
					<tr class="border-t border-slate-200 {row.level === currentLevel ? 'bg-amber-50' : ''}">
						<td class="px-3 py-3 align-middle">
							<span class="font-semibold text-slate-800">{row.level}</span>
							{#if row.level === currentLevel}
								<span class="block text-xs text-amber-600">current</span>
							{/if}
						</td>
						<td class="px-3 py-3 align-middle">
							{#if row.items.length > 0}
								<ul class="flex flex-wrap gap-x-4 gap-y-2">
									{#each row.items as item (item.id)}
										<li class="flex items-center gap-2">
											<ItemIcon src={item.img} alt={item.name} size={36} />
											<span class="text-slate-800">{item.name}</span>
										</li>
									{/each}
								</ul>
							{:else}
								<span class="text-slate-300">—</span>
							{/if}
						</td>
						<td class="px-3 py-3 align-middle text-slate-600">
							{#if track.kind === 'skill' && row.threshold !== null}
								{formatXp(row.threshold)}
							{:else if row.totalXpAt !== null}
								{formatXp(row.totalXpAt)}
							{:else}
								<span class="text-slate-400">—</span>
							{/if}
						</td>
						{#if row.reached}
							<td class="px-3 py-3 align-middle"></td>
							<td class="px-3 py-3 text-center align-middle">
								<span
									class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
								>
									Unlocked
								</span>
							</td>
						{:else}
							<td class="px-3 py-3 align-middle">
								{#if track.kind === 'skill' && row.threshold !== null}
									<span class="text-xs text-slate-500">
										{formatXp(Math.max(0, row.threshold - currentXp))} XP to go
									</span>
								{:else}
									<span class="text-xs text-slate-500">
										{row.level - currentLevel} levels to go
									</span>
								{/if}
							</td>
							<td class="px-3 py-3 text-center align-middle">
								<EstimateBadge estimate={row.estimate} />
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if track.kind === 'overall'}
		<p class="text-xs text-slate-500">
			Wardog estimates project each progression track at its average pace; progression tracks you
			haven't entered XP for count as level 0.
		</p>
	{/if}
</section>
