# Space Cleanup Station

Pizza Ready-style 2.5D isometric mobile game about collecting orbital debris, recycling it at a station, and reinvesting credits into faster cleanup and automation.

## Play the latest main

GitHub Pages preview:

https://smri2170.github.io/space-cleanup-station/

Every push to `main` is built with Vite and deployed from `dist/`. The Pages build is the fast browser review target; Android/iOS via Capacitor remain the release targets.

## Stack

- Phaser 4.2.1
- TypeScript
- Vite
- Capacitor 8
- Offline-first; no backend required for the core game
- GitHub Actions for build validation and Pages preview

## Current vertical slice

1. Move with WASD / arrow keys or the mobile virtual stick.
2. Approach debris to collect it automatically.
3. Return to the `RECYCLE` station to process cargo.
4. Spend credits on speed and cargo capacity.
5. Unlock automation through the broken-drone repair progression.
6. Contracts, Archive collection, station growth, and the Month 1 salvage arc expand the loop.
7. Progress is saved locally.

## Roadmap

Current milestone: **Phaser Mobile MVP**

- #27 GitHub Pages preview
- #28 visible cargo stack + recycling conveyor
- #29 world upgrade pads + data-driven upgrades
- #30 worker drone automation
- #31 mobile HUD / touch / safe areas
- #32 save / balance / mobile performance
- #33 Android + iOS device builds

Parent roadmap: #26

## Design sources

This repository is intended to be understandable without prior chat history.

- `GAME_DESIGN.md` — primary gameplay source of truth
- `ART_DIRECTION.md` — 2.5D visual and asset direction
- `docs/FIRST_HOUR_DESIGN.md` — 0–60 minute player experience
- `docs/PROGRESSION_MODEL.md` — unlock graph, typed progression states, and Save v3 target
- `AGENTS.md` — mandatory AI implementation rules and reading order
- `TASKS.md` — current implementation sequence

Month 1 progression parent: **#56**.

## Run locally

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
```

## Native mobile

Generate native projects once:

```bash
npx cap add android
npx cap add ios
npm run cap:sync
```

Run on device/emulator:

```bash
npm run cap:android
npm run cap:ios
```

The Vite bundle is copied into the native app (`webDir: dist`), so the core game does not require a separate game server.

## Architecture

```text
src/
├─ entities/
├─ game/
├─ scenes/
├─ main.ts
└─ styles.css
```

See `AGENTS.md`, `TASKS.md`, and `GAMEPLAY_LOOP.md` for the current development rules.
