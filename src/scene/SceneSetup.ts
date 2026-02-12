/**
 * Babylon.js scene creation, matching ZylonGameViewController.setupView() + setupScene().
 */

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Color4 } from '@babylonjs/core/Maths/math.color';

export interface SceneContext {
  engine: Engine;
  scene: Scene;
  canvas: HTMLCanvasElement;
}

export function createScene(canvas: HTMLCanvasElement): SceneContext {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);
  scene.collisionsEnabled = true;

  // Handle window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });

  return { engine, scene, canvas };
}
