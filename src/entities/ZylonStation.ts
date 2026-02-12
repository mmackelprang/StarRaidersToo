/**
 * Zylon space station — provides repair services.
 * Ported from ZylonGameViewController starbase logic.
 *
 * The station rotates slowly (360 degrees per 90 seconds)
 * and initiates a repair beam after 3.25 seconds, completing
 * full repair at 8 seconds.
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SectorObject } from '@/entities/SectorObject';
import { ObjectType } from '@/core/types';

export class ZylonStation extends SectorObject {
  /** Rotation speed: 360 degrees / 90 seconds = 4 deg/s ≈ 0.0698 rad/s */
  private static readonly ROTATION_SPEED = (2 * Math.PI) / 90;

  constructor(scene: Scene) {
    super('zylonStation', scene, ObjectType.ZylonStation);

    // Placeholder geometry (Phase 6 will create detailed model)
    const hub = MeshBuilder.CreateCylinder(
      'station_hub',
      { height: 2, diameter: 6, tessellation: 8 },
      scene,
    );
    hub.parent = this;

    const mat = new StandardMaterial('station_mat', scene);
    mat.emissiveColor = new Color3(0.1, 0.3, 0.8);
    hub.material = mat;

    // Arms radiating from hub
    for (let i = 0; i < 4; i++) {
      const arm = MeshBuilder.CreateBox(
        `station_arm_${i}`,
        { width: 12, height: 0.5, depth: 1 },
        scene,
      );
      arm.parent = this;
      arm.rotation.y = (Math.PI / 2) * i;
      arm.material = mat;
    }

    this.position = new Vector3(0, 0, -50);
  }

  /** Per-frame update — rotate the station slowly */
  update(deltaSeconds: number): void {
    this.rotation.y += ZylonStation.ROTATION_SPEED * deltaSeconds;
  }
}
