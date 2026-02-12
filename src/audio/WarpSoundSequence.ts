/**
 * Warp sound sequence — warpStart followed by warpEnd.
 * Ported from ZylonGameViewController.setupGridWarpEngineSounds() lines 816-827.
 *
 * Volume: 0.9. Plays two clips back-to-back using Web Audio scheduling.
 */

import { AudioManager } from '@/audio/AudioManager';

const WARP_VOLUME = 0.9;

export class WarpSoundSequence {
  private audioManager: AudioManager;
  private startSource: AudioBufferSourceNode | null = null;
  private endSource: AudioBufferSourceNode | null = null;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /** Play the warp start + warp end sequence */
  play(): void {
    this.stop();

    this.startSource = this.audioManager.playSound('warpStart', false, WARP_VOLUME);

    // Schedule warpEnd to play after warpStart completes
    if (this.startSource && this.startSource.buffer) {
      const ctx = this.audioManager.getContext();
      const endTime = ctx.currentTime + this.startSource.buffer.duration;

      // Use a timeout to trigger warpEnd since we can't precisely schedule
      // a new playSound call via Web Audio scheduling
      const delayMs = this.startSource.buffer.duration * 1000;
      setTimeout(() => {
        this.endSource = this.audioManager.playSound('warpEnd', false, WARP_VOLUME);
      }, delayMs);
    } else {
      // No warpStart loaded — play warpEnd directly
      this.endSource = this.audioManager.playSound('warpEnd', false, WARP_VOLUME);
    }
  }

  /** Stop any playing warp sounds */
  stop(): void {
    if (this.startSource) {
      try { this.startSource.stop(); } catch { /* already stopped */ }
      this.startSource.disconnect();
      this.startSource = null;
    }
    if (this.endSource) {
      try { this.endSource.stop(); } catch { /* already stopped */ }
      this.endSource.disconnect();
      this.endSource = null;
    }
  }

  dispose(): void {
    this.stop();
  }
}
