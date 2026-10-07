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
