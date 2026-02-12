import { describe, it, expect } from 'vitest';
import { difficultyScalar, Difficulty } from '@/core/types';

/**
 * Combat balance tests — verify difficulty scaling formulas.
 */

describe('Difficulty scalar values', () => {
  it('Novice = 1', () => expect(difficultyScalar(Difficulty.Novice)).toBe(1));
  it('Pilot = 2', () => expect(difficultyScalar(Difficulty.Pilot)).toBe(2));
  it('Commander = 3', () => expect(difficultyScalar(Difficulty.Commander)).toBe(3));
  it('Warrior = 4', () => expect(difficultyScalar(Difficulty.Warrior)).toBe(4));
  it('Lord = 5', () => expect(difficultyScalar(Difficulty.Lord)).toBe(5));
});

describe('Torpedo cost scaling', () => {
  function torpedoCost(difficulty: number): number {
    return 5 * difficulty;
  }

  it('Novice: 5 energy per torpedo', () => {
    expect(torpedoCost(1)).toBe(5);
  });

  it('Lord: 25 energy per torpedo', () => {
    expect(torpedoCost(5)).toBe(25);
  });
});

describe('Max torpedoes scaling', () => {
  const MAX_TORPEDOES = 6;

  function maxTorps(difficulty: number): number {
    return MAX_TORPEDOES - difficulty;
  }

  it('Novice allows 5 torpedoes', () => {
    expect(maxTorps(1)).toBe(5);
  });

  it('Lord allows only 1 torpedo', () => {
    expect(maxTorps(5)).toBe(1);
  });
});

describe('Energy drain rates', () => {
  function calculateDrainRate(
    shieldsUp: boolean,
    difficulty: number,
    speed: number,
  ): number {
    const base = shieldsUp ? 20 : 60;
    const rate = Math.trunc(base / difficulty) - Math.trunc(speed / 3);
    return Math.max(1, rate);
  }

  it('shields up drains faster than shields down', () => {
    const shieldsUpRate = calculateDrainRate(true, 3, 5);
    const shieldsDownRate = calculateDrainRate(false, 3, 5);
    expect(shieldsUpRate).toBeLessThanOrEqual(shieldsDownRate);
  });

  it('higher speed increases drain rate (lower rate = more frequent)', () => {
    const slowRate = calculateDrainRate(false, 3, 0);
    const fastRate = calculateDrainRate(false, 3, 9);
    expect(fastRate).toBeLessThanOrEqual(slowRate);
  });

  it('higher difficulty increases drain rate', () => {
    const easyRate = calculateDrainRate(false, 1, 5);
    const hardRate = calculateDrainRate(false, 5, 5);
    expect(hardRate).toBeLessThanOrEqual(easyRate);
  });

  it('drain rate never drops below 1', () => {
    const extreme = calculateDrainRate(true, 5, 9);
    expect(extreme).toBeGreaterThanOrEqual(1);
  });
});

describe('Troop movement intervals', () => {
  function updateInterval(difficulty: number): number {
    return Math.floor(4800 / difficulty);
  }

  it('Novice: 4800 frames between updates', () => {
    expect(updateInterval(1)).toBe(4800);
  });

  it('Pilot: 2400 frames', () => {
    expect(updateInterval(2)).toBe(2400);
  });

  it('Commander: 1600 frames', () => {
    expect(updateInterval(3)).toBe(1600);
  });

  it('Warrior: 1200 frames', () => {
    expect(updateInterval(4)).toBe(1200);
  });

  it('Lord: 960 frames', () => {
    expect(updateInterval(5)).toBe(960);
  });
});

describe('Warp energy cost', () => {
  function warpCost(currentSector: number, targetSector: number, difficulty: number): number {
    return Math.abs(currentSector - targetSector) * difficulty;
  }

  it('adjacent sector at Novice costs 1 energy', () => {
    expect(warpCost(0, 1, 1)).toBe(1);
  });

  it('cross-galaxy at Lord costs 635 energy', () => {
    expect(warpCost(0, 127, 5)).toBe(635);
  });

  it('same sector costs 0', () => {
    expect(warpCost(42, 42, 5)).toBe(0);
  });
});
