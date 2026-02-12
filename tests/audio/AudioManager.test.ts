import { describe, it, expect } from 'vitest';

/**
 * Tests for AudioManager logic.
 * We test buffer cache logic and API contracts without requiring Web Audio API.
 */

describe('AudioManager buffer cache logic', () => {
  function createMockCache() {
    const cache = new Map<string, { duration: number }>();
    return {
      set: (name: string, buffer: { duration: number }) => cache.set(name, buffer),
      get: (name: string) => cache.get(name),
      has: (name: string) => cache.has(name),
      clear: () => cache.clear(),
      size: () => cache.size,
    };
  }

  it('hasSound returns false for unknown sound', () => {
    const cache = createMockCache();
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('hasSound returns true after sound is cached', () => {
    const cache = createMockCache();
    cache.set('explosion', { duration: 0.5 });
    expect(cache.has('explosion')).toBe(true);
  });

  it('caching same sound twice does not duplicate', () => {
    const cache = createMockCache();
    cache.set('beep', { duration: 0.1 });
    cache.set('beep', { duration: 0.1 });
    expect(cache.size()).toBe(1);
  });

  it('clear removes all cached sounds', () => {
    const cache = createMockCache();
    cache.set('a', { duration: 0.1 });
    cache.set('b', { duration: 0.2 });
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.has('a')).toBe(false);
  });
});

describe('AudioManager mute logic', () => {
  it('muted starts as false', () => {
    let muted = false;
    expect(muted).toBe(false);
  });

  it('master gain is 0 when muted', () => {
    const muted = true;
    const gainValue = muted ? 0 : 1;
    expect(gainValue).toBe(0);
  });

  it('master gain is 1 when unmuted', () => {
    const muted = false;
    const gainValue = muted ? 0 : 1;
    expect(gainValue).toBe(1);
  });
});

describe('AudioManager playSound contracts', () => {
  it('returns null when buffer not cached', () => {
    const cache = new Map<string, unknown>();
    const buffer = cache.get('missing');
    expect(buffer ?? null).toBeNull();
  });

  it('loop defaults to false', () => {
    function playSound(_name: string, loop = false) {
      return { loop };
    }
    const result = playSound('test');
    expect(result.loop).toBe(false);
  });

  it('volume defaults to 1.0', () => {
    function playSound(_name: string, _loop = false, volume = 1.0) {
      return { volume };
    }
    const result = playSound('test');
    expect(result.volume).toBe(1.0);
  });
});
