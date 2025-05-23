## Solar System Simulation: Feature To-Do List

**Legend:**

- [x] Completed
- [ ] To-Do

---

### Project Setup & Infrastructure

- **Version Control & Hosting:**
  - [x] Git repository initialization
  - [x] GitHub repository setup (https://github.com/undeadpickle/solar-system.git)
  - [x] README.md with comprehensive project documentation
  - [x] .gitignore configuration for web development
  - [x] MIT License for open source distribution

---

### Core Simulation & Celestial Bodies

- **Engine & Rendering:**
  - [x] 4.1.1 3D Rendering (Three.js)
  - [x] 4.1.2 Orbital Mechanics (Keplerian elements, visual paths)
  - [x] 4.1.3 Time Control (scale, pause/resume, reset)
  - [x] 4.1.4 Scaled Representation (bodies and orbits)
- **Sun:**
  - [x] 4.2.1 Textured, light source, `MeshStandardMaterial`
- **Planets:**
  - [x] 4.2.2 All 8 major planets implemented, textured, with rotation & tilt
- **Moons:**
  - [x] 4.2.3 Key moons for Earth, Mars, Jupiter, Saturn, Uranus, Neptune implemented
- **Ring Systems:**
  - [x] 4.2.4 Saturn (prominent), Jupiter, Uranus, Neptune (fainter)
- **Asteroid Belt:**
  - [x] 4.2.5 Procedurally generated belt between Mars & Jupiter

---

### User Interface (UI) & User Experience (UX)

- [x] 4.3.1 Camera Controls (OrbitControls)
- [x] 4.3.2 Focusing System (Click-to-focus, Dropdown for Sun/Planets)
- [x] 4.3.3 Information Panel (Focused object name, Sim time)
- [x] 4.3.4 Time Control Panel (UI elements for time control)
- [x] 4.3.5 Settings Panel (Appears on Focus)
  - [x] Object Details Section (Name, Description, Fun Fact)
  - [x] Material & Appearance Settings Section (Collapsible, Default Collapsed, +/- icon, persistent collapse state)
    - [x] Texture Upload (Filename display, Clear button)
    - [x] Self-Emission Slider
    - [x] Body Opacity Slider
    - [x] Roughness Slider
    - [x] Metalness Slider
    - [x] Show Wireframe Toggle
    - [x] Show Orbit Path Toggle (within collapsible section)
    - [x] Ring Opacity Slider (within collapsible section, for ringed planets)
    - [x] Reset Object Settings Button (within collapsible section, resets all relevant properties including orbit path & ring opacity)
- [x] 4.3.6 Global Visual Effects Controls (Bloom effects and atmospheric glow toggles consolidated in time control panel for scene-wide management)

---

### Visual Enhancements

- [x] 4.4.1 Starfield Background (Procedural)
- [x] 4.4.2 Shadows (Sun's point light, 4096x4096 map)
- [x] 4.4.3 Emissive Properties (Uranus, Neptune, Sun)
- [x] 4.4.4 Sun Lens Flares (Multiple flare elements, distance-based intensity, toggle control)
- [x] 4.4.5 Atmospheric Glow for Gas Giants (ENHANCED: Realistic gradient textures, Fresnel-like rim lighting, multi-layer depth system, planet-specific characteristics with storm bands for Jupiter/Neptune, canvas-generated radial gradients, global toggle control)
- [x] 4.4.6 Bloom/Glow Effects (COMPLETED: Post-processing bloom system fully working, optimized intensity parameters, Three.js script loading issues resolved, global toggle control in time panel)

---

### Future Considerations / To-Do List

- **Code & Project Organization:**
  - [x] Separate CSS into `style.css`.
  - [x] Separate JavaScript into `main.js`.
  - [x] Extract celestial body data into `celestialBodyData.js` ES6 module (Chunk 1 complete)
  - [x] Setup ES6 modules development environment (VS Code Live Server)
  - [x] Extract Three.js setup into `threeSetup.js` ES6 module (Chunk 2 complete)
  - [x] Extract UI Controls into `uiControls.js` ES6 module (Chunk 3 complete)
  - [x] Extract Physics & Orbital Mechanics into `physics.js` ES6 module (Chunk 4 complete)
- **Enhanced Texturing (PRD 7.1):**
  - [ ] Implement normal maps, bump maps, specular maps for more detailed surfaces.
  - [ ] Add textures for more moons (currently many use placeholders or base colors).
- **Additional Celestial Bodies (PRD 7.2):**
  - [ ] Prominent dwarf planets (Pluto, Ceres, Eris, etc.).
  - [ ] Major comets with visible tails (when near the Sun).
- **UI/UX Refinements (PRD 7.3):**
  - [ ] Expand the focus dropdown to include moons and other categories (e.g., asteroids).
  - [ ] More detailed information in the info panel (e.g., radius, mass, orbital period of focused object).
  - [ ] Global settings (e.g., toggle all orbit paths, toggle all labels).
  - [ ] Search functionality for celestial bodies.
  - [ ] "Save/Load Scene State" for user customizations.
- **Visual Effects (PRD 7.4):**
  - [ ] Atmospheric scattering/haze for planets with atmospheres.
  - [x] Lens flares for the Sun.
  - [x] Bloom/glow effects for bright objects (Sun, emissive surfaces).
- **Advanced Orbital Features (PRD 7.5):**
  - [ ] Representation of orbital precession.
  - [ ] More accurate handling of moon orbits relative to their planet's equatorial plane vs. the ecliptic.
- **Performance Optimizations (PRD 7.6):**
  - [ ] Level of Detail (LOD) for distant objects.
  - [ ] Optimized asteroid belt rendering (e.g., instanced rendering).
- **Sound (PRD 7.7):**
  - [ ] Ambient space sounds or thematic music.
- **Mobile Responsiveness (PRD 7.8):**
  - [ ] Improve layout and controls for touch devices.
