import { describe, it, expect } from 'vitest';
import {
  randIntRange,
  randRange,
  degreesToRadians,
  radiansToDegrees,
  clamp,
  distanceFromOrigin,
} from '@/utils/MathUtils';

describe('randIntRange', () => {
  it('returns values within inclusive bounds', () => {
    for (let i = 0; i < 100; i++) {
      const val = randIntRange(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
    }
  });

  it('returns only integers', () => {
    for (let i = 0; i < 100; i++) {
      const val = randIntRange(0, 100);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('works with single-value range', () => {
    expect(randIntRange(5, 5)).toBe(5);
  });
});

describe('randRange', () => {
  it('returns values within bounds [lower, upper)', () => {
    for (let i = 0; i < 100; i++) {
      const val = randRange(1.5, 3.5);
      expect(val).toBeGreaterThanOrEqual(1.5);
      expect(val).toBeLessThan(3.5);
    }
  });

  it('works with negative ranges', () => {
    for (let i = 0; i < 100; i++) {
      const val = randRange(-50, -10);
      expect(val).toBeGreaterThanOrEqual(-50);
      expect(val).toBeLessThan(-10);
    }
  });
});

describe('degreesToRadians', () => {
  it('converts 0 degrees to 0 radians', () => {
    expect(degreesToRadians(0)).toBe(0);
  });

  it('converts 180 degrees to PI radians', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
  });

  it('converts 360 degrees to 2*PI radians', () => {
    expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
  });

  it('converts 90 degrees to PI/2 radians', () => {
    expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('radiansToDegrees', () => {
  it('converts PI to 180 degrees', () => {
    expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  it('is inverse of degreesToRadians', () => {
    expect(radiansToDegrees(degreesToRadians(45))).toBeCloseTo(45);
    expect(radiansToDegrees(degreesToRadians(270))).toBeCloseTo(270);
  });
});

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value within range unchanged', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('handles edge cases at boundaries', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('distanceFromOrigin', () => {
  it('returns 0 for origin', () => {
    expect(distanceFromOrigin(0, 0, 0)).toBe(0);
  });

  it('calculates correct distance along single axis', () => {
    expect(distanceFromOrigin(5, 0, 0)).toBe(5);
    expect(distanceFromOrigin(0, 3, 0)).toBe(3);
    expect(distanceFromOrigin(0, 0, 4)).toBe(4);
  });

  it('calculates correct distance for 3-4-5 triangle equivalent', () => {
    // sqrt(3^2 + 4^2 + 0^2) = 5
    expect(distanceFromOrigin(3, 4, 0)).toBeCloseTo(5);
  });
});
