/** The six progression tracks the player earns XP in. */
export const SKILL_IDS = ['assault', 'medic', 'support', 'recon', 'pilot', 'driver'] as const;

export type SkillId = (typeof SKILL_IDS)[number];

/** The overall track, whose level is the sum of the progression track levels. */
export const WARDOG_ID = 'wardog' as const;

export const ALL_TRACK_IDS = [...SKILL_IDS, WARDOG_ID] as const;

export type TrackId = (typeof ALL_TRACK_IDS)[number];

export const TRACK_NAMES: Record<string, string> = {
	assault: 'Assault',
	medic: 'Medic',
	support: 'Support',
	recon: 'Recon',
	pilot: 'Pilot',
	driver: 'Driver',
	wardog: 'Wardog'
};

export function isSkillId(value: string): value is SkillId {
	return (SKILL_IDS as readonly string[]).includes(value);
}
