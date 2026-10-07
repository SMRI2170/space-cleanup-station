# Art Direction — Space Cleanup Station

## Goal

Keep the game technically 2.5D and mobile-friendly while making every important object look like it came from a coherent low-poly 3D world.

The target is **stylized realism**, not photorealism:
- immediately readable on a phone
- believable construction and materials
- consistent light direction
- strong silhouettes
- low visual noise
- easy to replace/iterate with AI-generated or Blender-rendered assets later

## Visual language

### Camera
- fixed isometric / three-quarter top-down view
- object sprites must share the same camera angle
- no perspective mismatch between player, debris, station and drones

### Lighting
- key light from upper-left
- soft cool fill from space / station lighting
- soft elliptical contact shadow under every grounded/floating gameplay object
- subtle rim light on metallic edges

### Materials
Use a small consistent set:
- brushed aluminum / gray metal
- dark graphite
- off-white astronaut shell
- blue solar cells
- amber warning paint
- cyan/green system lights
- restrained purple only for autonomous drone tech

Avoid glossy toy-plastic surfaces.

### Shape language
- station: industrial, modular, hexagonal/rectilinear
- astronaut: rounded life-support shell + visible backpack/jet unit
- drone: compact radial frame, articulated capture arms
- debris: asymmetric, broken, visibly manufactured rather than generic rocks

## Asset pipeline

Preferred production path:

```text
Blender / AI 3D concept
→ fixed isometric camera
→ transparent WebP/PNG render
→ Phaser sprite
→ separate shadow / glow where useful
```

The runtime stays 2D. Do not ship realtime 3D models for the MVP.

### Export rules
- transparent background
- same camera and light rig for every asset
- 2x source resolution, then downsample
- WebP for large opaque/semi-opaque art when practical
- PNG where alpha edge quality matters
- keep sprite bounds tight
- no baked UI labels in image assets

## Priority asset set

### 1. Debris
Replace abstract colored blocks with recognizable objects:
- **SCRAP** — bent aluminum panel, cable, bolts
- **PANEL** — broken blue solar-panel section
- **CORE** — compact satellite electronics / battery module
- **RELIC** — damaged satellite bus / rare scientific instrument

Each must remain identifiable at small size by silhouette first, color second.

### 2. Player
Orbital cleanup worker:
- off-white EVA-style suit
- dark visor
- orange/yellow utility accents
- compact maneuvering backpack
- cargo attachment points visible behind the character

Keep the character friendly and readable rather than NASA-photoreal.

### 3. Drone
- compact autonomous tug
- two visible capture arms / magnetic clamps
- purple/cyan autonomy accent
- small thruster pods
- visibly different silhouette from the player

### 4. Station
Break the station into readable modules:
- central recycling core
- inbound conveyor / intake
- processor chamber
- cargo/output container
- drone dock
- upgrade modules around the main platform

The player should understand where debris enters and where value is produced.

## Animation direction

Use short, readable motion rather than complex animation:
- debris pickup: magnetic pull + small rotation
- cargo: stack/attach with small bounce
- conveyor: one item visibly travels through the processor
- processor: light pulse + mechanical clamp/door motion
- drone: thruster glow while moving
- upgrade: equipment module flashes/extends after purchase

## Mobile readability rules

At the target phone size:
- important objects must not rely on details smaller than ~3–4 px
- silhouette differences must survive downscaling
- avoid thin antennae as the only identifying feature
- keep gameplay hit/collection logic independent of sprite bounds
- shadows should clarify depth, not obscure the grid

## Implementation rules

Code must not depend on a specific art file size.

Prefer:
```text
assets/
  sprites/
    player/
    debris/
    drone/
    station/
    fx/
```

Gameplay classes should own behavior; rendering details should be swappable without rewriting economy, collection, save, or AI logic.

Temporary procedural Phaser geometry may remain as fallback until each final sprite category lands.
