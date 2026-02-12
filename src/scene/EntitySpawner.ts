/**
 * Spawns entities when entering a new sector.
 * Ported from ZylonGameViewController.populateSector() lines 377-428.
 *
 * Coordinates with CombatManager to spawn enemies/starbase
 * based on the current sector's type from the GalaxyMapModel.
 */

import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { SectorGrid } from '@/galaxy/SectorGrid';
import { CombatManager } from '@/combat/CombatManager';
import { ZylonShip } from '@/entities/ZylonShip';
import { SectorGridType } from '@/core/types';
import { delayWithSeconds } from '@/utils/MathUtils';

export class EntitySpawner {
  private combatManager: CombatManager;

  constructor(combatManager: CombatManager) {
    this.combatManager = combatManager;
  }

  /**
   * Populate the current sector based on galaxy model data.
   * Sets ship speed and spawns appropriate entities.
   */
  populateSector(
    ship: ZylonShip,
    galaxy: GalaxyMapModel,
    onRepairComplete?: () => void,
  ): void {
    const sectorIndex = ship.currentSectorNumber;
    if (sectorIndex < 0 || sectorIndex >= galaxy.map.length) return;

    const sector = galaxy.map[sectorIndex];

    // Clear any existing entities from previous sector
    this.combatManager.clearSector();

    switch (sector.sectorType) {
      case SectorGridType.Starbase:
        this.spawnStarbaseSector(ship, onRepairComplete);
        break;
      case SectorGridType.Enemy:
      case SectorGridType.Enemy2:
      case SectorGridType.Enemy3:
        this.spawnEnemySector(ship, sector);
        break;
      case SectorGridType.Empty:
      default:
        ship.currentSpeed = 3;
        break;
    }
  }

  private spawnStarbaseSector(ship: ZylonShip, onRepairComplete?: () => void): void {
    ship.currentSpeed = 0;
    this.combatManager.spawnStation();

    // Repair sequence: 2s message, 3.25s beam start, 8s repair complete
    if (onRepairComplete) {
      delayWithSeconds(8, () => {
        ship.repair();
        onRepairComplete();
      });
    }
  }

  private spawnEnemySector(ship: ZylonShip, sector: SectorGrid): void {
    ship.currentSpeed = 2;
    if (sector.enemyTypes && sector.enemyTypes.length > 0) {
      this.combatManager.spawnEnemies(sector.enemyTypes);
      this.combatManager.setEnemyCount(sector.enemyTypes.length);
    }
  }
}
