/**
 * Prologue screen — 11 typewriter messages with skip button.
 * Ported from PrologueViewController.swift.
 *
 * Displays messages at 0.037s/char, skip button appears at 2.85s.
 * After all messages, waits 3.5s then transitions to game.
 */

import { TelemetryDisplay, PROLOGUE_CHAR_SPEED } from '@/ui/TelemetryDisplay';
import type { Screen } from '@/core/ScreenManager';

/** Skip button delay in seconds */
export const SKIP_BUTTON_DELAY = 2.85;

/** Delay after last message before transitioning (seconds) */
export const POST_MESSAGE_DELAY = 3.5;

interface PrologueMessage {
  text: string;
  delay: number; // seconds before starting this message
}

/** All 11 prologue messages with their delays (from iOS PrologueViewController) */
export const PROLOGUE_MESSAGES: PrologueMessage[] = [
  { text: 'Forty centons ago, they arrived...', delay: 0.75 },
  { text: 'spreading relentlessly across peaceful Zylon\nsystems like an unstoppable virus.', delay: 1.20 },
  { text: '\n\nThe STAR RAIDERS.', delay: 1.55 },
  { text: '\n\nWith warp technology, they quickly established starbases deep within Zylon space,\nconducting brutal raids which easily overwhelmed our defenses.', delay: 1.0 },
  { text: ' In just four cycles,\na single raider defeated almost our entire defense force.', delay: 1.0 },
  { text: '\n\nBut a few brave scientists managed to develop an experimental starcruiser that could\ndefeat the invaders - and finally drive them back to their distant homesystem, Sol.\n\n', delay: 1.25 },
  { text: '\n\nYou will pilot that starship.', delay: 1.5 },
  { text: '\n\nDEFEND THE EMPIRE.', delay: 0.5 },
  { text: ' DRIVE BACK THE HUMON INVADERS.', delay: 0.5 },
  { text: ' SAVE THE ZYLON RACE.\n\n\n', delay: 0.75 },
  { text: '[TRANSMISSION TERMINATED 40AFFE]', delay: 0.0 },
];

export class PrologueScreen implements Screen {
  private container: HTMLDivElement;
  private telemetry: TelemetryDisplay;
  private skipButton: HTMLButtonElement;
  private onComplete: () => void;
  private messageIndex = 0;
  private skipTimer: ReturnType<typeof setTimeout> | null = null;
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement, onComplete: () => void) {
    this.onComplete = onComplete;

    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:#000;z-index:100;';

    // Skip button (initially hidden)
    this.skipButton = document.createElement('button');
    this.skipButton.textContent = 'SKIP >>';
    this.skipButton.style.cssText =
      'position:absolute;bottom:40px;right:40px;' +
      'background:transparent;border:1px solid #888;color:#888;' +
      'font-family:"Courier New",monospace;font-size:1vw;' +
      'padding:0.5vh 1.5vw;cursor:pointer;opacity:0;' +
      'transition:opacity 1s ease;pointer-events:none;z-index:110;';
    this.skipButton.addEventListener('click', () => this.skip());
    this.container.appendChild(this.skipButton);

    parent.appendChild(this.container);
    this.telemetry = new TelemetryDisplay(this.container);
    this.container.style.display = 'none';
  }

  show(): void {
    this.container.style.display = 'block';
    this.telemetry.show();
    this.telemetry.clear();
    this.messageIndex = 0;

    // Show skip button after delay
    this.skipTimer = setTimeout(() => {
      this.skipButton.style.opacity = '0.85';
      this.skipButton.style.pointerEvents = 'auto';
    }, SKIP_BUTTON_DELAY * 1000);

    // Start first message
    this.scheduleNextMessage();
  }

  hide(): void {
    this.container.style.display = 'none';
    this.telemetry.hide();
    this.clearTimers();
  }

  private scheduleNextMessage(): void {
    if (this.messageIndex >= PROLOGUE_MESSAGES.length) {
      // All messages done — wait then transition
      this.messageTimer = setTimeout(() => {
        this.onComplete();
      }, POST_MESSAGE_DELAY * 1000);
      return;
    }

    const msg = PROLOGUE_MESSAGES[this.messageIndex];
    const delay = this.messageIndex === 0 ? msg.delay : msg.delay;

    this.messageTimer = setTimeout(() => {
      this.telemetry.appendMessage(msg.text, PROLOGUE_CHAR_SPEED, () => {
        this.messageIndex++;
        this.scheduleNextMessage();
      });
    }, delay * 1000);
  }

  private skip(): void {
    this.clearTimers();
    this.telemetry.abort();
    this.onComplete();
  }

  private clearTimers(): void {
    if (this.skipTimer) {
      clearTimeout(this.skipTimer);
      this.skipTimer = null;
    }
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }

  dispose(): void {
    this.clearTimers();
    this.telemetry.dispose();
    this.container.remove();
  }
}
