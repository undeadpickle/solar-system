/**
 * Cosmic Voyage — Cinematic guided journey through the solar system.
 *
 * Manages camera choreography, state machine, overlay DOM, and timing.
 * Integrates with main.js via callback API (closure state access).
 */

import { VOYAGE_STOPS, VOYAGE_CONFIG } from "./cosmicVoyageData.js";
import { AU, distanceScale } from "./celestialBodyData.js";

// Pre-allocated vectors (per lessons.md — no per-frame allocations)
const _targetPos = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _approachPoint = new THREE.Vector3();
const _orbitOffset = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

/**
 * Smoothstep easing — same as main.js setFocus (line 1947)
 */
function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

/**
 * Compute travel duration from light-minute delta.
 */
function computeTravelDuration(fromLightMin, toLightMin) {
  const delta = Math.abs(toLightMin - fromLightMin);
  const raw = delta * VOYAGE_CONFIG.travelTimeMultiplier;
  return Math.max(VOYAGE_CONFIG.minTravelSeconds, Math.min(raw, VOYAGE_CONFIG.maxTravelSeconds));
}

/**
 * Get world position for a voyage stop.
 * For virtual stops (asteroid belt), computes position from AU.
 */
function getStopWorldPosition(stop, objectLookup, outVec) {
  if (stop.isVirtualStop) {
    const sceneDistance = stop.virtualPositionAU * AU * distanceScale;
    outVec.set(sceneDistance, 0, 0);
    return true;
  }

  const mesh = objectLookup[stop.targetName];
  if (!mesh) return false;

  const pivot = mesh.userData.type === "star" ? mesh : mesh.userData.pivot;
  if (pivot) {
    pivot.getWorldPosition(outVec);
  } else {
    mesh.getWorldPosition(outVec);
  }
  return true;
}

/**
 * Get scaled visual radius for a stop's body.
 */
function getStopRadius(stop, objectLookup) {
  if (stop.isVirtualStop) return 1.0;
  const mesh = objectLookup[stop.targetName];
  if (!mesh) return 1.0;
  return mesh.userData.scaledRadius || 1.0;
}

/**
 * Convert spherical coordinates to a cartesian offset vector.
 * theta = azimuth, phi = polar from Y-up, dist = distance
 */
function sphericalToOffset(theta, phi, dist, outVec) {
  outVec.set(
    dist * Math.sin(phi) * Math.cos(theta),
    dist * Math.cos(phi),
    dist * Math.sin(phi) * Math.sin(theta)
  );
  return outVec;
}

// Pause/play button text (safe — no HTML injection)
const PAUSE_SYMBOL = "\u23F8\u23F8"; // ⏸⏸
const PLAY_SYMBOL = "\u25B6";        // ▶


export class CosmicVoyage {
  /**
   * @param {object} opts
   * @param {THREE.Camera} opts.camera
   * @param {THREE.OrbitControls} opts.orbitControls
   * @param {object} opts.objectLookup
   * @param {function} opts.getTimeScale
   * @param {function} opts.setTimeScale
   * @param {function} opts.setFollowedObject
   * @param {function} opts.setFocus
   */
  constructor(opts) {
    this.camera = opts.camera;
    this.controls = opts.orbitControls;
    this.objectLookup = opts.objectLookup;
    this.getTimeScale = opts.getTimeScale;
    this.setTimeScale = opts.setTimeScale;
    this.setFollowedObject = opts.setFollowedObject;
    this.setFocusCallback = opts.setFocus;

    // State machine
    this._state = "idle"; // idle | traveling | approaching | orbiting | departing
    this._stopIndex = 0;
    this._phaseTime = 0;
    this._phaseDuration = 0;
    this._paused = false;

    // Saved state for restore
    this._savedTimeScale = 1;

    // Camera interpolation
    this._startCamPos = new THREE.Vector3();
    this._startLookTarget = new THREE.Vector3();
    this._departTarget = new THREE.Vector3();

    // Orbit phase
    this._orbitAngle = 0;

    // Approach spline
    this._approachCurve = null;

    // Light-travel countdown
    this._lightTimeRemaining = 0;
    this._lightTimeDelta = 0;

    // Staggered overlay timeouts (cleared on phase change)
    this._overlayTimeouts = [];

    // DOM cache
    this._domCached = false;
    this._dom = {};
  }

  // --- Public API ---

  get isActive() { return this._state !== "idle"; }
  get currentStopIndex() { return this._stopIndex; }
  get state() { return this._state; }

  start() {
    if (this.isActive) return;

    this._cacheDom();
    this._savedTimeScale = this.getTimeScale();
    this.setFollowedObject(null);

    this._stopIndex = 0;
    this._paused = false;

    document.body.classList.add("voyage-active");
    if (this._dom.overlay) this._dom.overlay.style.display = "block";

    this._buildProgressDots();
    this._enterOrbit();
  }

  stop() {
    if (!this.isActive) return;

    this._clearOverlayTimeouts();
    this.setTimeScale(this._savedTimeScale);
    this.controls.enabled = true;

    document.body.classList.remove("voyage-active");
    if (this._dom.overlay) this._dom.overlay.style.display = "none";
    this._hideAllOverlays();

    // Sync UI to current stop body (clamp index for end-of-voyage case)
    const clampedIndex = Math.min(this._stopIndex, VOYAGE_STOPS.length - 1);
    const stop = VOYAGE_STOPS[clampedIndex];
    if (stop && !stop.isVirtualStop && this.setFocusCallback) {
      const mesh = this.objectLookup[stop.targetName];
      if (mesh) this.setFocusCallback(mesh);
    }

    this._state = "idle";
  }

  pause() {
    this._paused = true;
    if (this._dom.pauseBtn) this._dom.pauseBtn.textContent = PLAY_SYMBOL;
  }

  resume() {
    this._paused = false;
    if (this._dom.pauseBtn) this._dom.pauseBtn.textContent = PAUSE_SYMBOL;
  }

  togglePause() {
    if (this._paused) this.resume();
    else this.pause();
  }

  skipToNext() {
    if (!this.isActive) return;
    this._clearOverlayTimeouts();
    this._hideAllOverlays();
    if (this._stopIndex < VOYAGE_STOPS.length - 1) {
      this._stopIndex++;
      this._enterOrbit();
    } else {
      this.stop();
    }
  }

  skipToPrevious() {
    if (!this.isActive) return;
    this._clearOverlayTimeouts();
    this._hideAllOverlays();
    if (this._stopIndex > 0) {
      this._stopIndex--;
      this._enterOrbit();
    }
  }

  /**
   * Called from animate() each frame.
   */
  update(dt) {
    if (!this.isActive || this._paused) return;

    this._phaseTime += dt;
    const t = this._phaseDuration > 0
      ? Math.min(this._phaseTime / this._phaseDuration, 1)
      : 1;

    switch (this._state) {
      case "traveling": this._updateTraveling(dt, t); break;
      case "approaching": this._updateApproaching(dt, t); break;
      case "orbiting": this._updateOrbiting(dt, t); break;
      case "departing": this._updateDeparting(dt, t); break;
    }
  }

  // --- Phase Updates ---

  _updateTraveling(dt, t) {
    const stop = VOYAGE_STOPS[this._stopIndex];
    const eased = smoothstep(t);

    // Get live destination position
    getStopWorldPosition(stop, this.objectLookup, _targetPos);
    const radius = getStopRadius(stop, this.objectLookup);
    const cam = stop.camera;

    // Approach point: offset from body
    sphericalToOffset(cam.approachFrom.theta, cam.approachFrom.phi, radius * cam.approachFrom.distance, _approachPoint);
    _approachPoint.add(_targetPos);

    // Lerp camera toward live approach point
    _camPos.lerpVectors(this._startCamPos, _approachPoint, eased);
    this.camera.position.copy(_camPos);

    // Lerp look target from departure to destination
    _lookTarget.lerpVectors(this._startLookTarget, _targetPos, eased);
    this.controls.target.copy(_lookTarget);

    // Update countdown
    this._lightTimeRemaining = this._lightTimeDelta * (1 - t);
    this._updateLightTimeDisplay();

    if (t >= 1) {
      this._enterApproach();
    }
  }

  _updateApproaching(dt, t) {
    if (!this._approachCurve) {
      this._enterOrbit();
      return;
    }

    const eased = smoothstep(t);
    this._approachCurve.getPointAt(eased, _camPos);
    this.camera.position.copy(_camPos);

    const stop = VOYAGE_STOPS[this._stopIndex];
    getStopWorldPosition(stop, this.objectLookup, _targetPos);
    this.controls.target.copy(_targetPos);

    if (t >= 1) {
      this._enterOrbit();
    }
  }

  _updateOrbiting(dt, t) {
    const stop = VOYAGE_STOPS[this._stopIndex];
    getStopWorldPosition(stop, this.objectLookup, _targetPos);
    const radius = getStopRadius(stop, this.objectLookup);
    const cam = stop.camera;

    this._orbitAngle += cam.orbitSpeed * dt;

    const orbitDist = radius * cam.orbitRadius;
    _orbitOffset.set(
      Math.cos(this._orbitAngle) * orbitDist,
      orbitDist * 0.3,
      Math.sin(this._orbitAngle) * orbitDist
    );

    this.camera.position.copy(_targetPos).add(_orbitOffset);
    this.controls.target.copy(_targetPos);

    if (t >= 1) {
      this._enterDepart();
    }
  }

  _updateDeparting(dt, t) {
    const eased = smoothstep(t);

    // Pull camera back along the departure vector
    _camPos.lerpVectors(this._startCamPos, this._departTarget, eased);
    this.camera.position.copy(_camPos);

    if (t >= 1) {
      this._stopIndex++;
      if (this._stopIndex >= VOYAGE_STOPS.length) {
        this.stop();
        return;
      }
      this._enterTravel();
    }
  }

  // --- Phase Transitions ---

  _enterOrbit() {
    this._state = "orbiting";
    this._phaseTime = 0;
    const stop = VOYAGE_STOPS[this._stopIndex];
    this._phaseDuration = stop.camera.orbitDuration;
    this._orbitAngle = stop.camera.approachFrom.theta || 0;

    this.setTimeScale(VOYAGE_CONFIG.orbitTimeScale);
    this.controls.enabled = false;

    this._hideTravelInfo();
    this._showPlanetReveal(stop);
    this._updateProgress();
  }

  _enterTravel() {
    this._state = "traveling";
    this._phaseTime = 0;

    const prevStop = VOYAGE_STOPS[this._stopIndex - 1] || VOYAGE_STOPS[0];
    const nextStop = VOYAGE_STOPS[this._stopIndex];

    this._phaseDuration = computeTravelDuration(prevStop.lightMinutesFromSun, nextStop.lightMinutesFromSun);
    this._lightTimeDelta = Math.abs(nextStop.lightMinutesFromSun - prevStop.lightMinutesFromSun);
    this._lightTimeRemaining = this._lightTimeDelta;

    this._startCamPos.copy(this.camera.position);
    getStopWorldPosition(prevStop, this.objectLookup, this._startLookTarget);

    this.setTimeScale(VOYAGE_CONFIG.travelTimeScale);
    this.controls.enabled = false;

    this._hidePlanetReveal();
    this._showTravelInfo(nextStop);
  }

  _enterApproach() {
    this._state = "approaching";
    this._phaseTime = 0;
    this._phaseDuration = VOYAGE_CONFIG.approachDuration;

    const stop = VOYAGE_STOPS[this._stopIndex];
    getStopWorldPosition(stop, this.objectLookup, _targetPos);
    const radius = getStopRadius(stop, this.objectLookup);
    const cam = stop.camera;

    const start = this.camera.position.clone();
    const orbitDist = radius * cam.orbitRadius;
    const orbitStart = _targetPos.clone().add(
      sphericalToOffset(cam.approachFrom.theta, cam.approachFrom.phi, orbitDist, _approachPoint)
    );

    const mid = new THREE.Vector3().lerpVectors(start, orbitStart, 0.5);
    mid.y += orbitDist * 0.4;

    this._approachCurve = new THREE.CatmullRomCurve3([start, mid, orbitStart]);
    this.controls.enabled = false;

    this._hideTravelInfo();
  }

  _enterDepart() {
    this._state = "departing";
    this._phaseTime = 0;
    this._phaseDuration = VOYAGE_CONFIG.departDuration;

    this._startCamPos.copy(this.camera.position);

    // Pull-back target: move camera away from body center
    const stop = VOYAGE_STOPS[this._stopIndex];
    getStopWorldPosition(stop, this.objectLookup, _targetPos);
    const pullDir = new THREE.Vector3().subVectors(this.camera.position, _targetPos).normalize();
    const radius = getStopRadius(stop, this.objectLookup);
    this._departTarget.copy(this.camera.position).add(pullDir.multiplyScalar(radius * 3));

    this._hidePlanetReveal();
  }

  // --- DOM / Overlay Management ---

  _cacheDom() {
    if (this._domCached) return;
    this._dom = {
      overlay: document.getElementById("voyageOverlay"),
      travelInfo: document.getElementById("voyageTravelInfo"),
      lightTime: document.getElementById("voyageLightTime"),
      planetReveal: document.getElementById("voyagePlanetReveal"),
      planetName: document.getElementById("voyagePlanetName"),
      subtitle: document.getElementById("voyagePlanetSubtitle"),
      fact: document.getElementById("voyagePlanetFact"),
      scaleComparison: document.getElementById("voyageScaleComparison"),
      progressFill: document.getElementById("voyageProgressFill"),
      progressStops: document.getElementById("voyageProgressStops"),
      pauseBtn: document.getElementById("voyagePauseResume"),
    };
    this._domCached = true;
  }

  _clearOverlayTimeouts() {
    this._overlayTimeouts.forEach(id => clearTimeout(id));
    this._overlayTimeouts = [];
  }

  _showTravelInfo(stop) {
    if (!this._dom.travelInfo) return;
    this._dom.travelInfo.classList.add("voyage-visible");
    if (this._dom.lightTime) {
      const label = stop.overlay?.title || stop.targetName || "Asteroid Belt";
      this._dom.lightTime.textContent = this._formatLightTime(this._lightTimeDelta) + " to " + label;
    }
  }

  _hideTravelInfo() {
    if (this._dom.travelInfo) this._dom.travelInfo.classList.remove("voyage-visible");
  }

  _showPlanetReveal(stop) {
    if (!this._dom.planetReveal) return;

    if (this._dom.planetName) this._dom.planetName.textContent = stop.overlay.title;
    if (this._dom.subtitle) this._dom.subtitle.textContent = stop.overlay.subtitle;
    if (this._dom.fact) this._dom.fact.textContent = stop.overlay.fact;
    if (this._dom.scaleComparison) this._dom.scaleComparison.textContent = stop.overlay.scaleComparison;

    // Title appears immediately
    this._dom.planetReveal.classList.add("voyage-visible");
    if (this._dom.planetName) this._dom.planetName.classList.add("voyage-visible");

    // Stagger children
    this._clearOverlayTimeouts();
    const stagger = [
      [this._dom.subtitle, VOYAGE_CONFIG.subtitleDelay],
      [this._dom.fact, VOYAGE_CONFIG.factDelay],
      [this._dom.scaleComparison, VOYAGE_CONFIG.scaleDelay],
    ];
    stagger.forEach(([el, delay]) => {
      if (!el) return;
      el.classList.remove("voyage-visible");
      const id = setTimeout(() => el.classList.add("voyage-visible"), delay * 1000);
      this._overlayTimeouts.push(id);
    });
  }

  _hidePlanetReveal() {
    this._clearOverlayTimeouts();
    if (!this._dom.planetReveal) return;
    this._dom.planetReveal.classList.remove("voyage-visible");
    [this._dom.planetName, this._dom.subtitle, this._dom.fact, this._dom.scaleComparison]
      .forEach(el => { if (el) el.classList.remove("voyage-visible"); });
  }

  _hideAllOverlays() {
    this._hideTravelInfo();
    this._hidePlanetReveal();
  }

  _updateLightTimeDisplay() {
    if (!this._dom.lightTime) return;
    const stop = VOYAGE_STOPS[this._stopIndex];
    const label = stop.overlay?.title || stop.targetName || "Asteroid Belt";
    this._dom.lightTime.textContent = this._formatLightTime(this._lightTimeRemaining) + " to " + label;
  }

  _updateProgress() {
    if (!this._dom.progressFill) return;
    const pct = (this._stopIndex / (VOYAGE_STOPS.length - 1)) * 100;
    this._dom.progressFill.style.width = pct + "%";

    const dots = this._dom.progressStops?.children;
    if (dots) {
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle("voyage-stop-active", i === this._stopIndex);
        dots[i].classList.toggle("voyage-stop-visited", i < this._stopIndex);
      }
    }
  }

  _buildProgressDots() {
    if (!this._dom.progressStops) return;
    // Clear existing dots safely
    while (this._dom.progressStops.firstChild) {
      this._dom.progressStops.removeChild(this._dom.progressStops.firstChild);
    }
    VOYAGE_STOPS.forEach((stop, i) => {
      const dot = document.createElement("div");
      dot.className = "voyage-stop-dot";
      dot.title = stop.overlay?.title || "Asteroid Belt";
      dot.style.left = ((i / (VOYAGE_STOPS.length - 1)) * 100) + "%";
      this._dom.progressStops.appendChild(dot);
    });
  }

  _formatLightTime(minutes) {
    if (minutes < 1) return Math.max(1, Math.round(minutes * 60)) + "s";
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.round((minutes % 1) * 60);
    if (h > 0) return h + "h " + m + "m";
    return m + "m " + s + "s";
  }
}
