# Solar System Explorer — CLAUDE.md

## Project Overview

Interactive 3D Solar System simulation built with Three.js — educational tool for exploring planets, moons, ring systems, and orbital mechanics in the browser.

## Tech Stack

- **Runtime:** Browser (vanilla JS, ES modules)
- **3D Engine:** Three.js r128 (loaded via CDN, not npm)
- **Build System:** None — static files, no bundler
- **Package Manager:** None
- **Fonts:** Google Fonts (Inter)

## Architecture

Single-page app with modular JS files. No framework, no build step — just open `solarsystem.html` in a browser (needs a local server for ES module imports).

### Key Files

- `solarsystem.html` — Entry point, UI markup, CDN script tags
- `main.js` (~2000 lines) — Core simulation loop, planet/moon creation, animation, post-processing
- `celestialBodyData.js` (~980 lines) — Orbital parameters, planet data, ring system configs, asteroid belt generation
- `threeSetup.js` (~270 lines) — Three.js scene, camera, renderer, controls initialization
- `uiControls.js` (~540 lines) — UI event handlers, settings panel logic
- `physics.js` (~370 lines) — Keplerian orbital mechanics calculations
- `style.css` — UI panel styling (observatory amber token system)

### Key Directories

- `images/` — Planet textures (2k JPGs), ring textures, starfield background
- `audio/` — Background music (Solaris Drone.mp3)
- `docs/` — PRD, assessment report, improvement plans, to-do list

## Development

### Running Locally

```bash
# Needs a local server for ES module imports
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:<port>/solarsystem.html` (serve picks an available port, check terminal output).

### No Build Step

Just edit files and refresh the browser.

## Conventions

- Vanilla JS with ES module imports/exports between files
- Three.js globals loaded via CDN `<script>` tags (THREE is global), local modules use `import`
- Celestial body data is centralized in `celestialBodyData.js`
- UI controls are wired up in `uiControls.js`, called from `main.js`
- Distances use AU-based scaling; planet sizes use separate scale factor
- Collapsible settings panel sections with `+`/`-` toggle pattern
- CSS uses custom property token system (`--amber`, `--glass`, `--reading`, `--edge`, etc.) — observatory amber theme
- Spacing uses 4/8/12/16/24px scale via `--space-*` tokens

## Gotchas

- Three.js r128 is loaded globally via CDN — don't try to `import` THREE from npm
- Three.js r128 is ~47 releases behind latest; upgrading requires switching to ES modules + bundler (see dependency audit notes)
- `main.js` is large (~2000 lines) — read targeted sections, not the whole file
- Moon orbits use parent planet's equatorial plane, not ecliptic (intentional scientific accuracy fix)
- Texture loading has fallback system — check `RING_SYSTEMS` config in `celestialBodyData.js` for ring texture paths
- Some HTML elements have inline styles using CSS custom properties — check `solarsystem.html` when changing token names

## Current Focus

