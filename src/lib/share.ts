import { browser } from '$app/env';
import { progress } from './progress.svelte';
import { SKILL_IDS, type SkillId } from './tracks';

/** Query parameter that carries exported XP values, in `SKILL_IDS` order. */
export const SHARE_PARAM = 'xp';

export function encodeShareXp(xp: Record<SkillId, number>): string {
	return SKILL_IDS.map((id) => Math.max(0, Math.floor(xp[id] ?? 0))).join(',');
}

export function decodeShareXp(raw: string): Record<SkillId, number> | null {
	const parts = raw.split(',');
	if (parts.length !== SKILL_IDS.length) return null;
	const xp = {} as Record<SkillId, number>;
	for (let index = 0; index < SKILL_IDS.length; index++) {
		const value = Number(parts[index]);
		if (!Number.isFinite(value) || value < 0) return null;
		xp[SKILL_IDS[index]] = Math.floor(value);
	}
	return xp;
}

/** A copyable URL for the current page that carries `xp` as exported progress. */
export function buildShareUrl(xp: Record<SkillId, number>): string {
	const url = new URL(window.location.href);
	url.search = '';
	url.hash = '';
	url.searchParams.set(SHARE_PARAM, encodeShareXp(xp));
	return url.toString();
}

function removeShareParam(): void {
	if (!browser) return;
	const url = new URL(window.location.href);
	if (!url.searchParams.has(SHARE_PARAM)) return;
	url.searchParams.delete(SHARE_PARAM);
	// Only cleans the query string on the current history entry, so the native API is enough.
	window.history.replaceState(window.history.state, '', url.toString());
}

/** If the current URL carries exported progress, preview it without editing. */
export function initShare(): void {
	if (!browser) return;
	const raw = new URLSearchParams(window.location.search).get(SHARE_PARAM);
	if (raw === null) return;
	const xp = decodeShareXp(raw);
	if (xp) progress.preview(xp);
}

/** Save the previewed shared progress locally and resume editing. */
export function importShared(): void {
	progress.commitPreview();
	removeShareParam();
}

/** Leave shared preview mode without saving. */
export function discardShared(): void {
	progress.cancelPreview();
	removeShareParam();
}
