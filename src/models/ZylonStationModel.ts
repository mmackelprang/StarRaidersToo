/**
 * Procedural Zylon Station model.
 * Recreated from the iOS zylonStation.scn asset using Babylon.js primitives.
 *
 * Design: Central hub with 4 radiating arms and a slow 360deg/90s rotation.
 * Physics bounding: 10w x 10h x 10d (matches iOS SCNBox).
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export function createZylonStationModel(scene: Scene, parent: TransformNode): void {
  const hubMat = new StandardMaterial('stationHubMat', scene);
  hubMat.emissiveColor = new Color3(0.1, 0.3, 0.7);
  hubMat.diffuseColor = new Color3(0.05, 0.15, 0.5);

  const armMat = new StandardMaterial('stationArmMat', scene);
  armMat.emissiveColor = new Color3(0.15, 0.25, 0.6);

  // Central hub — octagonal cylinder
  const hub = MeshBuilder.CreateCylinder('station_hub', {
    height: 3,
    diameter: 6,
    tessellation: 8,
  }, scene);
  hub.material = hubMat;
  hub.parent = parent;

  // Docking ring
  const ring = MeshBuilder.CreateTorus('station_ring', {
    diameter: 8,
    thickness: 0.5,
    tessellation: 16,
  }, scene);
  ring.material = armMat;
  ring.parent = parent;

  // 4 radiating arms
  for (let i = 0; i < 4; i++) {
    const arm = MeshBuilder.CreateBox(`station_arm_${i}`, {
      width: 14,
      height: 0.6,
      depth: 1.2,
    }, scene);
    arm.rotation.y = (Math.PI / 2) * i;
    arm.material = armMat;
    arm.parent = parent;

    // Tip module at end of each arm
    const tip = MeshBuilder.CreateSphere(`station_tip_${i}`, {
      diameter: 1.5,
      segments: 6,
    }, scene);
    const angle = (Math.PI / 2) * i;
    tip.position = new Vector3(Math.cos(angle) * 7, 0, Math.sin(angle) * 7);
    tip.material = hubMat;
    tip.parent = parent;
  }
}
