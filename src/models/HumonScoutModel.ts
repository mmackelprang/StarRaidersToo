/**
 * Procedural Humon Scout ship model.
 * Recreated from the iOS HumonScout.scn asset using Babylon.js primitives.
 *
 * Design: Angular fuselage with swept wings — inspired by a TIE fighter aesthetic.
 * Physics bounding: 10w x 5h x 5d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createScoutHullMaterial, createCockpitMaterial, createEngineGlowMaterial } from './ShipMaterials';

export function createHumonScoutModel(scene: Scene, parent: TransformNode): void {
  const hull = createScoutHullMaterial(scene);
  const cockpitMat = createCockpitMaterial(scene);
  const glow = createEngineGlowMaterial(scene);

  // === Central fuselage (tapered, multi-section) ===
  // Main body
  const body = MeshBuilder.CreateBox('scout_body', { width: 2, height: 1.4, depth: 4.5 }, scene);
  body.material = hull;
  body.parent = parent;

  // Forward taper
  const nose = MeshBuilder.CreateCylinder('scout_nose', {
    height: 2.5, diameterTop: 0, diameterBottom: 2.2, tessellation: 8,
  }, scene);
  nose.rotation.x = Math.PI / 2;
  nose.position = new Vector3(0, 0, -3.5);
  nose.material = hull;
  nose.parent = parent;

  // Rear taper
  const tail = MeshBuilder.CreateCylinder('scout_tail', {
    height: 1.5, diameterTop: 2, diameterBottom: 1, tessellation: 8,
  }, scene);
  tail.rotation.x = Math.PI / 2;
  tail.position = new Vector3(0, 0, 2.8);
  tail.material = hull;
  tail.parent = parent;

  // === Cockpit canopy ===
  const cockpit = MeshBuilder.CreateSphere('scout_cockpit', { diameter: 1.6, segments: 16 }, scene);
  cockpit.position = new Vector3(0, 0.5, -1.2);
  cockpit.scaling = new Vector3(1, 0.7, 1.3);
  cockpit.material = cockpitMat;
  cockpit.parent = parent;

  // === Wings (swept, with thickness and detail) ===
  const createWing = (side: number, prefix: string) => {
    const x = side * 3.5;
    // Main wing spar
    const wing = MeshBuilder.CreateBox(`${prefix}_wing`, { width: 5, height: 0.15, depth: 3 }, scene);
    wing.position = new Vector3(x, 0, 0);
    wing.material = hull;
    wing.parent = parent;

    // Wing leading edge (angled)
    const leading = MeshBuilder.CreateBox(`${prefix}_lead`, { width: 4.5, height: 0.12, depth: 0.4 }, scene);
    leading.position = new Vector3(x, 0, -1.6);
    leading.rotation.y = side * 0.15;
    leading.material = hull;
    leading.parent = parent;

    // Wing trailing edge
    const trailing = MeshBuilder.CreateBox(`${prefix}_trail`, { width: 4, height: 0.12, depth: 0.3 }, scene);
    trailing.position = new Vector3(x, 0, 1.5);
    trailing.material = hull;
    trailing.parent = parent;

    // Wing strut (connecting wing to body)
    const strut = MeshBuilder.CreateBox(`${prefix}_strut`, { width: 0.3, height: 0.8, depth: 2 }, scene);
    strut.position = new Vector3(side * 1.2, 0, 0);
    strut.material = hull;
    strut.parent = parent;

    // Wingtip fin (vertical)
    const fin = MeshBuilder.CreateBox(`${prefix}_fin`, { width: 0.1, height: 1.2, depth: 1.5 }, scene);
    fin.position = new Vector3(side * 5.8, 0, 0);
    fin.material = hull;
    fin.parent = parent;
  };

  createWing(-1, 'scout_l');
  createWing(1, 'scout_r');

  // === Engine exhausts ===
  const createEngine = (xOff: number, name: string) => {
    // Engine housing
    const housing = MeshBuilder.CreateCylinder(name, {
      height: 1.5, diameter: 0.8, tessellation: 12,
    }, scene);
    housing.rotation.x = Math.PI / 2;
    housing.position = new Vector3(xOff, 0, 3.2);
    housing.material = hull;
    housing.parent = parent;

    // Exhaust glow
    const exhaust = MeshBuilder.CreateCylinder(`${name}_glow`, {
      height: 0.3, diameter: 0.6, tessellation: 12,
    }, scene);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position = new Vector3(xOff, 0, 3.9);
    exhaust.material = glow;
    exhaust.parent = parent;
  };

  createEngine(-0.7, 'scout_eng_l');
  createEngine(0.7, 'scout_eng_r');

  // === Hull ridge (dorsal spine) ===
  const spine = MeshBuilder.CreateBox('scout_spine', { width: 0.2, height: 0.3, depth: 3.5 }, scene);
  spine.position = new Vector3(0, 0.8, 0);
  spine.material = hull;
  spine.parent = parent;
}
