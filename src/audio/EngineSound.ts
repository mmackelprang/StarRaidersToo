/**
 * Ship engine hum — loops continuously, volume scales with speed.
 * Ported from ZylonGameViewController engine sound logic.
 *
 * Speed 0 = silent, speed >= 1 = full volume.
 */

import { AudioManager } from '@/audio/AudioManager';

export class EngineSound {
  private audioManager: AudioManager;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  start(): void {
    if (this.source) return;

    const buffer = this.audioManager.getBuffer('ship_hum');
    if (!buffer) return;

    const ctx = this.audioManager.getContext();
    this.source = ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0;

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioManager.getMasterGain());
    this.source.start();
  }

  /** Update engine volume based on ship speed (0-9) */
  setSpeed(speed: number): void {
    if (!this.gainNode) return;
    this.gainNode.gain.value = speed >= 1 ? 0.08 : 0;
  }

  stop(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
  }

  dispose(): void {
    this.stop();
    if (this.source) {
      try { this.source.stop(); } catch { /* already stopped */ }
      this.source.disconnect();
    }
    this.source = null;
    this.gainNode = null;
  }
}
