import { describe, it, expect } from 'vitest';
import { DamageAmount, ShipType } from '@/core/types';
import { Constants } from '@/core/Constants';

/**
 * Tests for combat damage logic.
 * We test the pure math without requiring Babylon.js Scene.
 */

describe('Shield damage calculation', () => {
  function applyShieldHit(
    shieldStrength: number,
    shieldsAreUp: boolean,
    difficulty: number,
  ): { shieldStrength: number; shieldsAreUp: boolean; shieldIntegrity: DamageAmount; energyDrain: number } {
    const dmg = 5 * difficulty;
    let energyDrain = 0;

    if (!shieldsAreUp) {
      return { shieldStrength, shieldsAreUp, shieldIntegrity: DamageAmount.Functional, energyDrain: 0 };
    }

    if (difficulty > 1) {
      energyDrain = dmg;
    }

    const newStrength = shieldStrength - dmg;
    let integrity = DamageAmount.Functional;

    if (newStrength <= 0) {
      integrity = DamageAmount.Destroyed;
      return { shieldStrength: newStrength, shieldsAreUp: false, shieldIntegrity: integrity, energyDrain };
    }

    return { shieldStrength: newStrength, shieldsAreUp: true, shieldIntegrity: integrity, energyDrain };
  }

  it('reduces shield strength by 5 * difficulty', () => {
    const result = applyShieldHit(100, true, 3);
    expect(result.shieldStrength).toBe(85); // 100 - 15
  });

  it('destroys shields when strength drops to 0', () => {
    const result = applyShieldHit(5, true, 1);
    expect(result.shieldStrength).toBe(0);
    expect(result.shieldsAreUp).toBe(false);
    expect(result.shieldIntegrity).toBe(DamageAmount.Destroyed);
  });

  it('does not drain energy at Novice difficulty', () => {
    const result = applyShieldHit(100, true, 1);
    expect(result.energyDrain).toBe(0);
  });

  it('drains energy at higher difficulties', () => {
    const result = applyShieldHit(100, true, 3);
    expect(result.energyDrain).toBe(15);
  });

  it('takes 20 hits at Novice to break shields from 100', () => {
    let strength = 100;
    let hits = 0;
    while (strength > 0) {
      strength -= 5 * 1;
      hits++;
    }
    expect(hits).toBe(20);
  });

  it('takes 4 hits at Lord to break shields from 100', () => {
    let strength = 100;
    let hits = 0;
    while (strength > 0) {
      strength -= 5 * 5;
      hits++;
    }
    expect(hits).toBe(4);
  });
});

describe('Enemy type distribution', () => {
  function generateEnemyTypes(sectorType: string, count: number): number[] {
    let chanceOfFighters = 0;
    switch (sectorType) {
      case 'enemy3':
        chanceOfFighters = 2;
        break;
      case 'enemy2':
        chanceOfFighters = 1;
        break;
      default:
        chanceOfFighters = 0;
        break;
    }

    const types: number[] = [];
    for (let i = 0; i < count; i++) {
      const randType = Math.floor(Math.random() * (chanceOfFighters + 1));
      types.push(Math.min(randType, 2));
    }
    return types;
  }

  it('enemy sectors only produce scouts', () => {
    const types = generateEnemyTypes('enemy', 10);
    for (const t of types) {
      expect(t).toBe(ShipType.Scout);
    }
  });

  it('enemy2 sectors can produce scouts and fighters', () => {
    const allTypes = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const types = generateEnemyTypes('enemy2', 1);
      allTypes.add(types[0]);
    }
    expect(allTypes.has(ShipType.Scout)).toBe(true);
    expect(allTypes.has(ShipType.Fighter)).toBe(true);
  });

  it('enemy3 sectors can produce all three types', () => {
    const allTypes = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const types = generateEnemyTypes('enemy3', 1);
      allTypes.add(types[0]);
    }
    expect(allTypes.has(ShipType.Scout)).toBe(true);
    expect(allTypes.has(ShipType.Fighter)).toBe(true);
    expect(allTypes.has(ShipType.Destroyer)).toBe(true);
  });
});

describe('Warp energy cost', () => {
  it('matches iOS formula: |current - target| * difficulty', () => {
    const current = 64;
    const target = 128;
    const difficulty = 3;
    const cost = Math.abs(current - target) * difficulty;
    expect(cost).toBe(192);
  });
});
