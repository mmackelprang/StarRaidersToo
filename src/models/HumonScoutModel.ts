/**
 * Procedural Humon Scout ship model.
 * Recreated from the iOS HumonScout.scn asset using Babylon.js primitives.
 *
 * Design: Angular fuselage with swept wings — inspired by a TIE fighter aesthetic.
 * Physics bounding: 10w x 5h x 5d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export function createHumonScoutModel(scene: Scene, parent: TransformNode): void {
  const mat = new StandardMaterial('scoutMat', scene);
  mat.emissiveColor = new Color3(0.5, 0.08, 0.08);
  mat.diffuseColor = new Color3(0.3, 0.05, 0.05);

  // Central fuselage
  const body = MeshBuilder.CreateBox('scout_body', { width: 2, height: 1.5, depth: 4 }, scene);
  body.material = mat;
  body.parent = parent;

  // Cockpit sphere
  const cockpit = MeshBuilder.CreateSphere('scout_cockpit', { diameter: 2, segments: 8 }, scene);
  const cockpitMat = new StandardMaterial('scoutCockpit', scene);
  cockpitMat.emissiveColor = new Color3(0.2, 0.05, 0.05);
  cockpit.material = cockpitMat;
  cockpit.parent = parent;

  // Left wing
  const leftWing = MeshBuilder.CreateBox('scout_lwing', { width: 5, height: 0.2, depth: 3 }, scene);
  leftWing.position = new Vector3(-3, 0, 0);
  leftWing.material = mat;
  leftWing.parent = parent;

  // Right wing
  const rightWing = MeshBuilder.CreateBox('scout_rwing', { width: 5, height: 0.2, depth: 3 }, scene);
  rightWing.position = new Vector3(3, 0, 0);
  rightWing.material = mat;
  rightWing.parent = parent;
}
