import { describe, it, expect } from 'vitest';
import { Constants, ObjectCategories, numberStrings } from '@/core/Constants';

describe('Constants', () => {
  it('has correct starfield values', () => {
    expect(Constants.numberOfStars).toBe(100);
    expect(Constants.starMoveDivider).toBe(0.4);
    expect(Constants.starBoundsX).toBe(200);
    expect(Constants.starBoundsY).toBe(500);
    expect(Constants.starBoundsZ).toBe(500);
  });

  it('has correct torpedo values', () => {
    expect(Constants.maxTorpedoes).toBe(6);
    expect(Constants.torpedoLifespan).toBe(140);
    expect(Constants.torpedoSpeed).toBe(0.6);
    expect(Constants.torpedoCorrectionSpeedDivider).toBe(13);
    expect(Constants.shotDelay).toBe(1);
  });

  it('has correct enemy AI values', () => {
    expect(Constants.minHumanShootInterval).toBe(185);
    expect(Constants.maxHumanShootInterval).toBe(800);
    expect(Constants.maxEnemyShips).toBe(5);
  });

  it('has correct camera and map values', () => {
    expect(Constants.cameraFalloff).toBe(1500.0);
    expect(Constants.fadedMapTransparency).toBe(0.03);
    expect(Constants.galacticMapBlipRadius).toBe(0.06);
    expect(Constants.sectorBreadth).toBe(500);
  });
});

describe('ObjectCategories', () => {
  it('has unique bitmask values', () => {
    const values = Object.values(ObjectCategories);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('has correct bitmask values matching iOS', () => {
    expect(ObjectCategories.zylonShip).toBe(1);
    expect(ObjectCategories.zylonFire).toBe(2);
    expect(ObjectCategories.enemyShip).toBe(4);
    expect(ObjectCategories.enemyFire).toBe(8);
    expect(ObjectCategories.starBases).toBe(16);
    expect(ObjectCategories.asteroids).toBe(32);
    expect(ObjectCategories.warpgrids).toBe(64);
  });

  it('bitmasks are powers of 2 (single-bit each)', () => {
    for (const val of Object.values(ObjectCategories)) {
      expect(val & (val - 1)).toBe(0); // power-of-2 check
      expect(val).toBeGreaterThan(0);
    }
  });
});

describe('numberStrings', () => {
  it('has 10 entries for digits 0-9', () => {
    expect(numberStrings).toHaveLength(10);
  });

  it('starts with zero and ends with nine', () => {
    expect(numberStrings[0]).toBe('zero');
    expect(numberStrings[9]).toBe('nine');
  });
});
