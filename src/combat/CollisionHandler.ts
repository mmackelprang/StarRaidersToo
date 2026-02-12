/**
 * Per-frame intersection testing for torpedoes hitting ships/stations.
 * Ported from ZylonGameViewController.physicsWorld(_:didBegin:).
 *
 * Since Babylon.js physics setup is heavy for this use case, we use
 * simple sphere-based intersection testing each frame.
 */

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Torpedo } from '@/entities/Torpedo';
import { HumonShip } from '@/entities/HumonShip';
import { ZylonStation } from '@/entities/ZylonStation';
import { TorpType } from '@/core/types';
import { TorpedoPool } from '@/combat/TorpedoPool';

export interface CollisionEvent {
  type: 'playerHit' | 'enemyHit' | 'stationHit';
  torpedo: Torpedo;
  target?: HumonShip | ZylonStation;
}

/** Hit detection radius — matches iOS physics shape sizes */
const PLAYER_HIT_RADIUS = 5;
const ENEMY_HIT_RADIUS = 5;
const STATION_HIT_RADIUS = 6;

export class CollisionHandler {
  /**
   * Check for collisions between torpedoes and targets.
   * Returns collision events for the CombatManager to process.
   */
  checkCollisions(
    torpedoPool: TorpedoPool,
    enemies: HumonShip[],
    station: ZylonStation | null,
  ): CollisionEvent[] {
    const events: CollisionEvent[] = [];

    for (const torp of torpedoPool.activeTorpedoes) {
      if (torp.torpType === TorpType.Humon) {
        // Humon torpedo → check against player (at origin)
        const distToPlayer = torp.position.length();
        if (distToPlayer < PLAYER_HIT_RADIUS) {
          events.push({ type: 'playerHit', torpedo: torp });
        }
      } else {
        // Zylon torpedo → check against enemies and station
        for (const enemy of enemies) {
          const dist = Vector3.Distance(torp.position, enemy.position);
          if (dist < ENEMY_HIT_RADIUS) {
            events.push({ type: 'enemyHit', torpedo: torp, target: enemy });
            break; // One torpedo can only hit one target
          }
        }

        if (station) {
          const dist = Vector3.Distance(torp.position, station.position);
          if (dist < STATION_HIT_RADIUS) {
            events.push({ type: 'stationHit', torpedo: torp, target: station });
          }
        }
      }
    }

    return events;
  }
}
