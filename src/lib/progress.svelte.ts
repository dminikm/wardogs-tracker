import { browser } from '$app/env';
import { SKILL_IDS, type SkillId } from './tracks';

const STORAGE_KEY = 'wardogs-tracker:progress:v1';

function emptyXp(): Record<SkillId, number> {
	return Object.fromEntries(SKILL_IDS.map((id) => [id, 0])) as Record<SkillId, number>;
}

/** Normalize arbitrary input into a complete, non-negative integer XP record. */
function sanitizeXp(values: Partial<Record<SkillId, number>>): Record<SkillId, number> {
	const xp = emptyXp();
	for (const id of SKILL_IDS) {
		const value = Number(values[id]);
		if (Number.isFinite(value) && value > 0) xp[id] = Math.floor(value);
	}
	return xp;
}

function loadXp(): Record<SkillId, number> {
	if (!browser) return emptyXp();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyXp();
		return sanitizeXp(JSON.parse(raw) as Partial<Record<SkillId, number>>);
	} catch {
		// Ignore unreadable storage and fall back to an empty progress.
		return emptyXp();
	}
}

class ProgressStore {
	#local = $state<Record<SkillId, number>>(loadXp());
	#preview = $state<Record<SkillId, number> | null>(null);

	/** The XP currently displayed: shared preview data when active, otherwise local data. */
	get xp(): Record<SkillId, number> {
		return this.#preview ?? this.#local;
	}

	/** Whether progress can be edited (false while viewing shared/exported data). */
	get editable(): boolean {
		return this.#preview === null;
	}

	/** Whether shared/exported data is currently being previewed. */
	get previewing(): boolean {
		return this.#preview !== null;
	}

	get total(): number {
		return SKILL_IDS.reduce((sum, id) => sum + this.xp[id], 0);
	}

	set(id: SkillId, value: number) {
		if (!this.editable) return;
		this.#local[id] = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
		this.#save();
	}

	add(id: SkillId, delta: number) {
		this.set(id, this.xp[id] + delta);
	}

	reset() {
		if (!this.editable) return;
		this.#local = emptyXp();
		this.#save();
	}

	/** Show `values` without touching local storage, until committed or cancelled. */
	preview(values: Partial<Record<SkillId, number>>) {
		this.#preview = sanitizeXp(values);
	}

	/** Save the previewed values to local storage and resume editing. */
	commitPreview() {
		if (!this.#preview) return;
		this.#local = { ...this.#preview };
		this.#preview = null;
		this.#save();
	}

	/** Stop previewing without saving. */
	cancelPreview() {
		this.#preview = null;
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#local));
		} catch {
			// Ignore quota/private-mode errors; progress simply won't persist.
		}
	}
}

export const progress = new ProgressStore();
