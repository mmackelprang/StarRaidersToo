import { describe, it, expect } from 'vitest';
import { degreesToRadians } from '@/utils/MathUtils';

/**
 * Tests for joystick angle/displacement calculations.
 * We test the math directly since the DOM joystick requires a browser environment.
 */

describe('Joystick angle calculation', () => {
  // Port of JoyStickView.swift line 239 + 294:
  //   angleRadians = atan2f(delta.dx, delta.dy)
  //   angle = 180 - angleRadians * 180 / π
  function calculateAngle(dx: number, dy: number): number {
    const angleRadians = Math.atan2(dx, dy);
    return 180 - angleRadians * 180 / Math.PI;
  }

  it('reports 0° (north) when pushing up (dy negative in screen, but dy positive in joystick)', () => {
    // In the joystick, "up" means dy < 0 in screen coords but the joystick
    // reports angle based on delta from center where dy is positive = up
    // With dx=0, dy=1 (straight up): atan2(0, 1) = 0, angle = 180 - 0 = 180
    // Wait - in iOS the dy convention is inverted.
    // Actually: dx=0 (no horizontal), dy > 0 means moving UP in the joystick view
    // atan2(0, positive) = 0 radians, so angle = 180 - 0 = 180
    // Hmm, let's check: in iOS screen coords, Y increases downward
    // The joystick uses superview coords where dy = location.y - center.y
    // Moving finger UP = negative dy, so delta.dy is negative
    // atan2(0, -1) = π, angle = 180 - π*180/π = 180 - 180 = 0°
    const angle = calculateAngle(0, -1); // finger moved up (negative dy in screen)
    expect(angle).toBeCloseTo(0);
  });

  it('reports 90° (east) when pushing right', () => {
    // dx = positive, dy = 0
    // atan2(1, 0) = π/2
    // angle = 180 - (π/2 * 180/π) = 180 - 90 = 90
    const angle = calculateAngle(1, 0);
    expect(angle).toBeCloseTo(90);
  });

  it('reports 180° (south) when pushing down', () => {
    // dx = 0, dy = positive (finger moved down in screen coords)
    // atan2(0, 1) = 0
    // angle = 180 - 0 = 180
    const angle = calculateAngle(0, 1);
    expect(angle).toBeCloseTo(180);
  });

  it('reports 270° (west) when pushing left', () => {
    // dx = negative, dy = 0
    // atan2(-1, 0) = -π/2
    // angle = 180 - (-90) = 270
    const angle = calculateAngle(-1, 0);
    expect(angle).toBeCloseTo(270);
  });
});

describe('Joystick displacement calculation', () => {
  function calculateDisplacement(dx: number, dy: number, radius: number): number {
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(dist / radius, 1.0);
  }

  it('returns 0 at center', () => {
    expect(calculateDisplacement(0, 0, 75)).toBe(0);
  });

  it('returns 1.0 at edge of radius', () => {
    expect(calculateDisplacement(75, 0, 75)).toBeCloseTo(1.0);
  });

  it('clamps to 1.0 beyond radius', () => {
    expect(calculateDisplacement(100, 0, 75)).toBe(1.0);
  });

  it('returns 0.5 at half radius', () => {
    expect(calculateDisplacement(37.5, 0, 75)).toBeCloseTo(0.5);
  });
});

describe('Joystick thrust calculation', () => {
  // Port of ZylonGameViewController.swift lines 124-126
  function xThrust(angle: number, displacement: number): number {
    return Math.cos(degreesToRadians(angle)) * displacement / 100;
  }
  function yThrust(angle: number, displacement: number): number {
    return Math.sin(degreesToRadians(angle)) * displacement / 100;
  }

  it('produces zero thrust with zero displacement', () => {
    expect(xThrust(45, 0)).toBe(0);
    expect(yThrust(45, 0)).toBe(0);
  });

  it('produces non-zero thrust at full displacement', () => {
    const x = xThrust(45, 1);
    const y = yThrust(45, 1);
    expect(x).not.toBe(0);
    expect(y).not.toBe(0);
  });

  it('thrust values are small (divided by 100)', () => {
    // At max displacement=1.0, max thrust component is 1/100 = 0.01
    const x = xThrust(0, 1);
    expect(Math.abs(x)).toBeLessThanOrEqual(0.01);
  });

  it('inverted thrust is negated via angle + π', () => {
    const normal = Math.cos(degreesToRadians(45)) / 100;
    const inverted = Math.cos(degreesToRadians(45) + Math.PI) / 100;
    expect(inverted).toBeCloseTo(-normal);
  });
});
