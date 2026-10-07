# Gameplay loop

## Core loop

The MVP is intentionally smaller than the previous Three.js / Unity designs.

```text
explore
  → collect debris automatically
  → cargo visibly stacks
  → return to the station
  → process debris one item at a time
  → earn credits
  → buy an upgrade in the world
  → unlock automation
  → collect faster
```

## First 5 minutes

The player should understand the game without a long tutorial:

1. Move and collect the first debris.
2. Notice cargo capacity.
3. Return to RECYCLE and watch cargo become credits.
4. Buy a first upgrade.
5. Repeat faster.
6. Work toward the first automated drone.

## Primary decisions

Keep the MVP to a few readable decisions:

- continue collecting or return to recycle
- which upgrade to buy next
- manual collection versus investing in automation

## MVP success criteria

- The loop works offline.
- Collection, cargo, recycling, credits, upgrades and automation are visually connected.
- A first-time player can make progress within one minute.
- Meaningful automation is reachable in roughly five minutes after balancing.
- The same core loop is playable on GitHub Pages and in Capacitor mobile builds.
- Mobile UI never requires precise mouse-like input.

Contracts, hazards, multiple orbital areas, cloud accounts, ads and IAP are post-MVP.
