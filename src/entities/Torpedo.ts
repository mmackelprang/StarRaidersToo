/**
 * Torpedo entity — both Zylon (player, ballistic) and Humon (enemy, homing).
 * Ported from Torpedo.swift.
 *
 * Zylon torpedoes travel in a straight line from where they are fired.
 * Humon torpedoes home toward the player (origin) each frame:
 *   pos.x -= pos.x / 13
 *   pos.y -= pos.y / 13
 *   pos.z += 0.6
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { TorpType } from '@/core/types';
import { Constants } from '@/core/Constants';

export class Torpedo extends TransformNode {
  age = 0;
  torpType: TorpType;

  /** Velocity vector (units per frame) */
  velocity: Vector3;

  private mesh: ReturnType<typeof MeshBuilder.CreateSphere>;
  private material: StandardMaterial;

  constructor(scene: Scene, torpType: TorpType, position: Vector3, velocity: Vector3) {
    super(torpType === TorpType.Zylon ? 'torpedo' : 'Humon torpedo', scene);
    this.torpType = torpType;
    this.velocity = velocity;
    this.position = position.clone();

    // Visual: small glowing sphere
    this.mesh = MeshBuilder.CreateSphere(
      `${this.name}_mesh`,
      { diameter: 0.5, segments: 6 },
      scene,
    );
    this.mesh.parent = this;

    this.material = new StandardMaterial(`${this.name}_mat`, scene);
    if (torpType === TorpType.Zylon) {
      this.material.emissiveColor = new Color3(0.2, 0.8, 1.0); // cyan
    } else {
      this.material.emissiveColor = new Color3(1.0, 0.3, 0.1); // orange-red
    }
    this.mesh.material = this.material;
  }

  /**
   * Per-frame update. Returns true if the torpedo is still alive.
   */
  update(): boolean {
    this.age += 1;

    if (this.torpType === TorpType.Humon) {
      // Homing correction toward origin (player position)
      this.position.x -= this.position.x / Constants.torpedoCorrectionSpeedDivider;
      this.position.y -= this.position.y / Constants.torpedoCorrectionSpeedDivider;
      this.position.z += Constants.torpedoSpeed;
    } else {
      // Ballistic — apply velocity
      this.position.addInPlace(this.velocity);
    }

    // Fade and expire at end of lifespan
    if (this.age >= Constants.torpedoLifespan) {
      return false;
    }

    return true;
  }

  dispose(): void {
    this.mesh.dispose();
    this.material.dispose();
    super.dispose();
  }
}
