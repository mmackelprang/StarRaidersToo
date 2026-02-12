/**
 * Manages game-level state: difficulty, settings, game flow.
 * Acts as central coordinator between the galaxy model, ship, and UI.
 *
 * Settings persist to localStorage.
 */

import { Difficulty, GameSettings } from '@/core/types';

const STORAGE_KEY = 'starRaidersToo_settings';

const DEFAULT_SETTINGS: GameSettings = {
  prologueEnabled: true,
  invertedAxis: false,
  difficulty: Difficulty.Novice,
};

export class GameStateManager {
  settings: GameSettings;
  gameOver = false;
  paused = false;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Ignore localStorage errors
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore localStorage errors
    }
  }

  setDifficulty(d: Difficulty): void {
    this.settings.difficulty = d;
    this.saveSettings();
  }

  setInvertedAxis(inverted: boolean): void {
    this.settings.invertedAxis = inverted;
    this.saveSettings();
  }

  setPrologueEnabled(enabled: boolean): void {
    this.settings.prologueEnabled = enabled;
    this.saveSettings();
  }
}
