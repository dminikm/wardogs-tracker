<script lang="ts">
	import { onMount } from 'svelte';
	import { progress } from '#lib/progress.svelte';
	import { buildShareUrl, importShared, initShare } from '#lib/share';

	let copied = $state(false);
	let failed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	// Applied after hydration so the server and first client render agree.
	onMount(initShare);

	async function copyToClipboard(text: string): Promise<boolean> {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				return true;
			}
		} catch {
			// Fall through to the legacy approach below.
		}
		try {
			const area = document.createElement('textarea');
			area.value = text;
			area.setAttribute('readonly', '');
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.appendChild(area);
			area.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(area);
			return ok;
		} catch {
			return false;
		}
	}

	async function onExport() {
		const ok = await copyToClipboard(buildShareUrl(progress.xp));
		copied = ok;
		failed = !ok;
		clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
			failed = false;
		}, 2500);
	}
</script>

{#if progress.previewing}
	<button
		type="button"
		class="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
		title="Save the shared progress to this browser and resume editing"
		onclick={importShared}
	>
		Import progress
	</button>
{:else}
	<button
		type="button"
		class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100"
		title="Copy a link that contains your current progress"
		onclick={onExport}
	>
		{#if copied}
			Link copied!
		{:else if failed}
			Copy failed
		{:else}
			Export link
		{/if}
	</button>
{/if}
