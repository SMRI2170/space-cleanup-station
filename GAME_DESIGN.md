# Space Cleanup Station — Game Design Source of Truth

This document is the primary gameplay design reference for humans and AI agents.

If an Issue conflicts with this document, prefer the more recent explicit Issue only when the Issue clearly says it intentionally changes the design. Otherwise, do not invent mechanics that contradict this file.

## 1. Game fantasy

The player starts as the operator of a tiny orbital debris cleanup station in low Earth orbit.

The fantasy evolves from:

```text
solo cleanup worker
→ small orbital salvage operator
→ automated debris recovery company
→ orbital infrastructure contractor
→ major accident recovery operator
→ high-orbit salvage company
```

The game should feel satisfying before it feels complex.

## 2. Product direction

- Mobile-first 2.5D isometric management / cleanup game
- Phaser + TypeScript runtime
- GitHub Pages is the fast review/playtest surface
- Android/iOS via Capacitor are the release targets
- Offline-first core game
- No backend required for the core loop
- No realtime 3D requirement
- Stylized realism rather than photorealism

## 3. Core loop

```text
find debris
→ move close
→ magnetically collect
→ visibly carry cargo
→ return to station
→ process cargo one-by-one
→ receive Credits
→ upgrade
→ automate
→ reach farther / process faster / collect rarer debris
```

Every major system should strengthen this loop rather than replace it.

## 4. Core player verbs

The player mainly:
- moves
- approaches debris
- collects automatically in range
- carries visible cargo
- returns to the station
- watches processing
- buys upgrades
- chooses short-term goals
- expands automation
- discovers rare/story debris

Do not add unnecessary combat or complex inventory micromanagement to the Month 1 experience.

## 5. Progression philosophy

Progression is achievement-driven, not calendar-locked.

Do not require:
- waiting until tomorrow
- daily login streaks
- ads to continue
- real-money purchases
- server connectivity

Time targets are tuning targets only.

A skilled player may progress faster.
A casual player may progress slowly without being punished.

## 6. First hour

Detailed source of truth:
`docs/FIRST_HOUR_DESIGN.md`

Summary:

```text
0–1.5 min
move + first pickup

1.5–5 min
first return + first processing + first upgrade

5–10 min
independent second loop + broken drone reveal

10–30 min
repair drone + first automation

30–40 min
first commercial contract

40–60 min
Orbital Archive + rarity
```

## 7. Month 1 arc

Parent EPIC: #56

### Chapter 1 — Station Restart
Learn the core loop and restore the broken recovery drone.

### Chapter 2 — First Business
Unlock contracts, archive collection, and rarity.

### Chapter 3 — Orbital Company
Expand the physical station and processing capacity.

### Chapter 4 — Unknown Debris
Discover UNKNOWN-01, UNKNOWN-02, and UNKNOWN-03.

### Chapter 5 — Orbital Cleanup
Perform a multi-stage salvage operation on a giant damaged satellite.

### Chapter completion
Receive a High Orbit License and a clear next-area objective.

## 8. Four layers of goals

The game should always try to provide multiple layers of motivation.

### Seconds to minutes
- pick up nearby debris
- fill cargo
- watch processing
- receive Credits
- discover a NEW item

### 5–15 minutes
- complete a contract
- buy an upgrade
- find a Rare item
- unlock a system

### Multiple sessions
- repair the drone
- expand the station
- evolve the processor
- complete UNKNOWN collection stages

### Month-scale
- complete ORBITAL CLEANUP
- receive High Orbit License

Avoid long periods where only one repetitive task remains.

## 9. Economy

Primary currency:
- Credits

Credits come from processed debris and selected rewards.

Upgrade families:
- THRUST
- CARGO
- MAGNET
- PROCESSOR
- DRONE

Rules:
- important new systems should not unlock only because a Credit number was reached
- major unlocks should feel like milestones
- first upgrades should be affordable quickly
- costs should remain data-driven
- do not use ads as mandatory economy multipliers

## 10. Drone progression

Drone Lv0:
- broken and visible at the station

Drone Lv1:
- unlocked through repair progression, not by direct Credit purchase

Repair concept:
- Power Cell ×1
- Control Board ×1
- Thruster Scrap ×2
- small Credit fee

Mandatory repair parts must not depend on unbounded RNG.

After repair:
- immediately show one complete automated collect-and-return cycle

Drone Lv2+:
- may use normal upgrade progression

## 11. Contracts

Contracts provide short-session goals.

Examples:
- collect SCRAP
- deliver PANEL
- process a Credit value
- discover a rarity
- complete a timed but optional cleanup target

Rules:
- no punishment for expiration/failure
- do not require real-world daily reset for Month 1
- contract pool expands with progression
- early contracts should be deterministic and teach the system

## 12. Orbital Archive

The Archive turns debris into collectible discoveries.

Each entry may include:
- display name
- rarity
- short description
- discovered / undiscovered state
- total recovered count
- optional first discovery sequence

Undiscovered entries should use silhouettes.

Base rarity:
- Common
- Uncommon
- Rare
- Epic
- Relic

Rarity should add excitement, not block required progression.

## 13. Station progression

The station must visually grow.

### Tier 1
Small cleanup station.
Single processor.
Broken / first drone dock.

### Tier 2
Expanded platform.
Larger storage.
Expanded drone facilities.

### Tier 3
Orbital Recycling Complex.
Multiple visually active industrial modules.

The station should communicate:

```text
cargo enters
→ conveyor moves it
→ processor converts it
→ Credits are produced
```

## 14. Processor evolution

Suggested visual stages:
- Compact Recycler
- Dual Processor
- Industrial Recycler

Processing speed and visual scale should feel related, while gameplay logic stays independent from art implementation.

## 15. Story delivery

Story is light and contextual.

Use:
- short communications
- world signals
- equipment state changes
- Archive entries
- brief chapter events

Avoid:
- long mandatory dialogue
- long cutscenes
- visual novel pacing
- blocking gameplay for exposition

Typical story event target:
10–20 seconds.

## 16. UNKNOWN debris chain

Mid-game story collection:

```text
UNKNOWN-01 fragment
→ UNKNOWN-02 signal module
→ UNKNOWN-03 core fragment
→ locate major orbital accident
→ unlock ORBITAL CLEANUP
```

The player must not be permanently blocked by random drops.

## 17. ORBITAL CLEANUP

Month 1 finale.

A giant damaged satellite is salvaged in stages:

1. Solar Array
2. Antenna
3. Fuel / Service Module
4. Satellite Core
5. Main Hull

This is a non-combat boss.

Requirements:
- progress persists between sessions
- upgrades matter
- visual state changes after each stage
- can be debug-started during development
- completion grants a major reward and next-area access

## 18. Returning player UX

A returning player should know what to do within 10 seconds.

Show briefly:
- current chapter
- next major goal
- active contract
- Archive NEW count
- near-term unlock if relevant

Do not punish absence.

## 19. Visual direction

Visual source of truth:
`ART_DIRECTION.md`

Summary:
- fixed isometric / three-quarter top-down
- stylized low-poly realism
- upper-left key light
- readable silhouettes
- industrial modular station
- 2D runtime sprites, not realtime 3D for MVP
- WebP/atlas-friendly mobile assets

## 20. UX rules

- mobile landscape is the current target orientation
- touch controls first, keyboard retained for development
- no tutorial modal chain
- teach one concept at a time
- hide hints after demonstrated understanding
- important objects must remain readable at phone scale
- gameplay hit areas must not depend on sprite dimensions
- HUD must respect safe areas

## 21. Save / persistence

Progression must survive reload at every major step.

Current progression work should migrate from save v2 to v3 safely.

Do not:
- wipe existing Credits
- wipe upgrades
- wipe cargo
- replay already-completed story events indefinitely
- let corrupt optional progression data prevent boot

Detailed specification:
`docs/PROGRESSION_MODEL.md`

## 22. Performance principles

Optimize for mid-range mobile hardware.

Prefer:
- reused textures
- WebP assets
- texture atlases when asset count grows
- pooled / lifecycle-controlled FX
- limited overdraw
- limited particle count
- deterministic object counts

Do not use realtime 3D just for visual quality.

## 23. AI implementation rules

Before changing gameplay, read:
1. `AGENTS.md`
2. this file
3. relevant specialized design doc
4. parent EPIC
5. assigned Issue
6. current implementation

Do not invent a new system if the Issue can be fulfilled using an existing one.

## 24. Explicitly out of scope for Month 1

- PvP
- multiplayer
- combat
- backend-required progression
- cloud account requirement
- forced ads
- gacha / paid loot boxes
- login streak punishment
- freeform base building
- deep crafting
- large dialogue trees
- full MEO / GEO campaign
