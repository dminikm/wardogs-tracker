import { error } from '@sveltejs/kit';
import { ALL_TRACK_IDS, type TrackId } from '#lib/tracks';
import type { PageLoad } from './$types';

export const entries = () => ALL_TRACK_IDS.map((track) => ({ track }));

export const load: PageLoad = ({ params }) => {
	if (!(ALL_TRACK_IDS as readonly string[]).includes(params.track)) {
		error(404, 'Unknown track');
	}
	return { trackId: params.track as TrackId };
};
