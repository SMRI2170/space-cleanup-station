# Development tasks

Current roadmap: #26  
Milestone: **Phaser Mobile MVP**  
Live preview: https://smri2170.github.io/space-cleanup-station/

## Current order

- [x] #27 Vite build → GitHub Pages preview
- [x] #28 Visible cargo stack + one-by-one recycling conveyor
- [x] #29 World upgrade pads + data-driven upgrades
- [x] #30 Worker drone automation
- [ ] #31 Mobile HUD, touch controls, safe areas
- [ ] #32 Save robustness, balance, mobile performance
- [ ] #33 Capacitor Android/iOS real-device build

## Current playable slice

- isometric orbital cleanup field
- mobile virtual stick + WASD/arrow controls
- four debris rarity/value classes
- visible cargo stack on the player
- magnetic pickup range visualization
- animated one-by-one recycling processor
- credits and persistent progression
- in-world upgrade pads for thrust, cargo, magnet and processor
- unlockable/upgradable autonomous collection drone
- objective HUD and pickup/reward feedback
- local save v2 with legacy save migration
- GitHub Pages auto-preview

## Next quality pass

### #31 Mobile presentation
- tune HUD for small phone aspect ratios
- landscape safe-area verification on iPhone/Android
- prevent UI/game-input conflicts
- add optional haptic feedback through Capacitor

### #32 Stability / feel
- 5-minute economy balance
- low/mid-range mobile performance budget
- cap visual effects and active debris
- save corruption / migration checks
- tune drone versus manual collection value

### #33 Native validation
- generate Android/iOS native projects
- offline real-device test
- resume/save restoration test
- record device/OS/build results

## After MVP

Only after the core loop feels good:

- authored isometric art / animation / sound
- additional orbital zones and station expansion
- contracts and optional hazards
- ads / IAP
- cloud save / login / leaderboard

Backend features must not block the offline single-player mobile release.

## Art quality pass

### Foundation
- [ ] #38 2.5D asset loading / metadata / fallback

### Debris — parent #34
- [ ] #39 optimize 4 debris assets to WebP
- [ ] #40 integrate debris sprites into Phaser
- [ ] #41 finish pickup / cargo presentation

### Player — parent #35
- [ ] #42 integrate astronaut base sprite
- [ ] #43 movement / thruster presentation
- [ ] #44 cargo attachment presentation

### Station — parent #36
- [ ] #45 platform + recycling core
- [ ] #46 intake + conveyor
- [ ] #47 processor + output flow
- [ ] #48 drone dock
- [ ] #49 visual upgrade modules

### Drone — parent #37
- [ ] #50 integrate cleanup drone sprite
- [ ] #51 visualize collect / return / dock states

### World / feedback
- [ ] #52 orbital environment art
- [ ] #53 station decorative props
- [ ] #54 shared gameplay VFX

### Final QA
- [ ] #55 mobile texture budget + art QA

Source of truth: `ART_DIRECTION.md`.
Runtime stays 2.5D; do not move the MVP to realtime 3D.

Recommended order:
`#38 → #39-#51 → #54 → #52/#53 → #55`.


## Month 1 progression

Parent: #56

### Phase 1 — Station Restart
- [ ] #57 onboarding: collect → process → upgrade
- [ ] #68 5 / 15 / 30 minute pacing
- [ ] #58 broken drone repair goal

### Phase 2 — First Business
- [ ] #59 contracts
- [ ] #60 Orbital Archive
- [ ] #61 rarity system

### Phase 3 — Orbital Company
- [ ] #62 3-stage station expansion
- [ ] #63 3-stage processor evolution
- [ ] #64 chapter events

### Phase 4 — Unknown Debris
- [ ] #65 UNKNOWN debris story chain

### Phase 5 — ORBITAL CLEANUP
- [ ] #66 multi-stage giant satellite salvage
- [ ] #67 High Orbit License

### Retention UX
- [ ] #69 returning-player recap

Progress is play-based, not calendar-locked. No required login streaks.


### First-hour detailed design
- [ ] #70 progression state + Save v3 migration
- [ ] #71 first 90 seconds: movement + pickup
- [ ] #72 1–5 min: first return + first upgrade
- [ ] #73 5–10 min: independent second loop + broken drone reveal
- [ ] #74 10–30 min: drone repair + first automation
- [ ] #75 30–60 min: contracts + Archive staged unlock
- [ ] #76 progression debug HUD

Source of truth: `docs/FIRST_HOUR_DESIGN.md`.


## Month 1 implementation order

1. [ ] #70 Month 1 progression state + Save v3
2. [ ] #76 Progression Debug HUD
3. [ ] #71 0〜90秒: 移動 + 最初の回収
4. [ ] #72 1〜5分: 初帰還 + 初処理 + 初Upgrade
5. [ ] #73 5〜10分: 2周目 + Broken Drone提示
6. [ ] #74 10〜30分: Drone修復 + 初自動化
7. [ ] #75 30〜60分: Contract + Archive段階解放
8. [ ] #59 通常Contract pool
9. [ ] #60 Orbital Archive本実装
10. [ ] #61 Common〜Relic rarity
11. [ ] #62 基地Tier 1→2→3拡張
12. [ ] #63 Processor 3段階進化
13. [ ] #64 Chapterイベント/短い通信
14. [ ] #69 Returning Player導線
15. [ ] #65 UNKNOWNデブリ収集チェーン
16. [ ] #66 ORBITAL CLEANUP大型サルベージ
17. [ ] #67 High Orbit License

Rule: complete each player-facing step on GitHub Pages before moving to the next unless the next item is only a non-blocking art task.
