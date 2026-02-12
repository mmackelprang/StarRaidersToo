/**
 * Music player — menu and prologue background music.
 * Ported from MainMenuViewController.setupMusicAudioPlayer().
 *
 * Menu: "dreadnaught" — plays during main menu.
 * Prologue: "zylonHope" — plays during prologue sequence.
 */

import { AudioManager } from '@/audio/AudioManager';

export class MusicPlayer {
  private audioManager: AudioManager;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private currentTrack = '';

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /** Play a named music track, looping */
  play(trackName: string, volume = 1.0): void {
    if (this.currentTrack === trackName && this.currentSource) return;

    this.stopImmediate();

    const source = this.audioManager.playSound(trackName, true, volume);
    if (source) {
      this.currentSource = source;
      this.currentTrack = trackName;
    }
  }

  /** Fade out current track over duration (seconds), then stop */
  fadeOut(durationSeconds = 1.5): void {
    if (!this.currentGain) {
      this.stopImmediate();
      return;
    }

    const ctx = this.audioManager.getContext();
    this.currentGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSeconds);

    setTimeout(() => {
      this.stopImmediate();
    }, durationSeconds * 1000);
  }

  /** Immediately stop current music */
  stopImmediate(): void {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch { /* already stopped */ }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    this.currentGain = null;
    this.currentTrack = '';
  }

  get isPlaying(): boolean {
    return this.currentSource !== null;
  }

  dispose(): void {
    this.stopImmediate();
  }
}
