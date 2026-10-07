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

- [ ] #34 realistic low-poly debris sprites
- [ ] #35 astronaut worker sprite
- [ ] #36 modular recycling station art
- [ ] #37 autonomous cleanup drone art

Source of truth: `ART_DIRECTION.md`.
Runtime stays 2.5D; do not move the MVP to realtime 3D.
