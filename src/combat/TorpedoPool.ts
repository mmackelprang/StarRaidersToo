/**
 * Manages active torpedoes in the scene.
 * Ported from ZylonGameViewController cleanSceneAndUpdateSectorNodeObjects().
 *
 * Tracks active Zylon and Humon torpedoes, updates their positions each frame,
 * and removes expired ones.
 */

import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Torpedo } from '@/entities/Torpedo';
import { TorpType } from '@/core/types';
import { Constants } from '@/core/Constants';

export class TorpedoPool {
  private torpedoes: Torpedo[] = [];
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /** Fire a Zylon (player) torpedo */
  fireZylon(position: Vector3, velocity: Vector3): Torpedo | null {
    const torp = new Torpedo(this.scene, TorpType.Zylon, position, velocity);
    this.torpedoes.push(torp);
    return torp;
  }

  /** Fire a Humon (enemy) torpedo from an enemy position */
  fireHumon(position: Vector3): Torpedo | null {
    // Humon torpedoes use homing — velocity is handled by the update loop
    const velocity = new Vector3(-2 / 60, 1.7 / 60, 0);
    const torp = new Torpedo(this.scene, TorpType.Humon, position, velocity);
    this.torpedoes.push(torp);
    return torp;
  }

  get zylonCount(): number {
    return this.torpedoes.filter((t) => t.torpType === TorpType.Zylon).length;
  }

  get humonCount(): number {
    return this.torpedoes.filter((t) => t.torpType === TorpType.Humon).length;
  }

  get activeTorpedoes(): readonly Torpedo[] {
    return this.torpedoes;
  }

  /**
   * Update all torpedoes. Returns lists of expired torpedoes for cleanup.
   */
  update(): Torpedo[] {
    const expired: Torpedo[] = [];

    for (const torp of this.torpedoes) {
      const alive = torp.update();
      if (!alive) {
        expired.push(torp);
      }
    }

    // Remove expired torpedoes
    for (const torp of expired) {
      const idx = this.torpedoes.indexOf(torp);
      if (idx >= 0) this.torpedoes.splice(idx, 1);
      torp.dispose();
    }

    return expired;
  }

  /** Remove a specific torpedo (e.g. on collision) */
  remove(torp: Torpedo): void {
    const idx = this.torpedoes.indexOf(torp);
    if (idx >= 0) {
      this.torpedoes.splice(idx, 1);
      torp.dispose();
    }
  }

  /** Clear all torpedoes (e.g. on warp or sector change) */
  clearAll(): void {
    for (const torp of this.torpedoes) {
      torp.dispose();
    }
    this.torpedoes = [];
  }

  dispose(): void {
    this.clearAll();
  }
}
