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
    if (!this.audioManager.hasSound('ship_hum')) return;

    const ctx = this.audioManager.getContext();
    this.source = ctx.createBufferSource();
    this.source.buffer = this.audioManager.hasSound('ship_hum')
      ? (null as any) // Will be set properly when audio files are available
      : null;

    // For now, use an oscillator as placeholder
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 55; // Low hum

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0;

    osc.connect(this.gainNode);
    this.gainNode.connect(this.audioManager.getMasterGain());
    osc.start();
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
    this.source = null;
    this.gainNode = null;
  }
}
