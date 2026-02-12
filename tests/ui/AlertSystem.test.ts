import { describe, it, expect } from 'vitest';
import { HIGH_TONE, LOW_TONE, MAX_ALARM_REPEATS } from '@/ui/AlertSystem';

/**
 * Tests for alert system constants and logic.
 * We test the pure values without requiring DOM/Web Audio.
 */

describe('Alert system constants', () => {
  it('high tone is 486 Hz (matches iOS HUD.swift line 18)', () => {
    expect(HIGH_TONE).toBe(486);
  });

  it('low tone is 334 Hz (matches iOS HUD.swift line 19)', () => {
    expect(LOW_TONE).toBe(334);
  });

  it('alarm repeats 7 times (matches iOS HUD.swift line 76)', () => {
    expect(MAX_ALARM_REPEATS).toBe(7);
  });
});

describe('Alert tone alternation pattern', () => {
  function simulateAlarmSequence(): number[] {
    const tones: number[] = [];
    let currentFreq = HIGH_TONE;

    for (let i = 0; i < MAX_ALARM_REPEATS; i++) {
      tones.push(currentFreq);
      currentFreq = currentFreq === HIGH_TONE ? LOW_TONE : HIGH_TONE;
    }
    return tones;
  }

  it('starts with high tone', () => {
    const seq = simulateAlarmSequence();
    expect(seq[0]).toBe(HIGH_TONE);
  });

  it('alternates between high and low', () => {
    const seq = simulateAlarmSequence();
    expect(seq[1]).toBe(LOW_TONE);
    expect(seq[2]).toBe(HIGH_TONE);
    expect(seq[3]).toBe(LOW_TONE);
  });

  it('produces exactly 7 tones', () => {
    const seq = simulateAlarmSequence();
    expect(seq.length).toBe(7);
  });

  it('ends on high tone (odd number of repeats)', () => {
    const seq = simulateAlarmSequence();
    expect(seq[seq.length - 1]).toBe(HIGH_TONE);
  });
});
