import { SKILL_IDS, type SkillId } from './tracks';
import type { Levels, Season } from './types';

export const HOUR_MS = 3_600_000;

export interface Estimate {
	/** XP earned per hour since the season started (for wardog: across all progression tracks). */
	rate: number;
	/** Predicted unlock timestamp in ms, or `null` when it cannot be estimated. */
	at: number | null;
	/** Hours from now until the unlock, or `null`. */
	inHours: number | null;
	/** Whether the target is already reached. */
	reached: boolean;
}

export function elapsedHours(season: Season, now: number = Date.now()): number {
	return Math.max(0, (now - new Date(season.start).getTime()) / HOUR_MS);
}

export function remainingHours(season: Season, now: number = Date.now()): number {
	return Math.max(0, (new Date(season.end).getTime() - now) / HOUR_MS);
}

/** Fraction (0..1) of the season that has elapsed. */
export function seasonProgress(season: Season, now: number = Date.now()): number {
	const start = new Date(season.start).getTime();
	const end = new Date(season.end).getTime();
	if (end <= start) return 1;
	return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

/** Highest level whose cumulative XP threshold has been reached (starts at 0). */
export function levelForXp(xp: number, thresholds: number[]): number {
	let level = 0;
	for (const threshold of thresholds) {
		if (xp >= threshold) level++;
		else break;
	}
	return level;
}

/** Cumulative XP required to reach `level`, or `null` past the end of the curve. */
export function xpForLevel(level: number, thresholds: number[]): number | null {
	if (level <= 0) return 0;
	if (level > thresholds.length) return null;
	return thresholds[level - 1];
}

export function skillLevels(xp: Record<SkillId, number>, levels: Levels): Record<SkillId, number> {
	const result = {} as Record<SkillId, number>;
	for (const id of SKILL_IDS) result[id] = levelForXp(xp[id], levels.xp);
	return result;
}

export function wardogLevel(xp: Record<SkillId, number>, levels: Levels): number {
	let total = 0;
	for (const id of SKILL_IDS) total += levelForXp(xp[id], levels.xp);
	return total;
}

/**
 * Estimate when a progression track reaches `targetXp` at the average rate observed since the
 * season started. This is deliberately simple: it assumes the player keeps earning
 * XP at the same average pace.
 */
export function estimateSkill(
	currentXp: number,
	targetXp: number,
	season: Season,
	now: number = Date.now()
): Estimate {
	const elapsed = elapsedHours(season, now);
	const rate = elapsed > 0 ? currentXp / elapsed : 0;
	if (currentXp >= targetXp) return { rate, at: now, inHours: 0, reached: true };
	if (rate <= 0) return { rate: 0, at: null, inHours: null, reached: false };
	const inHours = (targetXp - currentXp) / rate;
	return { rate, at: now + inHours * HOUR_MS, inHours, reached: false };
}

/**
 * Estimate when the summed wardog level reaches `targetLevel`. Because wardog level
 * is the sum of the progression track levels, we project each progression track independently at its average
 * rate and binary-search for the first time the sum is high enough.
 */
export function estimateWardog(
	xp: Record<SkillId, number>,
	targetLevel: number,
	levels: Levels,
	season: Season,
	now: number = Date.now()
): Estimate {
	const elapsed = elapsedHours(season, now);
	const rates = {} as Record<SkillId, number>;
	let totalRate = 0;
	for (const id of SKILL_IDS) {
		const rate = elapsed > 0 ? xp[id] / elapsed : 0;
		rates[id] = rate;
		totalRate += rate;
	}

	if (wardogLevel(xp, levels) >= targetLevel) {
		return { rate: totalRate, at: now, inHours: 0, reached: true };
	}
	if (totalRate <= 0) return { rate: 0, at: null, inHours: null, reached: false };

	const levelAt = (hours: number) => {
		let total = 0;
		for (const id of SKILL_IDS) total += levelForXp(xp[id] + rates[id] * hours, levels.xp);
		return total;
	};

	let high = 1;
	let guard = 0;
	while (levelAt(high) < targetLevel) {
		high *= 2;
		if (++guard > 40) return { rate: totalRate, at: null, inHours: null, reached: false };
	}

	let low = 0;
	for (let i = 0; i < 50; i++) {
		const mid = (low + high) / 2;
		if (levelAt(mid) >= targetLevel) high = mid;
		else low = mid;
	}

	const inHours = high;
	return { rate: totalRate, at: now + inHours * HOUR_MS, inHours, reached: false };
}
