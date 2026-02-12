/**
 * Sector data structure for the 128-sector galaxy.
 * Ported from SectorGrid.swift.
 */

import { KnownQuadrants, SectorGridType, ShipType } from '@/core/types';

export interface SectorGrid {
  /** 1-based sector number (1-128) */
  number: number;
  enemyTypes: ShipType[] | null;
  numberOfSectorObjects: number;
  sectorType: SectorGridType;
}

/** Get the quadrant for a 1-based sector number */
export function sectorQuadrant(sectorNumber: number): KnownQuadrants {
  if (sectorNumber <= 32) return KnownQuadrants.Alpha;
  if (sectorNumber <= 64) return KnownQuadrants.Beta;
  if (sectorNumber <= 96) return KnownQuadrants.Gamma;
  return KnownQuadrants.Delta;
}

/** Get the 1-32 position within the quadrant for a 1-based sector number */
export function sectorQuadrantNumber(sectorNumber: number): number {
  if (sectorNumber >= 97) return sectorNumber - 96;
  if (sectorNumber >= 65) return sectorNumber - 64;
  if (sectorNumber >= 33) return sectorNumber - 32;
  return sectorNumber;
}

/** Quadrant sector ranges (0-based array indices) */
export const QUADRANT_RANGES: Record<KnownQuadrants, { min: number; max: number }> = {
  [KnownQuadrants.Alpha]: { min: 0, max: 31 },
  [KnownQuadrants.Beta]: { min: 32, max: 63 },
  [KnownQuadrants.Gamma]: { min: 64, max: 95 },
  [KnownQuadrants.Delta]: { min: 96, max: 127 },
};

export function createEmptySector(number: number): SectorGrid {
  return {
    number,
    enemyTypes: null,
    numberOfSectorObjects: 0,
    sectorType: SectorGridType.Empty,
  };
}
