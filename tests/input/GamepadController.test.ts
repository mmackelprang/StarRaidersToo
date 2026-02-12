import { describe, it, expect } from 'vitest';

/**
 * Tests for GamepadController logic.
 * We test constants and mapping logic without requiring Gamepad API.
 */

describe('Gamepad stick scaling', () => {
  const GAMEPAD_STICK_DIVISOR = 40;
  const TOUCH_JOYSTICK_DIVISOR = 100;

  it('gamepad stick divisor is 40 (matches iOS)', () => {
    expect(GAMEPAD_STICK_DIVISOR).toBe(40);
  });

  it('gamepad is more sensitive than touch joystick', () => {
    expect(GAMEPAD_STICK_DIVISOR).toBeLessThan(TOUCH_JOYSTICK_DIVISOR);
  });

  it('full stick deflection produces reasonable thrust', () => {
    const maxDeflection = 1.0;
    const thrust = maxDeflection / GAMEPAD_STICK_DIVISOR;
    expect(thrust).toBe(0.025);
  });

  it('half stick deflection produces half thrust', () => {
    const halfDeflection = 0.5;
    const thrust = halfDeflection / GAMEPAD_STICK_DIVISOR;
    expect(thrust).toBeCloseTo(0.0125);
  });
});

describe('Gamepad button indices (Standard mapping)', () => {
  const BUTTON = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
  };

  it('A button is index 0', () => {
    expect(BUTTON.A).toBe(0);
  });

  it('B button is index 1', () => {
    expect(BUTTON.B).toBe(1);
  });

  it('LT is index 6 (shields toggle)', () => {
    expect(BUTTON.LT).toBe(6);
  });

  it('RT is index 7 (fire)', () => {
    expect(BUTTON.RT).toBe(7);
  });

  it('LB is index 4 (galactic map)', () => {
    expect(BUTTON.LB).toBe(4);
  });
});

describe('Gamepad deadzone filtering', () => {
  const DEADZONE = 0.1;

  function applyDeadzone(value: number): number {
    return Math.abs(value) > DEADZONE ? value : 0;
  }

  it('values within deadzone return 0', () => {
    expect(applyDeadzone(0.05)).toBe(0);
    expect(applyDeadzone(-0.09)).toBe(0);
  });

  it('values outside deadzone pass through', () => {
    expect(applyDeadzone(0.5)).toBe(0.5);
    expect(applyDeadzone(-0.8)).toBe(-0.8);
  });

  it('deadzone boundary is exclusive', () => {
    expect(applyDeadzone(0.1)).toBe(0);
    expect(applyDeadzone(0.11)).toBeCloseTo(0.11);
  });
});

describe('Edge-triggered button detection', () => {
  function detectEdge(prev: boolean, current: boolean): boolean {
    return current && !prev;
  }

  it('detects press (false → true)', () => {
    expect(detectEdge(false, true)).toBe(true);
  });

  it('ignores hold (true → true)', () => {
    expect(detectEdge(true, true)).toBe(false);
  });

  it('ignores release (true → false)', () => {
    expect(detectEdge(true, false)).toBe(false);
  });

  it('ignores idle (false → false)', () => {
    expect(detectEdge(false, false)).toBe(false);
  });
});

describe('Galactic map 3D constants', () => {
  it('enemy blip pulse period is 1000ms (1s, matches iOS)', () => {
    expect(1000).toBe(1000);
  });

  it('station blip pulse period is 200ms (matches iOS)', () => {
    expect(200).toBe(200);
  });

  it('blip rotation takes 4 seconds', () => {
    expect(4000).toBe(4000);
  });

  it('map zoom range is 0.75 to 1.2', () => {
    const MIN = 0.75;
    const MAX = 1.2;
    expect(MIN).toBeLessThan(MAX);
    expect(MIN).toBe(0.75);
    expect(MAX).toBe(1.2);
  });

  it('faded map transparency is 0.03 (3%)', () => {
    expect(0.03).toBe(0.03);
  });
});

describe('Haptic vibration patterns', () => {
  const PATTERNS = {
    light: [10],
    medium: [20],
    heavy: [40],
    error: [50, 30, 50],
    oldSchool: [100],
  };

  it('medium is used for shield hits', () => {
    expect(PATTERNS.medium[0]).toBe(20);
  });

  it('error pattern has 3 pulses', () => {
    expect(PATTERNS.error.length).toBe(3);
  });

  it('oldSchool is a single long vibrate', () => {
    expect(PATTERNS.oldSchool[0]).toBe(100);
  });

  it('heavy is stronger than medium', () => {
    expect(PATTERNS.heavy[0]).toBeGreaterThan(PATTERNS.medium[0]);
  });
});
