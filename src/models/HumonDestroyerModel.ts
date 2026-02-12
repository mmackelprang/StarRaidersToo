/**
 * Procedural Humon Destroyer (Hunter) ship model.
 * Recreated from the iOS HumonHunter.scn asset using Babylon.js primitives.
 *
 * Design: Larger, more angular and heavier than the scout.
 * Physics bounding: 10w x 5h x 5d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export function createHumonDestroyerModel(scene: Scene, parent: TransformNode): void {
  const mat = new StandardMaterial('destroyerMat', scene);
  mat.emissiveColor = new Color3(0.6, 0.0, 0.15);
  mat.diffuseColor = new Color3(0.4, 0.0, 0.1);

  // Heavy fuselage
  const body = MeshBuilder.CreateBox('dest_body', { width: 3.5, height: 2, depth: 6 }, scene);
  body.material = mat;
  body.parent = parent;

  // Forward spike
  const spike = MeshBuilder.CreateCylinder('dest_spike', {
    height: 4,
    diameterTop: 0,
    diameterBottom: 2,
    tessellation: 6,
  }, scene);
  spike.position = new Vector3(0, 0, -5);
  spike.rotation.x = Math.PI / 2;
  spike.material = mat;
  spike.parent = parent;

  // Left heavy wing
  const leftWing = MeshBuilder.CreateBox('dest_lwing', { width: 6, height: 0.4, depth: 4 }, scene);
  leftWing.position = new Vector3(-4, 0, 0);
  leftWing.material = mat;
  leftWing.parent = parent;

  // Right heavy wing
  const rightWing = MeshBuilder.CreateBox('dest_rwing', { width: 6, height: 0.4, depth: 4 }, scene);
  rightWing.position = new Vector3(4, 0, 0);
  rightWing.material = mat;
  rightWing.parent = parent;

  // Engine nacelles
  const nacelleMat = new StandardMaterial('nacelMat', scene);
  nacelleMat.emissiveColor = new Color3(0.8, 0.2, 0.0);

  const leftNacelle = MeshBuilder.CreateCylinder('dest_lnac', { height: 3, diameter: 1.2 }, scene);
  leftNacelle.position = new Vector3(-3, 0, 2);
  leftNacelle.rotation.x = Math.PI / 2;
  leftNacelle.material = nacelleMat;
  leftNacelle.parent = parent;

  const rightNacelle = MeshBuilder.CreateCylinder('dest_rnac', { height: 3, diameter: 1.2 }, scene);
  rightNacelle.position = new Vector3(3, 0, 2);
  rightNacelle.rotation.x = Math.PI / 2;
  rightNacelle.material = nacelleMat;
  rightNacelle.parent = parent;
}
