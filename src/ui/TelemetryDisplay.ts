/**
 * Typewriter text display with cursor blink.
 * Ported from TelemetryPlayer.swift.
 *
 * Writes text character-by-character at configurable speed,
 * then blinks a cursor when the message is complete.
 */

/** Default speeds matching iOS (seconds per character) */
export const PROLOGUE_CHAR_SPEED = 0.037;
export const GAME_OVER_CHAR_SPEED = 0.05;
export const DEFAULT_CHAR_SPEED = 0.097;
export const CURSOR_BLINK_SPEED = 0.12;

export class TelemetryDisplay {
  private container: HTMLElement;
  private textElement: HTMLPreElement;
  private charTimer: ReturnType<typeof setInterval> | null = null;
  private blinkTimer: ReturnType<typeof setInterval> | null = null;
  private currentMessage = '';
  private currentIndex = 0;
  private cursorVisible = false;
  private _isWriting = false;
  private onComplete: (() => void) | null = null;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'display:flex;align-items:center;justify-content:center;' +
      'pointer-events:none;z-index:80;';

    this.textElement = document.createElement('pre');
    this.textElement.style.cssText =
      'color:#0f0;font-family:"Courier New",monospace;font-size:1.2vw;' +
      'white-space:pre-wrap;max-width:80%;text-align:left;line-height:1.5;' +
      'text-shadow:0 0 4px #0f0;';

    this.container.appendChild(this.textElement);
    parent.appendChild(this.container);
    this.container.style.display = 'none';
  }

  /** Write a message character by character */
  writeMessage(
    message: string,
    speed = DEFAULT_CHAR_SPEED,
    onComplete?: () => void,
  ): void {
    this.stopTimers();
    this.currentMessage = message;
    this.currentIndex = 0;
    this._isWriting = true;
    this.onComplete = onComplete ?? null;

    this.charTimer = setInterval(() => {
      if (this.currentIndex < this.currentMessage.length) {
        this.textElement.textContent += this.currentMessage[this.currentIndex];
        this.currentIndex++;
      } else {
        this.finishWriting();
      }
    }, speed * 1000);
  }

  /** Append text to existing content, then write character by character */
  appendMessage(
    message: string,
    speed = DEFAULT_CHAR_SPEED,
    onComplete?: () => void,
  ): void {
    this.stopTimers();
    this.currentMessage = message;
    this.currentIndex = 0;
    this._isWriting = true;
    this.onComplete = onComplete ?? null;

    this.charTimer = setInterval(() => {
      if (this.currentIndex < this.currentMessage.length) {
        this.textElement.textContent += this.currentMessage[this.currentIndex];
        this.currentIndex++;
      } else {
        this.finishWriting();
      }
    }, speed * 1000);
  }

  private finishWriting(): void {
    if (this.charTimer) {
      clearInterval(this.charTimer);
      this.charTimer = null;
    }
    this._isWriting = false;

    // Start cursor blink
    this.blinkTimer = setInterval(() => {
      if (this.cursorVisible) {
        const text = this.textElement.textContent ?? '';
        if (text.endsWith('_')) {
          this.textElement.textContent = text.slice(0, -1);
        }
        this.cursorVisible = false;
      } else {
        this.textElement.textContent += '_';
        this.cursorVisible = true;
      }
    }, CURSOR_BLINK_SPEED * 1000);

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /** Stop all writing and blinking */
  abort(): void {
    this.stopTimers();
    this._isWriting = false;
  }

  /** Clear all text */
  clear(): void {
    this.textElement.textContent = '';
    this.cursorVisible = false;
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  get isWriting(): boolean {
    return this._isWriting;
  }

  private stopTimers(): void {
    if (this.charTimer) {
      clearInterval(this.charTimer);
      this.charTimer = null;
    }
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    // Remove trailing cursor
    if (this.cursorVisible) {
      const text = this.textElement.textContent ?? '';
      if (text.endsWith('_')) {
        this.textElement.textContent = text.slice(0, -1);
      }
      this.cursorVisible = false;
    }
  }

  dispose(): void {
    this.stopTimers();
    this.container.remove();
  }
}
