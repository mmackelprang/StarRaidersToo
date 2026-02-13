/**
 * Queued voice announcements — "Entering sector Alpha 2-3".
 * Ported from ZylonGameViewController.enterSector() lines 1245-1290.
 *
 * Plays a sequence of audio clips: entering_sector + quadrant + tens + ones.
 * Uses Web Audio API buffer scheduling for gapless sequential playback.
 */

import { AudioManager } from '@/audio/AudioManager';

const QUADRANT_NAMES = ['alpha', 'beta', 'gamma', 'delta'] as const;
const NUMBER_NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'] as const;

export class VoiceAnnouncer {
  private audioManager: AudioManager;
  private playing = false;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  /**
   * Announce entry into a sector: "Entering sector [quadrant] [tens] [ones]"
   * Sector number 0-127, quadrant derived from sector / 32.
   */
  announceSector(sectorNumber: number): void {
    if (this.playing) return;

    const quadrantIndex = Math.floor(sectorNumber / 32);
    const localSector = sectorNumber % 32;
    const tens = Math.floor(localSector / 10);
    const ones = localSector % 10;

    const clips: string[] = ['entering_sector', QUADRANT_NAMES[quadrantIndex]];

    if (localSector >= 10) {
      clips.push(NUMBER_NAMES[tens]);
    }
    clips.push(NUMBER_NAMES[ones]);

    this.playSequence(clips);
  }

  /**
   * Announce shield status: "Shields [percentage] percent"
   */
  announceShields(percentage: number): void {
    if (this.playing) return;

    if (percentage <= 0) {
      this.playSequence(['ShieldsFailure']);
    } else {
      // Round to nearest 10
      const rounded = Math.round(percentage / 10) * 10;
      const clamped = Math.max(10, Math.min(100, rounded));
      this.playSequence([`Shields${clamped}`, 'percent']);
    }
  }

  /** Play a sequence of named audio clips back-to-back */
  private playSequence(clipNames: string[]): void {
    this.playing = true;

    const ctx = this.audioManager.getContext();
    let startTime = ctx.currentTime;

    for (const name of clipNames) {
      const buffer = this.audioManager.getBuffer(name);
      if (!buffer) continue;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.value = 1.0;
      source.connect(gain);
      gain.connect(this.audioManager.getMasterGain());

      source.start(startTime);
      startTime += buffer.duration;
    }

    // Mark as done after estimated total duration
    const totalDuration = (startTime - ctx.currentTime) * 1000;
    setTimeout(() => {
      this.playing = false;
    }, Math.max(totalDuration, 500));
  }

  dispose(): void {
    this.playing = false;
  }
}
