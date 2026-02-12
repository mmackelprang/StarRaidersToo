/**
 * Top-level game orchestrator.
 * Creates the Babylon.js scene, manages the game loop, and coordinates subsystems.
 */

import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createScene, SceneContext } from '@/scene/SceneSetup';
import { StarfieldManager } from '@/scene/StarfieldManager';
import { Constants } from '@/core/Constants';

export class Game {
  private ctx: SceneContext;
  private sectorObjectsNode!: TransformNode;
  private starfieldManager!: StarfieldManager;
  private camera!: FreeCamera;

  /** Placeholder speed for Phase 1 starfield animation demo */
  private currentSpeed = 2;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = createScene(canvas);
    this.setupScene();
    this.startGameLoop();
  }

  private setupScene(): void {
    const { scene } = this.ctx;

    // The sectorObjectsNode is the pivoting container.
    // Ship sits at origin; this node rotates to simulate steering.
    this.sectorObjectsNode = new TransformNode('sectorObjectsNode', scene);

    // Forward camera at origin, looking down -Z
    this.camera = new FreeCamera(
      'forwardCamera',
      Vector3.Zero(),
      scene,
    );
    this.camera.maxZ = Constants.cameraFalloff;
    this.camera.minZ = 0.1;
    this.camera.setTarget(new Vector3(0, 0, -1));

    // Disable default camera controls — input will be handled by our joystick
    this.camera.inputs.clear();

    scene.activeCamera = this.camera;

    // Create starfield
    this.starfieldManager = new StarfieldManager(
      scene,
      this.sectorObjectsNode,
    );
  }

  private startGameLoop(): void {
    const { engine, scene } = this.ctx;

    engine.runRenderLoop(() => {
      // Pre-render update (equivalent to renderer(_:updateAtTime:))
      this.starfieldManager.updateStars(this.currentSpeed);

      scene.render();
    });
  }

  dispose(): void {
    this.starfieldManager.dispose();
    this.ctx.engine.dispose();
  }
}
