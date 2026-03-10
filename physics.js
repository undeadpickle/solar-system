// physics.js - Orbital mechanics and physics calculations for the solar system simulation

import {
  distanceScale,
  planetSizeScale,
  MOON_VISUAL_ORBIT_GAP,
} from "./celestialBodyData.js";

import { scene, objectLookup } from "./threeSetup.js";

/**
 * Creates a transformation matrix for moon orbits from ecliptic to parent planet's equatorial plane
 * @param {Object} moonData - Moon data containing orbital elements
 * @param {THREE.Mesh} parentPlanet - Parent planet object with userData.axialTilt
 * @returns {THREE.Matrix4} Transformation matrix for moon's orbital plane
 */
export function getMoonOrbitMatrix(moonData, parentPlanet) {
  const parentTilt = parentPlanet.userData.axialTilt || 0;
  const parentRotation = parentPlanet.userData.currentRotation || 0;

  // Transform moon's orbital elements from ecliptic to parent's equatorial plane
  const tiltMatrix = new THREE.Matrix4().makeRotationX(
    THREE.MathUtils.degToRad(parentTilt)
  );
  const rotationMatrix = new THREE.Matrix4().makeRotationY(parentRotation);

  // Apply transformations
  const combinedMatrix = new THREE.Matrix4().multiplyMatrices(
    rotationMatrix,
    tiltMatrix
  );

  return combinedMatrix;
}

// Pre-allocated reusable objects to avoid per-frame GC pressure
const _tempVec3 = new THREE.Vector3();
const _tempVec3b = new THREE.Vector3();
const _rotMatrix = { Px: 0, Py: 0, Pz: 0, Qx: 0, Qy: 0, Qz: 0 };

/**
 * Calculates the orbital rotation matrix elements from orbital angles.
 * Writes results into the provided output object to avoid allocation.
 * @param {number} w_rad - Argument of perihelion in radians
 * @param {number} Omega_rad - Longitude of ascending node in radians
 * @param {number} i_rad - Inclination in radians
 * @param {Object} out - Output object with Px, Py, Pz, Qx, Qy, Qz properties
 * @returns {Object} The output object (same reference as `out`)
 */
function calculateRotationMatrix(w_rad, Omega_rad, i_rad, out) {
  const cosW = Math.cos(w_rad), sinW = Math.sin(w_rad);
  const cosO = Math.cos(Omega_rad), sinO = Math.sin(Omega_rad);
  const cosI = Math.cos(i_rad), sinI = Math.sin(i_rad);
  out.Px = cosW * cosO - sinW * sinO * cosI;
  out.Py = cosW * sinO + sinW * cosO * cosI;
  out.Pz = sinW * sinI;
  out.Qx = -sinW * cosO - cosW * sinO * cosI;
  out.Qy = -sinW * sinO + cosW * cosO * cosI;
  out.Qz = cosW * sinI;
  return out;
}

/**
 * Creates a visual orbit path line for a celestial body
 * @param {number} scaled_a - Semi-major axis (scaled for visualization)
 * @param {number} e - Eccentricity
 * @param {number} Px_ref - P vector x component in reference frame
 * @param {number} Py_ref - P vector y component in reference frame
 * @param {number} Pz_ref - P vector z component in reference frame
 * @param {number} Qx_ref - Q vector x component in reference frame
 * @param {number} Qy_ref - Q vector y component in reference frame
 * @param {number} Qz_ref - Q vector z component in reference frame
 * @returns {THREE.Group} The orbit path group ready to be added to scene
 */
export function createOrbitPathLine(
  scaled_a,
  e,
  Px_ref,
  Py_ref,
  Pz_ref,
  Qx_ref,
  Qy_ref,
  Qz_ref
) {
  const points = [];
  const segments = 128;
  const scaled_b = scaled_a * Math.sqrt(Math.max(0, 1 - e * e));
  const ellipseCurve = new THREE.EllipseCurve(
    0,
    0,
    scaled_a,
    scaled_b,
    0,
    2 * Math.PI,
    false,
    0
  );
  const curvePoints = ellipseCurve.getPoints(segments);
  const focusOffset = scaled_a * e;
  for (let p of curvePoints) {
    points.push(new THREE.Vector3(p.x - focusOffset, 0, p.y));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.3,
    fog: false,
  });
  const lineMesh = new THREE.Line(geometry, material);
  const orbitLineGroup = new THREE.Group();
  orbitLineGroup.add(lineMesh);
  const P_vec_scene = new THREE.Vector3(Px_ref, Pz_ref, Py_ref).normalize();
  const Q_vec_scene_initial = new THREE.Vector3(Qx_ref, Qz_ref, Qy_ref);
  const N_vec_scene = new THREE.Vector3()
    .crossVectors(P_vec_scene, Q_vec_scene_initial)
    .normalize();
  const Q_vec_scene_final = new THREE.Vector3()
    .crossVectors(N_vec_scene, P_vec_scene)
    .normalize();
  orbitLineGroup.matrixAutoUpdate = false;
  orbitLineGroup.matrix.makeBasis(P_vec_scene, N_vec_scene, Q_vec_scene_final);
  return orbitLineGroup;
}

/**
 * Updates the position and rotation of a celestial body based on current simulation time
 * Uses Keplerian orbital elements for realistic orbital mechanics
 * @param {THREE.Mesh} body - The celestial body mesh to update
 * @param {number} currentSimTimeDays - Current simulation time in days
 * @param {THREE.Clock} clock - THREE.js clock for timing calculations
 * @param {number} timeScale - Current time scale multiplier
 */
export function updateCelestialBody(
  body,
  currentSimTimeDays,
  clock,
  timeScale
) {
  const data = body.userData;

  // Handle rotation
  if (data.tiltedPole && data.rotationPeriod) {
    const rotationPeriodDays = data.rotationPeriod / 24;
    if (rotationPeriodDays !== 0) {
      const rotationSpeedRadPerDay = (Math.PI * 2) / rotationPeriodDays;
      const rotationThisFrame =
        rotationSpeedRadPerDay * (clock.getDelta() * timeScale);
      data.tiltedPole.rotation.y += rotationThisFrame;

      // Handle Earth cloud layer rotation (slightly faster than planet)
      if (data.name === "Earth" && data.cloudMesh) {
        const cloudRotationMultiplier = 5.0; // Faster than planet for visible atmospheric motion
        data.cloudMesh.rotation.y +=
          rotationThisFrame * cloudRotationMultiplier;
      }
    }
  }

  // Handle orbital motion
  if (data.orbitalElements && data.parent && data.pivot) {
    const oe = data.orbitalElements;
    if (oe.period === 0) return;

    // Calculate mean motion
    const n_rad_per_day = (2 * Math.PI) / oe.period;
    const M0_rad = THREE.MathUtils.degToRad(oe.M);
    let M_current_rad =
      (M0_rad + n_rad_per_day * currentSimTimeDays) % (2 * Math.PI);
    if (M_current_rad < 0) M_current_rad += 2 * Math.PI;

    // Solve Kepler's equation using Newton-Raphson method
    let E_rad = M_current_rad;
    const maxIter = 10;
    const tol = 1e-7;
    for (let i = 0; i < maxIter; i++) {
      const E_prev = E_rad;
      const f_E = E_rad - oe.e * Math.sin(E_rad) - M_current_rad;
      const f_prime_E = 1 - oe.e * Math.cos(E_rad);
      if (Math.abs(f_prime_E) < 1e-10) break;
      E_rad = E_rad - f_E / f_prime_E;
      if (Math.abs(E_rad - E_prev) < tol) break;
    }
    if (isNaN(E_rad)) {
      return;
    }

    // Calculate true anomaly
    const nu_rad =
      2 *
      Math.atan2(
        Math.sqrt(1 + oe.e) * Math.sin(E_rad / 2),
        Math.sqrt(1 - oe.e) * Math.cos(E_rad / 2)
      );

    // Calculate position in orbital plane
    const r_km = oe.a * (1 - oe.e * Math.cos(E_rad));
    const x_orb_km = r_km * Math.cos(nu_rad);
    const y_orb_km = r_km * Math.sin(nu_rad);

    // Transform to reference frame using orbital elements
    const i_rad = THREE.MathUtils.degToRad(oe.i);
    const Omega_rad = THREE.MathUtils.degToRad(oe.Omega);
    const w_rad = THREE.MathUtils.degToRad(oe.w);

    // Calculate rotation matrix elements
    calculateRotationMatrix(w_rad, Omega_rad, i_rad, _rotMatrix);

    // Calculate position in reference frame
    let posX_ref_km = _rotMatrix.Px * x_orb_km + _rotMatrix.Qx * y_orb_km;
    let posY_ref_km = _rotMatrix.Py * x_orb_km + _rotMatrix.Qy * y_orb_km;
    let posZ_ref_km = _rotMatrix.Pz * x_orb_km + _rotMatrix.Qz * y_orb_km;

    // Apply moon orbital transformation if this is a moon
    if (data.type === "moon" && data.parent) {
      const parentPlanetObject = objectLookup[data.parent];
      if (parentPlanetObject) {
        // Get the transformation matrix from ecliptic to parent's equatorial plane
        const moonTransformMatrix = getMoonOrbitMatrix(
          data,
          parentPlanetObject
        );

        // Apply transformation to the calculated position
        _tempVec3.set(posX_ref_km, posY_ref_km, posZ_ref_km);
        _tempVec3.applyMatrix4(moonTransformMatrix);

        posX_ref_km = _tempVec3.x;
        posY_ref_km = _tempVec3.y;
        posZ_ref_km = _tempVec3.z;
      }
    }

    // Scale to scene units and convert coordinate system
    let finalX = posX_ref_km * distanceScale;
    let finalY = posZ_ref_km * distanceScale;
    let finalZ = posY_ref_km * distanceScale;

    // Special handling for moons - use visual orbit radius instead of scaled physical distance
    if (data.type === "moon") {
      const parentPlanetObject = objectLookup[data.parent];
      let parentPlanetVisualRadius = 0;
      if (parentPlanetObject && parentPlanetObject.userData.scaledRadius) {
        parentPlanetVisualRadius = parentPlanetObject.userData.scaledRadius;
      }
      const moonOwnVisualRadius = data.scaledRadius;
      const direction = _tempVec3.set(finalX, finalY, finalZ).normalize();
      if (direction.lengthSq() === 0) {
        direction.set(1, 0, 0);
      }
      const moonVisualOrbitRadius =
        parentPlanetVisualRadius + moonOwnVisualRadius + MOON_VISUAL_ORBIT_GAP;
      finalX = direction.x * moonVisualOrbitRadius;
      finalY = direction.y * moonVisualOrbitRadius;
      finalZ = direction.z * moonVisualOrbitRadius;
    }

    // Update the body's position
    data.pivot.position.set(finalX, finalY, finalZ);
  }
}

/**
 * Updates all celestial bodies in the simulation
 * @param {Array} celestialObjects - Array of celestial body meshes
 * @param {number} currentSimTimeDays - Current simulation time in days
 * @param {THREE.Clock} clock - THREE.js clock for timing calculations
 * @param {number} timeScale - Current time scale multiplier
 */
export function updateAllCelestialBodies(
  celestialObjects,
  currentSimTimeDays,
  clock,
  timeScale
) {
  celestialObjects.forEach((obj) =>
    updateCelestialBody(obj, currentSimTimeDays, clock, timeScale)
  );
}

/**
 * Calculates orbit path parameters for a celestial body and adds it to the scene
 * @param {Object} data - Celestial body data containing orbital elements
 * @param {THREE.Mesh} bodyMesh - The body mesh that needs an orbit path
 */
export function addOrbitPath(data, bodyMesh) {
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
        parentPlanetVisualRadius + moonOwnVisualRadius + MOON_VISUAL_ORBIT_GAP;
    } else {
      scaled_a_for_orbit_path = oe.a * distanceScale;
    }

    // Calculate rotation matrix elements for orbit path orientation
    const i_rad = THREE.MathUtils.degToRad(oe.i);
    const Omega_rad = THREE.MathUtils.degToRad(oe.Omega);
    const w_rad = THREE.MathUtils.degToRad(oe.w);
    const rm = calculateRotationMatrix(w_rad, Omega_rad, i_rad, { Px: 0, Py: 0, Pz: 0, Qx: 0, Qy: 0, Qz: 0 });

    // Apply moon orbital transformation to P and Q vectors if this is a moon
    let finalPx_ref = rm.Px,
      finalPy_ref = rm.Py,
      finalPz_ref = rm.Pz;
    let finalQx_ref = rm.Qx,
      finalQy_ref = rm.Qy,
      finalQz_ref = rm.Qz;

    if (data.type === "moon" && data.parent) {
      const parentPlanetObject = objectLookup[data.parent];
      if (parentPlanetObject) {
        const moonTransformMatrix = getMoonOrbitMatrix(
          data,
          parentPlanetObject
        );

        // Transform P and Q vectors
        const P_vector = new THREE.Vector3(rm.Px, rm.Py, rm.Pz);
        P_vector.applyMatrix4(moonTransformMatrix);
        finalPx_ref = P_vector.x;
        finalPy_ref = P_vector.y;
        finalPz_ref = P_vector.z;

        const Q_vector = new THREE.Vector3(rm.Qx, rm.Qy, rm.Qz);
        Q_vector.applyMatrix4(moonTransformMatrix);
        finalQx_ref = Q_vector.x;
        finalQy_ref = Q_vector.y;
        finalQz_ref = Q_vector.z;
      }
    }

    // Create the orbit path
    const orbitPathGroup = createOrbitPathLine(
      scaled_a_for_orbit_path,
      oe.e,
      finalPx_ref,
      finalPy_ref,
      finalPz_ref,
      finalQx_ref,
      finalQy_ref,
      finalQz_ref
    );

    // Add to scene hierarchy
    if (objectLookup[data.parent] && objectLookup[data.parent].userData.pivot) {
      objectLookup[data.parent].userData.pivot.add(orbitPathGroup);
    } else {
      scene.add(orbitPathGroup);
    }

    // Store reference to orbit path for visibility control
    bodyMesh.userData.orbitPath = orbitPathGroup.children[0];
    bodyMesh.userData.orbitPath.visible =
      bodyMesh.userData.initialOrbitPathVisible;
  }
}
