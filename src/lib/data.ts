import { asset } from '$app/paths';
import type { AppData } from './types';

let cached: AppData | null = null;
let pending: Promise<AppData> | null = null;

/**
 * Fetch the generated data bundle from `static/data/index.json`. The result is
 * cached for the lifetime of the page.
 */
export function loadData(): Promise<AppData> {
	if (cached) return Promise.resolve(cached);
	if (!pending) {
		pending = fetch(asset('data/index.json'))
			.then((response) => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.json() as Promise<AppData>;
			})
			.then((data) => {
				cached = data;
				return data;
			});
	}
	return pending;
}
