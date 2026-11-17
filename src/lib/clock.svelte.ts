import { browser } from '$app/env';

/** Shared wall clock, refreshed periodically so estimates stay current. */
class Clock {
	now = $state(Date.now());
}

export const clock = new Clock();

if (browser) {
	setInterval(() => {
		clock.now = Date.now();
	}, 30_000);
}
