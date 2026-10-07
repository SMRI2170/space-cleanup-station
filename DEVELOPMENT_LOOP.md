# Development loop

The project is optimized for short AI-assisted iterations.

1. Select one small player-visible change.
2. Keep the change localized to the responsible module.
3. Run `npm run build` before considering the change complete.
4. Verify desktop controls in the browser.
5. For touch/gameplay changes, verify on a real mobile device as early as possible.
6. Commit only after the vertical slice still works: move → collect → recycle → upgrade.

Do not add servers, authentication, databases, or heavy frameworks unless the requested feature actually requires them.
