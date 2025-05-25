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
 * Enhanced texture loading with automatic fallback for threeSetup.js
 * Specialized version for starfield with procedural generation fallback
 * @param {string} textureUrl - URL of the texture to load
 * @param {number} fallbackColor - Fallback color (hex) if texture fails to load
 * @param {string} objectName - Name of the object (for logging)
 * @param {THREE.Material} material - Material to update if texture fails
 * @param {string} materialProperty - Property to update ('map' or 'emissiveMap')
 * @returns {THREE.Texture|null} Loaded texture or null if failed (fallback will be applied)
 */
function loadTextureWithFallbackStarfield(
  textureUrl,
  fallbackColor,
  objectName,
  material,
  materialProperty = "map"
) {
  if (!textureUrl) return null;

  const texture = textureLoader.load(
    textureUrl,
    (loadedTexture) => {
      // Success callback
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      console.log(
        `✅ Texture loaded successfully for ${objectName}: ${textureUrl}`
      );
    },
    undefined, // Progress callback (not needed)
    (error) => {
      // Error callback - texture loading failed, generate procedural starfield
      console.warn(
        `⚠️ Texture loading failed for ${objectName}: ${textureUrl}`
      );
      console.warn(`🌟 Generating procedural starfield as fallback`);
      console.warn("Error details:", error);

      // Generate procedural starfield texture
      const proceduralTexture = createStarfieldTexture(2048, 1024, 8000);

      // Apply fallback texture to material
      if (material && proceduralTexture) {
        // Remove the failed texture
        if (material[materialProperty]) {
          material[materialProperty].dispose();
          material[materialProperty] = null;
        }

        // Set procedural texture
        material[materialProperty] = proceduralTexture;
        material.color.set(0xffffff); // Use white with texture
        material.needsUpdate = true;
        console.log(
          `🔄 Applied procedural starfield to ${objectName} material`
        );
      }
    }
  );

  // Set color space immediately for successful loads
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Create a procedural starfield texture
 * @param {number} width - Texture width
 * @param {number} height - Texture height
 * @param {number} starCount - Number of stars to generate
 * @returns {THREE.CanvasTexture} Generated starfield texture
 */
function createStarfieldTexture(width, height, starCount) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fill with deep space black
  ctx.fillStyle = "#000011";
  ctx.fillRect(0, 0, width, height);

  // Generate stars
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const brightness = Math.random();
    const size = Math.random() * 2 + 0.5;

    // Color variation for stars
    let starColor;
    if (brightness > 0.9) {
      starColor = `rgb(255, 255, ${Math.floor(200 + Math.random() * 55)})`; // Blue-white giants
    } else if (brightness > 0.7) {
      starColor = `rgb(255, ${Math.floor(
        240 + Math.random() * 15
      )}, ${Math.floor(200 + Math.random() * 55)})`; // White
    } else if (brightness > 0.4) {
      starColor = `rgb(255, ${Math.floor(
        200 + Math.random() * 55
      )}, ${Math.floor(100 + Math.random() * 100)})`; // Yellow
    } else {
      starColor = `rgb(255, ${Math.floor(
        150 + Math.random() * 50
      )}, ${Math.floor(50 + Math.random() * 50)})`; // Red
    }

    ctx.fillStyle = starColor;
    ctx.globalAlpha = brightness * 0.8 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  console.log(
    `🌟 Generated procedural starfield: ${width}x${height} with ${starCount} stars`
  );
  return texture;
}

/**
 * Initialize the Three.js scene, camera, renderer, lights, and controls
 * @returns {Object} Object containing scene, camera, renderer, orbitControls, celestialObjects, objectLookup, textureLoader
 */
export function initThreeJS() {
  console.log("initThreeJS() called");

  // Create scene
  scene = new THREE.Scene();

  // Create camera first (needed for starfield sizing)
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

  // Now create starfield background (after camera exists)
  const starGeometry = new THREE.SphereGeometry(camera.far * 0.9, 64, 64);

  // Create starfield material first
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000, // Black fallback
    side: THREE.BackSide,
    fog: false,
  });

  // Load starfield texture with fallback to procedural starfield
  const starTexture = loadTextureWithFallbackStarfield(
    "./images/8k_stars.jpg",
    0x000022, // Dark blue fallback color (won't be used since we generate procedural)
    "Starfield Background",
    starMaterial,
    "map"
  );

  if (starTexture) {
    starMaterial.map = starTexture;
    starMaterial.color.set(0xffffff); // Use white when texture is present
  }
  // If texture fails, the error callback will generate procedural stars

  const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  starMesh.name = "Starfield";
  scene.add(starMesh);

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
