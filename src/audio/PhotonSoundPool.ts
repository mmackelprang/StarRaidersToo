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
    // When audio files are loaded, this will cycle through 4 buffer instances
    // For now, use the tone generator as a placeholder
    const ctx = this.audioManager.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 880 + this.currentSlot * 100;
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(this.audioManager.getMasterGain());
    osc.start();

    // Short burst
    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }, 80);

    this.currentSlot = (this.currentSlot + 1) % this.poolSize;
  }

  /** Play the torpedo fail sound */
  playFail(): void {
    const ctx = this.audioManager.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 200;
    gain.gain.value = 0.06;

    osc.connect(gain);
    gain.connect(this.audioManager.getMasterGain());
    osc.start();

    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }, 150);
  }

  dispose(): void {
    // Nothing to clean up — sounds are one-shot
  }
}
