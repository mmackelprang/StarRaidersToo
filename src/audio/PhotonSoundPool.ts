/**
 * 4-slot round-robin sound pool for rapid torpedo fire.
 * Ported from ZylonGameViewController photonSoundArray.
 *
 * Cycles through 4 sound slots to allow overlapping torpedo fire sounds.
 */

import { AudioManager } from '@/audio/AudioManager';

export class PhotonSoundPool {
  private audioManager: AudioManager;
  private currentSlot = 0;
  private readonly poolSize = 4;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /** Play the next torpedo fire sound in the pool */
  play(): void {
    this.audioManager.playOneShot('photon_sound', 0.3);
    this.currentSlot = (this.currentSlot + 1) % this.poolSize;
  }

  /** Play the torpedo fail sound */
  playFail(): void {
    this.audioManager.playOneShot('torpedo_fail', 0.2);
  }

  dispose(): void {
    // Nothing to clean up — sounds are one-shot
  }
}
