import { describe, it, expect } from 'vitest';
import { KnownQuadrants } from '@/core/types';
import {
  sectorQuadrant,
  sectorQuadrantNumber,
  createEmptySector,
  QUADRANT_RANGES,
} from '@/galaxy/SectorGrid';

describe('SectorGrid quadrant calculation', () => {
  it('assigns sectors 1-32 to Alpha', () => {
    expect(sectorQuadrant(1)).toBe(KnownQuadrants.Alpha);
    expect(sectorQuadrant(16)).toBe(KnownQuadrants.Alpha);
    expect(sectorQuadrant(32)).toBe(KnownQuadrants.Alpha);
  });

  it('assigns sectors 33-64 to Beta', () => {
    expect(sectorQuadrant(33)).toBe(KnownQuadrants.Beta);
    expect(sectorQuadrant(48)).toBe(KnownQuadrants.Beta);
    expect(sectorQuadrant(64)).toBe(KnownQuadrants.Beta);
  });

  it('assigns sectors 65-96 to Gamma', () => {
    expect(sectorQuadrant(65)).toBe(KnownQuadrants.Gamma);
    expect(sectorQuadrant(80)).toBe(KnownQuadrants.Gamma);
    expect(sectorQuadrant(96)).toBe(KnownQuadrants.Gamma);
  });

  it('assigns sectors 97-128 to Delta', () => {
    expect(sectorQuadrant(97)).toBe(KnownQuadrants.Delta);
    expect(sectorQuadrant(112)).toBe(KnownQuadrants.Delta);
    expect(sectorQuadrant(128)).toBe(KnownQuadrants.Delta);
  });
});

describe('SectorGrid quadrant number', () => {
  it('returns 1-32 within Alpha', () => {
    expect(sectorQuadrantNumber(1)).toBe(1);
    expect(sectorQuadrantNumber(32)).toBe(32);
  });

  it('returns 1-32 within Beta', () => {
    expect(sectorQuadrantNumber(33)).toBe(1);
    expect(sectorQuadrantNumber(64)).toBe(32);
  });

  it('returns 1-32 within Gamma', () => {
    expect(sectorQuadrantNumber(65)).toBe(1);
    expect(sectorQuadrantNumber(96)).toBe(32);
  });

  it('returns 1-32 within Delta', () => {
    expect(sectorQuadrantNumber(97)).toBe(1);
    expect(sectorQuadrantNumber(128)).toBe(32);
  });
});

describe('QUADRANT_RANGES', () => {
  it('has correct 0-based ranges for all quadrants', () => {
    expect(QUADRANT_RANGES[KnownQuadrants.Alpha]).toEqual({ min: 0, max: 31 });
    expect(QUADRANT_RANGES[KnownQuadrants.Beta]).toEqual({ min: 32, max: 63 });
    expect(QUADRANT_RANGES[KnownQuadrants.Gamma]).toEqual({ min: 64, max: 95 });
    expect(QUADRANT_RANGES[KnownQuadrants.Delta]).toEqual({ min: 96, max: 127 });
  });
});

describe('createEmptySector', () => {
  it('creates a sector with correct defaults', () => {
    const sector = createEmptySector(42);
    expect(sector.number).toBe(42);
    expect(sector.sectorType).toBe('empty');
    expect(sector.numberOfSectorObjects).toBe(0);
    expect(sector.enemyTypes).toBeNull();
  });
});
