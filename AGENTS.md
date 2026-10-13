# AI Guide — Clean Rebuild

Before an Issue: read `README.md`, `GAME_DESIGN.md`, the relevant specialized design document, parent EPIC, assigned Issue, and current code.

## Important
Main currently contains only a minimal Phaser scene and movement. Design docs describe **future goals**, not existing features.
Old implementation: `backup/pre-clean-rebuild-2026-10-13`. Use as reference only.

## Rules
- One coherent player-facing improvement per PR
- Scene orchestrates only; move domain state/rules to focused modules
- Prefer pure TypeScript logic and clear boundaries
- Avoid speculative abstractions, unnecessary frameworks, `any`
- Offline-first, mobile landscape, preserve touch and keyboard input
- No backend, real-time 3D, combat, or multiplayer
- Do not casually change economy or scope beyond assigned Issue
- Never break existing saves when adding persistence; migrate v2 safely
- `npm run build` required
- Pages player-visible check required
- `preview/` is intentionally tracked by Pages publish workflow; do not remove
- Never commit `dist/` or `node_modules/`

## Restart plan
Rebuild minimal core loop first: movement → one debris type → cargo → recycling → Credits → upgrade → persistence. Only then implement Month 1 (#56/#70+).

Do not mark prior Issue completions as proof of newly rebuilt gameplay.