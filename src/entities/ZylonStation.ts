/**
 * Zylon space station — provides repair services.
 * Ported from ZylonGameViewController starbase logic.
 *
 * The station rotates slowly (360 degrees per 90 seconds)
 * and initiates a repair beam after 3.25 seconds, completing
 * full repair at 8 seconds.
 */

import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SectorObject } from '@/entities/SectorObject';
import { ObjectType } from '@/core/types';
import { createZylonStationModel } from '@/models/ZylonStationModel';

export class ZylonStation extends SectorObject {
  /** Rotation speed: 360 degrees / 90 seconds = 4 deg/s ≈ 0.0698 rad/s */
  private static readonly ROTATION_SPEED = (2 * Math.PI) / 90;

  constructor(scene: Scene) {
    super('zylonStation', scene, ObjectType.ZylonStation);

    createZylonStationModel(scene, this);

    this.position = new Vector3(0, 0, -50);
  }

  /** Per-frame update — rotate the station slowly */
  update(deltaSeconds: number): void {
    this.rotation.y += ZylonStation.ROTATION_SPEED * deltaSeconds;
  }
}
