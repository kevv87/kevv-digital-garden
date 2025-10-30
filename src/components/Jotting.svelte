<style lang="less">
	article {
		footer {
			button {
				display: flex;
				align-items: center;
				justify-content: center;

				width: 30px;
				height: 30px;

				margin-top: 0.25rem 0rem 0.5rem;
				border-bottom: 2px solid;

				font-style: var(--monospace);
				font-size: 0.875rem;

				transition: color 0.15s ease-in-out;

				&:hover,
				&.location {
					color: var(--primary-color);
				}
			}
		}
	}

	aside {
		section {
			display: flex;
			flex-direction: column;
			gap: 5px;

			p {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				gap: 5px;

				button {
					border-bottom: 1px solid var(--primary-color);
					padding: 0rem 0.2rem;

					font-size: 0.9rem;
					transition:
						color 0.1s ease-in-out,
						background-color 0.1s ease-in-out;

					&.selected {
						color: var(--background-color);
						background-color: var(--primary-color);
					}

					@media (min-width: 640px) {
						&:hover {
							color: var(--background-color);
							background-color: var(--primary-color);
						}
					}
				}
			}
		}
	}
</style>

<main class="flex flex-col-reverse sm:flex-row gap-10 grow">
	<article class="flex flex-col grow">
		<header class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
		</header>

		{#if pages > 1}
			<footer class="sticky bottom-0 flex items-center justify-center gap-3 mt-a pb-1 c-weak bg-background font-mono">
				<button onclick={() => (page = Math.max(1, page - 1))}>{@render left()}</button>
				<button class:location={1 == page} onclick={() => (page = 1)}>{1}</button>

				{#if pages > 7 && page > 4}{@render dots()}{/if}

				{#each Array.from({ length: Math.min(5, pages - 2) }, (_, i) => i + Math.max(2, Math.min(pages - 5, page - 2))) as P (P)}
					<button class:location={P == page} onclick={() => (page = P)} animate:flip={{ duration: 150 }} transition:fade={{ duration: 150 }}>{P}</button>
				{/each}

				{#if pages > 7 && page < pages - 3}{@render dots()}{/if}

				<button class:location={pages == page} onclick={() => (page = pages)}>{pages}</button>
				<button onclick={() => (page = Math.min(pages, page + 1))}>{@render right()}</button>
			</footer>
		{/if}
	</article>
	<aside class="sm:flex-basis-200px flex flex-col gap-5">
	</aside>
</main>

<script lang="ts">
	import { getRelativeLocaleUrl } from "astro:i18n";
	import { onMount, type Snippet } from "svelte";
	import { flip } from "svelte/animate";
	import { fade } from "svelte/transition";
	import i18nit from "$i18n";

	let { locale, tags: tag_list, top, sensitive, left, right, dots }: { locale: string; tags: string[]; top: Snippet; sensitive: Snippet; left: Snippet; right: Snippet; dots: Snippet } = $props();

	const t = i18nit(locale);

	let initial = $state(false); // Track initial load to prevent unexpected effects
	let tags: string[] = $state([]);
	let filtered: any[] = $derived.by(() => {

		if (!initial) return list;

		// Build URL with current page and tag filters
		let url = getRelativeLocaleUrl(locale, `/jotting?page=${page}${tags.map(tag => `&tag=${tag}`).join("")}`);

		// Match https://github.com/swup/swup/blob/main/src/helpers/history.ts#L22
		window.history.replaceState({ url, random: Math.random(), source: "swup" }, "", url);

		return list;
	});

	// Calculate pagination
	const size: number = 20;
	let pages: number = $derived(Math.ceil(filtered.length / size));

	// Ensure page is within valid range
	let page: number = $state(1);
	$effect(() => {
		page = Math.max(1, Math.min(Math.floor(page), pages));
	});

	// Apply pagination by slicing the array
	let list: any[] = $derived(filtered.slice((page - 1) * size, page * size));

	/**
	 * Toggle tag inclusion/exclusion in the filter list
	 * @param tag Tag to toggle
	 * @param turn whether to include or exclude the tag
	 */
	function switch_tag(tag: string, turn?: boolean) {
		let included = tags.includes(tag);
		if (turn === undefined) turn = !included;

		// Add tag if turning on and not included, or remove if turning off
		tags = turn ? (included ? tags : [...tags, tag]) : tags.filter(item => item !== tag);
	}

	onMount(() => {
		const params = new URLSearchParams(window.location.search);

		page = Number(params.get("page")) || 1;
		tags = params.getAll("tag");

		initial = true;
	});
</script>
