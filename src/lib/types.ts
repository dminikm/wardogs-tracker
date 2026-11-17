export interface ItemSource {
	track: string;
	level: number;
}

export interface Item {
	id: string;
	name: string;
	/** Path relative to the static root, e.g. `icons/foo.webp`, or `null` if unknown. */
	img: string | null;
	sources?: ItemSource[];
}

export interface UnlockLevel {
	level: number;
	items: Item[];
}

export interface Track {
	id: string;
	name: string;
	kind: 'skill' | 'overall';
	maxLevel: number;
	unlockLevels: number[];
	levels: UnlockLevel[];
}

export interface Levels {
	maxLevel: number;
	xp: number[];
}

export interface Season {
	name: string;
	start: string;
	end: string;
	durationDays: number;
}

export interface AppData {
	season: Season;
	levels: Levels;
	tracks: Track[];
	items: Item[];
}
