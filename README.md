# Space Cleanup Station — Clean Rebuild

The experimental gameplay implementation was reset on 2026-10-13 to reduce complexity.

Old implementation (restorable): [backup/pre-clean-rebuild-2026-10-13](https://github.com/SMRI2170/space-cleanup-station/tree/backup/pre-clean-rebuild-2026-10-13).

## Current implementation

Minimal Phaser bootstrap, a station marker, basic keyboard and touch movement. Debris, cargo, credits, upgrades, drone, save and progression are **not yet implemented on main**.

## Design documents
- `GAME_DESIGN.md` — complete game vision
- `ART_DIRECTION.md` — visual direction
- `docs/FIRST_HOUR_DESIGN.md` — first-hour experience
- `docs/PROGRESSION_MODEL.md` — save/unlock target
- `AGENTS.md` — AI rules
- `TASKS.md` — clean rebuild sequence

## Run

```bash
npm install
npm run build
npm run dev
```

Preview: https://smri2170.github.io/space-cleanup-station/preview/

Reimplement one gameplay responsibility at a time; do not paste the original GameScene wholesale.