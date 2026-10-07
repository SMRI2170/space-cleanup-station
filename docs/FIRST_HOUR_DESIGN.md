# First Hour Design — Space Cleanup Station

## Goal

The first hour must teach the game through play, not through menus.

The intended transition is:

```text
move
→ collect
→ return
→ process
→ upgrade
→ repeat independently
→ discover broken drone
→ repair it
→ watch automation work
→ receive first contract
→ discover the Archive
```

The player should never be required to wait for a real-world date.

## 0:00–1:30 — First contact

### 0:00–0:15
Spawn close to the recycling station with one clear SCRAP object in the movement direction.

Show only:
- joystick
- cargo
- objective: MOVE TO THE DEBRIS

Do not highlight upgrade pads yet.

### 0:15–0:45
When the player enters collection range:
- magnet reacts automatically
- first pickup feedback is stronger than normal
- cargo becomes 1/5
- short message: SCRAP SECURED

### 0:45–1:30
Place another 2–3 easy debris objects nearby.
Remove the strong marker after the first successful pickup.

Fallback hint:
only show a subtle movement hint if the player remains inactive or fails to approach debris for a meaningful period.

## 1:30–5:00 — First value conversion

### 1:30–3:00
Once cargo contains several objects:
- gently highlight the station
- let the player return before cargo is full
- show each cargo object entering the processor
- make the credit gain visually obvious

### 3:00–5:00
Make THRUST and CARGO the clearest first upgrade choices.

Current starting costs:
- THRUST: 20 CR
- CARGO: 20 CR

The first return should normally afford one of them, but should not trivially afford every first-tier upgrade.

The purchased improvement should be immediately noticeable.

## 5:00–10:00 — Independent second loop

The player now receives less guidance.

Introduce:
- slightly farther PANEL debris
- second upgrade opportunity
- MAGNET / PROCESSOR as visible future choices

Around minute 8, activate a signal from the broken drone parked near the station.

Short communication:
A recovery unit can be restored if the required components are found.

This becomes the first major goal.

## 10:00–30:00 — Repair the drone

Do not unlock Drone Lv1 by credits alone.

Required repair components should be simple and guaranteed to appear within a reasonable amount of normal play.

Initial design:
- Power Cell ×1
- Control Board ×1
- Thruster Scrap ×2
- small repair fee

The components may appear as special progression drops, but mandatory components must use pity/guaranteed spawning so bad luck cannot block progress indefinitely.

Repair flow:
1. diagnose drone
2. reveal required parts
3. collect parts during normal play
4. deliver parts
5. pay repair fee
6. short repair animation
7. Drone Lv1 unlock
8. drone immediately performs one complete collection-and-return cycle

The first automated cycle is part of the reward and should be visible to the player.

## 30:00–60:00 — Expand the game

Do not unlock several systems at once.

### 30–40 min: Contracts
After the first successful automated drone delivery:
- present one fixed commercial contract
- example: deliver 5 PANEL debris
- after completion, unlock the normal contract pool

### 40–60 min: Orbital Archive
Unlock after either:
- the first qualifying rare discovery, or
- a deterministic collection threshold

Retroactively register already-discovered base debris.

The Archive introduces rarity:
- Common
- Uncommon
- Rare
- Epic
- Relic

The player should now have three parallel reasons to continue:
- earn and upgrade
- complete contracts
- discover new debris

## Progression state

The first-hour flow should not be encoded as scattered scene booleans.

Persist:
- currentChapter
- onboardingStep
- droneRepairStage
- droneRepairParts
- unlockedSystems
- seenStoryEvents
- completedMajorGoals

Use safe save migration from the current v2 save schema.

## Pacing targets

| Time | Target |
| --- | --- |
| 0:15 | Player moves |
| 0:45 | First pickup |
| 1:30 | Multiple debris collected |
| 3:00 | First station processing |
| 5:00 | First upgrade |
| 8–10 min | Broken drone becomes major goal |
| 20–30 min | Drone repaired |
| 30–40 min | First contract |
| 40–60 min | Archive / rarity introduced |

These are tuning targets, not hard timers. Progress should be achievement-driven.

## UX rules

- no forced full-screen tutorial sequence
- one concept at a time
- remove hints after the player demonstrates understanding
- do not teach future systems before they matter
- avoid mandatory RNG gates
- no login streak requirement
- no ad requirement
- allow save/reload at every stage
- keep the core loop playable even if optional UI is ignored

## Debug requirements

Development mode should support:
- reset to fresh save
- jump onboarding step
- add credits
- add drone repair component
- unlock drone
- jump chapter
- inspect elapsed session time
- inspect current major goal

This makes first-hour balance reproducible instead of relying on manual long-form replay.

## Related issues

- #56 Month 1 progression
- #57 first 10 minutes
- #58 drone repair
- #68 first-hour pacing
- #70 progression state / Save v3
- #71–#75 first-hour slices
- #76 progression debug HUD
