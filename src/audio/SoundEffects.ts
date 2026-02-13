/**
 * One-shot sound effects — explosions, shields, beeps, alerts.
 * Ported from UtilityFunctions.swift and ZylonGameViewController.swift.
 *
 * All effects route through AudioManager.playOneShot() which creates
 * a buffer source, connects to master gain, and fires once.
 */

import { AudioManager } from '@/audio/AudioManager';
import { randIntRange } from '@/utils/MathUtils';

/** Volume constants matching iOS */
const BEEP_VOLUME = 0.5;
const ENVIRONMENT_VOLUME = 0.6;
const EXPLOSION_VOLUME = 0.6;

const EXPLOSION_VARIANTS = ['explosion', 'explosion2', 'explosion3', 'explosion4'];

export class SoundEffects {
  private audioManager: AudioManager;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /** UI beep — button presses, mode changes. Volume 0.5 */
  beep(): void {
    this.audioManager.playOneShot('beep', BEEP_VOLUME);
  }

  /** Random explosion from 4 variants. Volume 0.6 */
  explosion(): void {
    const variant = EXPLOSION_VARIANTS[randIntRange(0, 3)];
    this.audioManager.playOneShot(variant, EXPLOSION_VOLUME);
  }

  /** Final death explosion. Volume 0.6 */
  deathExplosion(): void {
    this.audioManager.playOneShot('death', EXPLOSION_VOLUME);
  }

  /** Shields up sound */
  shieldsUp(): void {
    this.audioManager.playOneShot('shieldsUp', ENVIRONMENT_VOLUME);
  }

  /** Shields down sound */
  shieldsDown(): void {
    this.audioManager.playOneShot('shieldsDown', ENVIRONMENT_VOLUME);
  }

  /** Forcefield hit sound */
  shieldHit(): void {
    this.audioManager.playOneShot('forcefieldHit', ENVIRONMENT_VOLUME);
  }

  /** Hull hit sound */
  hullHit(): void {
    this.audioManager.playOneShot('hullHit', ENVIRONMENT_VOLUME);
  }

  /** Ship hull impact */
  shipHullHit(): void {
    this.audioManager.playOneShot('shipHullHit', ENVIRONMENT_VOLUME);
  }

  /** Alert sound */
  alert(): void {
    this.audioManager.playOneShot('alert', ENVIRONMENT_VOLUME);
  }

  /** Enemy alert — when entering enemy sector from galactic map */
  enemyAlert(): void {
    this.audioManager.playOneShot('enemyAlert', BEEP_VOLUME);
  }

  /** Torpedo fail sound */
  torpedoFail(): void {
    this.audioManager.playOneShot('torpedo_fail', BEEP_VOLUME);
  }

  /** Refuel complete */
  refuelComplete(): void {
    this.audioManager.playOneShot('refuelComplete', ENVIRONMENT_VOLUME);
  }

  /** Bad idea — destroying own station */
  badIdea(): void {
    this.audioManager.playOneShot('badIdea', ENVIRONMENT_VOLUME);
  }

  /** Play a named clip at standard environment volume */
  playClip(name: string): void {
    this.audioManager.playOneShot(name, ENVIRONMENT_VOLUME);
  }

  dispose(): void {
    // Nothing to clean up — one-shots manage their own lifecycle
  }
}
