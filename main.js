console.log("=== MAIN.JS MODULE STARTING ===");

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
  ASTEROID_BELT_CONFIG,
  generateAsteroidBelt,
  RING_SYSTEMS,
} from "./celestialBodyData.js";

import {
  initThreeJS,
  setupWindowResize,
  scene,
  camera,
  renderer,
  orbitControls,
  celestialObjects,
  objectLookup,
  textureLoader,
} from "./threeSetup.js";

import {
  setupPlanetSelector,
  onCanvasClick,
  togglePause as uiTogglePause,
  resetSimulationTime as uiResetSimulationTime,
  resetCameraView as uiResetCameraView,
  handleTextureUpload,
  handleClearTexture,
  handleResetAllObjectSettings,
  handleEmissionChange,
  handleOpacityChange,
  handleRoughnessChange,
  handleMetalnessChange,
  handleWireframeToggle,
  handleRingOpacityChange,
  handleTimeScaleChange as uiHandleTimeScaleChange,
} from "./uiControls.js";

import {
  createOrbitPathLine,
  updateCelestialBody,
  updateAllCelestialBodies,
  addOrbitPath,
} from "./physics.js";

/**
 * Enhanced texture loading with automatic fallback to appropriate planet colors
 * @param {string} textureUrl - URL of the texture to load
 * @param {number} fallbackColor - Fallback color (hex) if texture fails to load
 * @param {string} objectName - Name of the object (for logging)
 * @param {THREE.Material} material - Material to update if texture fails (optional)
 * @param {string} materialProperty - Property to update ('map' or 'emissiveMap')
 * @returns {THREE.Texture|null} Loaded texture or null if failed (fallback color will be used)
 */
function loadTextureWithFallback(
  textureUrl,
  fallbackColor,
  objectName,
  material = null,
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
      // Error callback - texture loading failed
      console.warn(
        `⚠️ Texture loading failed for ${objectName}: ${textureUrl}`
      );
      console.warn(
        `🎨 Falling back to color: #${fallbackColor
          .toString(16)
          .padStart(6, "0")}`
      );
      console.warn("Error details:", error);

      // Apply fallback color to material if provided
      if (material) {
        // Remove the failed texture
        if (material[materialProperty]) {
          material[materialProperty].dispose();
          material[materialProperty] = null;
        }

        // Set fallback color based on material property
        if (materialProperty === "emissiveMap" && material.emissive) {
          material.emissive.setHex(fallbackColor);
        } else if (materialProperty === "map" && material.color) {
          material.color.setHex(fallbackColor);
        }

        material.needsUpdate = true;
        console.log(`🔄 Applied fallback color to ${objectName} material`);
      }
    }
  );

  // Set color space immediately for successful loads
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "DOM fully loaded. Script starting (Step 16c: Settings Panel UI Refinements)..."
  );

  let followedObject = null;
  let settingsTargetObject = null;
  let materialSettingsCollapsed = true; // Keep track of collapse state
  let sunLight; // Will be assigned from initThreeJS
  let focusAnimationId = null;

  const clock = new THREE.Clock();
  const animationClock = new THREE.Clock();
  let totalSimulatedTimeDays = 0;
  let timeScale = 1;
  let isPaused = false;
  let animationFrameCounter = 0;

  // Bloom post-processing system
  let composer = null;
  let renderPass = null;
  let bloomPass = null;
  let bloomEnabled = true;

  // Background music system
  let backgroundMusic = null;
  let musicEnabled = false;
  let musicMuted = false;

  // Celestial body scaling system
  let bodySizeScale = 5.0; // Current global scale multiplier

  // --- UI Elements for Settings Panel ---
  const settingsPanel = document.getElementById("settingsPanel");
  const objectDetailsSection = document.getElementById("objectDetailsSection");
  const objectNameDisplay = document.getElementById("objectNameDisplay");
  const objectDescription = document.getElementById("objectDescription");
  const objectFunFact = document.getElementById("objectFunFact");

  const materialSettingsHeader = document.getElementById(
    "materialSettingsHeader"
  );
  const materialSettingsContent = document.getElementById(
    "materialSettingsContent"
  );
  const collapseIcon = materialSettingsHeader.querySelector(".collapse-icon");

  const textureUploadControl = document.getElementById("textureUploadControl");
  const textureUploadInput = document.getElementById("textureUpload");
  const textureFileNameDisplay = document.getElementById(
    "textureFileNameDisplay"
  );
  const clearTextureButton = document.getElementById("clearTextureButton");
  const resetAllObjectSettingsButton = document.getElementById(
    "resetAllObjectSettingsButton"
  );

  const emissionControl = document.getElementById("emissionControl");
  const emissionSlider = document.getElementById("emissionSlider");
  const emissionValueDisplay = document.getElementById("emissionValue");
  const emissionSliderLabel = document.getElementById("emissionSliderLabel");

  const opacityControl = document.getElementById("opacityControl");
  const opacitySlider = document.getElementById("opacitySlider");
  const opacityValueDisplay = document.getElementById("opacityValue");
  const opacitySliderLabel = document.getElementById("opacitySliderLabel");

  const roughnessControl = document.getElementById("roughnessControl");
  const roughnessSlider = document.getElementById("roughnessSlider");
  const roughnessValueDisplay = document.getElementById("roughnessValue");
  const roughnessSliderLabel = document.getElementById("roughnessSliderLabel");

  const metalnessControl = document.getElementById("metalnessControl");
  const metalnessSlider = document.getElementById("metalnessSlider");
  const metalnessValueDisplay = document.getElementById("metalnessValue");
  const metalnessSliderLabel = document.getElementById("metalnessSliderLabel");

  const wireframeControl = document.getElementById("wireframeControl");
  const wireframeToggle = document.getElementById("wireframeToggle");

  const ringOpacityControl = document.getElementById("ringOpacityControl");
  const ringOpacitySlider = document.getElementById("ringOpacitySlider");
  const ringOpacityValueDisplay = document.getElementById("ringOpacityValue");
  const ringOpacitySliderLabel = document.getElementById(
    "ringOpacitySliderLabel"
  );

  // Lens flare UI controls
  const lensFlareControl = document.getElementById("lensFlareControl");
  const lensFlareToggle = document.getElementById("lensFlareToggle");

  // Bloom effects UI controls (now in global controls)
  const bloomEffectsToggle = document.getElementById("bloomEffectsToggle");

  // Atmospheric glow UI controls (now in global controls)
  const atmosphericGlowToggle = document.getElementById(
    "atmosphericGlowToggle"
  );

  // Asteroid belt UI controls (global controls)
  const asteroidBeltToggle = document.getElementById("asteroidBeltToggle");

  // Global orbit paths control
  const orbitPathsGlobalToggle = document.getElementById(
    "orbitPathsGlobalToggle"
  );

  // Background music controls
  const backgroundMusicToggle = document.getElementById(
    "backgroundMusicToggle"
  );
  const playPauseButton = document.getElementById("playPauseButton");
  const muteButton = document.getElementById("muteButton");

  // Celestial body size controls
  const bodySizeSlider = document.getElementById("bodySizeSlider");
  const bodySizeValueDisplay = document.getElementById("bodySizeValue");

  // Constants now imported from celestialBodyData.js

  // Celestial body data now imported from celestialBodyData.js

  // Camera position now imported from celestialBodyData.js

  // Helper function to provide UI elements object for modular functions
  function getUIElements() {
    return {
      emissionSlider,
      emissionValueDisplay,
      roughnessSlider,
      roughnessValueDisplay,
      metalnessSlider,
      metalnessValueDisplay,
      opacitySlider,
      opacityValueDisplay,
      wireframeToggle,
      ringOpacitySlider,
      ringOpacityValueDisplay,
      lensFlareToggle,
    };
  }

  init();
  animate();

  function init() {
    console.log("init() called");
    try {
      // Initialize Three.js scene, camera, renderer, lights, and controls
      const threeJSObjects = initThreeJS();
      sunLight = threeJSObjects.sunLight;

      // Create celestial bodies
      solarSystemData.forEach((data) => createCelestialBody(data, sunLight));

      // Generate and create asteroid belt
      console.log("Generating asteroid belt...");
      const asteroidBeltData = generateAsteroidBelt();
      asteroidBeltData.forEach((asteroid) =>
        createCelestialBody(asteroid, sunLight)
      );
      console.log(`Created ${asteroidBeltData.length} asteroids in the belt.`);

      // Setup planet selector dropdown
      setupPlanetSelector(setFocus);

      if (document.getElementById("currentFocus")) {
        document.getElementById("currentFocus").textContent =
          "Solar System Overview";
      }

      // Event listeners for settings panel
      materialSettingsHeader.addEventListener("click", () => {
        materialSettingsContent.classList.toggle("collapsed");
        materialSettingsCollapsed =
          materialSettingsContent.classList.contains("collapsed");
        collapseIcon.textContent = materialSettingsCollapsed ? "+" : "-";
      });
      // Set initial state of material settings to collapsed
      materialSettingsContent.classList.add("collapsed");
      collapseIcon.textContent = "+";
      materialSettingsCollapsed = true;

      textureUploadInput.addEventListener("change", (e) =>
        handleTextureUpload(e, settingsTargetObject, textureFileNameDisplay)
      );
      clearTextureButton.addEventListener("click", () =>
        handleClearTexture(
          settingsTargetObject,
          textureUploadInput,
          textureFileNameDisplay
        )
      );
      resetAllObjectSettingsButton.addEventListener("click", () =>
        handleResetAllObjectSettings(
          settingsTargetObject,
          getUIElements(),
          () => setFocus(settingsTargetObject, true) /* Re-populate settings */
        )
      );

      // Lens flare toggle
      lensFlareToggle.addEventListener("change", (e) =>
        handleLensFlareToggle(e, settingsTargetObject)
      );

      // Atmospheric glow toggle
      atmosphericGlowToggle.addEventListener(
        "change",
        handleAtmosphericGlowToggle
      );

      // Asteroid belt toggle
      asteroidBeltToggle.addEventListener("change", handleAsteroidBeltToggle);

      // Global orbit paths toggle
      orbitPathsGlobalToggle.addEventListener(
        "change",
        handleOrbitPathsGlobalToggle
      );

      // Bloom effects toggle
      bloomEffectsToggle.addEventListener("change", handleBloomEffectsToggle);

      // Background music controls
      backgroundMusicToggle.addEventListener(
        "change",
        handleBackgroundMusicToggle
      );
      playPauseButton.addEventListener("click", handlePlayPause);
      muteButton.addEventListener("click", handleMute);

      // Celestial body size control
      bodySizeSlider.addEventListener("input", handleBodySizeChange);

      // Initialize systems
      setupBloomSystem();

      // Set initial audio control states
      backgroundMusicToggle.disabled = true; // Disabled until audio loads
      updateAudioControls();

      initBackgroundMusic();

      emissionSlider.addEventListener("input", (e) =>
        handleEmissionChange(e, settingsTargetObject, emissionValueDisplay)
      );
      opacitySlider.addEventListener("input", (e) =>
        handleOpacityChange(e, settingsTargetObject, opacityValueDisplay)
      );
      roughnessSlider.addEventListener("input", (e) =>
        handleRoughnessChange(e, settingsTargetObject, roughnessValueDisplay)
      );
      metalnessSlider.addEventListener("input", (e) =>
        handleMetalnessChange(e, settingsTargetObject, metalnessValueDisplay)
      );
      wireframeToggle.addEventListener("change", (e) =>
        handleWireframeToggle(e, settingsTargetObject)
      );
      ringOpacitySlider.addEventListener("input", (e) =>
        handleRingOpacityChange(
          e,
          settingsTargetObject,
          ringOpacityValueDisplay
        )
      );

      setupWindowResize(updateBloomSystemSize);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      renderer.domElement.addEventListener("click", (e) =>
        onCanvasClick(e, setFocus)
      );
      document
        .getElementById("timeScaleInput")
        .addEventListener("input", handleTimeScaleChange);
      document
        .getElementById("pauseButton")
        .addEventListener("click", () => togglePause());
      document
        .getElementById("resetTimeButton")
        .addEventListener("click", () => resetSimulationTime());
      document
        .getElementById("resetViewButton")
        .addEventListener("click", () => {
          const result = uiResetCameraView(focusAnimationId);
          if (result) {
            followedObject = result.followedObject;
            settingsTargetObject = result.settingsTargetObject;
            focusAnimationId = result.focusAnimationId;
          }
        });

      // Apply initial 5x scaling to all celestial bodies
      updateAllBodySizes();
      console.log("Applied initial 5x scaling to all celestial bodies.");

      console.log("init() completed successfully.");
    } catch (e) {
      console.error("Error in init():", e);
      alert("Error during initialization: " + e.message);
    }
  }

  /**
   * Creates a lens flare system for the Sun
   * @param {THREE.Group} sunPivot - The Sun's pivot group to attach lens flare to
   * @param {number} sunRadius - The Sun's scaled radius for positioning
   * @returns {THREE.Group} The lens flare group
   */
  function createSunLensFlare(sunPivot, sunRadius) {
    const lensFlareGroup = new THREE.Group();
    lensFlareGroup.name = "sunLensFlare";

    // Create lens flare textures programmatically
    const flareTextures = [];

    // Main sun glow texture
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext("2d");
    const glowGradient = glowCtx.createRadialGradient(
      128,
      128,
      0,
      128,
      128,
      128
    );
    glowGradient.addColorStop(0, "rgba(255, 255, 200, 0.8)");
    glowGradient.addColorStop(0.2, "rgba(255, 220, 150, 0.6)");
    glowGradient.addColorStop(0.6, "rgba(255, 200, 100, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 180, 80, 0)");
    glowCtx.fillStyle = glowGradient;
    glowCtx.fillRect(0, 0, 256, 256);
    flareTextures.push(new THREE.CanvasTexture(glowCanvas));

    // Ring flare texture
    const ringCanvas = document.createElement("canvas");
    ringCanvas.width = 128;
    ringCanvas.height = 128;
    const ringCtx = ringCanvas.getContext("2d");
    const ringGradient = ringCtx.createRadialGradient(64, 64, 20, 64, 64, 64);
    ringGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    ringGradient.addColorStop(0.8, "rgba(255, 220, 150, 0.4)");
    ringGradient.addColorStop(0.9, "rgba(255, 200, 100, 0.6)");
    ringGradient.addColorStop(1, "rgba(255, 180, 80, 0)");
    ringCtx.fillStyle = ringGradient;
    ringCtx.fillRect(0, 0, 128, 128);
    flareTextures.push(new THREE.CanvasTexture(ringCanvas));

    // Small flare dot texture
    const dotCanvas = document.createElement("canvas");
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const dotCtx = dotCanvas.getContext("2d");
    const dotGradient = dotCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    dotGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    dotGradient.addColorStop(0.3, "rgba(255, 220, 150, 0.6)");
    dotGradient.addColorStop(1, "rgba(255, 200, 100, 0)");
    dotCtx.fillStyle = dotGradient;
    dotCtx.fillRect(0, 0, 64, 64);
    flareTextures.push(new THREE.CanvasTexture(dotCanvas));

    // Lens flare configuration
    const flareElements = [
      {
        texture: 0,
        size: sunRadius * 4,
        distance: 0,
        opacity: 0.7,
        color: 0xffffc0,
      },
      {
        texture: 1,
        size: sunRadius * 1.5,
        distance: 0.1,
        opacity: 0.4,
        color: 0xffeb99,
      },
      {
        texture: 2,
        size: sunRadius * 0.8,
        distance: 0.3,
        opacity: 0.3,
        color: 0xffcc66,
      },
      {
        texture: 2,
        size: sunRadius * 0.6,
        distance: 0.6,
        opacity: 0.2,
        color: 0xff9933,
      },
      {
        texture: 1,
        size: sunRadius * 1.2,
        distance: 0.8,
        opacity: 0.3,
        color: 0xffaa44,
      },
      {
        texture: 2,
        size: sunRadius * 0.4,
        distance: 1.2,
        opacity: 0.15,
        color: 0xff8800,
      },
    ];

    flareElements.forEach((element, index) => {
      const geometry = new THREE.PlaneGeometry(element.size, element.size);
      const material = new THREE.MeshBasicMaterial({
        map: flareTextures[element.texture],
        transparent: true,
        opacity: element.opacity,
        color: element.color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });

      const flareMesh = new THREE.Mesh(geometry, material);
      flareMesh.name = `lensFlare_${index}`;
      flareMesh.userData = {
        distance: element.distance,
        baseOpacity: element.opacity,
      };

      lensFlareGroup.add(flareMesh);
    });

    // Add lens flare group to sun pivot
    sunPivot.add(lensFlareGroup);

    return lensFlareGroup;
  }

  /**
   * Updates the Sun's lens flare orientation and intensity based on camera position
   * @param {THREE.Mesh} sunMesh - The Sun mesh object
   * @param {THREE.Camera} camera - The current camera
   */
  function updateSunLensFlare(sunMesh, camera) {
    if (
      !sunMesh.userData.lensFlareGroup ||
      !sunMesh.userData.lensFlareVisible
    ) {
      return;
    }

    const lensFlareGroup = sunMesh.userData.lensFlareGroup;
    const sunWorldPosition = new THREE.Vector3();
    sunMesh.getWorldPosition(sunWorldPosition);

    // Calculate camera distance to sun for intensity scaling
    const distanceToSun = camera.position.distanceTo(sunWorldPosition);
    const maxDistance = distanceScaleFactor * 20; // Max effective distance
    const minDistance = distanceScaleFactor * 2; // Min distance for full effect

    let intensityFactor = 1.0;
    if (distanceToSun > minDistance) {
      intensityFactor = Math.max(
        0.1,
        1.0 - (distanceToSun - minDistance) / (maxDistance - minDistance)
      );
    }

    // Make lens flare elements face the camera
    lensFlareGroup.lookAt(camera.position);

    // Update each flare element
    lensFlareGroup.children.forEach((flareMesh, index) => {
      const baseOpacity = flareMesh.userData.baseOpacity;
      const adjustedOpacity = baseOpacity * intensityFactor;
      flareMesh.material.opacity = Math.max(0, Math.min(1, adjustedOpacity));

      // Position flare elements along the line from sun to camera
      const distance = flareMesh.userData.distance;
      if (distance > 0) {
        const direction = new THREE.Vector3()
          .subVectors(camera.position, sunWorldPosition)
          .normalize();
        const offsetDistance = distance * sunMesh.userData.scaledRadius * 2;
        flareMesh.position.copy(direction.multiplyScalar(offsetDistance));
      } else {
        flareMesh.position.set(0, 0, 0);
      }
    });
  }

  /**
   * Handles lens flare toggle for the Sun
   * @param {Event} e - The toggle event
   * @param {THREE.Mesh} targetObject - The target object (should be the Sun)
   */
  function handleLensFlareToggle(e, targetObject) {
    if (!targetObject || targetObject.userData.type !== "star") {
      return;
    }

    const isEnabled = e.target.checked;
    targetObject.userData.lensFlareVisible = isEnabled;

    if (targetObject.userData.lensFlareGroup) {
      targetObject.userData.lensFlareGroup.visible = isEnabled;
    }
  }

  /**
   * Creates realistic atmospheric glow effect for gas giant planets
   * @param {THREE.Group} planetPivot - The planet's pivot group to attach atmosphere to
   * @param {number} planetRadius - The planet's scaled radius
   * @param {string} planetName - The planet name to determine atmosphere characteristics
   * @returns {THREE.Mesh} The atmospheric glow mesh
   */
  function createAtmosphericGlow(planetPivot, planetRadius, planetName) {
    // Enhanced atmospheric characteristics for each gas giant
    const atmosphereConfig = {
      Jupiter: {
        innerColor: [255, 200, 100], // Warm orange core
        outerColor: [255, 170, 60], // Golden edge
        opacity: 0.25,
        scale: 1.4,
        rimIntensity: 0.15,
        hasStormBands: true,
      },
      Saturn: {
        innerColor: [255, 220, 150], // Pale golden core
        outerColor: [255, 200, 120], // Warmer edge
        opacity: 0.22,
        scale: 1.35,
        rimIntensity: 0.12,
        hasStormBands: false,
      },
      Uranus: {
        innerColor: [100, 220, 255], // Bright cyan core
        outerColor: [60, 200, 240], // Deep cyan edge
        opacity: 0.28,
        scale: 1.5,
        rimIntensity: 0.18,
        hasStormBands: false,
      },
      Neptune: {
        innerColor: [80, 150, 255], // Bright blue core
        outerColor: [40, 100, 220], // Deep blue edge
        opacity: 0.26,
        scale: 1.45,
        rimIntensity: 0.16,
        hasStormBands: true,
      },
    };

    const config = atmosphereConfig[planetName];
    if (!config) return null;

    // Create radial gradient texture for realistic atmospheric falloff
    const createAtmosphereTexture = (innerRGB, outerRGB, hasStorms = false) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Create radial gradient from center to edge
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);

      // Inner atmosphere (dense)
      gradient.addColorStop(0, `rgba(${innerRGB.join(",")}, 0.8)`);
      gradient.addColorStop(0.3, `rgba(${innerRGB.join(",")}, 0.6)`);

      // Mid atmosphere (transition)
      const midRGB = innerRGB.map((c, i) => Math.round((c + outerRGB[i]) / 2));
      gradient.addColorStop(0.6, `rgba(${midRGB.join(",")}, 0.4)`);

      // Outer atmosphere (edge glow)
      gradient.addColorStop(0.85, `rgba(${outerRGB.join(",")}, 0.2)`);
      gradient.addColorStop(1, `rgba(${outerRGB.join(",")}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      // Add storm band effects for Jupiter and Neptune
      if (hasStorms) {
        ctx.globalCompositeOperation = "overlay";
        for (let i = 0; i < 3; i++) {
          const y = 80 + i * 32;
          const bandGradient = ctx.createLinearGradient(0, y - 8, 0, y + 8);
          bandGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
          bandGradient.addColorStop(0.5, `rgba(${outerRGB.join(",")}, 0.1)`);
          bandGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = bandGradient;
          ctx.fillRect(0, y - 8, 256, 16);
        }
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Create atmosphere textures
    const atmosphereTexture = createAtmosphereTexture(
      config.innerColor,
      config.outerColor,
      config.hasStormBands
    );

    // Main atmospheric sphere with gradient texture
    const atmosphereRadius = planetRadius * config.scale;
    const atmosphereGeometry = new THREE.SphereGeometry(
      atmosphereRadius,
      32,
      32
    );

    // Enhanced atmospheric material with Fresnel-like effect
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      map: atmosphereTexture,
      transparent: true,
      opacity: config.opacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    // Create rim lighting effect using a second layer
    const rimGeometry = new THREE.SphereGeometry(
      atmosphereRadius * 1.05,
      32,
      32
    );
    const rimTexture = createAtmosphereTexture(
      config.outerColor.map((c) => Math.min(255, c + 30)), // Brighter rim
      config.outerColor,
      false
    );

    const rimMaterial = new THREE.MeshBasicMaterial({
      map: rimTexture,
      transparent: true,
      opacity: config.rimIntensity,
      side: THREE.BackSide, // Only visible from outside
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    // Create inner atmosphere for depth
    const innerGeometry = new THREE.SphereGeometry(
      atmosphereRadius * 0.95,
      32,
      32
    );
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(
        config.innerColor[0] / 255,
        config.innerColor[1] / 255,
        config.innerColor[2] / 255
      ),
      transparent: true,
      opacity: config.opacity * 0.3,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });

    // Create atmosphere meshes
    const atmosphereMesh = new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial
    );
    const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);

    // Create atmosphere group
    const atmosphereGroup = new THREE.Group();
    atmosphereGroup.name = `${planetName}_atmosphere`;

    // Add layers in correct order
    atmosphereGroup.add(innerMesh); // Inner core glow
    atmosphereGroup.add(atmosphereMesh); // Main atmosphere
    atmosphereGroup.add(rimMesh); // Rim lighting

    // Add to planet's tilted pole (rotates with planet)
    planetPivot.add(atmosphereGroup);

    return atmosphereGroup;
  }

  /**
   * Handles atmospheric glow toggle for all gas giants globally
   * @param {Event} e - The toggle event
   */
  function handleAtmosphericGlowToggle(e) {
    const enabled = e.target.checked;
    const gasGiants = ["Jupiter", "Saturn", "Uranus", "Neptune"];

    gasGiants.forEach((planetName) => {
      const planetMesh = objectLookup[planetName];
      if (planetMesh && planetMesh.userData.atmosphereGroup) {
        planetMesh.userData.atmosphereGroup.visible = enabled;
        planetMesh.userData.atmosphericGlowVisible = enabled;
      }
    });

    console.log(
      "Atmospheric glow:",
      enabled ? "enabled" : "disabled",
      "for all gas giants"
    );
  }

  /**
   * Toggles visibility of all asteroid belt objects
   * @param {Event} e - The change event from the checkbox
   */
  function handleAsteroidBeltToggle(e) {
    const enabled = e.target.checked;

    // Find all asteroid objects and toggle their visibility
    celestialObjects.forEach((bodyMesh) => {
      if (bodyMesh.userData.type === "asteroid") {
        bodyMesh.userData.pivot.visible = enabled;
      }
    });

    console.log("Asteroid belt:", enabled ? "visible" : "hidden");
  }

  /**
   * Toggles visibility of all orbit paths globally
   * @param {Event} e - The change event from the checkbox
   */
  function handleOrbitPathsGlobalToggle(e) {
    const enabled = e.target.checked;

    // Find all celestial objects and toggle their orbit paths (excluding asteroids and Sun)
    celestialObjects.forEach((bodyMesh) => {
      if (
        bodyMesh.userData.orbitPath &&
        bodyMesh.userData.type !== "asteroid" &&
        bodyMesh.userData.type !== "star"
      ) {
        bodyMesh.userData.orbitPath.visible = enabled;
      }
    });

    console.log("All orbit paths:", enabled ? "visible" : "hidden");
  }

  /**
   * Sets up the bloom post-processing system
   */
  function setupBloomSystem() {
    if (!renderer || !scene || !camera) {
      console.warn(
        "Cannot setup bloom system: renderer, scene, or camera not available"
      );
      return;
    }

    // Create composer for post-processing
    composer = new THREE.EffectComposer(renderer);

    // Add render pass (renders the scene)
    renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom pass
    const bloomStrength = 0.3; // Intensity of bloom (reduced from 1.5)
    const bloomRadius = 0.2; // Spread of bloom (reduced from 0.4)
    const bloomThreshold = 0.9; // Brightness threshold for bloom (increased from 0.85)

    bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );

    bloomPass.enabled = bloomEnabled;
    composer.addPass(bloomPass);

    console.log("Bloom system initialized successfully");
  }

  /**
   * Updates bloom system on window resize
   */
  function updateBloomSystemSize() {
    if (composer && bloomPass) {
      composer.setSize(window.innerWidth, window.innerHeight);
      bloomPass.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Handles bloom effects toggle
   * @param {Event} e - The toggle event
   */
  function handleBloomEffectsToggle(e) {
    bloomEnabled = e.target.checked;
    if (bloomPass) {
      bloomPass.enabled = bloomEnabled;
    }
    console.log("Bloom effects:", bloomEnabled ? "enabled" : "disabled");
  }

  /**
   * Initialize background music system
   */
  function initBackgroundMusic() {
    try {
      backgroundMusic = new Audio("./audio/Solaris Drone.mp3");
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.5; // Set to reasonable volume
      backgroundMusic.preload = "auto";

      // Add event listeners for audio events
      backgroundMusic.addEventListener("loadeddata", () => {
        console.log("✅ Background music loaded successfully");
        // Enable controls once audio is loaded
        backgroundMusicToggle.disabled = false;
        updateAudioControls();
      });

      backgroundMusic.addEventListener("error", (e) => {
        console.warn("⚠️ Failed to load background music:", e);
        console.warn("Audio controls will be disabled");
      });

      backgroundMusic.addEventListener("ended", () => {
        // This shouldn't happen with loop=true, but just in case
        if (musicEnabled && !musicMuted) {
          backgroundMusic
            .play()
            .catch((err) => console.warn("Audio play failed:", err));
        }
      });
    } catch (error) {
      console.warn("⚠️ Failed to initialize background music:", error);
    }
  }

  /**
   * Update audio control buttons state
   */
  function updateAudioControls() {
    const canUseControls = backgroundMusic && musicEnabled;

    playPauseButton.disabled = !canUseControls;
    muteButton.disabled = !canUseControls;

    if (canUseControls) {
      const isPlaying = !backgroundMusic.paused;
      playPauseButton.textContent = isPlaying ? "Pause" : "Play";
      muteButton.textContent = musicMuted ? "Unmute" : "Mute";
    } else {
      playPauseButton.textContent = "Play";
      muteButton.textContent = "Mute";
    }
  }

  /**
   * Handle background music toggle
   * @param {Event} e - The toggle event
   */
  function handleBackgroundMusicToggle(e) {
    musicEnabled = e.target.checked;

    if (!backgroundMusic) {
      initBackgroundMusic();
      return;
    }

    if (musicEnabled && !musicMuted) {
      // Start playing music
      backgroundMusic.play().catch((err) => {
        console.warn("Failed to play background music:", err);
        console.warn("This might be due to browser autoplay policies");
      });
    } else {
      // Stop playing music
      backgroundMusic.pause();
    }

    updateAudioControls();
    console.log("Background music:", musicEnabled ? "enabled" : "disabled");
  }

  /**
   * Handle play/pause button
   */
  function handlePlayPause() {
    if (!backgroundMusic || !musicEnabled) return;

    if (backgroundMusic.paused) {
      backgroundMusic.play().catch((err) => {
        console.warn("Failed to play background music:", err);
      });
    } else {
      backgroundMusic.pause();
    }

    updateAudioControls();
  }

  /**
   * Handle mute button
   */
  function handleMute() {
    if (!backgroundMusic || !musicEnabled) return;

    musicMuted = !musicMuted;
    backgroundMusic.muted = musicMuted;

    updateAudioControls();
    console.log("Background music:", musicMuted ? "muted" : "unmuted");
  }

  /**
   * Handle celestial body size scaling
   * @param {Event} e - The slider input event
   */
  function handleBodySizeChange(e) {
    const sliderValue = parseFloat(e.target.value);
    // Linear mapping: 0→1x, 100→10x
    bodySizeScale = 1 + (sliderValue / 100) * 9;

    // Update display
    bodySizeValueDisplay.textContent = `${bodySizeScale.toFixed(1)}x`;

    // Apply scaling to all celestial bodies
    updateAllBodySizes();

    console.log(
      `Celestial body size scale updated to: ${bodySizeScale.toFixed(1)}x`
    );
  }

  /**
   * Update the size of all celestial bodies based on current scale
   */
  function updateAllBodySizes() {
    celestialObjects.forEach((bodyMesh) => {
      if (!bodyMesh.userData || !bodyMesh.userData.originalRadius) return;

      const originalRadius = bodyMesh.userData.originalRadius;
      const newRadius = originalRadius * bodySizeScale;

      // Store current scale for future calculations
      bodyMesh.userData.currentScale = bodySizeScale;

      // Update mesh geometry
      if (bodyMesh.geometry) {
        bodyMesh.geometry.dispose();

        const segments =
          bodyMesh.userData.type === "moon"
            ? 16
            : bodyMesh.userData.type === "asteroid"
            ? 8
            : bodyMesh.userData.radius > 20000
            ? 64
            : 32;

        bodyMesh.geometry = new THREE.SphereGeometry(
          newRadius,
          segments,
          segments
        );
      }

      // Update stored scaled radius
      bodyMesh.userData.scaledRadius = newRadius;

      // Update rings if present
      if (bodyMesh.userData.ringMesh) {
        updateRingScale(bodyMesh, bodySizeScale);
      }

      // Update lens flare if present (Sun)
      if (
        bodyMesh.userData.lensFlareGroup &&
        bodyMesh.userData.type === "star"
      ) {
        updateLensFlareScale(bodyMesh, bodySizeScale);
      }

      // Update atmospheric glow if present
      if (bodyMesh.userData.atmosphereGroup) {
        updateAtmosphereScale(bodyMesh, bodySizeScale);
      }

      // Update cloud layer if present (Earth)
      if (bodyMesh.userData.cloudMesh) {
        updateCloudScale(bodyMesh, bodySizeScale);
      }
    });

    // Update moon orbital distances to maintain visual gaps
    updateMoonOrbitalDistances();
  }

  /**
   * Update ring system scale for a planet
   * @param {THREE.Mesh} planetMesh - The planet mesh with rings
   * @param {number} scale - The new scale factor
   */
  function updateRingScale(planetMesh, scale) {
    const ringMesh = planetMesh.userData.ringMesh;
    if (!ringMesh) return;

    const originalInnerRadius = planetMesh.userData.originalRingInnerRadius;
    const originalOuterRadius = planetMesh.userData.originalRingOuterRadius;

    const newInnerRadius = originalInnerRadius * scale;
    const newOuterRadius = originalOuterRadius * scale;

    // Update ring geometry
    ringMesh.geometry.dispose();
    const segments = planetMesh.userData.name === "Saturn" ? 256 : 64;
    ringMesh.geometry = new THREE.RingGeometry(
      newInnerRadius,
      newOuterRadius,
      segments
    );
  }

  /**
   * Update lens flare scale for the Sun
   * @param {THREE.Mesh} sunMesh - The Sun mesh
   * @param {number} scale - The new scale factor
   */
  function updateLensFlareScale(sunMesh, scale) {
    const lensFlareGroup = sunMesh.userData.lensFlareGroup;
    if (!lensFlareGroup) return;

    const baseRadius = sunMesh.userData.originalRadius;

    lensFlareGroup.children.forEach((flareMesh, index) => {
      // Scale lens flare elements based on new sun size
      const flareElements = [
        { size: baseRadius * 4 * scale },
        { size: baseRadius * 1.5 * scale },
        { size: baseRadius * 0.8 * scale },
        { size: baseRadius * 0.6 * scale },
        { size: baseRadius * 1.2 * scale },
        { size: baseRadius * 0.4 * scale },
      ];

      if (flareElements[index]) {
        const newSize = flareElements[index].size;
        flareMesh.geometry.dispose();
        flareMesh.geometry = new THREE.PlaneGeometry(newSize, newSize);
      }
    });
  }

  /**
   * Update atmospheric glow scale for gas giants
   * @param {THREE.Mesh} planetMesh - The planet mesh
   * @param {number} scale - The new scale factor
   */
  function updateAtmosphereScale(planetMesh, scale) {
    const atmosphereGroup = planetMesh.userData.atmosphereGroup;
    if (!atmosphereGroup) return;

    const baseRadius = planetMesh.userData.originalRadius;

    // Update each atmosphere layer
    atmosphereGroup.children.forEach((atmosphereMesh, index) => {
      const scaleFactors = [0.95, 1.4, 1.45]; // inner, main, rim layers
      const newRadius = baseRadius * scaleFactors[index] * scale;

      atmosphereMesh.geometry.dispose();
      atmosphereMesh.geometry = new THREE.SphereGeometry(newRadius, 32, 32);
    });
  }

  /**
   * Update cloud layer scale for Earth
   * @param {THREE.Mesh} earthMesh - The Earth mesh
   * @param {number} scale - The new scale factor
   */
  function updateCloudScale(earthMesh, scale) {
    const cloudMesh = earthMesh.userData.cloudMesh;
    if (!cloudMesh) return;

    const baseRadius = earthMesh.userData.originalRadius;
    const newCloudRadius = baseRadius * 1.01 * scale; // Slightly larger than Earth

    cloudMesh.geometry.dispose();
    cloudMesh.geometry = new THREE.SphereGeometry(newCloudRadius, 64, 64);
  }

  /**
   * Update moon orbital distances to maintain visual gaps
   */
  function updateMoonOrbitalDistances() {
    celestialObjects.forEach((bodyMesh) => {
      if (bodyMesh.userData.type === "moon" && bodyMesh.userData.parent) {
        const parentPlanetMesh = objectLookup[bodyMesh.userData.parent];
        if (!parentPlanetMesh) return;

        const parentRadius = parentPlanetMesh.userData.scaledRadius;
        const moonRadius = bodyMesh.userData.scaledRadius;
        const newOrbitalDistance =
          parentRadius + moonRadius + MOON_VISUAL_ORBIT_GAP;

        // Update the moon's orbital position (this maintains the visual gap)
        // The actual orbital mechanics will be handled by the existing physics system
        // We just need to ensure the visual distance is maintained
        if (bodyMesh.userData.pivot) {
          const currentDistance = bodyMesh.userData.pivot.position.length();
          if (currentDistance > 0) {
            const scale = newOrbitalDistance / currentDistance;
            bodyMesh.userData.pivot.position.multiplyScalar(scale);
          }
        }
      }
    });
  }

  function createCelestialBody(data, sunLightRef) {
    let geometry;
    let material;
    let materialProperties = {
      roughness: data.roughness !== undefined ? data.roughness : 0.8,
      metalness: data.metalness !== undefined ? data.metalness : 0.1,
    };
    let scaledRadius;
    let texture = null;
    let bodyMesh;

    if (data.type === "star") {
      scaledRadius = sunDisplayRadius;
      geometry = new THREE.SphereGeometry(scaledRadius, 64, 64);

      materialProperties.color = 0x000000;
      materialProperties.emissive = new THREE.Color(data.color);
      materialProperties.emissiveIntensity =
        data.emissiveIntensity !== undefined ? data.emissiveIntensity : 1.5;
      materialProperties.roughness =
        data.roughness !== undefined ? data.roughness : 0.9;
      materialProperties.metalness =
        data.metalness !== undefined ? data.metalness : 0.1;

      // Create material first
      material = new THREE.MeshStandardMaterial(materialProperties);

      // Then load texture with fallback capability
      if (data.textureUrl) {
        texture = loadTextureWithFallback(
          data.textureUrl,
          data.color,
          data.name,
          material,
          "emissiveMap"
        );
        if (texture) {
          material.emissiveMap = texture;
          material.emissive.set(0xffffff); // Use white when texture is present
        }
        // If texture fails, the error callback will set emissive color to fallback
      }
    } else {
      scaledRadius = Math.max(
        data.type === "moon" ? MOON_MIN_VISUAL_RADIUS : minVisualRadius,
        data.radius * planetSizeScale
      );

      // Special handling for asteroids - make them much more visible
      if (data.type === "asteroid") {
        scaledRadius = Math.max(
          minVisualRadius * 2.0,
          data.radius * planetSizeScale * 5.0
        ); // Much larger and more visible
      }

      const segments =
        data.radius > 20000
          ? 64
          : data.type === "moon"
          ? 16
          : data.type === "asteroid"
          ? 8
          : 32;
      geometry = new THREE.SphereGeometry(scaledRadius, segments, segments);

      // Set initial color (will be overridden by texture if successful)
      materialProperties.color = data.color;

      if (data.type === "moon") {
        materialProperties.roughness =
          data.roughness !== undefined ? data.roughness : 0.9;
        materialProperties.metalness =
          data.metalness !== undefined ? data.metalness : 0.05;
      }

      // Special emissive properties for Uranus and Neptune
      if (data.name === "Uranus" || data.name === "Neptune") {
        materialProperties.emissive = new THREE.Color(data.color);
        materialProperties.emissiveIntensity =
          data.emissiveIntensity !== undefined ? data.emissiveIntensity : 0.25; // Default emissive without texture
      } else if (data.type !== "star") {
        materialProperties.emissive = new THREE.Color(0x000000);
        materialProperties.emissiveIntensity =
          data.emissiveIntensity !== undefined ? data.emissiveIntensity : 0;
      }

      if (data.type === "asteroid") {
        materialProperties.roughness =
          data.roughness !== undefined ? data.roughness : 0.95; // Very rough surfaces
        materialProperties.metalness =
          data.metalness !== undefined ? data.metalness : 0.02; // Mostly rocky
      }

      // Create material first
      material = new THREE.MeshStandardMaterial(materialProperties);

      // Then load texture with fallback capability
      if (data.textureUrl) {
        texture = loadTextureWithFallback(
          data.textureUrl,
          data.color,
          data.name,
          material,
          "map"
        );
        if (texture) {
          material.map = texture;
          material.color.set(0xffffff); // Use white when texture is present
        }
        // If texture fails, the error callback will set color to fallback

        // Adjust emissive for Uranus/Neptune with texture
        if ((data.name === "Uranus" || data.name === "Neptune") && texture) {
          materialProperties.emissiveIntensity = 0.1; // Reduced with texture
          material.emissiveIntensity = 0.1;
        }
      }
    }

    bodyMesh = new THREE.Mesh(geometry, material);
    bodyMesh.name = data.name;
    bodyMesh.userData = {
      ...data,
      scaledRadius: scaledRadius,
      originalRadius: scaledRadius, // Store original radius for scaling
      currentScale: 1.0, // Track current scale applied
      initialTextureUrl: data.textureUrl || null,
      initialEmissiveIntensity:
        material.emissiveIntensity !== undefined
          ? material.emissiveIntensity
          : 0,
      initialOpacity: material.opacity !== undefined ? material.opacity : 1,
      initialRoughness:
        material.roughness !== undefined
          ? material.roughness
          : data.type === "moon"
          ? 0.9
          : data.type === "star"
          ? 0.9
          : 0.8,
      initialMetalness:
        material.metalness !== undefined
          ? material.metalness
          : data.type === "moon"
          ? 0.05
          : data.type === "star"
          ? 0.1
          : 0.1,
      initialWireframe: material.wireframe || false,
      initialOrbitPathVisible: true,
    };
    bodyMesh.castShadow = data.type !== "star";
    bodyMesh.receiveShadow = data.type !== "star";

    const tiltedPole = new THREE.Group();
    tiltedPole.rotation.z = THREE.MathUtils.degToRad(data.axialTilt || 0);
    tiltedPole.add(bodyMesh);
    bodyMesh.userData.tiltedPole = tiltedPole;

    const pivot = new THREE.Group();
    pivot.add(tiltedPole);
    bodyMesh.userData.pivot = pivot;

    if (data.parent && objectLookup[data.parent]) {
      objectLookup[data.parent].userData.pivot.add(pivot);
    } else {
      scene.add(pivot);
    }

    if (data.type === "star" && sunLightRef) {
      sunLightRef.position.set(0, 0, 0);
      pivot.add(sunLightRef);
    }

    // Create lens flare for the Sun
    if (data.type === "star") {
      const lensFlareGroup = createSunLensFlare(pivot, scaledRadius);
      bodyMesh.userData.lensFlareGroup = lensFlareGroup;
      bodyMesh.userData.initialLensFlareVisible = true;
      bodyMesh.userData.lensFlareVisible = true;
    }

    // Create atmospheric glow for gas giants
    const gasGiants = ["Jupiter", "Saturn", "Uranus", "Neptune"];
    if (gasGiants.includes(data.name)) {
      const atmosphereGroup = createAtmosphericGlow(
        tiltedPole,
        scaledRadius,
        data.name
      );
      if (atmosphereGroup) {
        bodyMesh.userData.atmosphereGroup = atmosphereGroup;
        bodyMesh.userData.initialAtmosphericGlowVisible = true;
        bodyMesh.userData.atmosphericGlowVisible = true;
      }
    }

    // Create cloud layer for Earth
    if (data.name === "Earth") {
      const cloudRadius = scaledRadius * 1.01; // Slightly larger than Earth
      const cloudGeometry = new THREE.SphereGeometry(cloudRadius, 64, 64);

      // Create cloud material first
      const cloudMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 0.8,
        depthWrite: false, // Prevents z-fighting with Earth surface
        blending: THREE.NormalBlending,
        color: 0xffffff, // Default to white, will be used if texture loads
      });

      // Load cloud texture with fallback capability
      const cloudTexture = loadTextureWithFallback(
        "./images/2k_earth_clouds.jpg",
        0xffffff, // White fallback (clouds will still work even if texture fails)
        "Earth Clouds",
        cloudMaterial,
        "alphaMap"
      );

      if (cloudTexture) {
        cloudMaterial.alphaMap = cloudTexture;
      }

      const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloudMesh.name = "Earth Clouds";

      // Add cloud layer to Earth's tilted pole group for proper rotation
      tiltedPole.add(cloudMesh);

      // Store cloud mesh reference for potential future controls
      bodyMesh.userData.cloudMesh = cloudMesh;
      bodyMesh.userData.initialCloudVisible = true;
      bodyMesh.userData.cloudVisible = true;
    }

    celestialObjects.push(bodyMesh);
    objectLookup[data.name] = bodyMesh;

    if (data.hasRings) {
      const innerR_scaled = data.ringInnerRadius * planetSizeScale;
      const outerR_scaled = data.ringOuterRadius * planetSizeScale;

      // Enhanced ring implementation for Saturn with alpha texture
      if (data.name === "Saturn") {
        const ringConfig = RING_SYSTEMS.Saturn;
        let ringOpacity =
          data.initialRingOpacity !== undefined
            ? data.initialRingOpacity
            : ringConfig.defaultOpacity;
        bodyMesh.userData.initialRingOpacity = ringOpacity;

        // Create ring geometry using centralized config
        const ringGeometry = new THREE.RingGeometry(
          innerR_scaled,
          outerR_scaled,
          ringConfig.segments,
          ringConfig.radialSegments
        );

        // Create ring material with fallback color using centralized config
        const ringMaterial = new THREE.MeshBasicMaterial({
          transparent: ringConfig.material.transparent,
          opacity: ringOpacity,
          side: THREE.DoubleSide,
          depthWrite: ringConfig.material.depthWrite,
          fog: ringConfig.material.fog,
          color: data.ringColor || 0xd0b080, // Default ring color
          blending: THREE.NormalBlending, // Important for solid color transparency
        });

        // Always create the ring mesh
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.name = data.name + " Rings";
        ringMesh.rotation.x = -Math.PI / 2; // Rotate to lie in Saturn's equatorial plane

        // Try to load Saturn's ring texture with fallback capability
        const ringTexture = loadTextureWithFallback(
          ringConfig.textureUrl,
          data.ringColor || 0xd0b080, // Saturn's default ring color as fallback
          "Saturn Rings",
          ringMaterial,
          "map"
        );

        if (ringTexture) {
          // Success: Enhance material with high-quality texture using config
          console.log("🪐 Using high-quality textured rings for Saturn");

          // Configure texture using centralized config
          if (ringConfig.textureConfig.wrapS) {
            ringTexture.wrapS = THREE[ringConfig.textureConfig.wrapS];
          }
          if (ringConfig.textureConfig.wrapT) {
            ringTexture.wrapT = THREE[ringConfig.textureConfig.wrapT];
          }
          if (ringConfig.textureConfig.repeat) {
            ringTexture.repeat.set(...ringConfig.textureConfig.repeat);
          }
          if (ringConfig.textureConfig.useAnisotropy) {
            ringTexture.anisotropy = Math.min(
              8,
              renderer.capabilities.getMaxAnisotropy()
            );
          }

          ringMaterial.map = ringTexture;
          ringMaterial.alphaMap = ringTexture;
        } else {
          // Fallback: Use solid color rings with enhanced transparency support
          console.log("🪐 Using solid color fallback rings for Saturn");

          // Ensure proper transparency for solid color rings
          ringMaterial.transparent = true;
          ringMaterial.alphaTest = 0.001; // Helps with depth sorting
          ringMaterial.depthWrite = false; // Important for transparency
          ringMaterial.blending = THREE.NormalBlending;

          // Create a subtle gradient effect for better visual appearance
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 16;
          const ctx = canvas.getContext("2d");

          // Create radial-like gradient for rings
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          const baseColor = new THREE.Color(data.ringColor || 0xd0b080);

          // Add some variation to make rings more interesting
          for (let i = 0; i <= 10; i++) {
            const pos = i / 10;
            const alpha = 0.3 + Math.sin(pos * Math.PI * 6) * 0.2; // Varying transparency
            gradient.addColorStop(
              pos,
              `rgba(${Math.floor(baseColor.r * 255)}, ${Math.floor(
                baseColor.g * 255
              )}, ${Math.floor(baseColor.b * 255)}, ${alpha})`
            );
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const fallbackTexture = new THREE.CanvasTexture(canvas);
          fallbackTexture.wrapS = THREE.RepeatWrapping;
          fallbackTexture.wrapT = THREE.RepeatWrapping;

          ringMaterial.map = fallbackTexture;
          ringMaterial.alphaMap = fallbackTexture;
          console.log(
            "🎨 Generated procedural ring texture for better transparency"
          );
        }

        bodyMesh.userData.ringMesh = ringMesh;
        bodyMesh.userData.originalRingInnerRadius = innerR_scaled;
        bodyMesh.userData.originalRingOuterRadius = outerR_scaled;
        bodyMesh.userData.tiltedPole.add(ringMesh);
      } else {
        // Original procedural ring generation for other planets
        const ringGeometry = new THREE.RingGeometry(
          innerR_scaled,
          outerR_scaled,
          64
        );
        let ringOpacity =
          data.initialRingOpacity !== undefined
            ? data.initialRingOpacity
            : data.name === "Jupiter" ||
              data.name === "Uranus" ||
              data.name === "Neptune"
            ? 0.25
            : 0.7;

        bodyMesh.userData.initialRingOpacity = ringOpacity;

        const ringCanvas = document.createElement("canvas");
        ringCanvas.width = 256;
        ringCanvas.height = 16;
        const ringCtx = ringCanvas.getContext("2d");
        const gradient = ringCtx.createLinearGradient(
          0,
          0,
          ringCanvas.width,
          0
        );
        const baseRingColor = new THREE.Color(data.ringColor);
        const alphaBase = ringOpacity * 0.6;
        const alphaVariation = ringOpacity * 0.4;
        for (let i = 0; i <= 10; i++) {
          const pos = i / 10;
          const alpha =
            alphaBase +
            (Math.random() - 0.3) * alphaVariation * (ringOpacity / 0.7);
          gradient.addColorStop(
            pos,
            `rgba(${Math.floor(baseRingColor.r * 255)}, ${Math.floor(
              baseRingColor.g * 255
            )}, ${Math.floor(baseRingColor.b * 255)}, ${Math.max(
              0,
              Math.min(1, alpha)
            )})`
          );
        }
        ringCtx.fillStyle = gradient;
        ringCtx.fillRect(0, 0, ringCanvas.width, ringCanvas.height);
        const ringTexture = new THREE.CanvasTexture(ringCanvas);
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: ringOpacity,
          fog: false,
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.name = data.name + " Rings";
        bodyMesh.userData.ringMesh = ringMesh;
        bodyMesh.userData.originalRingInnerRadius = innerR_scaled;
        bodyMesh.userData.originalRingOuterRadius = outerR_scaled;
        bodyMesh.userData.tiltedPole.add(ringMesh);
      }
    }

    if (data.orbitalElements && data.parent) {
      const oe = data.orbitalElements;
      let scaled_a_for_orbit_path;
      if (data.type === "moon") {
        const parentPlanetObject = objectLookup[data.parent];
        let parentPlanetVisualRadius = 0.3;
        if (parentPlanetObject && parentPlanetObject.userData.scaledRadius) {
          parentPlanetVisualRadius = parentPlanetObject.userData.scaledRadius;
        }
        const moonOwnVisualRadius = bodyMesh.userData.scaledRadius;
        scaled_a_for_orbit_path =
          parentPlanetVisualRadius +
          moonOwnVisualRadius +
          MOON_VISUAL_ORBIT_GAP;
      } else {
        scaled_a_for_orbit_path = oe.a * distanceScale;
      }
      const i_rad = THREE.MathUtils.degToRad(oe.i);
      const Omega_rad = THREE.MathUtils.degToRad(oe.Omega);
      const w_rad = THREE.MathUtils.degToRad(oe.w);
      const Px_ref =
        Math.cos(w_rad) * Math.cos(Omega_rad) -
        Math.sin(w_rad) * Math.sin(Omega_rad) * Math.cos(i_rad);
      const Py_ref =
        Math.cos(w_rad) * Math.sin(Omega_rad) +
        Math.sin(w_rad) * Math.cos(Omega_rad) * Math.cos(i_rad);
      const Pz_ref = Math.sin(w_rad) * Math.sin(i_rad);
      const Qx_ref =
        -Math.sin(w_rad) * Math.cos(Omega_rad) -
        Math.cos(w_rad) * Math.sin(Omega_rad) * Math.cos(i_rad);
      const Qy_ref =
        -Math.sin(w_rad) * Math.sin(Omega_rad) +
        Math.cos(w_rad) * Math.cos(Omega_rad) * Math.cos(i_rad);
      const Qz_ref = Math.cos(w_rad) * Math.sin(i_rad);

      // Only create orbit paths for planets and moons, not asteroids (to avoid clutter)
      if (data.type !== "asteroid") {
        addOrbitPath(data, bodyMesh);
      }
    }
  }

  function animate() {
    animationFrameCounter++;
    requestAnimationFrame(animate);
    const deltaTimeSeconds = clock.getDelta();
    if (!renderer || !scene || !camera) return;

    if (!isPaused) {
      totalSimulatedTimeDays += deltaTimeSeconds * timeScale;
      if (document.getElementById("simTime")) {
        document.getElementById("simTime").textContent =
          totalSimulatedTimeDays.toFixed(2);
      }
      updateAllCelestialBodies(
        celestialObjects,
        totalSimulatedTimeDays,
        clock,
        timeScale
      );
    }

    // Update Sun lens flare
    const sunObject = objectLookup["Sun"];
    if (sunObject) {
      updateSunLensFlare(sunObject, camera);
    }

    if (
      followedObject &&
      followedObject.userData &&
      followedObject.userData.pivot &&
      orbitControls
    ) {
      const targetPosition = new THREE.Vector3();
      let objectToTrack =
        followedObject.userData.type === "star"
          ? followedObject
          : followedObject.userData.pivot;
      objectToTrack.getWorldPosition(targetPosition);
      orbitControls.target.copy(targetPosition);
    }
    if (orbitControls) orbitControls.update();

    // Use bloom composer if available and enabled, otherwise direct render
    if (composer && bloomEnabled) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  function setFocus(targetObject, instant = false) {
    if (!targetObject || !camera || !orbitControls) {
      return;
    }
    if (focusAnimationId) cancelAnimationFrame(focusAnimationId);

    const previouslyFocusedObject = settingsTargetObject;
    settingsTargetObject = targetObject;

    if (document.getElementById("currentFocus")) {
      document.getElementById("currentFocus").textContent = targetObject.name;
    }

    followedObject =
      targetObject.userData.type === "star" ? null : targetObject;

    if (settingsPanel && targetObject && targetObject.material) {
      objectNameDisplay.textContent = targetObject.name;
      const mat = targetObject.material;
      const userData = targetObject.userData;
      const isStandardMaterial = mat.isMeshStandardMaterial;

      if (
        settingsPanel.style.display === "none" ||
        previouslyFocusedObject !== targetObject
      ) {
        // Only reset collapse state if panel was hidden or target changed significantly
        materialSettingsContent.classList.add("collapsed");
        collapseIcon.textContent = "+";
        materialSettingsCollapsed = true;
      }
      // Always reset file input display for new object
      textureFileNameDisplay.textContent = "No file chosen";
      textureUploadInput.value = null;

      if (userData.description || userData.funFact) {
        objectDescription.textContent =
          userData.description || "No description available.";
        objectFunFact.textContent = userData.funFact || "";
        objectDetailsSection.style.display = "block";
      } else {
        objectDetailsSection.style.display = "none";
      }

      textureUploadControl.style.display = "block";

      emissionControl.style.display = "block";
      emissionSlider.disabled = !isStandardMaterial;
      emissionSliderLabel.classList.toggle(
        "disabled-control",
        !isStandardMaterial
      );
      if (isStandardMaterial) {
        emissionSlider.value =
          mat.emissiveIntensity !== undefined
            ? mat.emissiveIntensity
            : userData.initialEmissiveIntensity;
        emissionValueDisplay.textContent = parseFloat(
          emissionSlider.value
        ).toFixed(2);
      } else {
        emissionValueDisplay.textContent = "N/A";
      }

      opacityControl.style.display = "block";
      opacitySlider.disabled = false;
      opacitySliderLabel.classList.remove("disabled-control");
      opacitySlider.value =
        mat.opacity !== undefined ? mat.opacity : userData.initialOpacity;
      opacityValueDisplay.textContent = parseFloat(opacitySlider.value).toFixed(
        2
      );

      roughnessControl.style.display = isStandardMaterial ? "block" : "none";
      roughnessSlider.disabled = !isStandardMaterial;
      roughnessSliderLabel.classList.toggle(
        "disabled-control",
        !isStandardMaterial
      );
      if (isStandardMaterial) {
        roughnessSlider.value =
          mat.roughness !== undefined
            ? mat.roughness
            : userData.initialRoughness;
        roughnessValueDisplay.textContent = parseFloat(
          roughnessSlider.value
        ).toFixed(2);
      }

      metalnessControl.style.display = isStandardMaterial ? "block" : "none";
      metalnessSlider.disabled = !isStandardMaterial;
      metalnessSliderLabel.classList.toggle(
        "disabled-control",
        !isStandardMaterial
      );
      if (isStandardMaterial) {
        metalnessSlider.value =
          mat.metalness !== undefined
            ? mat.metalness
            : userData.initialMetalness;
        metalnessValueDisplay.textContent = parseFloat(
          metalnessSlider.value
        ).toFixed(2);
      }

      wireframeControl.style.display = "block";
      wireframeToggle.disabled = false;
      document
        .querySelector('label[for="wireframeToggle"]')
        .classList.remove("disabled-control");
      wireframeToggle.checked = mat.wireframe || userData.initialWireframe;

      if (userData.ringMesh && userData.ringMesh.material) {
        ringOpacityControl.style.display = "block"; // Now inside material settings
        ringOpacitySlider.disabled = false;
        ringOpacitySliderLabel.classList.remove("disabled-control");
        ringOpacitySlider.value = userData.ringMesh.material.opacity;
        ringOpacityValueDisplay.textContent = parseFloat(
          ringOpacitySlider.value
        ).toFixed(2);
      } else {
        ringOpacityControl.style.display = "none";
      }

      // Lens flare control (only for stars/Sun)
      if (userData.type === "star" && userData.lensFlareGroup) {
        lensFlareControl.style.display = "block";
        lensFlareToggle.disabled = false;
        document
          .querySelector('label[for="lensFlareToggle"]')
          .classList.remove("disabled-control");
        lensFlareToggle.checked = userData.lensFlareVisible;
      } else {
        lensFlareControl.style.display = "none";
      }

      settingsPanel.style.display = "block";
    } else if (settingsPanel) {
      settingsPanel.style.display = "none";
    }

    const targetWorldPosition = new THREE.Vector3();
    if (!targetObject.geometry) {
      console.warn("setFocus: Target object has no geometry.");
      return;
    }
    let objectToGetPositionFrom =
      targetObject.userData.type !== "star" && targetObject.userData.pivot
        ? targetObject.userData.pivot
        : targetObject;
    objectToGetPositionFrom.getWorldPosition(targetWorldPosition);
    let actualVisualRadius =
      targetObject.userData.scaledRadius || minVisualRadius;
    let camDistanceFactor = targetObject.userData.type === "star" ? 4 : 6;
    if (targetObject.userData.type === "planet") camDistanceFactor = 8;
    if (targetObject.userData.type === "moon") camDistanceFactor = 10;
    let camDistance = actualVisualRadius * camDistanceFactor;
    camDistance = Math.max(camDistance, actualVisualRadius + 0.2);
    camDistance = Math.max(camDistance, 0.5);
    const offsetDirection = new THREE.Vector3()
      .subVectors(camera.position, orbitControls.target)
      .normalize();
    if (offsetDirection.lengthSq() === 0) {
      offsetDirection.set(0, 0.3, 1).normalize();
    }
    const newCamPos = new THREE.Vector3().addVectors(
      targetWorldPosition,
      offsetDirection.multiplyScalar(camDistance)
    );
    const startPos = camera.position.clone();
    const startTargetView = orbitControls.target.clone();
    const finalTargetView = targetWorldPosition.clone();
    let t = 0;
    const duration = instant ? 0 : 0.75;
    animationClock.stop();
    animationClock.start();
    function animateFocusTransition() {
      if (duration === 0) {
        camera.position.copy(newCamPos);
        if (!followedObject) orbitControls.target.copy(finalTargetView);
        if (orbitControls.update) orbitControls.update();
        focusAnimationId = null;
        return;
      }
      const dt = animationClock.getDelta();
      t += dt / duration;
      t = Math.min(t, 1);
      const smooth_t = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPos, newCamPos, smooth_t);
      if (!followedObject) {
        orbitControls.target.lerpVectors(
          startTargetView,
          finalTargetView,
          smooth_t
        );
      }
      if (orbitControls.update) orbitControls.update();
      if (t < 1) {
        focusAnimationId = requestAnimationFrame(animateFocusTransition);
      } else {
        focusAnimationId = null;
        if (!followedObject) orbitControls.target.copy(finalTargetView);
      }
    }
    animateFocusTransition();
  }

  function togglePause(forceState) {
    const result = uiTogglePause(clock, timeScale, isPaused);
    isPaused = result.isPaused;
    if (result.timeScale !== undefined) {
      timeScale = result.timeScale;
    }
  }
  function resetSimulationTime() {
    const result = uiResetSimulationTime(clock, isPaused, (obj) =>
      updateCelestialBody(obj, 0, clock, timeScale)
    );
    totalSimulatedTimeDays = result.totalSimulatedTimeDays;
  }
  function handleTimeScaleChange(e) {
    const result = uiHandleTimeScaleChange(e, togglePause);
    if (result.timeScale !== undefined) {
      timeScale = result.timeScale;
    }
    if (result.isPaused !== undefined) {
      isPaused = result.isPaused;
    }
  }
  function resetCameraView() {
    const result = uiResetCameraView(focusAnimationId);
    if (result) {
      followedObject = result.followedObject;
      settingsTargetObject = result.settingsTargetObject;
      focusAnimationId = result.focusAnimationId;
    }
  }
}); // End of DOMContentLoaded
