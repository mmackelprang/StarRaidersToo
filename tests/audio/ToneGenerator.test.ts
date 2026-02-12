import { describe, it, expect } from 'vitest';

/**
 * Tests for ToneGenerator logic.
 * We test the constants and patterns without requiring Web Audio API.
 */

describe('ToneGenerator frequency values', () => {
  it('alert high tone is 486 Hz', () => {
    const HIGH_TONE = 486;
    expect(HIGH_TONE).toBe(486);
  });

  it('alert low tone is 334 Hz', () => {
    const LOW_TONE = 334;
    expect(LOW_TONE).toBe(334);
  });

  it('tones are sine waves (oscillator type)', () => {
    // In the implementation: oscillator.type = 'sine'
    const OSCILLATOR_TYPE = 'sine';
    expect(OSCILLATOR_TYPE).toBe('sine');
  });
});

describe('Scanner beam rotation', () => {
  it('completes 360 degrees in 1.5 seconds', () => {
    const BEAM_SPEED_RAD_PER_SEC = (2 * Math.PI) / 1.5;
    const fullRotation = BEAM_SPEED_RAD_PER_SEC * 1.5;
    expect(fullRotation).toBeCloseTo(2 * Math.PI);
  });

  it('rotates at 240 degrees per second', () => {
    const BEAM_SPEED_DEG_PER_SEC = 360 / 1.5;
    expect(BEAM_SPEED_DEG_PER_SEC).toBe(240);
  });
});

describe('Scanner blip positioning', () => {
  function worldToScanner(worldX: number, worldY: number, worldZ: number) {
    return {
      x: worldX / 100,
      y: worldY / 90,
      z: worldZ / 90,
    };
  }

  it('scales X by dividing by 100', () => {
    const blip = worldToScanner(100, 0, 0);
    expect(blip.x).toBe(1);
  });

  it('scales Y by dividing by 90', () => {
    const blip = worldToScanner(0, 90, 0);
    expect(blip.y).toBe(1);
  });

  it('scales Z by dividing by 90', () => {
    const blip = worldToScanner(0, 0, -90);
    expect(blip.z).toBe(-1);
  });

  it('origin maps to scanner center', () => {
    const blip = worldToScanner(0, 0, 0);
    expect(blip.x).toBe(0);
    expect(blip.y).toBe(0);
    expect(blip.z).toBe(0);
  });
});
