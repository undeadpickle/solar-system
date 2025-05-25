// --- RING SYSTEM CONFIGURATION ---
export const RING_SYSTEMS = {
  Saturn: {
    textureUrl:
      "./images/stock_image___saturn_rings_by_alpha_element_d6ifske.png",
    segments: 256,
    radialSegments: 1,
    defaultOpacity: 0.9,
    textureConfig: {
      wrapS: "RepeatWrapping",
      wrapT: "RepeatWrapping",
      repeat: [1, 1],
      useAnisotropy: true,
    },
    material: {
      transparent: true,
      side: "DoubleSide",
      depthWrite: false,
      fog: false,
      blending: "NormalBlending",
    },
  },
  // Future ring systems can be added here (Jupiter, Uranus, Neptune)
  Jupiter: {
    segments: 64,
    radialSegments: 1,
    defaultOpacity: 0.25,
    material: {
      transparent: true,
      side: "DoubleSide",
      depthWrite: false,
      fog: false,
    },
  },
  Uranus: {
    segments: 64,
    radialSegments: 1,
    defaultOpacity: 0.25,
    material: {
      transparent: true,
      side: "DoubleSide",
      depthWrite: false,
      fog: false,
    },
  },
  Neptune: {
    segments: 64,
    radialSegments: 1,
    defaultOpacity: 0.25,
    material: {
      transparent: true,
      side: "DoubleSide",
      depthWrite: false,
      fog: false,
    },
  },
};

// --- SCALES AND CONSTANTS ---
export const AU = 149.6e6;
export const distanceScaleFactor = 50;
export const earthRadiusSceneUnits = 0.3;

export const distanceScale = distanceScaleFactor / AU;
export const planetSizeScale = earthRadiusSceneUnits / 6371;

export const sunDisplayRadius = 2.0;
export const minVisualRadius = 0.05;
export const MOON_MIN_VISUAL_RADIUS = 0.08;
export const MOON_VISUAL_ORBIT_GAP = 0.05;

// --- CELESTIAL BODY DATA ---
export const solarSystemData = [
  {
    name: "Sun",
    type: "star",
    radius: 695700,
    color: 0xffff00,
    textureUrl: "./images/2k_sun.jpg",
    rotationPeriod: 25.38 * 24,
    axialTilt: 7.25,
    parent: null,
    emissiveIntensity: 1.5,
    roughness: 0.9,
    metalness: 0.1,
    description:
      "The Sun is the star at the center of our Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
    funFact:
      "The Sun accounts for about 99.86% of the total mass of the Solar System!",
  },
  {
    name: "Mercury",
    type: "planet",
    radius: 2439.7,
    color: 0x9c887a,
    textureUrl: "./images/2k_mercury.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 0.387098 * AU,
      e: 0.20563,
      i: 7.005,
      M: 174.796,
      w: 29.124,
      Omega: 48.331,
      period: 87.969,
    },
    rotationPeriod: 58.646 * 24,
    axialTilt: 0.03,
    description:
      "Mercury is the smallest planet in our solar system and nearest to the Sun. It has a heavily cratered surface and extreme temperature variations.",
    funFact:
      "A year on Mercury is just 88 Earth days long, but a day on Mercury (sunrise to sunrise) is 176 Earth days long!",
  },
  {
    name: "Venus",
    type: "planet",
    radius: 6051.8,
    color: 0xd8c0a3,
    textureUrl: "./images/2k_venus.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 0.723332 * AU,
      e: 0.006772,
      i: 3.39458,
      M: 50.416,
      w: 54.884,
      Omega: 76.68,
      period: 224.701,
    },
    rotationPeriod: -243.025 * 24,
    axialTilt: 177.36,
    description:
      "Venus is the second planet from the Sun, known for its thick, toxic atmosphere and scorching temperatures. It rotates backwards compared to most other planets.",
    funFact:
      "Venus is the hottest planet in our solar system, even though Mercury is closer to the Sun. Its thick atmosphere traps heat in a runaway greenhouse effect.",
  },
  {
    name: "Earth",
    type: "planet",
    radius: 6371,
    color: 0x3399ff,
    textureUrl: "./images/2k_earth.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 1.0 * AU,
      e: 0.0167086,
      i: 0.00005,
      M: 358.617,
      w: 114.20783,
      Omega: -11.26064,
      period: 365.25636,
    },
    rotationPeriod: 23.9345,
    axialTilt: 23.4392811,
    description:
      "Earth is our home planet, the third planet from the Sun, and the only place known in the universe where life has originated and found habitability.",
    funFact:
      "Earth is not perfectly round; it's an oblate spheroid, meaning it bulges at the equator due to its rotation.",
  },
  {
    name: "Moon",
    type: "moon",
    radius: 1737.4,
    color: 0xcccccc,
    textureUrl: "./images/2k_moon.jpg",
    parent: "Earth",
    orbitalElements: {
      a: 384748,
      e: 0.0549,
      i: 5.145,
      M: 135.27,
      w: 318.06,
      Omega: 125.08,
      period: 27.321661,
    },
    rotationPeriod: 27.321661 * 24,
    axialTilt: 6.68,
    description:
      "The Moon is Earth's only natural satellite. It is the fifth largest moon in the Solar System and is tidally locked with Earth.",
    funFact:
      "The Moon is slowly drifting away from Earth at a rate of about 3.8 centimeters (1.5 inches) per year.",
  },
  {
    name: "Mars",
    type: "planet",
    radius: 3389.5,
    color: 0xc1440e,
    textureUrl: "./images/2k_mars.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 1.523679 * AU,
      e: 0.0934006,
      i: 1.85,
      M: 19.39,
      w: 286.502,
      Omega: 49.558,
      period: 686.98,
    },
    rotationPeriod: 24.6229,
    axialTilt: 25.19,
    description:
      "Mars is the fourth planet from the Sun, often called the 'Red Planet' due to its iron oxide-rich surface. It has polar ice caps, canyons, and the largest volcano in the solar system.",
    funFact:
      "Mars has the tallest volcano and the deepest, longest canyon in our solar system: Olympus Mons and Valles Marineris, respectively.",
  },
  {
    name: "Phobos",
    type: "moon",
    radius: 11.2667,
    color: 0x555555,
    parent: "Mars",
    orbitalElements: {
      a: 9376,
      e: 0.0151,
      i: 1.075,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 0.31891,
    },
    rotationPeriod: 0.31891 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Deimos",
    type: "moon",
    radius: 6.2,
    color: 0x777777,
    parent: "Mars",
    orbitalElements: {
      a: 23463.2,
      e: 0.00033,
      i: 0.93,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 1.263,
    },
    rotationPeriod: 1.263 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Jupiter",
    type: "planet",
    radius: 69911,
    color: 0xc8a060,
    textureUrl: "./images/2k_jupiter.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 5.2038 * AU,
      e: 0.0489,
      i: 1.303,
      M: 19.677,
      w: 273.867,
      Omega: 100.464,
      period: 4332.589,
    },
    rotationPeriod: 9.925 * 24,
    axialTilt: 3.13,
    hasRings: true,
    ringColor: 0x967969,
    ringInnerRadius: 92000,
    ringOuterRadius: 129000,
    description:
      "Jupiter is the largest planet in our Solar System, a gas giant primarily composed of hydrogen and helium. It's known for its Great Red Spot, a giant storm.",
    funFact:
      "Jupiter has the shortest day of all the planets; it rotates on its axis once every 9 hours and 55 minutes.",
  },
  {
    name: "Io",
    type: "moon",
    radius: 1821.6,
    color: 0xfff8b5,
    parent: "Jupiter",
    orbitalElements: {
      a: 421700,
      e: 0.0041,
      i: 0.05,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 1.769138,
    },
    rotationPeriod: 1.769138 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Europa",
    type: "moon",
    radius: 1560.8,
    color: 0xd4c9b8,
    parent: "Jupiter",
    orbitalElements: {
      a: 671034,
      e: 0.0094,
      i: 0.471,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 3.551181,
    },
    rotationPeriod: 3.551181 * 24,
    axialTilt: 0.1,
  },
  {
    name: "Ganymede",
    type: "moon",
    radius: 2634.1,
    color: 0xa0a0a0,
    parent: "Jupiter",
    orbitalElements: {
      a: 1070412,
      e: 0.0013,
      i: 0.204,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 7.154553,
    },
    rotationPeriod: 7.154553 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Callisto",
    type: "moon",
    radius: 2410.3,
    color: 0x605040,
    parent: "Jupiter",
    orbitalElements: {
      a: 1882709,
      e: 0.0074,
      i: 0.205,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 16.689018,
    },
    rotationPeriod: 16.689018 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Saturn",
    type: "planet",
    radius: 58232,
    color: 0xd0b080,
    textureUrl: "./images/2k_saturn.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 9.5826 * AU,
      e: 0.0565,
      i: 2.485,
      M: 320.347,
      w: 339.392,
      Omega: 113.665,
      period: 10759.22,
    },
    rotationPeriod: 10.656 * 24,
    axialTilt: 26.73,
    hasRings: true,
    ringColor: 0xb0a090,
    ringInnerRadius: 66900,
    ringOuterRadius: 140180,
    description:
      "Saturn is the sixth planet from the Sun and the second-largest, famous for its spectacular ring system made mostly of ice particles with a smaller amount of rocky debris and dust.",
    funFact:
      "Saturn is the least dense planet in the Solar System; it's so light that it would float in water (if you could find a bathtub big enough!).",
  },
  {
    name: "Mimas",
    type: "moon",
    radius: 198.2,
    color: 0xbababa,
    parent: "Saturn",
    orbitalElements: {
      a: 185539,
      e: 0.0196,
      i: 1.574,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 0.942422,
    },
    rotationPeriod: 0.942422 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Enceladus",
    type: "moon",
    radius: 252.1,
    color: 0xf8f8f8,
    parent: "Saturn",
    orbitalElements: {
      a: 237948,
      e: 0.0047,
      i: 0.009,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 1.370218,
    },
    rotationPeriod: 1.370218 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Tethys",
    type: "moon",
    radius: 533,
    color: 0xdadada,
    parent: "Saturn",
    orbitalElements: {
      a: 294619,
      e: 0.0001,
      i: 1.12,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 1.887802,
    },
    rotationPeriod: 1.887802 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Dione",
    type: "moon",
    radius: 561.4,
    color: 0xd3d3d3,
    parent: "Saturn",
    orbitalElements: {
      a: 377420,
      e: 0.0022,
      i: 0.019,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 2.736915,
    },
    rotationPeriod: 2.736915 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Rhea",
    type: "moon",
    radius: 763.8,
    color: 0xbebebe,
    parent: "Saturn",
    orbitalElements: {
      a: 527108,
      e: 0.001,
      i: 0.345,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 4.518212,
    },
    rotationPeriod: 4.518212 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Titan",
    type: "moon",
    radius: 2574.7,
    color: 0xffa500,
    textureUrl: "https://placehold.co/1024x512/FFA500/000000?text=Titan",
    parent: "Saturn",
    orbitalElements: {
      a: 1221870,
      e: 0.0288,
      i: 0.34854,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 15.945,
    },
    rotationPeriod: 15.945 * 24,
    axialTilt: 0.0,
    description:
      "Titan is Saturn's largest moon and the second largest in the Solar System. It is the only moon known to have a dense atmosphere and the only known body in space, other than Earth, where clear evidence of stable bodies of surface liquid has been found.",
    funFact:
      "Titan's atmosphere is so dense and its gravity so low that humans could strap wings to their arms and fly!",
  },
  {
    name: "Iapetus",
    type: "moon",
    radius: 734.5,
    color: 0x908070,
    parent: "Saturn",
    orbitalElements: {
      a: 3560820,
      e: 0.02925,
      i: 15.47,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 79.3215,
    },
    rotationPeriod: 79.3215 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Uranus",
    type: "planet",
    radius: 25362,
    color: 0xa0d0d0,
    textureUrl: "./images/2k_uranus.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 19.2184 * AU,
      e: 0.0457,
      i: 0.772,
      M: 142.238,
      w: 98.999,
      Omega: 74.006,
      period: 30688.5,
    },
    rotationPeriod: -17.24 * 24,
    axialTilt: 97.77,
    hasRings: true,
    ringColor: 0x888899,
    ringInnerRadius: 40000,
    ringOuterRadius: 51000,
    description:
      "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is unique because it rotates on its side.",
    funFact:
      "A season on Uranus lasts for about 21 Earth years, and because of its extreme tilt, one pole gets 42 years of continuous sunlight, followed by 42 years of darkness!",
  },
  {
    name: "Miranda",
    type: "moon",
    radius: 235.8,
    color: 0xaaaaaa,
    parent: "Uranus",
    orbitalElements: {
      a: 129390,
      e: 0.0013,
      i: 4.232,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 1.413479,
    },
    rotationPeriod: 1.413479 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Ariel",
    type: "moon",
    radius: 578.9,
    color: 0xc0c0c0,
    parent: "Uranus",
    orbitalElements: {
      a: 191020,
      e: 0.0012,
      i: 0.26,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 2.520379,
    },
    rotationPeriod: 2.520379 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Umbriel",
    type: "moon",
    radius: 584.7,
    color: 0x5a5a5a,
    parent: "Uranus",
    orbitalElements: {
      a: 266000,
      e: 0.0039,
      i: 0.2,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 4.144177,
    },
    rotationPeriod: 4.144177 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Titania",
    type: "moon",
    radius: 788.4,
    color: 0xb0e0e6,
    parent: "Uranus",
    orbitalElements: {
      a: 435910,
      e: 0.0011,
      i: 0.34,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 8.706234,
    },
    rotationPeriod: 8.706234 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Oberon",
    type: "moon",
    radius: 761.4,
    color: 0x778899,
    parent: "Uranus",
    orbitalElements: {
      a: 583520,
      e: 0.0014,
      i: 0.058,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 13.463234,
    },
    rotationPeriod: 13.463234 * 24,
    axialTilt: 0.0,
  },
  {
    name: "Neptune",
    type: "planet",
    radius: 24622,
    color: 0x4060b0,
    textureUrl: "./images/2k_neptune.jpg",
    parent: "Sun",
    orbitalElements: {
      a: 30.11 * AU,
      e: 0.0113,
      i: 1.77,
      M: 267.767,
      w: 272.846,
      Omega: 131.783,
      period: 60182,
    },
    rotationPeriod: 16.11 * 24,
    axialTilt: 28.32,
    hasRings: true,
    ringColor: 0x6070a0,
    ringInnerRadius: 40000,
    ringOuterRadius: 63000,
    description:
      "Neptune is the eighth and farthest-known Solar planet from the Sun. It's an ice giant, with a deep blue color due to methane in its atmosphere, and has the strongest winds in the Solar System.",
    funFact:
      "Neptune was the first planet located through mathematical prediction rather than by empirical observation.",
  },
  {
    name: "Triton",
    type: "moon",
    radius: 1353.4,
    color: 0xfff0e0,
    textureUrl: "https://placehold.co/1024x512/FFF0E0/000000?text=Triton",
    parent: "Neptune",
    orbitalElements: {
      a: 354759,
      e: 0.000016,
      i: 156.885,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: -5.876854,
    },
    rotationPeriod: -5.876854 * 24,
    axialTilt: 0.0,
    description:
      "Triton is the largest natural satellite of Neptune, and the only large moon in our Solar System with a retrograde orbit (it orbits in the direction opposite to its planet's rotation).",
    funFact:
      "Triton is one of the coldest known objects in our Solar System, with surface temperatures around -235°C (-391°F), and has active geysers erupting nitrogen frost!",
  },
  {
    name: "Nereid",
    type: "moon",
    radius: 170,
    color: 0x888899,
    parent: "Neptune",
    orbitalElements: {
      a: 5513818,
      e: 0.7507,
      i: 7.09,
      M: Math.random() * 360,
      w: Math.random() * 360,
      Omega: Math.random() * 360,
      period: 360.1362,
    },
    rotationPeriod: 0.475 * 24,
    axialTilt: 0.0,
  },
];

// --- SCIENTIFICALLY ACCURATE ASTEROID BELT CONFIGURATION ---
export const ASTEROID_BELT_CONFIG = {
  count: 150, // Increased for better representation with gaps
  innerRadius: 2.1 * AU, // Just inside 4:1 resonance
  outerRadius: 3.4 * AU, // Just outside 2:1 resonance
  minSize: 0.5, // km
  maxSize: 50, // km
  minInclination: 0,
  maxInclination: 25, // degrees
  minEccentricity: 0.05,
  maxEccentricity: 0.3,
  baseColor: 0x8b7355,
  colorVariation: 0x333333,

  // Kirkwood gaps (major resonances with Jupiter)
  kirkwoodGaps: [
    { center: 2.06 * AU, width: 0.08 * AU, name: "4:1 resonance" }, // Inner boundary
    { center: 2.5 * AU, width: 0.12 * AU, name: "3:1 resonance" }, // Major gap
    { center: 2.82 * AU, width: 0.08 * AU, name: "5:2 resonance" },
    { center: 2.96 * AU, width: 0.06 * AU, name: "7:3 resonance" },
    { center: 3.28 * AU, width: 0.1 * AU, name: "2:1 resonance" }, // Outer boundary
  ],

  // Asteroid families (clusters of related asteroids)
  asteroidFamilies: [
    {
      name: "Flora",
      center: 2.25 * AU,
      spread: 0.15 * AU,
      count: 25,
      color: 0xa0856b,
      inclination: { mean: 5.5, spread: 3.0 },
      eccentricity: { mean: 0.15, spread: 0.08 },
    },
    {
      name: "Vesta",
      center: 2.35 * AU,
      spread: 0.12 * AU,
      count: 18,
      color: 0x9a8570,
      inclination: { mean: 7.1, spread: 2.5 },
      eccentricity: { mean: 0.12, spread: 0.06 },
    },
    {
      name: "Eunomia",
      center: 2.65 * AU,
      spread: 0.18 * AU,
      count: 20,
      color: 0x8a7865,
      inclination: { mean: 11.7, spread: 4.0 },
      eccentricity: { mean: 0.18, spread: 0.09 },
    },
    {
      name: "Koronis",
      center: 2.87 * AU,
      spread: 0.14 * AU,
      count: 15,
      color: 0x7a6b58,
      inclination: { mean: 2.1, spread: 1.5 },
      eccentricity: { mean: 0.06, spread: 0.04 },
    },
    {
      name: "Eos",
      center: 3.01 * AU,
      spread: 0.16 * AU,
      count: 22,
      color: 0x6b5c49,
      inclination: { mean: 10.9, spread: 3.5 },
      eccentricity: { mean: 0.11, spread: 0.07 },
    },
  ],

  // Density zones (higher density in stable regions)
  densityZones: [
    { center: 2.2 * AU, width: 0.2 * AU, density: 1.5 }, // Inner belt - high density
    { center: 2.7 * AU, width: 0.3 * AU, density: 2.0 }, // Middle belt - highest density
    { center: 3.15 * AU, width: 0.2 * AU, density: 1.2 }, // Outer belt - moderate density
  ],
};

/**
 * Checks if a semi-major axis falls within any Kirkwood gap
 * @param {number} a - Semi-major axis in AU
 * @param {Array} gaps - Array of gap objects
 * @returns {boolean} True if within a gap
 */
function isInKirkwoodGap(a, gaps) {
  return gaps.some((gap) => Math.abs(a - gap.center) < gap.width / 2);
}

/**
 * Gets density multiplier for a given semi-major axis
 * @param {number} a - Semi-major axis
 * @param {Array} zones - Density zones
 * @returns {number} Density multiplier
 */
function getDensityMultiplier(a, zones) {
  for (const zone of zones) {
    if (Math.abs(a - zone.center) < zone.width / 2) {
      return zone.density;
    }
  }
  return 0.3; // Low density outside main zones
}

/**
 * Generates asteroid belt data with realistic structure including Kirkwood gaps and families
 * @returns {Array} Array of asteroid objects with orbital data
 */
export function generateAsteroidBelt() {
  const asteroids = [];
  const {
    count,
    innerRadius,
    outerRadius,
    minSize,
    maxSize,
    minInclination,
    maxInclination,
    minEccentricity,
    maxEccentricity,
    baseColor,
    colorVariation,
    kirkwoodGaps,
    asteroidFamilies,
    densityZones,
  } = ASTEROID_BELT_CONFIG;

  // First, generate family asteroids (clustered)
  let asteroidIndex = 1;
  for (const family of asteroidFamilies) {
    let familyGeneratedCount = 0;
    let familyAttempts = 0;
    const maxFamilyAttempts = family.count * 20; // Prevent infinite loops per family

    while (
      familyGeneratedCount < family.count &&
      familyAttempts < maxFamilyAttempts
    ) {
      familyAttempts++;

      // Gaussian distribution around family center
      const a =
        family.center +
        (Math.random() - 0.5) * family.spread * (Math.random() + Math.random()); // Box-Muller approximation

      // Skip if in Kirkwood gap
      if (isInKirkwoodGap(a, kirkwoodGaps)) continue;

      // Family-specific orbital parameters
      const e = Math.max(
        0.01,
        Math.min(
          0.4,
          family.eccentricity.mean +
            (Math.random() - 0.5) * family.eccentricity.spread * 2
        )
      );
      const i = Math.max(
        0,
        Math.min(
          25,
          family.inclination.mean +
            (Math.random() - 0.5) * family.inclination.spread * 2
        )
      );

      const M = Math.random() * 360;
      const w = Math.random() * 360;
      const Omega = Math.random() * 360;

      // Calculate period using Kepler's third law
      const period = Math.sqrt(Math.pow(a / AU, 3)) * 365.25;

      // Family-specific size and color
      const radius = minSize + Math.random() * (maxSize - minSize);
      const familyColorVariation = (Math.random() - 0.5) * colorVariation * 0.5;
      const asteroidColor = family.color + familyColorVariation;

      asteroids.push({
        name: `${family.name}-${familyGeneratedCount + 1}`,
        type: "asteroid",
        radius: radius,
        color: asteroidColor,
        parent: "Sun",
        family: family.name,
        orbitalElements: {
          a: a,
          e: e,
          i: i,
          M: M,
          w: w,
          Omega: Omega,
          period: period,
        },
        rotationPeriod: 8 + Math.random() * 16,
        axialTilt: Math.random() * 180,
        description: `A ${family.name} family asteroid, part of a cluster formed from the breakup of a larger parent body.`,
        funFact: `This ${family.name} family member orbits the Sun every ${
          Math.round((period / 365.25) * 10) / 10
        } years, sharing similar orbital characteristics with its family.`,
      });
      familyGeneratedCount++;
      asteroidIndex++;
    }
  }

  // Generate background asteroids with realistic density distribution
  const backgroundCount = count - asteroids.length;
  let attempts = 0;
  const maxAttempts = backgroundCount * 5; // Reduced attempts to prevent hanging

  while (asteroids.length < count && attempts < maxAttempts) {
    attempts++;

    // Random position with density bias
    const a = innerRadius + Math.random() * (outerRadius - innerRadius);

    // Skip if in Kirkwood gap
    if (isInKirkwoodGap(a, kirkwoodGaps)) continue;

    // Apply density filtering
    const densityMultiplier = getDensityMultiplier(a, densityZones);
    if (Math.random() > densityMultiplier * 0.8) continue; // Increased acceptance rate

    // Random orbital parameters
    const e =
      minEccentricity + Math.random() * (maxEccentricity - minEccentricity);
    const i =
      minInclination + Math.random() * (maxInclination - minInclination);
    const M = Math.random() * 360;
    const w = Math.random() * 360;
    const Omega = Math.random() * 360;

    // Calculate period using Kepler's third law
    const period = Math.sqrt(Math.pow(a / AU, 3)) * 365.25;

    // Random size and color
    const radius = minSize + Math.random() * (maxSize - minSize);
    const colorVariationAmount = (Math.random() - 0.5) * colorVariation;
    const asteroidColor = baseColor + colorVariationAmount;

    asteroids.push({
      name: `Asteroid-${asteroidIndex}`,
      type: "asteroid",
      radius: radius,
      color: asteroidColor,
      parent: "Sun",
      family: "Background",
      orbitalElements: {
        a: a,
        e: e,
        i: i,
        M: M,
        w: w,
        Omega: Omega,
        period: period,
      },
      rotationPeriod: 8 + Math.random() * 16,
      axialTilt: Math.random() * 180,
      description: `A small rocky body in the asteroid belt, avoiding the Kirkwood gaps cleared by Jupiter's gravitational resonances.`,
      funFact: `This asteroid orbits in a stable region at ${(a / AU).toFixed(
        2
      )} AU, completing one orbit every ${
        Math.round((period / 365.25) * 10) / 10
      } Earth years.`,
    });
    asteroidIndex++;
  }

  console.log(
    `Generated ${asteroids.length} asteroids: ${asteroidFamilies.reduce(
      (sum, f) => {
        const familyCount = asteroids.filter((a) => a.family === f.name).length;
        return sum + familyCount;
      },
      0
    )} in families, ${
      asteroids.length -
      asteroidFamilies.reduce((sum, f) => {
        const familyCount = asteroids.filter((a) => a.family === f.name).length;
        return sum + familyCount;
      }, 0)
    } background`
  );
  console.log(
    `Kirkwood gaps at: ${kirkwoodGaps.map((g) => g.name).join(", ")}`
  );

  return asteroids;
}

export const initialCameraPosition = {
  x: 0,
  y: distanceScaleFactor * 4,
  z: distanceScaleFactor * 12,
};
