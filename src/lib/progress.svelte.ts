import { browser } from '$app/env';
import { SKILL_IDS, type SkillId } from './tracks';

const STORAGE_KEY = 'wardogs-tracker:progress:v1';

function emptyXp(): Record<SkillId, number> {
	return Object.fromEntries(SKILL_IDS.map((id) => [id, 0])) as Record<SkillId, number>;
}

function loadXp(): Record<SkillId, number> {
	const xp = emptyXp();
	if (!browser) return xp;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return xp;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		for (const id of SKILL_IDS) {
			const value = Number(parsed[id]);
			if (Number.isFinite(value) && value > 0) xp[id] = Math.floor(value);
		}
	} catch {
		// Ignore unreadable storage and fall back to an empty progress.
	}
	return xp;
}

class ProgressStore {
	xp = $state<Record<SkillId, number>>(loadXp());

	get total(): number {
		return SKILL_IDS.reduce((sum, id) => sum + this.xp[id], 0);
	}

	set(id: SkillId, value: number) {
		this.xp[id] = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
		this.#save();
	}

	add(id: SkillId, delta: number) {
		this.set(id, this.xp[id] + delta);
	}

	reset() {
		this.xp = emptyXp();
		this.#save();
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.xp));
		} catch {
			// Ignore quota/private-mode errors; progress simply won't persist.
		}
	}
}

export const progress = new ProgressStore();
