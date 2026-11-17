<script lang="ts">
	import { resolve } from '$app/paths';
	import DataLoader from '#lib/components/DataLoader.svelte';
	import SeasonBar from '#lib/components/SeasonBar.svelte';
	import SkillInput from '#lib/components/SkillInput.svelte';
	import { clock } from '#lib/clock.svelte';
	import { levelForXp, wardogLevel } from '#lib/estimation';
	import { progress } from '#lib/progress.svelte';
	import { SKILL_IDS, WARDOG_ID } from '#lib/tracks';

	const names: Record<string, string> = {
		assault: 'Assault',
		medic: 'Medic',
		support: 'Support',
		recon: 'Recon',
		pilot: 'Pilot',
		driver: 'Driver'
	};
</script>

<svelte:head>
	<title>Overview · Wardogs Progression Tracker</title>
</svelte:head>

<DataLoader>
	{#snippet children(data)}
		<div class="space-y-8">
			<SeasonBar season={data.season} now={clock.now} />

			<section>
				<div class="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h2 class="text-lg font-semibold text-slate-900">Your XP</h2>
						<p class="text-sm text-slate-500">
							Enter the total XP you've earned in each progression track this season.
						</p>
					</div>
					<button
						type="button"
						class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
						onclick={() => progress.reset()}
					>
						Reset all
					</button>
				</div>
				<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each SKILL_IDS as id (id)}
						<SkillInput {id} name={names[id]} levels={data.levels} />
					{/each}
				</div>
			</section>

			<section>
				<h2 class="text-lg font-semibold text-slate-900">Tracks</h2>
				<p class="mt-1 text-sm text-slate-500">
					Wardog level is the sum of your six progression track levels.
				</p>
				<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<a
						href={resolve('/track/[track]', { track: WARDOG_ID })}
						class="rounded-xl border border-amber-300 bg-amber-50 p-4 transition-colors hover:border-amber-400"
					>
						<p class="text-sm font-semibold text-amber-700">Wardog</p>
						<p class="mt-1 text-3xl font-bold text-slate-900">
							{wardogLevel(progress.xp, data.levels)}
						</p>
						<p class="mt-1 text-xs text-slate-500">sum of all progression tracks</p>
					</a>
					{#each SKILL_IDS as id (id)}
						<a
							href={resolve('/track/[track]', { track: id })}
							class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-400"
						>
							<p class="text-sm font-semibold text-slate-700">{names[id]}</p>
							<p class="mt-1 text-3xl font-bold text-slate-900">
								{levelForXp(progress.xp[id], data.levels.xp)}
							</p>
							<p class="mt-1 text-xs text-slate-500">View unlocks →</p>
						</a>
					{/each}
				</div>
			</section>
		</div>
	{/snippet}
</DataLoader>
