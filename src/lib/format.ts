const numberFormat = new Intl.NumberFormat();
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(undefined, {
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});

export function formatXp(value: number): string {
	return numberFormat.format(Math.round(value));
}

/** Locale-aware day + month, e.g. "17. November" or "November 17". */
export function formatDate(ms: number): string {
	return dateFormat.format(new Date(ms));
}

/** Locale-aware time in the user's timezone, e.g. "13:59" or "1:59 PM". */
export function formatTime(ms: number): string {
	return timeFormat.format(new Date(ms));
}

export function formatDay(iso: string): string {
	return dayFormat.format(new Date(iso));
}

/** Human-friendly duration from a number of hours. */
export function formatDuration(hours: number): string {
	if (!Number.isFinite(hours) || hours < 0) return '—';
	const totalMinutes = Math.round(hours * 60);
	const days = Math.floor(totalMinutes / (24 * 60));
	const h = Math.floor((totalMinutes % (24 * 60)) / 60);
	const m = totalMinutes % 60;
	if (days > 0) return `${days}d ${h}h`;
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m`;
}
