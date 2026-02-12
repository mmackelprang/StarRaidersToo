import { describe, it, expect } from 'vitest';
import { Constants } from '@/core/Constants';

/**
 * Tests for Torpedo physics and homing logic.
 * We test the pure math without requiring Babylon.js Scene.
 */

describe('Torpedo homing correction', () => {
  // Port of ZylonGameViewController.swift lines 1411-1422
  function simulateHomingStep(x: number, y: number, z: number) {
    return {
      x: x - x / Constants.torpedoCorrectionSpeedDivider,
      y: y - y / Constants.torpedoCorrectionSpeedDivider,
      z: z + Constants.torpedoSpeed,
    };
  }

  it('moves forward each frame by torpedoSpeed', () => {
    const after = simulateHomingStep(0, 0, -50);
    expect(after.z).toBeCloseTo(-50 + 0.6);
  });

  it('corrects X position toward center', () => {
    const after = simulateHomingStep(13, 0, -50);
    expect(after.x).toBeCloseTo(12); // 13 - 13/13 = 12
  });

  it('corrects Y position toward center', () => {
    const after = simulateHomingStep(0, 26, -50);
    expect(after.y).toBeCloseTo(24); // 26 - 26/13 = 24
  });

  it('converges toward origin over many frames', () => {
    let x = 20;
    let y = 15;
    let z = -80;

    for (let i = 0; i < 100; i++) {
      const next = simulateHomingStep(x, y, z);
      x = next.x;
      y = next.y;
      z = next.z;
    }

    // After 100 frames, should be very close to center laterally
    expect(Math.abs(x)).toBeLessThan(0.1);
    expect(Math.abs(y)).toBeLessThan(0.1);
    // Z should have advanced significantly
    expect(z).toBeGreaterThan(-80 + 100 * 0.6 - 1);
  });

  it('correction divider matches iOS constant (13)', () => {
    expect(Constants.torpedoCorrectionSpeedDivider).toBe(13);
  });
});

describe('Torpedo lifespan', () => {
  it('lifespan is 140 frames', () => {
    expect(Constants.torpedoLifespan).toBe(140);
  });

  it('at 60fps, lifespan is ~2.33 seconds', () => {
    const seconds = Constants.torpedoLifespan / 60;
    expect(seconds).toBeCloseTo(2.333, 2);
  });
});

describe('Torpedo energy cost', () => {
  function torpedoEnergyCost(difficulty: number): number {
    return 5 * difficulty;
  }

  it('costs 5 energy at Novice', () => {
    expect(torpedoEnergyCost(1)).toBe(5);
  });

  it('costs 25 energy at Zylon Lord', () => {
    expect(torpedoEnergyCost(5)).toBe(25);
  });
});

describe('Max torpedoes by difficulty', () => {
  function maxTorpedoes(difficulty: number): number {
    return Constants.maxTorpedoes - difficulty;
  }

  it('Novice: 5 max torpedoes', () => {
    expect(maxTorpedoes(1)).toBe(5);
  });

  it('Lord: 1 max torpedo', () => {
    expect(maxTorpedoes(5)).toBe(1);
  });

  it('aft view: further reduced by 2', () => {
    const maxNovice = maxTorpedoes(1);
    const aftMax = Math.max(1, maxNovice - 2);
    expect(aftMax).toBe(3);
  });
});
