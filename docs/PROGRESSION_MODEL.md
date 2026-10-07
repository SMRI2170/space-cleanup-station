# Progression Model — Unlock Graph and Save v3

This document defines the intended progression state model.

It exists to prevent different AI agents from inventing incompatible state names, unlock rules, or save structures.

## 1. Chapter IDs

Use stable machine-readable IDs.

```ts
export type ChapterId =
  | 'station_restart'
  | 'first_business'
  | 'orbital_company'
  | 'unknown_debris'
  | 'orbital_cleanup'
  | 'high_orbit';
```

Do not store display labels as progression identifiers.

## 2. Onboarding steps

```ts
export type OnboardingStep =
  | 'move'
  | 'first_pickup'
  | 'collect_more'
  | 'return_to_station'
  | 'first_processing'
  | 'first_upgrade'
  | 'independent_loop'
  | 'drone_discovered'
  | 'complete';
```

Expected progression:
```text
move
→ first_pickup
→ collect_more
→ return_to_station
→ first_processing
→ first_upgrade
→ independent_loop
→ drone_discovered
→ complete
```

Transitions should be triggered by achievements, not elapsed time alone.

## 3. Drone repair stages

```ts
export type DroneRepairStage =
  | 'hidden'
  | 'discovered'
  | 'diagnosed'
  | 'collecting_parts'
  | 'ready_to_repair'
  | 'repairing'
  | 'operational';
```

Repair parts:

```ts
export interface DroneRepairParts {
  powerCell: number;
  controlBoard: number;
  thrusterScrap: number;
}
```

Initial target requirement:

```ts
export const DRONE_REPAIR_REQUIREMENT = {
  powerCell: 1,
  controlBoard: 1,
  thrusterScrap: 2,
};
```

The exact Credit repair fee belongs in GameBalance rather than the save structure.

## 4. Unlockable systems

```ts
export type SystemId =
  | 'upgrades'
  | 'drone_repair'
  | 'drone'
  | 'contracts'
  | 'archive'
  | 'rarity'
  | 'station_tier_2'
  | 'station_tier_3'
  | 'unknown_chain'
  | 'orbital_cleanup'
  | 'high_orbit';
```

Prefer a typed collection or record rather than unrelated booleans spread across scenes.

## 5. Major unlock graph

Canonical dependency graph:

```text
core loop available
        |
        v
first processing
        |
        v
first upgrade
        |
        v
independent second loop
        |
        v
broken drone discovered
        |
        v
drone diagnosed
        |
        v
repair parts collected
        |
        v
Drone Lv1 operational
        |
        +----------------------+
        |                      |
        v                      v
first contract           first automation payoff
        |
        v
normal contracts
        |
        v
Orbital Archive
        |
        v
rarity system
        |
        v
station Tier 2
        |
        v
orbital company chapter
        |
        v
UNKNOWN chain
        |
        v
UNKNOWN-01 → 02 → 03
        |
        v
ORBITAL CLEANUP
        |
        v
High Orbit License
```

Do not unlock downstream systems before their prerequisite unless a debug mode explicitly bypasses progression.

## 6. Suggested unlock conditions

These are design defaults and may be tuned in GameBalance.

### upgrades
Unlock after first processing.

### drone_repair
Unlock after onboarding reaches `drone_discovered`.

### drone
Unlock when repair stage reaches `operational`.

### contracts
Unlock after the first visible automated drone delivery.

### archive
Unlock after:
- first contract completion, and
- either first qualifying discovery or deterministic recovery-count threshold

### rarity
Expose explicitly when Archive unlocks.

### station_tier_2
Unlock from progression/earnings milestone after the player understands contracts + Archive.

### unknown_chain
Unlock after the Orbital Company chapter milestone, not randomly from minute zero.

### orbital_cleanup
Unlock after UNKNOWN-01, UNKNOWN-02, and UNKNOWN-03 are completed.

### high_orbit
Unlock only after ORBITAL CLEANUP completion.

## 7. Save v3 target shape

The exact implementation may use arrays, records, or helpers, but the semantic grouping should remain stable.

```ts
export interface SaveDataV3 {
  version: 3;

  economy: {
    credits: number;
    cargo: number[];
  };

  upgrades: {
    speed: number;
    capacity: number;
    range: number;
    recycle: number;
    drone: number;
  };

  progression: {
    chapter: ChapterId;
    onboardingStep: OnboardingStep;

    droneRepair: {
      stage: DroneRepairStage;
      parts: DroneRepairParts;
    };

    unlockedSystems: SystemId[];
    seenStoryEvents: string[];
    completedMajorGoals: string[];
  };

  stats: {
    debrisCollectedTotal: number;
    creditsEarnedTotal: number;
    stationReturns: number;
    upgradesPurchased: number;
  };
}
```

## 8. Migration from v2

v2 currently stores:
- credits
- speedLevel
- capacityLevel
- rangeLevel
- recycleLevel
- droneLevel
- cargo

Migration requirements:
- preserve all existing economy values
- preserve all upgrade levels
- preserve cargo up to valid capacity
- if existing `droneLevel > 0`, migrated player must remain operational and must not be forced through drone repair retroactively
- assign progression conservatively based on observable existing state
- unknown/missing fields fall back safely
- invalid optional progression data must not wipe the whole save

## 9. Existing-player migration rule for Drone

Important:

A player who already owns Drone Lv1+ before v3 migration must keep it.

Recommended migration:
```text
droneLevel > 0
→ droneRepair.stage = operational
→ system 'drone' unlocked
→ system 'drone_repair' unlocked
```

Do not take previously unlocked functionality away.

## 10. Story event IDs

Story events should use stable IDs.

Examples:

```text
intro_station_boot
first_scrap_secured
first_processing_complete
first_upgrade_complete
broken_drone_signal
drone_diagnosed
drone_repaired
first_drone_delivery
first_contract_received
archive_unlocked
unknown_01_found
unknown_02_found
unknown_03_found
orbital_cleanup_unlocked
orbital_cleanup_complete
high_orbit_license_granted
```

Never use localized display text as event identity.

## 11. Scene architecture

Do not put progression decision logic directly throughout `GameScene`.

Preferred structure:

```text
src/
  game/
    GameState.ts
    GameBalance.ts
    ProgressionState.ts
    ProgressionRules.ts
```

Suggested responsibilities:

### GameState
Persistence-facing aggregate.

### ProgressionState
Typed progression values.

### ProgressionRules
Pure checks/transitions:
- canUnlockContracts
- canUnlockArchive
- canRepairDrone
- canStartOrbitalCleanup
- etc.

### GameScene
Reads progression result and orchestrates visual/gameplay response.

## 12. UI ownership

Progression logic must not depend on whether a specific UI widget is visible.

UI reflects progression.
UI does not define progression.

Examples:
- closing a repair panel must not lose repair state
- hiding an objective banner must not reset its goal
- Archive availability must come from state, not whether the button exists

## 13. Debug bypasses

Debug tools may:
- jump onboarding step
- grant parts
- unlock drone
- jump chapter
- start ORBITAL CLEANUP

Debug actions must be explicitly separated from normal progression logic.

Production gameplay must not depend on debug-only paths.

## 14. Validation checklist

For any progression change:
- fresh save works
- migrated v2 save works
- reload at intermediate step works
- story event does not loop
- downstream unlock does not appear early
- debug mode can reach the state
- corrupt optional progression fields do not prevent boot
- `npm run build` succeeds
