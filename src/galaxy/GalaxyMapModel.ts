/**
 * Galaxy model: 128 sectors with difficulty-scaled generation.
 * Ported from GalaxyMapModel.swift.
 *
 * Generation algorithm:
 *  1. Create 128 empty sectors
 *  2. Place 4 starbases (one per quadrant at a random position)
 *  3. Populate enemy sectors (count depends on difficulty)
 *  4. Each enemy sector gets a random number of ships (1..maxShipsPerSector)
 *  5. Enemy type weighting depends on sector type (enemy/enemy2/enemy3)
 */

import { SectorGridType, ShipType } from '@/core/types';
import { randIntRange, randRange } from '@/utils/MathUtils';
import { SectorGrid, createEmptySector } from '@/galaxy/SectorGrid';

interface DifficultyConfig {
  occupiedSectors: number;
  maxShipsPerSector: number;
  stations: number;
}

const DIFFICULTY_TABLE: Record<number, DifficultyConfig> = {
  1: { occupiedSectors: 12, maxShipsPerSector: 3, stations: 4 },
  2: { occupiedSectors: 15, maxShipsPerSector: 3, stations: 4 },
  3: { occupiedSectors: 18, maxShipsPerSector: 4, stations: 4 },
  4: { occupiedSectors: 25, maxShipsPerSector: 5, stations: 4 },
  5: { occupiedSectors: 40, maxShipsPerSector: 7, stations: 4 },
};

export class GalaxyMapModel {
  map: SectorGrid[] = [];
  initialNumberOfOccupiedSectors = 0;

  constructor(difficulty: number) {
    const config = DIFFICULTY_TABLE[difficulty] ?? {
      occupiedSectors: 30,
      maxShipsPerSector: 3,
      stations: 4,
    };

    this.generate(config);
    this.initialNumberOfOccupiedSectors = this.currentNumberOfOccupiedSectors;
  }

  private generate(config: DifficultyConfig): void {
    // Step 1: Create 128 empty sectors (1-indexed sector numbers)
    this.map = [];
    for (let i = 1; i <= 128; i++) {
      this.map.push(createEmptySector(i));
    }

    // Step 2: Place starbases — one per quadrant
    for (let q = 0; q < config.stations; q++) {
      const lowerRange = q * 32;
      const idx = randIntRange(lowerRange, lowerRange + 31);
      this.map[idx].numberOfSectorObjects = 1;
      this.map[idx].sectorType = SectorGridType.Starbase;
    }

    // Step 3: Populate enemy sectors
    for (let i = 0; i < config.occupiedSectors; i++) {
      const idx = Math.floor(randRange(0, 128));
      const clamped = Math.min(idx, 127);

      // Don't overwrite starbases
      if (this.map[clamped].sectorType === SectorGridType.Starbase) continue;

      const shipCount = randIntRange(1, config.maxShipsPerSector);
      this.map[clamped].numberOfSectorObjects = shipCount;
      this.map[clamped].enemyTypes = [];

      // Determine sector enemy tier
      const typeRoll = randIntRange(1, 3);
      let chanceOfFighters = 0;
      switch (typeRoll) {
        case 3:
          this.map[clamped].sectorType = SectorGridType.Enemy3;
          chanceOfFighters = 2;
          break;
        case 2:
          this.map[clamped].sectorType = SectorGridType.Enemy2;
          chanceOfFighters = 1;
          break;
        default:
          this.map[clamped].sectorType = SectorGridType.Enemy;
          chanceOfFighters = 0;
          break;
      }

      // Assign ship types
      for (let s = 0; s < shipCount; s++) {
        const randType = randIntRange(0, chanceOfFighters);
        const shipType = (randType in ShipType)
          ? randType as ShipType
          : ShipType.Scout;
        this.map[clamped].enemyTypes!.push(shipType);
      }
    }
  }

  /** Count of sectors currently containing enemies */
  get currentNumberOfOccupiedSectors(): number {
    return this.map.filter(
      (s) =>
        s.sectorType === SectorGridType.Enemy ||
        s.sectorType === SectorGridType.Enemy2 ||
        s.sectorType === SectorGridType.Enemy3,
    ).length;
  }

  /** Ratio of remaining enemy sectors to initial count (for rank calculation) */
  get occupiedSectorRatio(): number {
    if (this.initialNumberOfOccupiedSectors === 0) return 0;
    return this.currentNumberOfOccupiedSectors / this.initialNumberOfOccupiedSectors;
  }

  /** Clear a sector after all enemies are destroyed */
  clearSector(index: number): void {
    this.map[index].sectorType = SectorGridType.Empty;
    this.map[index].numberOfSectorObjects = 0;
    this.map[index].enemyTypes = null;
  }
}
