# Space Cleanup Station

Pizza Ready-style 2.5D isometric mobile game about collecting orbital debris, recycling it at a station, and reinvesting the credits into faster cleanup.

## Stack

- Phaser 4.2.1
- TypeScript
- Vite
- Capacitor 8
- Offline-first; no backend required for the core game

## Current vertical slice

1. Move with WASD / arrow keys or the mobile virtual stick.
2. Approach debris to collect it automatically.
3. Return to the `RECYCLE` station to sell cargo one item at a time.
4. Buy speed and cargo-capacity upgrades.
5. Progress is saved locally on the device/browser.

No external art assets or network requests are required for this slice.

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## Native mobile

Generate the native projects once:

```bash
npm install
npx cap add android
npx cap add ios
npm run cap:sync
```

Run on device/emulator:

```bash
npm run cap:android
npm run cap:ios
```

The built Vite bundle is copied into the native app (`webDir: dist`), so the core game does not require a separate web server.

## Architecture

```text
src/
├─ entities/   # Player and debris presentation/state
├─ game/       # save state and isometric math
├─ scenes/     # Phaser scenes and orchestration
├─ main.ts     # Phaser boot config
└─ styles.css  # viewport / safe-area shell
```

See `AGENTS.md` for AI-development constraints.

## Next

- Replace procedural shapes with a cohesive isometric art set.
- Add worker drones and automated collection.
- Add recycling stations and visible processing queues.
- Add contracts and area unlocks after the core loop feels good.
- Generate Android/iOS projects and test on real devices early.
