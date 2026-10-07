# AI development rules

This project is designed for agent-driven iteration. An agent should be able to receive an Issue number, read the repository, understand the intended game, and implement the task without relying on chat history.

## Required reading order

Before implementing any gameplay Issue, read in this order:

1. `AGENTS.md`
2. `GAME_DESIGN.md`
3. the relevant specialized design document
4. the parent EPIC
5. the assigned Issue
6. the current implementation of the affected systems

Specialized documents:
- Art / visual work → `ART_DIRECTION.md`
- First-hour / onboarding work → `docs/FIRST_HOUR_DESIGN.md`
- Progression / unlock / save work → `docs/PROGRESSION_MODEL.md`
- Implementation order → `TASKS.md`

Do not invent a new interpretation before checking these files.

## Source-of-truth hierarchy

When instructions appear to conflict, use this order:

1. explicit current assigned Issue requirement
2. `GAME_DESIGN.md`
3. relevant specialized design document
4. parent EPIC
5. `TASKS.md`
6. existing implementation

An Issue should override the game design only when it clearly intends to change that design.

If the existing code conflicts with the design documents, preserve user data first, then move the code toward the documented design without unrelated rewrites.

## Project constraints

- Stack: Phaser 4.2.x + TypeScript + Vite + Capacitor 8.
- Core gameplay is offline-first.
- Do not add a backend unless an Issue explicitly requires it.
- Current gameplay target is mobile landscape.
- GitHub Pages is the fast review/playtest surface.
- Android/iOS via Capacitor are release targets.
- Keep touch controls working.
- Keep desktop keyboard controls for development.
- Do not move the MVP to realtime 3D.
- Optimize for mid-range mobile devices.

## Architecture rules

- Keep one gameplay responsibility per file/class where practical.
- Keep Scene classes thin.
- Move reusable logic into `entities/`, `game/`, or `systems/`.
- Progression decisions must not be scattered as arbitrary booleans in `GameScene`.
- UI reflects state; UI must not be the source of state.
- Gameplay collision / collection ranges must not depend on sprite image dimensions.
- Visual asset swaps must not rewrite economy, save, or AI logic.
- Prefer data-driven balance/config instead of magic numbers in Scene code.

For Month 1 progression, prefer:
```text
src/game/GameState.ts
src/game/GameBalance.ts
src/game/ProgressionState.ts
src/game/ProgressionRules.ts
```

See `docs/PROGRESSION_MODEL.md`.

## TypeScript rules

- Use strict TypeScript.
- Do not introduce `any` unless an external API makes it genuinely unavoidable.
- Prefer explicit domain types for progression, IDs, states, and configuration.
- Use stable machine-readable IDs. Never use localized UI strings as save identifiers.
- Keep pure progression rules testable outside Phaser when practical.

## Save-data rules

Existing user data must be preserved.

When changing the save schema:
- implement explicit migration
- preserve Credits
- preserve upgrade levels
- preserve cargo when valid
- preserve already-unlocked features
- sanitize unknown/corrupt optional fields
- never turn a recoverable optional-field error into a full save reset
- verify both fresh save and migrated save

A player who already has a Drone must not lose it because the new design introduces Drone repair.

## Issue implementation protocol

Before coding an Issue:

1. identify its parent EPIC
2. identify prerequisites
3. identify expected files/systems to touch
4. identify systems explicitly out of scope
5. inspect current code before editing
6. make the smallest coherent change that completes the player-facing goal

During implementation:
- do not opportunistically redesign unrelated systems
- do not silently change economy values unless the Issue requires it
- do not add a dependency unless it materially reduces complexity
- do not add a framework for a single feature
- keep `main` buildable

Before completing:
- run `npm run build`
- verify the player-facing behavior in the Pages-compatible build
- verify save/reload when persistence is involved
- verify migration when save schema changes
- verify touch behavior when controls/HUD are affected
- update relevant documentation if the implementation intentionally changes the design

## Player-facing completion rule

An asset existing in the repository is not sufficient completion.

For a player-facing Issue, completion normally means:
- the feature appears in the actual game
- it behaves correctly
- it survives relevant save/reload
- it does not break the core loop
- it can be reviewed through the Pages build

## Art rules

Read `ART_DIRECTION.md`.

- Runtime remains 2.5D.
- Prefer WebP sprites and atlases as asset count grows.
- Use procedural Phaser graphics as fallback while final art is missing.
- Keep camera angle, lighting, scale, and shadow direction consistent.
- Do not bake gameplay labels into art.
- Do not use oversized source textures at runtime without justification.

## Gameplay rules

Read `GAME_DESIGN.md`.

The core loop is:

```text
find debris
→ collect
→ carry
→ return
→ process
→ earn Credits
→ upgrade
→ automate
```

Month 1 progression is achievement-driven, not calendar-locked.

Do not add:
- required login streaks
- forced ads
- gacha / paid loot boxes
- mandatory backend progression
- combat
- PvP
- multiplayer
unless a future Issue explicitly changes scope.

## First-hour rules

Read `docs/FIRST_HOUR_DESIGN.md`.

- teach through play, not tutorial modal chains
- introduce one concept at a time
- remove hints after the player demonstrates understanding
- Drone Lv1 is unlocked by repair progression, not Credits alone
- mandatory repair parts must have deterministic/pity protection
- Contract and Archive unlock after the first automation experience, not at startup

## Validation

Minimum validation for every code change:
```bash
npm run build
```

Add focused tests when logic can reasonably be tested independently.

Prefer deterministic, small changes that are easy for another agent to review and continue.

## Repository hygiene

- Never commit `node_modules/`.
- Never commit generated `dist/`.
- The tracked `preview/` directory is an intentional GitHub Pages workaround; do not remove or redesign it unless the Pages deployment strategy is explicitly being changed.
- Do not delete legacy migration paths just because a fresh install does not need them.
