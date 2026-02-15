/**
 * Babylon.js scene creation, matching ZylonGameViewController.setupView() + setupScene().
 */

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

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

  // Ambient light for PBR materials — subtle fill from above-right
  const light = new HemisphericLight('ambientLight', new Vector3(0.3, 1, -0.5), scene);
  light.intensity = 0.8;
  light.diffuse = new Color3(0.9, 0.9, 1.0);
  light.groundColor = new Color3(0.05, 0.05, 0.15);

  // Handle window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });

  return { engine, scene, canvas };
}
