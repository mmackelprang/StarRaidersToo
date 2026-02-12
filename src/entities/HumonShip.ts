/**
 * Enemy ship with zig-zag AI.
 * Ported from HumonShip.swift.
 *
 * Behaviour:
 *   - Spawns at random position: X(-10,10), Y(-12,12), Z(-90,-60)
 *   - Zig-zag maneuver: alternates left/right based on current X position
 *   - Advances toward the player (Z moves toward 0) when far away
 *   - Fires homing torpedoes at intervals of 185-800 frames
 *   - Always faces the player (look-at constraint simulated per frame)
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SectorObject } from '@/entities/SectorObject';
import { ShipType, ObjectType } from '@/core/types';
import { Constants } from '@/core/Constants';
import { randRange, randIntRange } from '@/utils/MathUtils';

export enum ManeuverType {
  Zig = 'zig',
  Zag = 'zag',
  FullStop = 'fullstop',
}

export class HumonShip extends SectorObject {
  shipType: ShipType;
  shieldStrength = 100;
  currentManeuverType = ManeuverType.FullStop;
  cyclesUntilFireTorpedo: number;

  /** Whether a maneuver animation is in progress */
  private inCurrentManeuver = false;

  /** Maneuver target position */
  private maneuverTarget: Vector3 | null = null;
  private maneuverProgress = 0;
  private maneuverDuration = 0;
  private maneuverStart: Vector3 | null = null;

  /** Fly-in animation */
  private flyInProgress = 0;
  private flyInDuration = 90; // 1.5s at 60fps
  private isFlyingIn = true;

  constructor(scene: Scene, shipType: ShipType) {
    super('humonShip', scene, ObjectType.HumonShip);
    this.shipType = shipType;

    // Random spawn position
    this.position = new Vector3(
      randRange(-10, 10),
      randRange(-12, 12),
      randRange(-90, -60),
    );

    // Initial fire countdown (shorter than normal interval for quicker first shot)
    this.cyclesUntilFireTorpedo = Math.floor(randRange(30, 340));

    // Create placeholder geometry (Phase 6 will add proper models)
    this.createPlaceholderMesh(scene);
  }

  private createPlaceholderMesh(scene: Scene): void {
    // Simple box as placeholder until Phase 6 procedural models
    const body = MeshBuilder.CreateBox(
      `humon_body_${this.uniqueId}`,
      { width: 4, height: 2, depth: 3 },
      scene,
    );
    body.parent = this;

    const mat = new StandardMaterial(`humon_mat_${this.uniqueId}`, scene);
    switch (this.shipType) {
      case ShipType.Scout:
        mat.emissiveColor = new Color3(0.6, 0.1, 0.1);
        break;
      case ShipType.Fighter:
        mat.emissiveColor = new Color3(0.7, 0.3, 0.0);
        break;
      case ShipType.Destroyer:
        mat.emissiveColor = new Color3(0.8, 0.0, 0.2);
        body.scaling = new Vector3(1.5, 1.2, 1.5);
        break;
    }
    body.material = mat;
  }

  /**
   * Per-frame AI update. Returns true if this ship wants to fire a torpedo.
   */
  maneuver(): boolean {
    let wantsToFire = false;

    // Fly-in animation (scale from 0.1 to 1.0)
    if (this.isFlyingIn) {
      this.flyInProgress += 1;
      const t = Math.min(this.flyInProgress / this.flyInDuration, 1.0);
      const scale = 0.1 + 0.9 * t;
      this.scaling = new Vector3(scale, scale, scale);
      if (t >= 1.0) {
        this.isFlyingIn = false;
        this.scaling = Vector3.One();
      }
      return false; // Don't fire or maneuver during fly-in
    }

    // Zig-zag maneuver logic
    if (this.currentManeuverType === ManeuverType.FullStop) {
      this.startNewManeuver();
    } else if (this.inCurrentManeuver && this.maneuverTarget && this.maneuverStart) {
      this.maneuverProgress += 1;
      const t = Math.min(this.maneuverProgress / this.maneuverDuration, 1.0);
      // Ease-in-ease-out interpolation
      const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
      Vector3.LerpToRef(this.maneuverStart, this.maneuverTarget, eased, this.position);

      if (t >= 1.0) {
        this.currentManeuverType = ManeuverType.FullStop;
        this.inCurrentManeuver = false;
      }
    }

    // Torpedo firing countdown
    if (this.cyclesUntilFireTorpedo <= 0) {
      wantsToFire = true;
      this.cyclesUntilFireTorpedo = Math.floor(
        randRange(Constants.minHumanShootInterval, Constants.maxHumanShootInterval),
      );
    } else {
      this.cyclesUntilFireTorpedo -= 1;
    }

    return wantsToFire;
  }

  private startNewManeuver(): void {
    const maneuverSeconds = randRange(1, 4);
    this.maneuverDuration = maneuverSeconds * 60; // Convert to frames
    this.maneuverProgress = 0;
    this.maneuverStart = this.position.clone();

    const yDelta = randRange(-30, 30);
    let xDelta: number;
    let zDelta: number;

    // Z movement: advance toward player if far away, retreat if too close
    if (this.position.z < -20) {
      zDelta = randRange(5, 10);
    } else {
      zDelta = randRange(-25, -10);
    }

    // Zig-zag: alternate direction based on current X position
    if (this.position.x < 0) {
      this.currentManeuverType = ManeuverType.Zig;
      xDelta = randRange(20, 40);
    } else {
      this.currentManeuverType = ManeuverType.Zag;
      xDelta = randRange(-40, -20);
    }

    this.maneuverTarget = new Vector3(
      this.position.x + xDelta,
      this.position.y + yDelta,
      this.position.z + zDelta,
    );

    this.inCurrentManeuver = true;
  }

  /** Look at origin (player position) — simplified look-at constraint */
  lookAtPlayer(): void {
    this.lookAt(Vector3.Zero());
  }
}
