/**
 * Shared enums and type definitions ported from multiple Swift files.
 */

export enum ViewMode {
  ForeView = 'foreView',
  AftView = 'aftView',
  GalacticMap = 'galacticMap',
}

export enum Difficulty {
  Novice = 'Cadet',
  Pilot = 'Pilot',
  Warrior = 'Warrior',
  Commander = 'Commander',
  Lord = 'Zylon Lord',
}

/** Difficulty enum to numeric scalar (1-5) */
export function difficultyScalar(d: Difficulty): number {
  switch (d) {
    case Difficulty.Novice: return 1;
    case Difficulty.Pilot: return 2;
    case Difficulty.Commander: return 3;
    case Difficulty.Warrior: return 4;
    case Difficulty.Lord: return 5;
  }
}

export enum ShipType {
  Scout = 0,
  Fighter = 1,
  Destroyer = 2,
}

export enum TorpType {
  Humon = 'humon',
  Zylon = 'zylon',
}

export enum SectorGridType {
  Empty = 'empty',
  Starbase = 'starbase',
  Enemy = 'enemy',
  Enemy2 = 'enemy2',
  Enemy3 = 'enemy3',
}

export enum KnownQuadrants {
  Alpha = 'alpha',
  Beta = 'beta',
  Gamma = 'gamma',
  Delta = 'delta',
}

export enum DamageAmount {
  Functional = 0,
  Damaged = 1,
  SeverelyDamaged = 2,
  Destroyed = 3,
}

export enum ObjectType {
  HumonShip = 'humonShip',
  ZylonStation = 'zylonStation',
  Asteroid = 'asteroid',
}

export interface GameSettings {
  prologueEnabled: boolean;
  invertedAxis: boolean;
  difficulty: Difficulty;
}

export interface ShipSystems {
  outerHull: DamageAmount;
  shieldIntegrity: DamageAmount;
  engineIntegrity: DamageAmount;
  scanner: DamageAmount;
  babelfishCircuit: DamageAmount;
  genderIdentityCircuit: DamageAmount;
}

/** Ranking titles from best to worst */
export const rankArray = [
  'ZYLON HERO',
  'SPACE ACE',
  'WARRIOR',
  'CAPTAIN',
  'STAR COMMANDER',
  'COMMANDER',
  'LIEUTENANT',
  'PILOT',
  'ENSIGN',
  'NOVICE',
  'ROOKIE',
  'GARBAGE SCOW CAPTAIN',
  'GALACTIC COOK',
] as const;
