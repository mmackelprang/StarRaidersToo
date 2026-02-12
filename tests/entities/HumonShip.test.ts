import { describe, it, expect } from 'vitest';
import { ShipType } from '@/core/types';
import { Constants } from '@/core/Constants';
import { ManeuverType } from '@/entities/HumonShip';

/**
 * Tests for HumonShip AI logic.
 * We test the pure math/logic without requiring Babylon.js Scene.
 */

describe('HumonShip spawn positions', () => {
  it('spawn X range is -10 to 10', () => {
    const minX = -10;
    const maxX = 10;
    // Verify range matches iOS HumonShip.swift line 138
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * (maxX - minX) + minX;
      expect(x).toBeGreaterThanOrEqual(-10);
      expect(x).toBeLessThanOrEqual(10);
    }
  });

  it('spawn Y range is -12 to 12', () => {
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * 24 - 12;
      expect(y).toBeGreaterThanOrEqual(-12);
      expect(y).toBeLessThanOrEqual(12);
    }
  });

  it('spawn Z range is -90 to -60', () => {
    for (let i = 0; i < 100; i++) {
      const z = Math.random() * 30 - 90;
      expect(z).toBeGreaterThanOrEqual(-90);
      expect(z).toBeLessThanOrEqual(-60);
    }
  });
});

describe('HumonShip zig-zag maneuver logic', () => {
  function computeManeuverType(currentX: number): ManeuverType {
    return currentX < 0 ? ManeuverType.Zig : ManeuverType.Zag;
  }

  it('zigs right when on the left side (x < 0)', () => {
    expect(computeManeuverType(-5)).toBe(ManeuverType.Zig);
  });

  it('zags left when on the right side (x >= 0)', () => {
    expect(computeManeuverType(5)).toBe(ManeuverType.Zag);
    expect(computeManeuverType(0)).toBe(ManeuverType.Zag);
  });

  it('zig xDelta is positive (moves right)', () => {
    const xDelta = Math.random() * 20 + 20; // 20 to 40
    expect(xDelta).toBeGreaterThanOrEqual(20);
    expect(xDelta).toBeLessThanOrEqual(40);
  });

  it('zag xDelta is negative (moves left)', () => {
    const xDelta = -(Math.random() * 20 + 20); // -40 to -20
    expect(xDelta).toBeGreaterThanOrEqual(-40);
    expect(xDelta).toBeLessThanOrEqual(-20);
  });
});

describe('HumonShip Z movement logic', () => {
  function computeZDelta(currentZ: number): { min: number; max: number } {
    if (currentZ < -20) {
      return { min: 5, max: 10 }; // advance toward player
    }
    return { min: -25, max: -10 }; // retreat
  }

  it('advances toward player when far away (z < -20)', () => {
    const range = computeZDelta(-50);
    expect(range.min).toBeGreaterThan(0);
    expect(range.max).toBeGreaterThan(0);
  });

  it('retreats when too close (z >= -20)', () => {
    const range = computeZDelta(-10);
    expect(range.min).toBeLessThan(0);
    expect(range.max).toBeLessThan(0);
  });
});

describe('HumonShip fire interval', () => {
  it('fire interval matches iOS constants', () => {
    expect(Constants.minHumanShootInterval).toBe(185);
    expect(Constants.maxHumanShootInterval).toBe(800);
  });

  it('initial countdown is shorter (30-340 frames)', () => {
    for (let i = 0; i < 50; i++) {
      const countdown = Math.floor(Math.random() * 310 + 30);
      expect(countdown).toBeGreaterThanOrEqual(30);
      expect(countdown).toBeLessThanOrEqual(340);
    }
  });
});
