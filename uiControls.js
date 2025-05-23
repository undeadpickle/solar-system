import { solarSystemData, initialCameraPosition } from "./celestialBodyData.js";

import {
  renderer,
  camera,
  orbitControls,
  scene,
  celestialObjects,
  objectLookup,
  textureLoader,
} from "./threeSetup.js";

/**
 * Setup planet selector dropdown
 * @param {Function} setFocusCallback - Callback to set focus on selected object
 */
export function setupPlanetSelector(setFocusCallback) {
  const planetSelector = document.getElementById("planetSelector");
  if (planetSelector) {
    solarSystemData.forEach((data) => {
      if (data.type === "star" || data.type === "planet") {
        const option = document.createElement("option");
        option.value = data.name;
        option.textContent = data.name;
        planetSelector.appendChild(option);
      }
    });
    planetSelector.addEventListener("change", (event) => {
      const selectedName = event.target.value;
      if (selectedName && objectLookup[selectedName]) {
        setFocusCallback(objectLookup[selectedName]);
      }
    });
  }
}

/**
 * Setup UI event listeners for settings panel and controls
 * @param {Object} handlers - Object containing all handler functions
 * @param {Object} uiElements - Object containing UI element references
 */
export function setupUIEventListeners(handlers, uiElements) {
  const {
    handleTextureUpload,
    handleClearTexture,
    handleResetAllObjectSettings,
    handleEmissionChange,
    handleOpacityChange,
    handleRoughnessChange,
    handleMetalnessChange,
    handleWireframeToggle,
    handleOrbitPathToggle,
    handleRingOpacityChange,
    onCanvasClick,
    handleTimeScaleChange,
    togglePause,
    resetSimulationTime,
    resetCameraView,
  } = handlers;

  const {
    materialSettingsHeader,
    materialSettingsContent,
    collapseIcon,
    textureUploadInput,
    clearTextureButton,
    resetAllObjectSettingsButton,
    emissionSlider,
    opacitySlider,
    roughnessSlider,
    metalnessSlider,
    wireframeToggle,
    orbitPathToggle,
    ringOpacitySlider,
    lensFlareToggle,
    atmosphericGlowToggle,
    bloomEffectsToggle,
  } = uiElements;

  // Material settings collapsible header
  materialSettingsHeader.addEventListener("click", () => {
    materialSettingsContent.classList.toggle("collapsed");
    const materialSettingsCollapsed =
      materialSettingsContent.classList.contains("collapsed");
    collapseIcon.textContent = materialSettingsCollapsed ? "+" : "-";
  });

  // Set initial state of material settings to collapsed
  materialSettingsContent.classList.add("collapsed");
  collapseIcon.textContent = "+";

  // Settings panel event listeners
  textureUploadInput.addEventListener("change", handleTextureUpload);
  clearTextureButton.addEventListener("click", handleClearTexture);
  resetAllObjectSettingsButton.addEventListener(
    "click",
    handleResetAllObjectSettings
  );

  emissionSlider.addEventListener("input", handleEmissionChange);
  opacitySlider.addEventListener("input", handleOpacityChange);
  roughnessSlider.addEventListener("input", handleRoughnessChange);
  metalnessSlider.addEventListener("input", handleMetalnessChange);
  wireframeToggle.addEventListener("change", handleWireframeToggle);
  orbitPathToggle.addEventListener("change", handleOrbitPathToggle);
  ringOpacitySlider.addEventListener("input", handleRingOpacityChange);

  // Canvas click for object selection
  renderer.domElement.removeEventListener("click", onCanvasClick);
  renderer.domElement.addEventListener("click", onCanvasClick);

  // Time and camera control event listeners
  document
    .getElementById("timeScaleInput")
    .addEventListener("input", handleTimeScaleChange);
  document
    .getElementById("pauseButton")
    .addEventListener("click", () => togglePause());
  document
    .getElementById("resetTimeButton")
    .addEventListener("click", resetSimulationTime);
  document
    .getElementById("resetViewButton")
    .addEventListener("click", resetCameraView);
}

/**
 * Handle canvas click for object selection
 */
export function onCanvasClick(event, setFocusCallback) {
  if (!camera || !renderer || celestialObjects.length === 0) {
    return;
  }
  const mouse = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(celestialObjects, false);
  if (intersects.length > 0) {
    const targetObject = intersects[0].object;
    if (targetObject && targetObject.userData.name) {
      setFocusCallback(targetObject, false);
    }
  }
}

// --- Time Control Functions ---
export function togglePause(clock, timeScale, isPaused) {
  const newIsPaused = !isPaused;
  const pauseButton = document.getElementById("pauseButton");
  if (pauseButton) {
    pauseButton.textContent = newIsPaused ? "Resume" : "Pause";
    pauseButton.style.backgroundColor = newIsPaused ? "#28a745" : "#007bff";
  }
  if (newIsPaused) clock.stop();
  else {
    if (!clock.running) clock.start();
  }
  if (timeScale === 0 && !newIsPaused) {
    const finalIsPaused = true;
    if (clock) clock.stop();
    if (pauseButton) {
      pauseButton.textContent = "Resume";
      pauseButton.style.backgroundColor = "#28a745";
    }
    return { isPaused: finalIsPaused, timeScale };
  }

  return { isPaused: newIsPaused, timeScale };
}

export function resetSimulationTime(clock, isPaused, updateCelestialBody) {
  const totalSimulatedTimeDays = 0;
  if (clock) {
    clock.stop();
    clock.start();
    if (isPaused) clock.stop();
  }
  const simTimeDisplay = document.getElementById("simTime");
  if (simTimeDisplay) simTimeDisplay.textContent = "0.00";
  celestialObjects.forEach((obj) => updateCelestialBody(obj, 0));
  if (renderer && scene && camera) renderer.render(scene, camera);

  return { totalSimulatedTimeDays };
}

export function handleTimeScaleChange(e, togglePauseCallback) {
  const newTimeScale = parseFloat(e.target.value);
  if (!isNaN(newTimeScale)) {
    if (newTimeScale === 0) {
      const pauseState = togglePauseCallback(true);
      return { timeScale: newTimeScale, isPaused: pauseState.isPaused };
    }
    return { timeScale: newTimeScale };
  }
  return {};
}

export function resetCameraView(focusAnimationId) {
  console.log("Resetting camera view.");
  if (focusAnimationId) cancelAnimationFrame(focusAnimationId);

  camera.position.set(
    initialCameraPosition.x,
    initialCameraPosition.y,
    initialCameraPosition.z
  );
  if (orbitControls) {
    orbitControls.target.set(0, 0, 0);
    orbitControls.update();
  }
  if (document.getElementById("currentFocus")) {
    document.getElementById("currentFocus").textContent =
      "Solar System Overview";
  }
  const planetSelector = document.getElementById("planetSelector");
  if (planetSelector) {
    planetSelector.value = "";
  }
  const settingsPanel = document.getElementById("settingsPanel");
  if (settingsPanel) settingsPanel.style.display = "none";

  return {
    followedObject: null,
    settingsTargetObject: null,
    focusAnimationId: null,
  };
}

// --- Settings Panel Event Handlers ---
export function handleTextureUpload(
  event,
  settingsTargetObject,
  textureFileNameDisplay
) {
  if (!settingsTargetObject || !settingsTargetObject.material) return;
  const file = event.target.files[0];
  if (file) {
    textureFileNameDisplay.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const newTexture = textureLoader.load(
        e.target.result,
        () => {
          if (settingsTargetObject.material.map)
            settingsTargetObject.material.map.dispose();
          if (settingsTargetObject.material.emissiveMap)
            settingsTargetObject.material.emissiveMap.dispose();

          if (settingsTargetObject.userData.type === "star") {
            settingsTargetObject.material.emissiveMap = newTexture;
            settingsTargetObject.material.emissive.set(0xffffff);
          } else {
            settingsTargetObject.material.map = newTexture;
            settingsTargetObject.material.color.set(0xffffff);
          }
          newTexture.colorSpace = THREE.SRGBColorSpace;
          settingsTargetObject.material.needsUpdate = true;
          console.log(`Texture updated for ${settingsTargetObject.name}`);
        },
        undefined,
        (error) => {
          console.error(
            `Error loading uploaded texture for ${settingsTargetObject.name}:`,
            error
          );
          alert(`Failed to load texture: ${error.message || "Unknown error"}`);
          textureFileNameDisplay.textContent = "Upload failed. No file chosen.";
        }
      );
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      alert("Error reading file.");
      textureFileNameDisplay.textContent = "Error reading file.";
    };
    reader.readAsDataURL(file);
  } else {
    textureFileNameDisplay.textContent = "No file chosen";
  }
}

export function handleClearTexture(
  settingsTargetObject,
  textureUploadInput,
  textureFileNameDisplay
) {
  if (!settingsTargetObject || !settingsTargetObject.material) return;
  const mat = settingsTargetObject.material;
  const userData = settingsTargetObject.userData;

  console.log(
    `Clearing texture for ${userData.name}. Initial URL: ${userData.initialTextureUrl}`
  );

  if (mat.map) {
    mat.map.dispose();
    mat.map = null;
  }
  if (mat.emissiveMap) {
    mat.emissiveMap.dispose();
    mat.emissiveMap = null;
  }

  if (userData.initialTextureUrl) {
    const originalTexture = textureLoader.load(
      userData.initialTextureUrl,
      () => {
        if (userData.type === "star") {
          mat.emissiveMap = originalTexture;
          mat.emissive.set(0xffffff);
        } else {
          mat.map = originalTexture;
          mat.color.set(0xffffff);
        }
        originalTexture.colorSpace = THREE.SRGBColorSpace;
        mat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.error("Error reloading initial texture: ", err);
        if (userData.type !== "star" && mat.color)
          mat.color.setHex(userData.color);
        if (userData.type === "star" && mat.emissive)
          mat.emissive.setHex(userData.color);
      }
    );
  } else {
    if (userData.type !== "star" && mat.color) mat.color.setHex(userData.color);
    if (userData.type === "star" && mat.emissive)
      mat.emissive.setHex(userData.color);
    if (userData.type === "star")
      mat.emissiveIntensity = userData.initialEmissiveIntensity;
  }
  mat.needsUpdate = true;
  textureUploadInput.value = null;
  textureFileNameDisplay.textContent = "No file chosen";
}

export function handleResetAllObjectSettings(
  settingsTargetObject,
  uiElements,
  handleClearTextureCallback
) {
  if (!settingsTargetObject || !settingsTargetObject.material) return;
  const mat = settingsTargetObject.material;
  const userData = settingsTargetObject.userData;

  console.log(`Resetting ALL settings for ${userData.name}`);

  // Reset material properties (including texture via handleClearTexture)
  handleClearTextureCallback();

  const {
    emissionSlider,
    emissionValueDisplay,
    roughnessSlider,
    roughnessValueDisplay,
    metalnessSlider,
    metalnessValueDisplay,
    opacitySlider,
    opacityValueDisplay,
    wireframeToggle,
    orbitPathToggle,
    ringOpacitySlider,
    ringOpacityValueDisplay,
    lensFlareToggle,
    atmosphericGlowToggle,
    bloomEffectsToggle,
  } = uiElements;

  if (mat.isMeshStandardMaterial) {
    mat.emissiveIntensity = userData.initialEmissiveIntensity;
    if (userData.type === "star") {
      mat.emissive.setHex(userData.color);
      if (mat.emissiveMap) mat.emissive.set(0xffffff);
    } else if (mat.emissive) {
      mat.emissive.setHex(0x000000);
      if (
        (userData.name === "Uranus" || userData.name === "Neptune") &&
        !mat.emissiveMap
      ) {
        mat.emissive.setHex(userData.color);
      }
    }

    mat.roughness = userData.initialRoughness;
    mat.metalness = userData.initialMetalness;

    emissionSlider.value = mat.emissiveIntensity;
    emissionValueDisplay.textContent = mat.emissiveIntensity.toFixed(2);
    roughnessSlider.value = mat.roughness;
    roughnessValueDisplay.textContent = mat.roughness.toFixed(2);
    metalnessSlider.value = mat.metalness;
    metalnessValueDisplay.textContent = mat.metalness.toFixed(2);
  }

  mat.opacity = userData.initialOpacity;
  mat.transparent = mat.opacity < 1;
  mat.wireframe = userData.initialWireframe;
  mat.needsUpdate = true;

  opacitySlider.value = mat.opacity;
  opacityValueDisplay.textContent = mat.opacity.toFixed(2);
  wireframeToggle.checked = mat.wireframe;

  // Reset Orbit Path Visibility
  if (userData.orbitPath) {
    userData.orbitPath.visible = userData.initialOrbitPathVisible;
    orbitPathToggle.checked = userData.orbitPath.visible;
  }

  // Reset Ring Opacity
  if (userData.ringMesh && userData.ringMesh.material) {
    userData.ringMesh.material.opacity = userData.initialRingOpacity;
    userData.ringMesh.material.transparent = userData.initialRingOpacity < 1;
    userData.ringMesh.material.needsUpdate = true;
    ringOpacitySlider.value = userData.initialRingOpacity;
    ringOpacityValueDisplay.textContent =
      userData.initialRingOpacity.toFixed(2);
  }

  // Reset Lens Flare Visibility (only for stars)
  if (userData.type === "star" && userData.lensFlareGroup) {
    userData.lensFlareVisible = userData.initialLensFlareVisible;
    userData.lensFlareGroup.visible = userData.lensFlareVisible;
    if (lensFlareToggle) {
      lensFlareToggle.checked = userData.lensFlareVisible;
    }
  }

  // Reset Atmospheric Glow Visibility (only for gas giants)
  const gasGiants = ["Jupiter", "Saturn", "Uranus", "Neptune"];
  if (gasGiants.includes(userData.name) && userData.atmosphereGroup) {
    userData.atmosphericGlowVisible = userData.initialAtmosphericGlowVisible;
    userData.atmosphereGroup.visible = userData.atmosphericGlowVisible;
    if (atmosphericGlowToggle) {
      atmosphericGlowToggle.checked = userData.atmosphericGlowVisible;
    }
  }
}

export function handleEmissionChange(
  event,
  settingsTargetObject,
  emissionValueDisplay
) {
  if (
    settingsTargetObject &&
    settingsTargetObject.material &&
    settingsTargetObject.material.isMeshStandardMaterial
  ) {
    const intensity = parseFloat(event.target.value);
    settingsTargetObject.material.emissiveIntensity = intensity;
    emissionValueDisplay.textContent = intensity.toFixed(2);
    if (
      !settingsTargetObject.material.emissiveMap &&
      intensity > 0 &&
      settingsTargetObject.material.emissive.getHexString() === "000000"
    ) {
      const baseColorHex = settingsTargetObject.userData.color || 0xffffff;
      settingsTargetObject.material.emissive.setHex(baseColorHex);
    }
  }
}

export function handleOpacityChange(
  event,
  settingsTargetObject,
  opacityValueDisplay
) {
  if (settingsTargetObject && settingsTargetObject.material) {
    const opacity = parseFloat(event.target.value);
    settingsTargetObject.material.opacity = opacity;
    settingsTargetObject.material.transparent = opacity < 1;
    settingsTargetObject.material.needsUpdate = true;
    opacityValueDisplay.textContent = opacity.toFixed(2);
  }
}

export function handleRoughnessChange(
  event,
  settingsTargetObject,
  roughnessValueDisplay
) {
  if (
    settingsTargetObject &&
    settingsTargetObject.material &&
    settingsTargetObject.material.isMeshStandardMaterial
  ) {
    const value = parseFloat(event.target.value);
    settingsTargetObject.material.roughness = value;
    roughnessValueDisplay.textContent = value.toFixed(2);
  }
}

export function handleMetalnessChange(
  event,
  settingsTargetObject,
  metalnessValueDisplay
) {
  if (
    settingsTargetObject &&
    settingsTargetObject.material &&
    settingsTargetObject.material.isMeshStandardMaterial
  ) {
    const value = parseFloat(event.target.value);
    settingsTargetObject.material.metalness = value;
    metalnessValueDisplay.textContent = value.toFixed(2);
  }
}

export function handleWireframeToggle(event, settingsTargetObject) {
  if (settingsTargetObject && settingsTargetObject.material) {
    settingsTargetObject.material.wireframe = event.target.checked;
  }
}

export function handleOrbitPathToggle(event, settingsTargetObject) {
  if (settingsTargetObject && settingsTargetObject.userData.orbitPath) {
    settingsTargetObject.userData.orbitPath.visible = event.target.checked;
  }
}

export function handleRingOpacityChange(
  event,
  settingsTargetObject,
  ringOpacityValueDisplay
) {
  if (
    settingsTargetObject &&
    settingsTargetObject.userData.ringMesh &&
    settingsTargetObject.userData.ringMesh.material
  ) {
    const opacity = parseFloat(event.target.value);
    settingsTargetObject.userData.ringMesh.material.opacity = opacity;
    settingsTargetObject.userData.ringMesh.material.transparent = opacity < 1;
    settingsTargetObject.userData.ringMesh.material.needsUpdate = true;
    ringOpacityValueDisplay.textContent = opacity.toFixed(2);
  }
}
