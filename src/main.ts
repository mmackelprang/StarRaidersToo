/**
 * Entry point — orchestrates screen flow: MainMenu → Prologue → Game → GameOver.
 */

import { Game } from '@/Game';
import { GameStateManager } from '@/core/GameStateManager';
import { ScreenManager } from '@/core/ScreenManager';
import { MainMenu } from '@/screens/MainMenu';
import { PrologueScreen } from '@/screens/PrologueScreen';
import { GameOverScreen } from '@/screens/GameOverScreen';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element #gameCanvas not found');
}

const parent = canvas.parentElement!;
const stateManager = new GameStateManager();
const screenManager = new ScreenManager(parent);

let currentGame: Game | null = null;

// Game over screen
const gameOverScreen = new GameOverScreen(parent, () => {
  // Restart — return to main menu
  if (currentGame) {
    currentGame.dispose();
    currentGame = null;
  }
  screenManager.transitionTo('mainMenu', 2.0);
});

// Prologue screen
const prologueScreen = new PrologueScreen(parent, () => {
  screenManager.transitionTo('game');
});

// Main menu
const mainMenu = new MainMenu(parent, stateManager.settings, {
  onStartGame: () => {
    stateManager.saveSettings();
    if (stateManager.settings.prologueEnabled) {
      screenManager.transitionTo('prologue');
    } else {
      screenManager.transitionTo('game');
    }
  },
  onSettingsChanged: (settings) => {
    stateManager.settings = settings;
    stateManager.saveSettings();
  },
});

// Register a game screen adapter
const gameScreen = {
  show: () => {
    canvas.style.display = 'block';
    currentGame = new Game(canvas, {
      stateManager,
      onGameEnd: (cause, ratio, scalar) => {
        gameOverScreen.showWithResults(cause, ratio, scalar);
        screenManager.transitionTo('gameOver');
      },
    });
  },
  hide: () => {
    canvas.style.display = 'none';
    if (currentGame) {
      currentGame.dispose();
      currentGame = null;
    }
  },
  dispose: () => {
    if (currentGame) {
      currentGame.dispose();
      currentGame = null;
    }
  },
};

screenManager.registerScreen('mainMenu', mainMenu);
screenManager.registerScreen('prologue', prologueScreen);
screenManager.registerScreen('game', gameScreen);
screenManager.registerScreen('gameOver', gameOverScreen);

// Start at main menu
screenManager.showImmediate('mainMenu');
