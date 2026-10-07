# AI development rules

This project optimizes for fast agent-driven iteration.

- Stack: Phaser 4.2.x + TypeScript + Vite + Capacitor 8.
- Keep gameplay offline-first. Do not add a backend unless a feature explicitly requires it.
- Keep one gameplay responsibility per file/class where practical.
- Keep scene classes thin; move reusable logic into `entities/`, `game/`, or future `systems/` modules.
- Use strict TypeScript. Do not introduce `any` unless an external API makes it unavoidable.
- Prefer deterministic, small changes that can be verified with `npm run build`.
- Preserve touch controls and desktop keyboard controls.
- Avoid framework additions unless they reduce total complexity.
- Optimize for mid-range mobile devices before adding visual effects.
- Never commit generated `dist/` or `node_modules/`.
