/**
 * Cycling credits display — fades messages in and out on a timer.
 * Ported from MainMenuViewController credit cycling logic.
 *
 * 6.5 seconds per credit: 2s fade-in, 3s hold, 1s fade-out, 0.5s gap.
 */

const CREDIT_MESSAGES = [
  'based on STAR RAIDERS by Doug Neubauer',
  'Music by Neon Insect',
  'Special thanks to Lorenz Wiest',
  'Programmed and designed by Jeff Glasse',
  'With many thanks to Aimee for her infinite patience',
  'Copyright 2023 Nine Industries. All Rights Reserved.',
] as const;

/** Timing constants (seconds) */
export const CREDIT_CYCLE_INTERVAL = 6.5;
const FADE_IN_DURATION = 2.0;
const HOLD_DURATION = 3.0;
const FADE_OUT_DURATION = 1.0;

export class CreditsDisplay {
  private container: HTMLElement;
  private textElement: HTMLDivElement;
  private creditIndex = 0;
  private cycleTimer: ReturnType<typeof setInterval> | null = null;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;bottom:60px;left:0;width:100%;' +
      'display:flex;justify-content:center;pointer-events:none;z-index:75;';

    this.textElement = document.createElement('div');
    this.textElement.style.cssText =
      'color:#8f8;font-family:"Courier New",monospace;font-size:1vw;' +
      'text-align:center;opacity:0;transition:opacity 2s ease-in;';

    this.container.appendChild(this.textElement);
    parent.appendChild(this.container);
    this.container.style.display = 'none';
  }

  /** Start cycling through credit messages */
  start(): void {
    this.container.style.display = 'flex';
    this.creditIndex = 0;
    this.showCredit();

    this.cycleTimer = setInterval(() => {
      this.creditIndex = (this.creditIndex + 1) % CREDIT_MESSAGES.length;
      this.showCredit();
    }, CREDIT_CYCLE_INTERVAL * 1000);
  }

  private showCredit(): void {
    // Fade out
    this.textElement.style.transition = `opacity ${FADE_OUT_DURATION}s ease-out`;
    this.textElement.style.opacity = '0';

    // After fade-out, set new text and fade in
    setTimeout(() => {
      this.textElement.textContent = CREDIT_MESSAGES[this.creditIndex];
      this.textElement.style.transition = `opacity ${FADE_IN_DURATION}s ease-in`;
      this.textElement.style.opacity = '1';

      // Schedule fade-out after hold
      setTimeout(() => {
        this.textElement.style.transition = `opacity ${FADE_OUT_DURATION}s ease-out`;
        this.textElement.style.opacity = '0';
      }, (FADE_IN_DURATION + HOLD_DURATION) * 1000);
    }, FADE_OUT_DURATION * 1000);
  }

  stop(): void {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
    this.textElement.style.opacity = '0';
    this.container.style.display = 'none';
  }

  dispose(): void {
    this.stop();
    this.container.remove();
  }
}
