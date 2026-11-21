# Neon Coast Studio — multi-panel cover art maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/satsuki-sys/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/satsuki-sys/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your photos and a caption into GTA-style multi-panel cover art, built as an entry to make.fun's `gta6-cover-art-01` competition. Open `app/index.html` in a desktop browser — no build step, no network, nothing to install, and your photos never leave your machine.

## What it does

- **Multi-panel poster layouts**: Vice Grid (6 panels), Poster Stack, Hero Trio and Four Corners, with white poster separators, a colour grade over every panel, film grain and a vignette.
- **Any photo**: add your own photos (they are read locally, never uploaded) or start from the bundled samples. Fill every panel with one photo, mix several photos across panels, then frame each panel on its own — zoom, drag to reposition on the cover itself, scroll to zoom, fill or whole-photo fit.
- **Lettering**: a big gradient title with a dark outline and a letterspaced caption pill, at the foot or the top of the cover, in Sunset, Ice, Neon, Gold or White.
- **Grades**: Vice Sunset, Neon Night, Chrome Day and Mono Heat.
- **One-click PNG export** at the three post sizes — 1080×1080, 1080×1350 and 1920×1080 — or all three at once.

## Layout

- `app/` — the static app (`index.html`, `style.css`, ES modules under `app/src/`, sample images under `app/samples/`).
- `screenshots/` — four real renders of the app; `shots.json` at the repository root says what each shows. The first by name is an exported cover.
- `main.ts` — the hand-in: checks the tree, copies `app/` and `screenshots/` to the output directory, and writes `dossier.json` with the vendored make.fun library, which is shipped unchanged.

Run the hand-in with:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Preview locally with `node serve.ts`, then open http://localhost:8080.

## License

MIT — see `LICENSE`. The two photographic samples are make.fun's own, made with an image model for entrants to use; `neon-drive.jpg` was drawn programmatically for this entry. All lettering is drawn live on canvas with system fonts; no Rockstar Games logo, artwork or font is used.
