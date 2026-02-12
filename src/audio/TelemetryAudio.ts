/**
 * Telemetry audio — looping "wopr" sound during typewriter text display.
 * Ported from TelemetryPlayer.swift setupTelemetryAudioPlayer().
 *
 * Plays a short clicking/beeping loop while text is being typed.
 * Stops when the message is complete.
 */

import { AudioManager } from '@/audio/AudioManager';

export class TelemetryAudio {
  private audioManager: AudioManager;
  private source: AudioBufferSourceNode | null = null;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /** Start the telemetry typing sound (loops until stopped) */
  start(): void {
    if (this.source) return;

    this.source = this.audioManager.playSound('wopr', true, 0.8);
  }

  /** Stop the telemetry typing sound */
  stop(): void {
    if (this.source) {
      try { this.source.stop(); } catch { /* already stopped */ }
      this.source.disconnect();
      this.source = null;
    }
  }

  get isPlaying(): boolean {
    return this.source !== null;
  }

  dispose(): void {
    this.stop();
  }
}
