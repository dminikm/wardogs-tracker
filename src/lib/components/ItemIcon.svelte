<script lang="ts">
	import { asset } from '$app/paths';

	let { src, alt, size = 40 }: { src: string | null; alt: string; size?: number } = $props();

	const url = $derived(asset((src ?? 'icons/placeholder.svg') as Parameters<typeof asset>[0]));
</script>

<img
	src={url}
	{alt}
	width={size}
	height={size}
	loading="lazy"
	decoding="async"
	class="shrink-0 rounded border border-slate-200 bg-white object-contain p-0.5"
	style="width:{size}px;height:{size}px"
/>
