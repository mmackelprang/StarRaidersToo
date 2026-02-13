/**
 * Audio manifest and preloader.
 * Loads all game audio files into AudioManager's buffer cache at startup.
 */

import { AudioManager } from '@/audio/AudioManager';

const AUDIO_BASE = 'audio/';

/** All audio files used by the game, keyed by their buffer name */
const AUDIO_MANIFEST: Record<string, string> = {
  // Ship / engine
  ship_hum: 'ship_hum.mp3',

  // Torpedoes
  photon_sound: 'photon_sound.mp3',
  torpedo_fail: 'torpedo_fail.mp3',

  // Explosions
  explosion: 'explosion.mp3',
  explosion2: 'explosion2.mp3',
  explosion3: 'explosion3.mp3',
  explosion4: 'explosion4.mp3',
  death: 'death.mp3',

  // Shields
  shieldsUp: 'shieldsUp.mp3',
  shieldsDown: 'shieldsDown.mp3',
  forcefieldHit: 'forcefieldHit.mp3',
  hullHit: 'hullHit.mp3',
  shipHullHit: 'shipHullHit.mp3',
  shields: 'shields.mp3',

  // UI / alerts
  beep: 'beep.mp3',
  alert: 'alert.mp3',
  enemyAlert: 'enemyAlert.mp3',
  badIdea: 'badIdea.mp3',
  refuelComplete: 'refuelComplete.mp3',
  galacticMap: 'galacticMap.mp3',

  // Warp
  warpStart: 'warpStart.mp3',
  warpEnd: 'warpEnd.mp3',
  warpStartStop: 'warpStartStop.mp3',

  // Telemetry
  wopr: 'wopr.mp3',
  wopr2: 'wopr2.mp3',

  // Voice — sector entry
  entering_sector: 'entering_sector.mp3',
  alpha: 'alpha.mp3',
  beta: 'beta.mp3',
  gamma: 'gamma.mp3',
  delta: 'delta.mp3',
  alpha_2: 'alpha_2.mp3',
  beta_2: 'beta_2.mp3',
  gamma_2: 'gamma_2.mp3',
  delta_2: 'delta_2.mp3',
  AlphaSector: 'AlphaSector.mp3',
  BetaSector: 'BetaSector.mp3',
  GammaSector: 'GammaSector.mp3',
  DeltaSector: 'DeltaSector.mp3',

  // Voice — numbers
  zero: 'zero.mp3',
  one: 'one.mp3',
  two: 'two.mp3',
  three: 'three.mp3',
  four: 'four.mp3',
  five: 'five.mp3',
  six: 'six.mp3',
  seven: 'seven.mp3',
  eight: 'eight.mp3',
  nine: 'nine.mp3',

  // Voice — shield status
  Shields10: 'Shields10.mp3',
  Shields20: 'Shields20.mp3',
  Shields30: 'Shields30.mp3',
  Shields40: 'Shields40.mp3',
  Shields50: 'Shields50.mp3',
  Shields60: 'Shields60.mp3',
  Shields70: 'Shields70.mp3',
  Shields80: 'Shields80.mp3',
  Shields90: 'Shields90.mp3',
  Shields100: 'Shields100.mp3',
  ShieldsFailure: 'ShieldsFailure.mp3',
  percent: 'percent.mp3',

  // Voice — damage reports
  ReallyreallyBad: 'ReallyreallyBad.mp3',
  babelfishCircuitFailure: 'babelfishCircuitFailure.mp3',
  empathyCircuitDamaged: 'empathyCircuitDamaged.mp3',
  genderIdentityEnforcement: 'genderIdentityEnforcement.mp3',
  gridCoreFailureImminent: 'gridCoreFailureImminent.mp3',
  gridwarpGovernorMalfunction: 'gridwarpGovernorMalfunction.mp3',
  innerHullFailure: 'innerHullFailure.mp3',
  outerHullFailure: 'outerHullFailure.mp3',
  plasmaManifoldFailure: 'plasmaManifoldFailure.mp3',
  proximateImprobabilityDriveDetected: 'proximateImprobabilityDriveDetected.mp3',
  viralIntrusionDetected: 'viralIntrusionDetected.mp3',

  // Voice — station destroyed
  alphaStationDestroyed: 'alphaStationDestroyed.mp3',
  betaStationDestroyed: 'betaStationDestroyed.mp3',
  gammaStationDestroyed: 'gammaStationDestroyed.mp3',
  deltaStationDestroyed: 'deltaStationDestroyed.mp3',

  // Music
  dreadnaught: 'dreadnaught.mp3',
  zylonHope: 'zylonHope.mp3',
};

/**
 * Preload all audio files in parallel.
 * Failures are silently handled by AudioManager (returns silent buffer).
 */
export async function preloadAllAudio(audioManager: AudioManager): Promise<void> {
  const promises = Object.entries(AUDIO_MANIFEST).map(([name, file]) =>
    audioManager.loadSound(name, AUDIO_BASE + file),
  );
  await Promise.all(promises);
}
