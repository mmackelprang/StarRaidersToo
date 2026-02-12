/**
 * Alert system — blinking text and alternating alarm tones.
 * Ported from HUD.swift alert logic.
 *
 * Alert alarm: 486Hz and 334Hz alternating every 1 second, 7 repeats total.
 * Alert text blinks at 1-second intervals.
 */

import { ToneGenerator } from '@/audio/ToneGenerator';

const HIGH_TONE = 486;
const LOW_TONE = 334;
const ALARM_INTERVAL_MS = 1000;
const MAX_ALARM_REPEATS = 7;

export class AlertSystem {
  private container: HTMLDivElement;
  private alertText: HTMLSpanElement;
  private toneGenerator: ToneGenerator;
  private alarmTimer: number | null = null;
  private blinkTimer: number | null = null;
  private alarmRepeats = 0;
  private blinkVisible = true;

  constructor(parentElement: HTMLElement) {
    this.toneGenerator = new ToneGenerator();

    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '30',
      pointerEvents: 'none',
    });

    this.alertText = document.createElement('span');
    Object.assign(this.alertText.style, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#0f0',
      textShadow: '0 0 8px #0f0',
    });
    this.alertText.textContent = '';

    this.container.appendChild(this.alertText);
    parentElement.appendChild(this.container);
  }

  /**
   * Activate alert with blinking text and alarm tones.
   * Ported from HUD.swift activateAlert() / soundSectorAlarm().
   */
  activateAlert(message: string): void {
    this.alertText.textContent = message;
    this.alarmRepeats = 0;

    // Start blinking text
    if (this.blinkTimer === null) {
      this.blinkVisible = true;
      this.blinkTimer = window.setInterval(() => {
        this.blinkVisible = !this.blinkVisible;
        this.alertText.style.visibility = this.blinkVisible ? 'visible' : 'hidden';
      }, ALARM_INTERVAL_MS);
    }

    // Start alarm tone
    this.toneGenerator.frequency = HIGH_TONE;
    this.toneGenerator.play();

    if (this.alarmTimer === null) {
      this.alarmTimer = window.setInterval(() => {
        this.alarmRepeats += 1;
        if (this.alarmRepeats < MAX_ALARM_REPEATS) {
          // Alternate between high and low tone
          if (this.toneGenerator.frequency === HIGH_TONE) {
            this.toneGenerator.frequency = LOW_TONE;
          } else {
            this.toneGenerator.frequency = HIGH_TONE;
          }
        } else {
          this.toneGenerator.stop();
          if (this.alarmTimer !== null) {
            clearInterval(this.alarmTimer);
            this.alarmTimer = null;
          }
        }
      }, ALARM_INTERVAL_MS);
    }
  }

  deactivateAlert(): void {
    this.alertText.textContent = '';
    this.toneGenerator.stop();

    if (this.blinkTimer !== null) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.alarmTimer !== null) {
      clearInterval(this.alarmTimer);
      this.alarmTimer = null;
    }
    this.alertText.style.visibility = 'visible';
  }

  /** Update status text without alert (non-blinking) */
  setStatusText(text: string): void {
    if (this.blinkTimer !== null) return; // Don't overwrite active alert
    this.alertText.textContent = text;
    this.alertText.style.visibility = 'visible';
  }

  dispose(): void {
    this.deactivateAlert();
    this.toneGenerator.dispose();
    this.container.remove();
  }
}

/** Alert tone constants for testing */
export { HIGH_TONE, LOW_TONE, MAX_ALARM_REPEATS };
