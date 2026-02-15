/**
 * Procedural Zylon Station model.
 * Recreated from the iOS zylonStation.scn asset using Babylon.js primitives.
 *
 * Design: Central hub dome with 4 radiating arms, hanging pylons, and accent lights.
 * References iOS screenshot: dome-shaped top, structural trusses, amber lighting.
 * Physics bounding: 10w x 10h x 10d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import {
  createStationHullMaterial,
  createStationArmMaterial,
  createStationLightMaterial,
} from './ShipMaterials';

export function createZylonStationModel(scene: Scene, parent: TransformNode): void {
  const hull = createStationHullMaterial(scene);
  const arm = createStationArmMaterial(scene);
  const light = createStationLightMaterial(scene);

  // === Central hub (multi-tiered) ===
  // Upper dome
  const dome = MeshBuilder.CreateSphere('station_dome', {
    diameter: 7, segments: 20, slice: 0.5,
  }, scene);
  dome.position = new Vector3(0, 0.5, 0);
  dome.material = hull;
  dome.parent = parent;

  // Main disc body
  const disc = MeshBuilder.CreateCylinder('station_disc', {
    height: 1.5, diameter: 8, tessellation: 24,
  }, scene);
  disc.material = hull;
  disc.parent = parent;

  // Lower hull ring
  const lowerRing = MeshBuilder.CreateCylinder('station_lower', {
    height: 1, diameterTop: 8, diameterBottom: 6, tessellation: 24,
  }, scene);
  lowerRing.position = new Vector3(0, -1.2, 0);
  lowerRing.material = hull;
  lowerRing.parent = parent;

  // Docking ring (outer)
  const dockRing = MeshBuilder.CreateTorus('station_dock_ring', {
    diameter: 10, thickness: 0.6, tessellation: 32,
  }, scene);
  dockRing.position = new Vector3(0, -0.3, 0);
  dockRing.material = arm;
  dockRing.parent = parent;

  // === Central spire (ventral) ===
  const spire = MeshBuilder.CreateCylinder('station_spire', {
    height: 6, diameterTop: 0.8, diameterBottom: 1.5, tessellation: 12,
  }, scene);
  spire.position = new Vector3(0, -5, 0);
  spire.material = hull;
  spire.parent = parent;

  // Spire base connector
  const spireBase = MeshBuilder.CreateCylinder('station_spire_base', {
    height: 1, diameterTop: 1.5, diameterBottom: 2.5, tessellation: 12,
  }, scene);
  spireBase.position = new Vector3(0, -1.8, 0);
  spireBase.material = hull;
  spireBase.parent = parent;

  // === Radiating arms (4x with trusses and modules) ===
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Main arm beam (upper truss)
    const armBeam = MeshBuilder.CreateBox(`station_arm_${i}`, {
      width: 0.6, height: 0.4, depth: 12,
    }, scene);
    armBeam.position = new Vector3(cos * 6, 0, sin * 6);
    armBeam.rotation.y = -angle + Math.PI / 2;
    armBeam.material = arm;
    armBeam.parent = parent;

    // Lower truss beam (parallel)
    const lowerBeam = MeshBuilder.CreateBox(`station_arm_low_${i}`, {
      width: 0.4, height: 0.3, depth: 12,
    }, scene);
    lowerBeam.position = new Vector3(cos * 6, -1.2, sin * 6);
    lowerBeam.rotation.y = -angle + Math.PI / 2;
    lowerBeam.material = arm;
    lowerBeam.parent = parent;

    // Vertical struts connecting upper and lower beams
    for (let j = 0; j < 3; j++) {
      const t = (j + 1) / 4;
      const strutDist = 2 + t * 9;
      const strut = MeshBuilder.CreateBox(`station_strut_${i}_${j}`, {
        width: 0.15, height: 1.2, depth: 0.15,
      }, scene);
      strut.position = new Vector3(cos * strutDist, -0.6, sin * strutDist);
      strut.material = arm;
      strut.parent = parent;
    }

    // End module (pod at tip of arm)
    const pod = MeshBuilder.CreateSphere(`station_pod_${i}`, {
      diameter: 2, segments: 12,
    }, scene);
    pod.position = new Vector3(cos * 11.5, -0.3, sin * 11.5);
    pod.scaling = new Vector3(1, 0.7, 1);
    pod.material = hull;
    pod.parent = parent;

    // Pod antenna
    const antenna = MeshBuilder.CreateCylinder(`station_antenna_${i}`, {
      height: 2, diameter: 0.06, tessellation: 6,
    }, scene);
    antenna.position = new Vector3(cos * 11.5, 1.0, sin * 11.5);
    antenna.material = arm;
    antenna.parent = parent;

    // Hanging pylon below each arm
    const pylon = MeshBuilder.CreateCylinder(`station_pylon_${i}`, {
      height: 3, diameterTop: 0.3, diameterBottom: 0.15, tessellation: 8,
    }, scene);
    pylon.position = new Vector3(cos * 7, -3.5, sin * 7);
    pylon.material = arm;
    pylon.parent = parent;

    // Amber running light on each arm
    const runLight = MeshBuilder.CreateSphere(`station_light_${i}`, {
      diameter: 0.4, segments: 8,
    }, scene);
    runLight.position = new Vector3(cos * 9, 0.4, sin * 9);
    runLight.material = light;
    runLight.parent = parent;
  }

  // === Dome viewport windows (ring of small emissive dots) ===
  const windowCount = 8;
  for (let i = 0; i < windowCount; i++) {
    const a = (Math.PI * 2 / windowCount) * i;
    const win = MeshBuilder.CreateSphere(`station_win_${i}`, {
      diameter: 0.35, segments: 6,
    }, scene);
    win.position = new Vector3(Math.cos(a) * 3, 1.5, Math.sin(a) * 3);
    win.material = light;
    win.parent = parent;
  }

  // === Top beacon ===
  const beacon = MeshBuilder.CreateSphere('station_beacon', {
    diameter: 0.6, segments: 8,
  }, scene);
  beacon.position = new Vector3(0, 4, 0);
  beacon.material = light;
  beacon.parent = parent;

  // Beacon mast
  const mast = MeshBuilder.CreateCylinder('station_mast', {
    height: 1.5, diameter: 0.1, tessellation: 6,
  }, scene);
  mast.position = new Vector3(0, 3.2, 0);
  mast.material = arm;
  mast.parent = parent;
}
