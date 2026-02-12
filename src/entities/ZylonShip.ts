/**
 * Player ship state machine.
 * Ported from ZylonShip.swift — tracks energy, shields, speed, sector, and ship systems.
 *
 * The ship itself is invisible (camera POV). It sits at the origin and the
 * sectorObjectsNode rotates around it to simulate steering.
 */

import { Scene } from '@babylonjs/core/scene';
import { SectorObject } from '@/entities/SectorObject';
import { DamageAmount, ObjectType, ShipSystems } from '@/core/types';

export class ZylonShip extends SectorObject {
  shipClock = 0;
  currentSectorNumber = 64;
  targetSectorNumber = 68;
  tacticalDisplayEngaged = false;
  isInAlertMode = false;
  isCurrentlyInWarp = false;
  shieldsAreUp = false;
  currentSpeed = 0;
  engineHealth = 100;
  shieldStrength = 100;
  energyStore = 10000;
  currentTorpedoBay: 1 | 2 = 1;

  shipSystems: ShipSystems = {
    outerHull: DamageAmount.Functional,
    shieldIntegrity: DamageAmount.Functional,
    engineIntegrity: DamageAmount.Functional,
    scanner: DamageAmount.Functional,
    babelfishCircuit: DamageAmount.Functional,
    genderIdentityCircuit: DamageAmount.Functional,
  };

  readonly statusMessages = ['functional', 'damaged', 'severely damaged', 'destroyed'];

  constructor(scene: Scene) {
    super('zylonShip', scene, ObjectType.ZylonStation);
  }

  /**
   * Per-frame energy drain. Ported from ZylonShip.swift lines 100-111.
   *
   * Formula:
   *   drainRate = shieldsUp ? max(1, 20/difficulty - speed/3) : max(1, 60/difficulty - speed/3)
   *   If shipClock % drainRate === 0, drain 1 energy.
   */
  updateShipSystems(difficulty: number): void {
    this.shipClock += 1;

    const base = this.shieldsAreUp ? 20 : 60;
    let energyDrainRate = Math.trunc(base / difficulty) - Math.trunc(this.currentSpeed / 3);
    if (energyDrainRate < 1) energyDrainRate = 1;

    if (this.shipClock % energyDrainRate === 0) {
      if (this.energyStore > 0) {
        this.energyStore -= 1;
      }
    }
  }

  /**
   * Full repair at starbase. Ported from ZylonShip.swift lines 113-119.
   */
  repair(): void {
    this.shipSystems.outerHull = DamageAmount.Functional;
    this.shipSystems.engineIntegrity = DamageAmount.Functional;
    this.shipSystems.shieldIntegrity = DamageAmount.Functional;
    this.shieldStrength = 100;
    this.energyStore = 10000;
  }

  /**
   * Take damage when hit without shields. Ported from ZylonShip.swift lines 120-144.
   */
  takeDamage(): void {
    if (this.shieldStrength <= 0 && this.shieldsAreUp) {
      this.shipSystems.shieldIntegrity = DamageAmount.Destroyed;
      this.shieldsAreUp = false;
    }
  }
}
