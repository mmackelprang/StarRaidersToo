/**
 * Procedural Humon Destroyer (Hunter) ship model.
 * Recreated from the iOS HumonHunter.scn asset using Babylon.js primitives.
 *
 * Design: Larger, more angular and heavier than the scout.
 * Physics bounding: 10w x 5h x 5d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createDestroyerHullMaterial, createCockpitMaterial, createEngineGlowMaterial } from './ShipMaterials';

export function createHumonDestroyerModel(scene: Scene, parent: TransformNode): void {
  const hull = createDestroyerHullMaterial(scene);
  const cockpitMat = createCockpitMaterial(scene);
  const glow = createEngineGlowMaterial(scene);

  // === Multi-section fuselage ===
  // Main hull (central body)
  const body = MeshBuilder.CreateBox('dest_body', { width: 3.5, height: 2, depth: 6 }, scene);
  body.material = hull;
  body.parent = parent;

  // Forward command section (narrower)
  const command = MeshBuilder.CreateBox('dest_cmd', { width: 2.5, height: 1.5, depth: 3 }, scene);
  command.position = new Vector3(0, 0.2, -4);
  command.material = hull;
  command.parent = parent;

  // Forward spike/ram
  const spike = MeshBuilder.CreateCylinder('dest_spike', {
    height: 4, diameterTop: 0, diameterBottom: 2.2, tessellation: 12,
  }, scene);
  spike.rotation.x = Math.PI / 2;
  spike.position = new Vector3(0, 0, -7);
  spike.material = hull;
  spike.parent = parent;

  // Rear engineering section
  const engineering = MeshBuilder.CreateBox('dest_eng_section', { width: 4, height: 2.2, depth: 2.5 }, scene);
  engineering.position = new Vector3(0, 0, 4);
  engineering.material = hull;
  engineering.parent = parent;

  // === Bridge tower (dorsal) ===
  const bridge = MeshBuilder.CreateBox('dest_bridge', { width: 1.8, height: 1.2, depth: 2 }, scene);
  bridge.position = new Vector3(0, 1.5, -1);
  bridge.material = hull;
  bridge.parent = parent;

  // Bridge viewport
  const viewport = MeshBuilder.CreateSphere('dest_viewport', { diameter: 1.2, segments: 16 }, scene);
  viewport.position = new Vector3(0, 1.8, -2);
  viewport.scaling = new Vector3(1, 0.5, 1);
  viewport.material = cockpitMat;
  viewport.parent = parent;

  // === Heavy wings ===
  const createWing = (side: number, prefix: string) => {
    const x = side * 4.5;

    // Main wing plate
    const wing = MeshBuilder.CreateBox(`${prefix}_wing`, { width: 6, height: 0.35, depth: 4 }, scene);
    wing.position = new Vector3(x, 0, 0);
    wing.material = hull;
    wing.parent = parent;

    // Wing leading edge wedge
    const leading = MeshBuilder.CreateBox(`${prefix}_lead`, { width: 5.5, height: 0.3, depth: 0.6 }, scene);
    leading.position = new Vector3(x, 0, -2.2);
    leading.material = hull;
    leading.parent = parent;

    // Wing surface greeble (panel detail)
    const panel = MeshBuilder.CreateBox(`${prefix}_panel`, { width: 2.5, height: 0.08, depth: 2 }, scene);
    panel.position = new Vector3(x + side * 0.5, 0.22, 0);
    panel.material = hull;
    panel.parent = parent;

    // Weapon hardpoint
    const turret = MeshBuilder.CreateCylinder(`${prefix}_turret`, {
      height: 0.8, diameter: 0.6, tessellation: 8,
    }, scene);
    turret.position = new Vector3(x + side * 2, 0.4, -1);
    turret.material = hull;
    turret.parent = parent;

    // Weapon barrel
    const barrel = MeshBuilder.CreateCylinder(`${prefix}_barrel`, {
      height: 1.5, diameter: 0.15, tessellation: 8,
    }, scene);
    barrel.rotation.x = Math.PI / 2;
    barrel.position = new Vector3(x + side * 2, 0.4, -2);
    barrel.material = hull;
    barrel.parent = parent;
  };

  createWing(-1, 'dest_l');
  createWing(1, 'dest_r');

  // === Engine nacelles ===
  const createNacelle = (xOff: number, name: string) => {
    // Nacelle body
    const nacelle = MeshBuilder.CreateCylinder(name, {
      height: 4, diameter: 1.4, tessellation: 12,
    }, scene);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position = new Vector3(xOff, -0.3, 3);
    nacelle.material = hull;
    nacelle.parent = parent;

    // Intake scoop
    const intake = MeshBuilder.CreateCylinder(`${name}_intake`, {
      height: 0.4, diameterTop: 1.6, diameterBottom: 1.2, tessellation: 12,
    }, scene);
    intake.rotation.x = Math.PI / 2;
    intake.position = new Vector3(xOff, -0.3, 0.8);
    intake.material = hull;
    intake.parent = parent;

    // Exhaust glow
    const exhaust = MeshBuilder.CreateCylinder(`${name}_glow`, {
      height: 0.4, diameter: 1.0, tessellation: 12,
    }, scene);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position = new Vector3(xOff, -0.3, 5.2);
    exhaust.material = glow;
    exhaust.parent = parent;

    // Pylon connecting nacelle to body
    const pylon = MeshBuilder.CreateBox(`${name}_pylon`, { width: 0.3, height: 0.6, depth: 2.5 }, scene);
    pylon.position = new Vector3(xOff, 0.3, 3);
    pylon.material = hull;
    pylon.parent = parent;
  };

  createNacelle(-3.5, 'dest_nac_l');
  createNacelle(3.5, 'dest_nac_r');

  // === Ventral keel ===
  const keel = MeshBuilder.CreateBox('dest_keel', { width: 0.6, height: 0.8, depth: 5 }, scene);
  keel.position = new Vector3(0, -1.2, 0);
  keel.material = hull;
  keel.parent = parent;

  // === Dorsal antenna ===
  const antenna = MeshBuilder.CreateCylinder('dest_antenna', {
    height: 1.5, diameter: 0.08, tessellation: 6,
  }, scene);
  antenna.position = new Vector3(0, 2.8, -1);
  antenna.material = hull;
  antenna.parent = parent;
}
