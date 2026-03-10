# Lessons Learned

Project-specific corrections and patterns. Claude reads this at session start.

---

### Three.js Hot Loop Allocations
- Don't use `new THREE.Vector3()` inside per-frame render loops — pre-allocate module-scoped vectors and reuse with `.set()`
- Same for helper functions returning multiple values in hot paths: write into a pre-allocated object instead of returning a new one each call

### Refactoring Duplication
- Before creating a factory/abstraction for "identical" handlers, read the actual code — some may have special logic (e.g., emission handler sets emissive color fallback, opacity handler toggles transparent flag). Only abstract truly identical patterns.

### VISUAL_CONFIG Pattern
- Magic numbers for visual tuning (bloom, lighting, geometry segments, audio) live in `VISUAL_CONFIG` in `celestialBodyData.js`. Add new visual params there, not inline.

### CSS Token Discipline
- All colors should use CSS custom properties from `:root`. Hardcoded hex/rgba values outside the token definition block are considered bugs. Tokens added this session: `--amber-bright`, `--caution-text`, `--caution-text-hover`, `--bg-dark`, `--bg-dropdown`.

### innerHTML Security
- Don't use `innerHTML` for DOM manipulation — even with static content. Security hooks flag it as XSS risk. Use `document.createElement()`, `appendChild()`, `textContent`, and `removeChild()` instead. Unicode symbols (e.g., `\u25C4\u25C4` for rewind) work fine as `textContent`.

### Temporal Dead Zone with const + rAF
- When `const` declarations are placed after function definitions that start `requestAnimationFrame` loops, the rAF callback can fire before the `const` assignment executes, causing a TDZ ReferenceError. Fix: declare with `let` at the top of the scope, assign later. This bit us with `const voyage = new CosmicVoyage(...)` placed after `init()` which starts the render loop.

### Overlay State on Skip
- When implementing skip/prev controls for sequenced UI overlays, always hide all overlays first before showing new ones. CSS transitions mean old elements may still be visible during the transition period, causing overlap. Call a `hideAll()` before entering the new state.

### Pre-mortem Catches Real Bugs
- The `/code:premortem` skill caught 3 issues that would have been debugging nightmares: stale CatmullRomCurve3 endpoints during long travels, canvas click handler hijacking the camera mid-voyage, and followedObject tracking overwriting voyage camera positions. All were designed around before writing code.

### Callback API for Closure State
- When a module needs to read/write state trapped inside another module's closure (e.g., `timeScale`, `isPaused` inside main.js DOMContentLoaded), pass getter/setter callbacks in the constructor rather than trying to export the state. Pattern: `{ getTimeScale: () => timeScale, setTimeScale: (ts) => { timeScale = ts; } }`.
