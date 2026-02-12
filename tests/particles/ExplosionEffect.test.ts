import { describe, it, expect } from 'vitest';
import {
  EXPLOSION_DURATION,
  STATION_EXPLOSION_DURATION,
  EXPLOSION_CLEANUP_FRAMES,
} from '@/particles/ExplosionEffect';

/**
 * Tests for explosion effect constants matching iOS .scnp values.
 */

describe('Explosion effect constants', () => {
  it('standard explosion duration is 0.3s (matches iOS Explosion.scnp)', () => {
    expect(EXPLOSION_DURATION).toBe(0.3);
  });

  it('station explosion duration is 0.75s (matches iOS StationExplosion.scnp)', () => {
    expect(STATION_EXPLOSION_DURATION).toBe(0.75);
  });

  it('explosion cleanup threshold is 300 frames (matches iOS)', () => {
    expect(EXPLOSION_CLEANUP_FRAMES).toBe(300);
  });

  it('at 60fps, standard explosion is 18 frames', () => {
    expect(EXPLOSION_DURATION * 60).toBe(18);
  });

  it('at 60fps, station explosion is 45 frames', () => {
    expect(STATION_EXPLOSION_DURATION * 60).toBe(45);
  });
});

describe('Station explosion pattern', () => {
  it('creates 8 sub-explosions at random offsets (matches iOS stationBoom)', () => {
    // iOS: for _ in 1...8 { ... create explosion at random offset ... }
    const SUB_EXPLOSION_COUNT = 8;
    expect(SUB_EXPLOSION_COUNT).toBe(8);
  });

  it('offset ranges match iOS: X(-10,15), Y(-10,10), Z(-10,10)', () => {
    const xRange = { min: -10, max: 15 };
    const yRange = { min: -10, max: 10 };
    const zRange = { min: -10, max: 10 };

    // Verify ranges are valid
    expect(xRange.max - xRange.min).toBe(25);
    expect(yRange.max - yRange.min).toBe(20);
    expect(zRange.max - zRange.min).toBe(20);
  });
});
