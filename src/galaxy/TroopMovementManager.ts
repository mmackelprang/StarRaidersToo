/**
 * Enemy strategic troop movements between galaxy sectors.
 * Ported from GalaxyMapModel.swift updateHumonTroopMovements() lines 38-46.
 *
 * Framework for sector-to-sector enemy AI. Update interval = 4800 / difficulty.
 * NOTE: Like the iOS version, the actual movement logic is a stub —
 * the framework tracks timing but movement decisions are not yet implemented.
 */

import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { SectorGridType } from '@/core/types';

export class TroopMovementManager {
  private updateInterval: number;
  private timeSinceLastUpdate = 0;
  private surroundedStationIndexes: number[] = [];

  /**
   * @param difficulty - difficulty scalar (1-5)
   */
  constructor(difficulty: number) {
    this.updateInterval = Math.floor(4800 / difficulty);
  }

  /**
   * Called once per frame. Checks if it's time for a troop movement update.
   * Returns true if an update occurred.
   */
  update(galaxyModel: GalaxyMapModel): boolean {
    this.timeSinceLastUpdate += 1;

    if (this.timeSinceLastUpdate >= this.updateInterval) {
      this.timeSinceLastUpdate = 0;
      this.checkStationSieges(galaxyModel);
      return true;
    }

    return false;
  }

  /**
   * Check if any stations are surrounded by enemy sectors.
   * A station is "surrounded" when adjacent sectors are all enemy-occupied.
   */
  private checkStationSieges(galaxyModel: GalaxyMapModel): void {
    this.surroundedStationIndexes = [];

    for (let i = 0; i < 128; i++) {
      if (galaxyModel.map[i].sectorType !== SectorGridType.Starbase) continue;

      const row = Math.floor(i / 16);
      const col = i % 16;
      let surrounded = true;

      // Check 4 adjacent sectors
      const neighbors = [
        row > 0 ? (row - 1) * 16 + col : -1,     // above
        row < 7 ? (row + 1) * 16 + col : -1,      // below
        col > 0 ? row * 16 + (col - 1) : -1,      // left
        col < 15 ? row * 16 + (col + 1) : -1,     // right
      ];

      for (const n of neighbors) {
        if (n < 0 || n >= 128) continue;
        const type = galaxyModel.map[n].sectorType;
        if (type !== SectorGridType.Enemy &&
            type !== SectorGridType.Enemy2 &&
            type !== SectorGridType.Enemy3) {
          surrounded = false;
          break;
        }
      }

      if (surrounded) {
        this.surroundedStationIndexes.push(i);
      }
    }

    // Future: implement siege countdown and station destruction
  }

  /** Get list of stations currently under siege */
  get siegedStations(): readonly number[] {
    return this.surroundedStationIndexes;
  }

  /** Get the update interval in frames */
  get interval(): number {
    return this.updateInterval;
  }
}
