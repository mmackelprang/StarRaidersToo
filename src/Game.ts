/**
 * Top-level game orchestrator.
 * Creates the Babylon.js scene, manages the game loop, and coordinates subsystems.
 */

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createScene, SceneContext } from '@/scene/SceneSetup';
import { StarfieldManager } from '@/scene/StarfieldManager';
import { SectorObjectsNode } from '@/scene/SectorObjectsNode';
import { CameraRig } from '@/scene/CameraRig';
import { ZylonShip } from '@/entities/ZylonShip';
import { InputManager } from '@/input/InputManager';
import { ViewModeManager } from '@/ui/ViewModeManager';
import { Difficulty, difficultyScalar, ViewMode } from '@/core/types';

export class Game {
  private ctx: SceneContext;
  private sectorObjects!: SectorObjectsNode;
  private starfieldManager!: StarfieldManager;
  private cameraRig!: CameraRig;
  private ship!: ZylonShip;
  private inputManager!: InputManager;
  private viewModeManager!: ViewModeManager;

  private gameOver = false;
  private paused = false;
  private difficulty = Difficulty.Novice;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = createScene(canvas);
    this.setupScene();
    this.setupInput();
    this.startGameLoop();
  }

  private setupScene(): void {
    const { scene } = this.ctx;

    // The sectorObjectsNode is the pivoting container.
    // Ship sits at origin; this node rotates to simulate steering.
    this.sectorObjects = new SectorObjectsNode(scene);

    // Player ship (invisible, at origin — camera POV)
    this.ship = new ZylonShip(scene);
    const shipNode = new TransformNode('shipTransform', scene);
    this.ship.parent = shipNode;

    // Camera rig attached to the ship
    this.cameraRig = new CameraRig(scene, shipNode);

    // View mode manager
    this.viewModeManager = new ViewModeManager(this.cameraRig);

    // Create starfield attached to sectorObjectsNode
    this.starfieldManager = new StarfieldManager(scene, this.sectorObjects.node);

    // Start with speed 2 (matches iOS setupShip line 813)
    this.ship.currentSpeed = 2;
  }

  private setupInput(): void {
    this.inputManager = new InputManager(document.body);

    // Keyboard shortcuts for view toggling (dev convenience)
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'v':
          this.viewModeManager.toggleForeAft();
          break;
        case 'g':
          this.viewModeManager.toggleGalacticMap();
          break;
      }
    });
  }

  private startGameLoop(): void {
    const { engine, scene } = this.ctx;

    engine.runRenderLoop(() => {
      if (!this.gameOver && !this.paused) {
        // Phase 1: updateAtTime equivalent
        this.starfieldManager.updateStars(this.ship.currentSpeed);

        // Phase 2: didRenderScene equivalent — apply input and update ship
        this.turnShip();
        this.ship.updateShipSystems(difficultyScalar(this.difficulty));
      }

      scene.render();
    });
  }

  /**
   * Apply joystick/keyboard input to rotate the sectorObjectsNode.
   * Ported from ZylonGameViewController.turnShip() lines 1219-1239.
   */
  private turnShip(): void {
    // Only apply steering in fore or aft view
    if (this.viewModeManager.currentMode === ViewMode.GalacticMap) return;

    const input = this.inputManager.getInput();
    this.sectorObjects.applyJoystickInput(input.xThrust, input.yThrust);
  }

  dispose(): void {
    this.starfieldManager.dispose();
    this.inputManager.dispose();
    this.ctx.engine.dispose();
  }
}
