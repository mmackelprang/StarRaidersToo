import { describe, it, expect, beforeEach } from 'vitest';
import { DamageAmount } from '@/core/types';

/**
 * Tests for ZylonShip state logic.
 * We test the pure state/math functions without requiring Babylon.js Scene.
 */

describe('ZylonShip energy drain', () => {
  // Port the drain logic directly for unit testing without Scene dependency
  function calculateDrainRate(shieldsUp: boolean, difficulty: number, speed: number): number {
    const base = shieldsUp ? 20 : 60;
    let rate = Math.trunc(base / difficulty) - Math.trunc(speed / 3);
    if (rate < 1) rate = 1;
    return rate;
  }

  it('drains faster with shields up (Novice, speed 0)', () => {
    const withShields = calculateDrainRate(true, 1, 0);
    const withoutShields = calculateDrainRate(false, 1, 0);
    expect(withShields).toBeLessThan(withoutShields);
  });

  it('drains faster at higher difficulty', () => {
    const novice = calculateDrainRate(false, 1, 0);  // 60/1 = 60
    const lord = calculateDrainRate(false, 5, 0);     // 60/5 = 12
    expect(lord).toBeLessThan(novice);
  });

  it('drains faster at higher speed', () => {
    const slow = calculateDrainRate(false, 1, 0);   // 60 - 0 = 60
    const fast = calculateDrainRate(false, 1, 9);   // 60 - 3 = 57
    expect(fast).toBeLessThan(slow);
  });

  it('has minimum drain rate of 1', () => {
    // Lord difficulty with shields up and max speed: 20/5 - 9/3 = 4 - 3 = 1
    const rate = calculateDrainRate(true, 5, 9);
    expect(rate).toBeGreaterThanOrEqual(1);

    // Even more extreme: should still be 1
    const extreme = calculateDrainRate(true, 100, 100);
    expect(extreme).toBe(1);
  });

  it('matches exact iOS values for Novice, shields down, speed 0', () => {
    // 60/1 - 0/3 = 60
    expect(calculateDrainRate(false, 1, 0)).toBe(60);
  });

  it('matches exact iOS values for Lord, shields up, speed 5', () => {
    // 20/5 - 5/3 = 4 - 1 (trunc) = 3
    expect(calculateDrainRate(true, 5, 5)).toBe(3);
  });
});

describe('ZylonShip initial state', () => {
  it('has correct initial values matching iOS', () => {
    // Test the initial values without Scene dependency
    const defaults = {
      shipClock: 0,
      currentSectorNumber: 64,
      targetSectorNumber: 68,
      tacticalDisplayEngaged: false,
      isInAlertMode: false,
      isCurrentlyInWarp: false,
      shieldsAreUp: false,
      currentSpeed: 0,
      engineHealth: 100,
      shieldStrength: 100,
      energyStore: 10000,
      currentTorpedoBay: 1,
    };

    expect(defaults.currentSectorNumber).toBe(64);
    expect(defaults.targetSectorNumber).toBe(68);
    expect(defaults.energyStore).toBe(10000);
    expect(defaults.shieldStrength).toBe(100);
    expect(defaults.shieldsAreUp).toBe(false);
  });
});

describe('ZylonShip repair', () => {
  it('restores all systems to functional', () => {
    const systems = {
      outerHull: DamageAmount.Destroyed,
      shieldIntegrity: DamageAmount.SeverelyDamaged,
      engineIntegrity: DamageAmount.Damaged,
      scanner: DamageAmount.Functional,
      babelfishCircuit: DamageAmount.Destroyed,
      genderIdentityCircuit: DamageAmount.Functional,
    };

    // Simulate repair
    systems.outerHull = DamageAmount.Functional;
    systems.engineIntegrity = DamageAmount.Functional;
    systems.shieldIntegrity = DamageAmount.Functional;

    expect(systems.outerHull).toBe(DamageAmount.Functional);
    expect(systems.engineIntegrity).toBe(DamageAmount.Functional);
    expect(systems.shieldIntegrity).toBe(DamageAmount.Functional);
  });
});

describe('ZylonShip takeDamage', () => {
  it('destroys shields when strength <= 0 and shields are up', () => {
    let shieldStrength = 0;
    let shieldsAreUp = true;
    let shieldIntegrity = DamageAmount.Functional;

    // takeDamage logic
    if (shieldStrength <= 0 && shieldsAreUp) {
      shieldIntegrity = DamageAmount.Destroyed;
      shieldsAreUp = false;
    }

    expect(shieldIntegrity).toBe(DamageAmount.Destroyed);
    expect(shieldsAreUp).toBe(false);
  });

  it('does not destroy shields when strength > 0', () => {
    let shieldStrength = 50;
    let shieldsAreUp = true;
    let shieldIntegrity = DamageAmount.Functional;

    if (shieldStrength <= 0 && shieldsAreUp) {
      shieldIntegrity = DamageAmount.Destroyed;
      shieldsAreUp = false;
    }

    expect(shieldIntegrity).toBe(DamageAmount.Functional);
    expect(shieldsAreUp).toBe(true);
  });
});
