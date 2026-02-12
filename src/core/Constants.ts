/**
 * Game constants ported from Constants.swift.
 * These values control gameplay tuning and must match the iOS version exactly.
 */

/** Spoken number words for sector announcements */
export const numberStrings = [
  'zero', 'one', 'two', 'three', 'four',
  'five', 'six', 'seven', 'eight', 'nine',
] as const;

export const Constants = {
  fadedMapTransparency: 0.03,
  starMoveDivider: 0.4,
  maxTorpedoes: 6,
  maxEnemyShips: 5,
  torpedoLifespan: 140,
  torpedoSpeed: 0.6,
  torpedoCorrectionSpeedDivider: 13,
  shotDelay: 1,
  thrustAmount: 5.0,
  numberOfStars: 100,
  starBoundsX: 200,
  starBoundsY: 500,
  starBoundsZ: 500,
  cameraFalloff: 1500.0,
  minHumanShootInterval: 185,
  maxHumanShootInterval: 800,
  sectorBreadth: 500,
  galacticMapBlipRadius: 0.06,
} as const;

export const ObjectCategories = {
  zylonShip:  0b00000001,
  zylonFire:  0b00000010,
  enemyShip:  0b00000100,
  enemyFire:  0b00001000,
  starBases:  0b00010000,
  asteroids:  0b00100000,
  warpgrids:  0b01000000,
} as const;
