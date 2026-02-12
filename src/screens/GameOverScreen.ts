/**
 * Game over screen — displays rank and cause via typewriter effect.
 * Ported from ZylonGameViewController.endGame().
 *
 * Shows cause message + rank at 0.05s/char speed.
 * Restart button appears after 6 seconds.
 */

import { TelemetryDisplay, GAME_OVER_CHAR_SPEED } from '@/ui/TelemetryDisplay';
import { calculateRank } from '@/core/RankCalculator';
import type { Screen } from '@/core/ScreenManager';

/** Delay before showing restart button (seconds) */
const RESTART_BUTTON_DELAY = 6.0;

/** Delay before starting typewriter after game end (seconds) */
const TYPEWRITER_START_DELAY = 1.0;

export class GameOverScreen implements Screen {
  private container: HTMLDivElement;
  private telemetry: TelemetryDisplay;
  private restartButton: HTMLButtonElement;
  private onRestart: () => void;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private startTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement, onRestart: () => void) {
    this.onRestart = onRestart;

    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.85);z-index:100;';

    // Restart button (initially hidden)
    this.restartButton = document.createElement('button');
    this.restartButton.textContent = 'RETURN TO BASE';
    this.restartButton.style.cssText =
      'position:absolute;bottom:60px;left:50%;transform:translateX(-50%);' +
      'background:transparent;border:1px solid #0ff;color:#0ff;' +
      'font-family:"Courier New",monospace;font-size:1.5vw;' +
      'padding:1vh 3vw;cursor:pointer;opacity:0;' +
      'transition:opacity 1s ease;pointer-events:none;z-index:110;';
    this.restartButton.addEventListener('click', () => {
      this.onRestart();
    });
    this.container.appendChild(this.restartButton);

    parent.appendChild(this.container);
    this.telemetry = new TelemetryDisplay(this.container);
    this.container.style.display = 'none';
  }

  /** Show the game over screen with the given cause and stats */
  showWithResults(
    cause: string,
    occupiedSectorRatio: number,
    difficultyScalar: number,
  ): void {
    this.container.style.display = 'block';
    this.telemetry.show();
    this.telemetry.clear();

    const rank = calculateRank(occupiedSectorRatio, difficultyScalar);
    const message =
      `Zylon Command to all sectors. ${cause}\n\n` +
      `Posthumous Rank: ${rank}`;

    // Start typewriter after brief delay
    this.startTimer = setTimeout(() => {
      this.telemetry.writeMessage(message, GAME_OVER_CHAR_SPEED);
    }, TYPEWRITER_START_DELAY * 1000);

    // Show restart button after delay
    this.restartTimer = setTimeout(() => {
      this.restartButton.style.opacity = '1';
      this.restartButton.style.pointerEvents = 'auto';
    }, RESTART_BUTTON_DELAY * 1000);
  }

  show(): void {
    this.container.style.display = 'block';
    this.telemetry.show();
  }

  hide(): void {
    this.container.style.display = 'none';
    this.telemetry.hide();
    this.telemetry.clear();
    this.restartButton.style.opacity = '0';
    this.restartButton.style.pointerEvents = 'none';
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.startTimer) {
      clearTimeout(this.startTimer);
      this.startTimer = null;
    }
  }

  dispose(): void {
    this.clearTimers();
    this.telemetry.dispose();
    this.container.remove();
  }
}
