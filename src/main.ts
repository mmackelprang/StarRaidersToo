/**
 * Entry point — initializes the game on the canvas element.
 */

import { Game } from '@/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element #gameCanvas not found');
}

new Game(canvas);
