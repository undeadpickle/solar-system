import {
  AU,
  distanceScaleFactor,
  earthRadiusSceneUnits,
  distanceScale,
  planetSizeScale,
  sunDisplayRadius,
  minVisualRadius,
  MOON_MIN_VISUAL_RADIUS,
  MOON_VISUAL_ORBIT_GAP,
  solarSystemData,
  initialCameraPosition,
} from "./celestialBodyData.js";

// Global Three.js objects that will be accessed from main.js
export let scene, camera, renderer, orbitControls;
export const celestialObjects = [];
export const objectLookup = {};
export const textureLoader = new THREE.TextureLoader();

/**
 * Initialize the Three.js scene, camera, renderer, lights, and controls
 * @returns {Object} Object containing scene, camera, renderer, orbitControls, celestialObjects, objectLookup, textureLoader
 */
export function initThreeJS() {
  console.log("initThreeJS() called");

  // Create scene
  scene = new THREE.Scene();

  // Add starfield background
  const starGeometry = new THREE.SphereGeometry(10000, 64, 64);
  const starTexture = textureLoader.load("./images/8k_stars.jpg");
  starTexture.colorSpace = THREE.SRGBColorSpace;
  const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(starGeometry, starMaterial));

  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    20000
  );
  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );
  camera.lookAt(0, 0, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Create lighting
  const sunLight = new THREE.PointLight(0xffffff, 1.8, 0, 2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = distanceScaleFactor * 50;
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Create orbit controls
  if (typeof THREE.OrbitControls === "function") {
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 0, 0);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 0.1;
    orbitControls.maxDistance = 15000;
  } else {
    console.warn("THREE.OrbitControls not found.");
  }

  // Return objects for use in main.js
  return {
    scene,
    camera,
    renderer,
    orbitControls,
    celestialObjects,
    objectLookup,
    textureLoader,
    sunLight,
  };
}

/**
 * Create procedural starfield texture (DEPRECATED - now using 2k_stars.jpg texture file)
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @param {number} numStars - Number of stars to generate
 * @returns {THREE.CanvasTexture} Generated starfield texture
 */
/*
export function createStarfieldTexture(width, height, numStars) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.3;
    const alpha = 0.5 + Math.random() * 0.5;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    context.fill();
  }
  return new THREE.CanvasTexture(canvas);
}
*/

/**
 * Handle window resize events
 * @param {Function} additionalResizeCallback - Optional callback for additional resize handling
 */
export function onWindowResize(additionalResizeCallback) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Call additional resize callback if provided
  if (
    additionalResizeCallback &&
    typeof additionalResizeCallback === "function"
  ) {
    additionalResizeCallback();
  }
}

/**
 * Setup window resize listener
 * @param {Function} additionalResizeCallback - Optional callback for additional resize handling
 */
export function setupWindowResize(additionalResizeCallback) {
  window.addEventListener("resize", () =>
    onWindowResize(additionalResizeCallback)
  );
}
