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
