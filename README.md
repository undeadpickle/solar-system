# Solar System Simulation

An interactive 3D Solar System simulation built with Three.js that provides an educational and visually stunning exploration of our solar system.

**🎓 External Assessment Grade: B+ (87/100)** - Assessed by ed-tech/astrophysics consultant for scientific accuracy and educational value.

![Solar System Simulation](screenshots/main-view.png)

## 🌟 Features

### Scientific Accuracy ⭐ NEW

- **Astronomically Accurate Moon Orbits**: Moons now orbit in their parent planet's equatorial plane (not ecliptic) for true scientific accuracy
- **Precise Orbital Mechanics**: Based on Keplerian orbital elements with realistic motion
- **Verified by External Assessment**: Professional evaluation confirms strong scientific foundation

### Core Simulation

- **Realistic 3D Solar System**: All 8 planets, 20+ moons, ring systems, and scientifically accurate asteroid belt
- **Asteroid Belt**: 150 asteroids with realistic distribution, Kirkwood gaps, and asteroid families
- **Time Control**: Adjustable time scale, pause/resume, and reset functionality
- **Interactive Navigation**: Free-look camera controls with click-to-focus

### Visual Enhancements

- **Atmospheric Glow**: Realistic atmospheric effects for gas giants with planet-specific characteristics
- **Lens Flares**: Multi-element sun lens flare system with distance-based intensity
- **Bloom Effects**: Post-processing bloom system for enhanced visual appeal
- **Starfield Background**: Procedural starfield with realistic space ambiance
- **Dynamic Shadows**: High-quality shadow mapping from the sun

### User Interface

- **Object Information Panel**: Detailed information about focused celestial bodies
- **Settings Panel**: Customize textures, materials, and visual properties
- **Time Control Panel**: Intuitive time manipulation controls
- **Focus System**: Easy navigation via click-to-focus or dropdown selection

### Customization

- **Texture Upload**: Upload custom textures for any celestial body
- **Material Properties**: Adjust opacity, roughness, metalness, and emission
- **Orbit Visibility**: Toggle orbit paths for better visualization
- **Visual Effects Controls**: Global controls for atmospheric glow and bloom effects

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/undeadpickle/solar-system.git
   cd solar-system
   ```

2. **Set up local development server**

   **⚠️ Important: Live Server Required for ES6 Modules**

   This project uses ES6 modules which require an HTTP server (not file:// protocol) due to CORS restrictions.

   **Option A: Cursor Live Server (Recommended for Development)**

   - Install the "Live Server" extension in Cursor IDE
   - Right-click on `solarsystem.html` and select "Open with Live Server"
   - Navigate to `http://127.0.0.1:5500/solarsystem.html`

   **Option B: VS Code Live Server**

   - Install the "Live Server" extension in VS Code
   - Right-click on `solarsystem.html` and select "Open with Live Server"

   **Option C: Python HTTP Server**

   ```bash
   # Python 3
   python -m http.server 5500

   # Python 2
   python -m SimpleHTTPServer 5500
   ```

   **Option D: Node.js HTTP Server**

   ```bash
   npx http-server . -p 5500
   ```

3. **Open in browser**
   - Navigate to `http://127.0.0.1:5500/solarsystem.html` (Live Server default) or the port shown by your server

### Quick Start

1. Use mouse to navigate around the solar system
2. Click on any planet or the sun to focus on it
3. Use the time controls to speed up or slow down the simulation
4. Explore the settings panel to customize appearance
5. Toggle visual effects like atmospheric glow and bloom

## 🎮 Usage

### Navigation Controls

- **Left Mouse Drag**: Rotate camera around the scene
- **Right Mouse Drag**: Pan the camera
- **Mouse Wheel**: Zoom in/out
- **Click on Object**: Focus camera on celestial body

### Time Controls

- **Play/Pause**: Start or stop the simulation
- **Speed Slider**: Adjust time scale (1x to 1000x)
- **Reset**: Return to initial state

### Customization

- **Focus on any object** to access its settings panel
- **Upload textures** to personalize celestial bodies
- **Adjust material properties** for realistic or artistic effects
- **Toggle orbit paths** for educational purposes
- **Control visual effects** globally

## 🏗️ Project Structure

```
solar-system/
├── solarsystem.html          # Main HTML file with ES6 module support
├── style.css                 # All styling and UI layout
├── main.js                   # Core application logic and rendering
├── threeSetup.js             # Three.js initialization and setup
├── uiControls.js             # UI event handlers and controls
├── physics.js                # Orbital mechanics and physics
├── celestialBodyData.js      # Celestial body data and constants
├── docs/                     # Documentation and planning
│   └── to-do-list.md         # Feature roadmap and progress
├── .giga/                    # Project management
│   └── memory/
│       └── memory.md         # Project memory and status
└── screenshots/              # Project screenshots
```

## 🔧 Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics**: Three.js (r128)
- **Architecture**: Modular ES6 structure with separated concerns
- **Development**: Cursor IDE with Live Server extension (required for ES6 modules)
- **Testing**: http://127.0.0.1:5500/solarsystem.html
- **Performance**: Optimized for desktop browsers

## 🎯 Educational Goals

This simulation is designed as an educational tool for:

- **Students**: K-12 through early college astronomy courses
- **Educators**: Teaching solar system concepts, orbital mechanics, and gravitational resonances
- **Enthusiasts**: Anyone interested in space, astronomy, and solar system structure

Key educational features include realistic asteroid belt distribution with Kirkwood gaps demonstrating Jupiter's gravitational influence.

## 🚧 Roadmap

See [docs/to-do-list.md](docs/to-do-list.md) for detailed feature roadmap including:

- Enhanced texturing with normal/bump maps
- Additional celestial bodies (dwarf planets, comets)
- Advanced orbital features
- Mobile responsiveness
- Performance optimizations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Three.js** community for the excellent 3D library
- **NASA** for reference data and textures
- Educational astronomy resources for accurate orbital data

---

**Built with ❤️ for education and exploration**
