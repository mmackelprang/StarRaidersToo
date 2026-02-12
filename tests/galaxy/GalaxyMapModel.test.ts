import { describe, it, expect } from 'vitest';
import { SectorGridType, ShipType } from '@/core/types';
import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';

describe('GalaxyMapModel generation', () => {
  it('creates exactly 128 sectors', () => {
    const galaxy = new GalaxyMapModel(1);
    expect(galaxy.map.length).toBe(128);
  });

  it('assigns 1-based sector numbers', () => {
    const galaxy = new GalaxyMapModel(1);
    expect(galaxy.map[0].number).toBe(1);
    expect(galaxy.map[127].number).toBe(128);
  });

  it('places exactly 4 starbases', () => {
    const galaxy = new GalaxyMapModel(3);
    const starbases = galaxy.map.filter(
      (s) => s.sectorType === SectorGridType.Starbase,
    );
    expect(starbases.length).toBe(4);
  });

  it('places one starbase per quadrant', () => {
    const galaxy = new GalaxyMapModel(3);
    const starbases = galaxy.map.filter(
      (s) => s.sectorType === SectorGridType.Starbase,
    );

    // Check each starbase is in a different quadrant (0-31, 32-63, 64-95, 96-127)
    const quadrants = starbases.map((s) => {
      const idx = galaxy.map.indexOf(s);
      return Math.floor(idx / 32);
    });
    const uniqueQuadrants = new Set(quadrants);
    expect(uniqueQuadrants.size).toBe(4);
  });

  it('creates enemy sectors for Novice difficulty', () => {
    const galaxy = new GalaxyMapModel(1);
    const enemies = galaxy.map.filter(
      (s) =>
        s.sectorType === SectorGridType.Enemy ||
        s.sectorType === SectorGridType.Enemy2 ||
        s.sectorType === SectorGridType.Enemy3,
    );
    // Novice = 12 attempts, some may overlap, so count >= 1
    expect(enemies.length).toBeGreaterThan(0);
    expect(enemies.length).toBeLessThanOrEqual(12);
  });

  it('creates more enemy sectors at higher difficulty', () => {
    // Run multiple trials to account for randomness
    let noviceTotal = 0;
    let lordTotal = 0;
    const trials = 20;
    for (let i = 0; i < trials; i++) {
      noviceTotal += new GalaxyMapModel(1).currentNumberOfOccupiedSectors;
      lordTotal += new GalaxyMapModel(5).currentNumberOfOccupiedSectors;
    }
    expect(lordTotal / trials).toBeGreaterThan(noviceTotal / trials);
  });

  it('enemy sectors have valid ship types', () => {
    const galaxy = new GalaxyMapModel(3);
    const enemies = galaxy.map.filter(
      (s) =>
        s.sectorType === SectorGridType.Enemy ||
        s.sectorType === SectorGridType.Enemy2 ||
        s.sectorType === SectorGridType.Enemy3,
    );

    for (const sector of enemies) {
      expect(sector.enemyTypes).not.toBeNull();
      expect(sector.enemyTypes!.length).toBeGreaterThan(0);
      for (const t of sector.enemyTypes!) {
        expect([ShipType.Scout, ShipType.Fighter, ShipType.Destroyer]).toContain(t);
      }
    }
  });

  it('enemy sectors have ship count matching enemyTypes length', () => {
    const galaxy = new GalaxyMapModel(4);
    const enemies = galaxy.map.filter(
      (s) => s.sectorType !== SectorGridType.Empty && s.sectorType !== SectorGridType.Starbase,
    );

    for (const sector of enemies) {
      expect(sector.numberOfSectorObjects).toBe(sector.enemyTypes!.length);
    }
  });
});

describe('GalaxyMapModel occupiedSectorRatio', () => {
  it('starts at ratio 1.0', () => {
    const galaxy = new GalaxyMapModel(3);
    if (galaxy.initialNumberOfOccupiedSectors > 0) {
      expect(galaxy.occupiedSectorRatio).toBeCloseTo(1.0);
    }
  });

  it('decreases when a sector is cleared', () => {
    const galaxy = new GalaxyMapModel(3);
    const enemyIdx = galaxy.map.findIndex(
      (s) =>
        s.sectorType === SectorGridType.Enemy ||
        s.sectorType === SectorGridType.Enemy2 ||
        s.sectorType === SectorGridType.Enemy3,
    );
    if (enemyIdx >= 0) {
      const ratioBefore = galaxy.occupiedSectorRatio;
      galaxy.clearSector(enemyIdx);
      expect(galaxy.occupiedSectorRatio).toBeLessThan(ratioBefore);
    }
  });

  it('returns 0 when all sectors are cleared', () => {
    const galaxy = new GalaxyMapModel(1);
    for (let i = 0; i < 128; i++) {
      if (
        galaxy.map[i].sectorType === SectorGridType.Enemy ||
        galaxy.map[i].sectorType === SectorGridType.Enemy2 ||
        galaxy.map[i].sectorType === SectorGridType.Enemy3
      ) {
        galaxy.clearSector(i);
      }
    }
    expect(galaxy.currentNumberOfOccupiedSectors).toBe(0);
    expect(galaxy.occupiedSectorRatio).toBe(0);
  });
});

describe('GalaxyMapModel warp energy cost', () => {
  // Port of performWarp(): energyUsed = |current - target| * difficultyScalar
  function warpEnergyCost(currentSector: number, targetSector: number, difficulty: number): number {
    return Math.abs(currentSector - targetSector) * difficulty;
  }

  it('costs nothing when warping to same sector', () => {
    expect(warpEnergyCost(64, 64, 3)).toBe(0);
  });

  it('costs more at higher difficulty', () => {
    const novice = warpEnergyCost(0, 64, 1);
    const lord = warpEnergyCost(0, 64, 5);
    expect(lord).toBe(novice * 5);
  });

  it('costs more for longer distance', () => {
    const short = warpEnergyCost(60, 64, 3);
    const long = warpEnergyCost(0, 64, 3);
    expect(long).toBeGreaterThan(short);
  });

  it('matches iOS exact value: sector 64→128 at difficulty 3 = 192', () => {
    expect(warpEnergyCost(64, 128, 3)).toBe(192);
  });
});
