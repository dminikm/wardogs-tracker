## Notes

This project is vibe-coded. No human has looked at the code and none likely will. The estimate itself is very rough.
The item icons were taken from MetaForge, though the original assets belong to Bulkhead.

# Wardogs Progression Tracker

A static, offline-first web app for tracking your **Wardogs** season progression and
getting rough estimates of when you'll unlock each item.

Enter the total XP you've earned in each of the six progression tracks. The tracker derives
your progression track levels, your overall **Wardog level** (the sum of the progression
track levels), and projects when each unlock is likely to happen based on the average XP
pace you've kept since the season started. Everything is stored locally in your browser —
there is no backend and no account.

## Features

- **Per-track XP entry** with `Next level` / `Prev level` shortcuts.
- **Seven progression views** — one for each progression track (Assault, Medic, Support, Recon,
  Pilot, Driver) plus the overall Wardog track.
- **Grouped unlock tables** showing the items unlocked at each level, the XP required,
  where you currently are, and a projected unlock date.
- **Local persistence** via `localStorage` (no data leaves your device).
- **Rough pace estimates** based on average XP/hour since the season start.
- **Fully static** output — deployable to GitHub Pages or any static host.

## How progression works

- Each progression track levels up using the shared XP curve in
  [`static/data/levels.json`](static/data/levels.json). `xp[i]` is the **cumulative**
  XP required to reach level `i + 1`.
- A progression track's level is the number of thresholds it has reached. A player with less than
  `200` XP is therefore level `0` until they cross the first threshold.
- The **Wardog level** is _not_ XP-based; it is the sum of the six progression track levels
  (e.g. `5 assault + 2 medic + 1 support + 1 recon + 1 pilot + 2 driver = 12`).
- Unlocks are defined per track in [`static/data/tracks.json`](static/data/tracks.json). The
  progression tracks run to level
  50; the overall Wardog track runs to level 200.

### Estimation

The estimate for a level is intentionally simple:

```
rate        = current XP / hours since season start
unlock time = now + (target XP − current XP) / rate
```

For the Wardog track the same idea is applied per progression track and then simulated:
each progression track is projected forward at its own average rate, and the first moment
the summed level reaches the target is reported. Progression tracks you haven't entered XP
for count as level `0`, so the Wardog projection is only meaningful once you track all the
progression tracks you care about.

Estimates are rough by design — they assume your average pace stays constant and ignore
future changes in play time.

## Data

Everything the app fetches comes from a single committed file,
[`static/data/index.json`](static/data/index.json), shaped as `{ season, levels, tracks,
items }`. The other files in `static/data/` are the same content split up for convenience:

| File                      | Contents                                                  |
| ------------------------- | --------------------------------------------------------- |
| `static/data/levels.json` | Cumulative XP curve (`xp[i]` = XP to reach level `i + 1`) |
| `static/data/season.json` | Season name, start and approximate end                    |
| `static/data/tracks.json` | Per-track, per-level grouped unlocks                      |
| `static/data/items.json`  | Deduplicated item index (`item → where it unlocks`)       |
| `static/data/index.json`  | Everything combined; the only file the app fetches        |

Item icons live in [`static/icons/`](static/icons/). Items without an icon (currently the
`MusicTape` items) fall back to `icons/placeholder.svg`.

To start a new season, replace the data above with the new XP curve and unlock tables and
add any new icons. Keep `index.json` in sync with the split files — the app reads only
`index.json`. All of it is committed, so a normal `npm run build` needs no network access.

## Project structure

```
static/
  data/                     Committed tracker data (see "Data")
  icons/                    Item icons
src/
  lib/
    components/             UI components
    clock.svelte.ts         Shared ticking clock for estimates
    data.ts                 Fetches the tracker data bundle
    estimation.ts           Level + estimate math
    format.ts               Number/date/duration formatting
    progress.svelte.ts      localStorage-backed XP store
    tracks.ts               Track ids, names and helpers
    types.ts                Shared types
  routes/
    +page.svelte            Overview: XP entry + track summaries
    track/[track]/          Per-track unlock table
```

## Development

Requires Node 22+ (the repo pins Node via [`mise`](https://mise.jdx.dev/), see
`mise.toml`).

```sh
npm install
npm run dev        # start the dev server
npm run check      # svelte-check + generated type sync
npm run lint       # prettier --check + eslint
npm run format     # prettier --write
```

## Building & deploying

```sh
npm run build      # static output in build/
npm run preview    # preview the production build
```

The site uses [`@sveltejs/adapter-static`](https://svelte.dev/docs/kit/adapter-static)
and prerenders every route.

### GitHub Pages

A workflow is included at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It builds the site with
the correct base path and publishes `build/` to GitHub Pages. To enable it, set
**Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

For a project site (`https://<user>.github.io/<repo>/`) the workflow sets
`BASE_PATH=/<repo>` automatically; user/org sites (`<user>.github.io`) use the root.
To build locally the same way:

```sh
BASE_PATH=/wardogs-tracker npm run build
```

## Data provenance

The unlock data and item icons originate from the Wardogs game assets (via MetaForge,
`static.metaforge.app`); the original assets belong to Bulkhead. They are included here
for a community progression tracker; all rights remain with the game's owners.
