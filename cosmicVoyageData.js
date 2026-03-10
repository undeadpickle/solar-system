/**
 * Cosmic Voyage — Journey stop definitions and timing config.
 * Pure data module, no dependencies on Three.js or DOM.
 */

// Timing and tuning constants
export const VOYAGE_CONFIG = {
  // Travel time compression: real light-minutes -> seconds of camera travel
  // Formula: travelSeconds = lightMinutesDelta * multiplier, clamped to [min, max]
  travelTimeMultiplier: 0.35,
  minTravelSeconds: 2.5,
  maxTravelSeconds: 18,

  // Simulation speed during phases
  travelTimeScale: 500,   // planets visibly orbit during travel
  orbitTimeScale: 1,       // real-time during orbit stop

  // Camera
  approachDuration: 2.0,   // seconds for cinematic approach spline
  departDuration: 1.5,     // seconds for pull-back before travel

  // Overlay fade timing (seconds)
  fadeDuration: 0.8,
  titleDelay: 0.3,         // after approach completes
  subtitleDelay: 1.2,
  factDelay: 2.5,
  scaleDelay: 4.0,
};

/**
 * Journey stops from Sun to Neptune.
 *
 * Camera spherical coords are relative to the target body:
 *   theta = azimuth angle (radians, 0 = +X axis)
 *   phi   = polar angle from Y-up (radians, 0 = top, PI/2 = equator, PI = bottom)
 *   distance = multiplier of body's visual radius
 *
 * Light-travel times are real-world values in minutes.
 */
export const VOYAGE_STOPS = [
  {
    targetName: "Sun",
    lightMinutesFromSun: 0,
    camera: {
      approachFrom: { theta: 0.4, phi: 1.2, distance: 6 },
      orbitRadius: 5,
      orbitSpeed: 0.12,
      orbitDuration: 7,
    },
    overlay: {
      title: "The Sun",
      subtitle: "Our Star",
      fact: "A nuclear furnace burning at 15 million degrees Celsius.",
      scaleComparison: "1.3 million Earths could fit inside the Sun.",
    },
  },
  {
    targetName: "Mercury",
    lightMinutesFromSun: 3.2,
    camera: {
      approachFrom: { theta: 0.8, phi: 1.4, distance: 10 },
      orbitRadius: 6,
      orbitSpeed: 0.2,
      orbitDuration: 5,
    },
    overlay: {
      title: "Mercury",
      subtitle: "The Swift Planet",
      fact: "A year here is just 88 Earth days — but a single day lasts 176.",
      scaleComparison: "Small enough to fit inside the continental United States.",
    },
  },
  {
    targetName: "Venus",
    lightMinutesFromSun: 6.0,
    camera: {
      approachFrom: { theta: -0.5, phi: 1.3, distance: 9 },
      orbitRadius: 5,
      orbitSpeed: 0.18,
      orbitDuration: 5,
    },
    overlay: {
      title: "Venus",
      subtitle: "Earth's Toxic Twin",
      fact: "Surface temperature: 465°C. Hotter than Mercury, despite being farther from the Sun.",
      scaleComparison: "Nearly identical in size to Earth — but utterly hostile to life.",
    },
  },
  {
    targetName: "Earth",
    lightMinutesFromSun: 8.3,
    camera: {
      approachFrom: { theta: 0.3, phi: 1.1, distance: 8 },
      orbitRadius: 5,
      orbitSpeed: 0.15,
      orbitDuration: 7,
    },
    overlay: {
      title: "Earth",
      subtitle: "Home",
      fact: "The only known world with liquid water on its surface — and life.",
      scaleComparison: "A pale blue dot. Everything humanity has ever known.",
    },
  },
  {
    targetName: "Mars",
    lightMinutesFromSun: 12.7,
    camera: {
      approachFrom: { theta: 1.0, phi: 1.0, distance: 9 },
      orbitRadius: 6,
      orbitSpeed: 0.2,
      orbitDuration: 5,
    },
    overlay: {
      title: "Mars",
      subtitle: "The Red Planet",
      fact: "Home to Olympus Mons — the tallest volcano in the solar system at 22 km.",
      scaleComparison: "About half the diameter of Earth. Its entire surface area equals Earth's land area.",
    },
  },
  {
    // Special stop — no mesh target, virtual position in asteroid belt
    targetName: null,
    isVirtualStop: true,
    virtualPositionAU: 2.7,
    lightMinutesFromSun: 21.5,
    camera: {
      approachFrom: { theta: 0, phi: 1.0, distance: 1 },
      orbitRadius: 3,
      orbitSpeed: 0.08,
      orbitDuration: 5,
    },
    overlay: {
      title: "The Asteroid Belt",
      subtitle: "Remnants of a World That Never Was",
      fact: "Millions of rocky fragments — yet their total mass is less than 4% of our Moon.",
      scaleComparison: "If you gathered every asteroid together, they'd form a body smaller than our Moon.",
    },
  },
  {
    targetName: "Jupiter",
    lightMinutesFromSun: 43.3,
    camera: {
      // Head-on approach to emphasize scale
      approachFrom: { theta: 0, phi: Math.PI / 2, distance: 8 },
      orbitRadius: 4,
      orbitSpeed: 0.1,
      orbitDuration: 7,
    },
    overlay: {
      title: "Jupiter",
      subtitle: "King of the Planets",
      fact: "The Great Red Spot is a storm larger than Earth — raging for at least 350 years.",
      scaleComparison: "So massive it could contain all other planets combined — twice over.",
    },
  },
  {
    targetName: "Saturn",
    lightMinutesFromSun: 79.3,
    camera: {
      // Approach from below the ring plane, sweep up and over
      approachFrom: { theta: 0.2, phi: 2.2, distance: 7 },
      orbitRadius: 4.5,
      orbitSpeed: 0.1,
      orbitDuration: 8,
    },
    overlay: {
      title: "Saturn",
      subtitle: "The Jewel of the Solar System",
      fact: "Its rings span 282,000 km but are only about 10 meters thick.",
      scaleComparison: "So light it would float in water — if you could find a bathtub large enough.",
    },
  },
  {
    targetName: "Uranus",
    lightMinutesFromSun: 159.6,
    camera: {
      approachFrom: { theta: -0.6, phi: 0.8, distance: 8 },
      orbitRadius: 5,
      orbitSpeed: 0.12,
      orbitDuration: 5,
    },
    overlay: {
      title: "Uranus",
      subtitle: "The Sideways Planet",
      fact: "Tilted 98° on its axis — it orbits the Sun essentially rolling on its side.",
      scaleComparison: "63 Earths could fit inside Uranus.",
    },
  },
  {
    targetName: "Neptune",
    lightMinutesFromSun: 249.7,
    camera: {
      approachFrom: { theta: 0.5, phi: 1.3, distance: 8 },
      orbitRadius: 5,
      orbitSpeed: 0.12,
      orbitDuration: 7,
    },
    overlay: {
      title: "Neptune",
      subtitle: "The Last Giant",
      fact: "Winds here reach 2,100 km/h — the fastest in the solar system.",
      scaleComparison: "So far from the Sun that noon looks like twilight on Earth.",
    },
  },
];
