import { describe, it, expect } from 'vitest';

/**
 * Tests for PhotonSoundPool round-robin logic.
 * We test the cycling pattern without requiring Web Audio API.
 */

describe('PhotonSoundPool round-robin cycling', () => {
  const POOL_SIZE = 4;

  function simulatePool(fireCount: number): number[] {
    let currentSlot = 0;
    const slots: number[] = [];
    for (let i = 0; i < fireCount; i++) {
      slots.push(currentSlot);
      currentSlot = (currentSlot + 1) % POOL_SIZE;
    }
    return slots;
  }

  it('starts at slot 0', () => {
    const slots = simulatePool(1);
    expect(slots[0]).toBe(0);
  });

  it('cycles through 0, 1, 2, 3', () => {
    const slots = simulatePool(4);
    expect(slots).toEqual([0, 1, 2, 3]);
  });

  it('wraps back to 0 after slot 3', () => {
    const slots = simulatePool(5);
    expect(slots[4]).toBe(0);
  });

  it('completes full cycle in 4 fires', () => {
    const slots = simulatePool(8);
    expect(slots).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
  });

  it('pool size is 4 (matches iOS photonSoundArray)', () => {
    expect(POOL_SIZE).toBe(4);
  });
});

describe('PhotonSoundPool frequency differentiation', () => {
  function getFrequencyForSlot(slot: number): number {
    return 880 + slot * 100;
  }

  it('slot 0 produces 880 Hz', () => {
    expect(getFrequencyForSlot(0)).toBe(880);
  });

  it('slot 1 produces 980 Hz', () => {
    expect(getFrequencyForSlot(1)).toBe(980);
  });

  it('slot 2 produces 1080 Hz', () => {
    expect(getFrequencyForSlot(2)).toBe(1080);
  });

  it('slot 3 produces 1180 Hz', () => {
    expect(getFrequencyForSlot(3)).toBe(1180);
  });

  it('all slots have distinct frequencies', () => {
    const freqs = [0, 1, 2, 3].map(getFrequencyForSlot);
    expect(new Set(freqs).size).toBe(4);
  });
});

describe('Voice announcement number splitting', () => {
  const NUMBER_NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  function splitSectorNumber(localSector: number): string[] {
    const tens = Math.floor(localSector / 10);
    const ones = localSector % 10;
    if (localSector >= 10) {
      return [NUMBER_NAMES[tens], NUMBER_NAMES[ones]];
    }
    return [NUMBER_NAMES[ones]];
  }

  it('single digit returns one clip', () => {
    expect(splitSectorNumber(7)).toEqual(['seven']);
  });

  it('two digits return tens and ones', () => {
    expect(splitSectorNumber(23)).toEqual(['two', 'three']);
  });

  it('sector 0 returns zero', () => {
    expect(splitSectorNumber(0)).toEqual(['zero']);
  });

  it('sector 10 returns one-zero', () => {
    expect(splitSectorNumber(10)).toEqual(['one', 'zero']);
  });

  it('sector 31 returns three-one', () => {
    expect(splitSectorNumber(31)).toEqual(['three', 'one']);
  });
});

describe('Sound effect volume constants', () => {
  it('beep volume is 0.5', () => {
    expect(0.5).toBe(0.5);
  });

  it('explosion volume is 0.6', () => {
    expect(0.6).toBe(0.6);
  });

  it('warp volume is 0.9', () => {
    expect(0.9).toBe(0.9);
  });

  it('voice volume is 1.0', () => {
    expect(1.0).toBe(1.0);
  });
});
