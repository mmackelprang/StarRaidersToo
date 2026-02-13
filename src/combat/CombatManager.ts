/**
 * Central combat coordinator — manages torpedo firing, enemy AI, damage, and cleanup.
 * Ported from ZylonGameViewController combat methods.
 *
 * Each frame:
 *   1. Update enemy AI (maneuver + fire decision)
 *   2. Update torpedo positions
 *   3. Check collisions
 *   4. Process hits (damage, explosions, cleanup)
 */

import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { HumonShip } from '@/entities/HumonShip';
import { ZylonShip } from '@/entities/ZylonShip';
import { ZylonStation } from '@/entities/ZylonStation';
import { Torpedo } from '@/entities/Torpedo';
import { TorpedoPool } from '@/combat/TorpedoPool';
import { CollisionHandler, CollisionEvent } from '@/combat/CollisionHandler';
import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { Constants } from '@/core/Constants';
import { ShipType, DamageAmount, ViewMode } from '@/core/types';

export interface CombatCallbacks {
  onPlayerDestroyed: (cause: string) => void;
  onEnemyDestroyed: (enemy: HumonShip) => void;
  onStationDestroyed: (station: ZylonStation) => void;
  onPlayerShieldHit: () => void;
  onSectorCleared: () => void;
}

export class CombatManager {
  private scene: Scene;
  private torpedoPool: TorpedoPool;
  private collisionHandler: CollisionHandler;
  private enemies: HumonShip[] = [];
  private station: ZylonStation | null = null;
  private sectorObjectsNode: TransformNode;
  private callbacks: CombatCallbacks;

  /** Alternating torpedo bay: 1 or 2 */
  private currentTorpedoBay: 1 | 2 = 1;

  constructor(
    scene: Scene,
    sectorObjectsNode: TransformNode,
    callbacks: CombatCallbacks,
  ) {
    this.scene = scene;
    this.sectorObjectsNode = sectorObjectsNode;
    this.torpedoPool = new TorpedoPool(scene);
    this.collisionHandler = new CollisionHandler();
    this.callbacks = callbacks;
  }

  /**
   * Fire a Zylon torpedo from the player.
   * Ported from ZylonGameViewController.fireTorp() lines 336-364.
   */
  fireZylonTorpedo(
    ship: ZylonShip,
    difficultyScalar: number,
    viewMode: ViewMode,
  ): boolean {
    const maxTorps = Constants.maxTorpedoes - difficultyScalar;
    const maxForView = viewMode === ViewMode.AftView
      ? Math.max(1, maxTorps - 2)
      : maxTorps;

    if (this.torpedoPool.zylonCount >= maxForView) return false;

    // Deduct energy
    ship.energyStore -= 5 * difficultyScalar;

    const driftAmount = 2 / 60;
    const forceZ = viewMode === ViewMode.AftView ? 95 / 60 : -95 / 60;
    const offset = 4;

    let position: Vector3;
    let velocity: Vector3;

    if (viewMode === ViewMode.AftView) {
      position = new Vector3(-0.1, 2, 0);
      velocity = new Vector3(0, 0, -forceZ);
    } else if (this.currentTorpedoBay === 1) {
      this.currentTorpedoBay = 2;
      position = new Vector3(offset, -2, 0);
      velocity = new Vector3(-driftAmount, 1.7 / 60, forceZ);
    } else {
      this.currentTorpedoBay = 1;
      position = new Vector3(-offset, -2, 0);
      velocity = new Vector3(driftAmount, 1.7 / 60, forceZ);
    }

    this.torpedoPool.fireZylon(position, velocity);
    return true;
  }

  /**
   * Spawn enemies in the current sector.
   * Ported from ZylonGameViewController.spawnEnemies().
   */
  spawnEnemies(shipTypes: ShipType[]): void {
    for (const type of shipTypes) {
      const enemy = new HumonShip(this.scene, type);
      this.enemies.push(enemy);
      enemy.parent = this.sectorObjectsNode;
    }
  }

  /** Spawn a starbase in the current sector */
  spawnStation(): void {
    this.station = new ZylonStation(this.scene);
    this.station.parent = this.sectorObjectsNode;
  }

  /**
   * Per-frame combat update.
   * Returns true if the player was destroyed this frame.
   */
  update(ship: ZylonShip, difficultyScalar: number, deltaSeconds: number): boolean {
    // Update station rotation
    if (this.station) {
      this.station.update(deltaSeconds);
    }

    // Update enemy AI
    for (const enemy of this.enemies) {
      const wantsToFire = enemy.maneuver();
      enemy.lookAtPlayer();

      if (wantsToFire) {
        this.torpedoPool.fireHumon(enemy.position.clone());
      }
    }

    // Update torpedoes
    this.torpedoPool.update();

    // Check collisions
    const events = this.collisionHandler.checkCollisions(
      this.torpedoPool,
      this.enemies,
      this.station,
    );

    // Process collision events
    let playerDestroyed = false;
    for (const event of events) {
      switch (event.type) {
        case 'playerHit':
          playerDestroyed = this.handlePlayerHit(ship, event, difficultyScalar);
          break;
        case 'enemyHit':
          this.handleEnemyHit(event, ship);
          break;
        case 'stationHit':
          this.handleStationHit(event);
          break;
      }
    }

    // Check if sector is cleared
    if (this.enemies.length === 0 && this.enemyCountAtSpawn > 0) {
      this.callbacks.onSectorCleared();
    }

    return playerDestroyed;
  }

  private enemyCountAtSpawn = 0;

  private handlePlayerHit(
    ship: ZylonShip,
    event: CollisionEvent,
    difficultyScalar: number,
  ): boolean {
    this.torpedoPool.remove(event.torpedo);

    if (!ship.shieldsAreUp) {
      this.callbacks.onPlayerDestroyed('Prototype defense ship destroyed by Humon Fire');
      return true;
    }

    // Shield absorbs hit
    if (difficultyScalar > 1) {
      ship.energyStore -= 5 * difficultyScalar;
    }
    ship.shieldStrength -= 5 * difficultyScalar;

    if (ship.shieldStrength <= 0) {
      ship.shipSystems.shieldIntegrity = DamageAmount.Destroyed;
      ship.shieldsAreUp = false;
    }

    this.callbacks.onPlayerShieldHit();
    return false;
  }

  private handleEnemyHit(event: CollisionEvent, ship: ZylonShip): void {
    const enemy = event.target as HumonShip;
    this.torpedoPool.remove(event.torpedo);

    // Remove enemy
    const idx = this.enemies.indexOf(enemy);
    if (idx >= 0) this.enemies.splice(idx, 1);

    this.callbacks.onEnemyDestroyed(enemy);
    enemy.dispose();
  }

  private handleStationHit(event: CollisionEvent): void {
    this.torpedoPool.remove(event.torpedo);
    if (this.station) {
      this.callbacks.onStationDestroyed(this.station);
      this.station.dispose();
      this.station = null;
    }
  }

  /** Clear all sector objects (e.g. before warp or sector change) */
  clearSector(): void {
    this.torpedoPool.clearAll();
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    this.enemies = [];
    if (this.station) {
      this.station.dispose();
      this.station = null;
    }
    this.enemyCountAtSpawn = 0;
  }

  /** Called when entering a new sector with enemies */
  setEnemyCount(count: number): void {
    this.enemyCountAtSpawn = count;
  }

  get enemyCount(): number {
    return this.enemies.length;
  }

  get activeStation(): ZylonStation | null {
    return this.station;
  }

  /** Distance to nearest enemy, or null if no enemies in sector */
  getNearestEnemyDistance(): number | null {
    if (this.enemies.length === 0) return null;
    let minDist = Infinity;
    for (const enemy of this.enemies) {
      const dist = enemy.position.length();
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }

  dispose(): void {
    this.clearSector();
    this.torpedoPool.dispose();
  }
}
