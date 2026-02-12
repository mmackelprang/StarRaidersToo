/**
 * Main menu screen — settings, credits, start button.
 * Ported from MainMenuViewController.swift.
 *
 * Displays cycling credits, difficulty selector, prologue toggle,
 * inverted axis toggle, and a START button.
 */

import { Difficulty, GameSettings } from '@/core/types';
import { CreditsDisplay } from '@/ui/CreditsDisplay';
import type { Screen } from '@/core/ScreenManager';

const DIFFICULTY_ORDER: Difficulty[] = [
  Difficulty.Novice,
  Difficulty.Pilot,
  Difficulty.Warrior,
  Difficulty.Commander,
  Difficulty.Lord,
];

export interface MainMenuCallbacks {
  onStartGame(): void;
  onSettingsChanged(settings: GameSettings): void;
}

export class MainMenu implements Screen {
  private container: HTMLDivElement;
  private creditsDisplay: CreditsDisplay;
  private settings: GameSettings;
  private callbacks: MainMenuCallbacks;
  private difficultyButton!: HTMLButtonElement;
  private prologueButton!: HTMLButtonElement;
  private invertedButton!: HTMLButtonElement;

  constructor(parent: HTMLElement, settings: GameSettings, callbacks: MainMenuCallbacks) {
    this.settings = { ...settings };
    this.callbacks = callbacks;

    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'background:#000;z-index:100;font-family:"Courier New",monospace;';

    this.buildUI();
    parent.appendChild(this.container);

    this.creditsDisplay = new CreditsDisplay(this.container);
    this.container.style.display = 'none';
  }

  private buildUI(): void {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'STAR RAIDERS TOO';
    title.style.cssText =
      'color:#0ff;font-size:3vw;margin-bottom:2vh;text-shadow:0 0 10px #0ff;';
    this.container.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.textContent = 'DEFEND THE ZYLON EMPIRE';
    subtitle.style.cssText = 'color:#8f8;font-size:1.2vw;margin-bottom:4vh;';
    this.container.appendChild(subtitle);

    // Start button
    const startBtn = this.createButton('START GAME', () => {
      this.callbacks.onStartGame();
    });
    startBtn.style.fontSize = '1.8vw';
    startBtn.style.marginBottom = '3vh';
    startBtn.style.padding = '1vh 3vw';
    this.container.appendChild(startBtn);

    // Settings group
    const settingsGroup = document.createElement('div');
    settingsGroup.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:1.5vh;';

    this.difficultyButton = this.createButton(
      this.difficultyLabel(),
      () => this.cycleDifficulty(),
    );
    settingsGroup.appendChild(this.difficultyButton);

    this.prologueButton = this.createButton(
      this.prologueLabel(),
      () => this.togglePrologue(),
    );
    settingsGroup.appendChild(this.prologueButton);

    this.invertedButton = this.createButton(
      this.invertedLabel(),
      () => this.toggleInverted(),
    );
    settingsGroup.appendChild(this.invertedButton);

    this.container.appendChild(settingsGroup);
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText =
      'background:transparent;border:1px solid #0ff;color:#0ff;' +
      'font-family:"Courier New",monospace;font-size:1.2vw;' +
      'padding:0.5vh 2vw;cursor:pointer;min-width:20vw;' +
      'transition:background 0.2s;';
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(0,255,255,0.15)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });
    btn.addEventListener('click', onClick);
    return btn;
  }

  private difficultyLabel(): string {
    return `Difficulty: ${this.settings.difficulty}`;
  }

  private prologueLabel(): string {
    return this.settings.prologueEnabled ? 'PROLOGUE ON' : 'PROLOGUE OFF';
  }

  private invertedLabel(): string {
    return this.settings.invertedAxis ? 'INVERT AXIS ON' : 'INVERT AXIS OFF';
  }

  private cycleDifficulty(): void {
    const idx = DIFFICULTY_ORDER.indexOf(this.settings.difficulty);
    this.settings.difficulty = DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length];
    this.difficultyButton.textContent = this.difficultyLabel();
    this.callbacks.onSettingsChanged(this.settings);
  }

  private togglePrologue(): void {
    this.settings.prologueEnabled = !this.settings.prologueEnabled;
    this.prologueButton.textContent = this.prologueLabel();
    this.callbacks.onSettingsChanged(this.settings);
  }

  private toggleInverted(): void {
    this.settings.invertedAxis = !this.settings.invertedAxis;
    this.invertedButton.textContent = this.invertedLabel();
    this.callbacks.onSettingsChanged(this.settings);
  }

  /** Update button labels to match external settings */
  updateSettings(settings: GameSettings): void {
    this.settings = { ...settings };
    this.difficultyButton.textContent = this.difficultyLabel();
    this.prologueButton.textContent = this.prologueLabel();
    this.invertedButton.textContent = this.invertedLabel();
  }

  show(): void {
    this.container.style.display = 'flex';
    this.creditsDisplay.start();
  }

  hide(): void {
    this.container.style.display = 'none';
    this.creditsDisplay.stop();
  }

  dispose(): void {
    this.creditsDisplay.dispose();
    this.container.remove();
  }
}
