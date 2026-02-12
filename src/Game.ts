/**
 * Top-level game orchestrator.
 * Creates the Babylon.js scene, manages the game loop, and coordinates subsystems.
 */

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { createScene, SceneContext } from '@/scene/SceneSetup';
import { StarfieldManager } from '@/scene/StarfieldManager';
import { SectorObjectsNode } from '@/scene/SectorObjectsNode';
import { CameraRig } from '@/scene/CameraRig';
import { WarpEffect } from '@/scene/WarpEffect';
import { ZylonShip } from '@/entities/ZylonShip';
import { HumonShip } from '@/entities/HumonShip';
import { ZylonStation } from '@/entities/ZylonStation';
import { InputManager } from '@/input/InputManager';
import { ViewModeManager } from '@/ui/ViewModeManager';
import { HudOverlay } from '@/ui/HudOverlay';
import { GalacticMapOverlay } from '@/ui/GalacticMapOverlay';
import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { CombatManager } from '@/combat/CombatManager';
import { EntitySpawner } from '@/scene/EntitySpawner';
import { Difficulty, difficultyScalar, ViewMode } from '@/core/types';
import { GameStateManager } from '@/core/GameStateManager';
import { randIntRange } from '@/utils/MathUtils';

export class Game {
  private ctx: SceneContext;
  private sectorObjects!: SectorObjectsNode;
  private starfieldManager!: StarfieldManager;
  private cameraRig!: CameraRig;
  private warpEffect!: WarpEffect;
  private ship!: ZylonShip;
  private inputManager!: InputManager;
  private viewModeManager!: ViewModeManager;
  private hud!: HudOverlay;
  private galacticMapOverlay!: GalacticMapOverlay;
  private galaxyModel!: GalaxyMapModel;
  private combatManager!: CombatManager;
  private entitySpawner!: EntitySpawner;
  private stateManager: GameStateManager;

  private gameOver = false;
  private paused = false;
  private lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.stateManager = new GameStateManager();
    this.ctx = createScene(canvas);
    this.setupScene();
    this.setupInput();
    this.setupUI();
    this.startGameLoop();
  }

  private get difficulty(): Difficulty {
    return this.stateManager.settings.difficulty;
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

    // Warp tunnel effect
    this.warpEffect = new WarpEffect(scene);

    // Galaxy model
    this.galaxyModel = new GalaxyMapModel(difficultyScalar(this.difficulty));

    // Combat system
    this.combatManager = new CombatManager(scene, this.sectorObjects.node, {
      onPlayerDestroyed: (cause) => {
        this.gameOver = true;
        // Phase 8 will add game over screen
      },
      onEnemyDestroyed: (enemy) => {
        this.galaxyModel.map[this.ship.currentSectorNumber].numberOfSectorObjects -= 1;
        if (this.galaxyModel.map[this.ship.currentSectorNumber].numberOfSectorObjects <= 0) {
          this.galaxyModel.clearSector(this.ship.currentSectorNumber);
        }
      },
      onStationDestroyed: () => {
        this.galaxyModel.clearSector(this.ship.currentSectorNumber);
      },
      onPlayerShieldHit: () => {
        // Phase 5 will add shield flash + sound
      },
      onSectorCleared: () => {
        // Phase 5 will add telemetry message
      },
    });

    this.entitySpawner = new EntitySpawner(this.combatManager);

    // Start with speed 2 (matches iOS setupShip line 813)
    this.ship.currentSpeed = 2;
  }

  private setupInput(): void {
    this.inputManager = new InputManager(document.body);
    this.inputManager.invertedAxis = this.stateManager.settings.invertedAxis;

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'v':
          this.viewModeManager.toggleForeAft();
          break;
        case 'g':
          this.toggleGalacticMap();
          break;
        case ' ':
          // Fire torpedo
          if (!this.ship.isCurrentlyInWarp && !this.gameOver) {
            this.combatManager.fireZylonTorpedo(
              this.ship,
              difficultyScalar(this.difficulty),
              this.viewModeManager.currentMode,
            );
          }
          break;
      }
    });
  }

  private setupUI(): void {
    const parent = this.ctx.engine.getRenderingCanvas()!.parentElement!;

    this.hud = new HudOverlay(parent);

    this.galacticMapOverlay = new GalacticMapOverlay(parent, {
      onTargetChanged: (sectorIndex) => {
        this.ship.targetSectorNumber = sectorIndex;
        this.galacticMapOverlay.updateDisplay(
          this.galaxyModel,
          this.ship.currentSectorNumber,
          this.ship.targetSectorNumber,
        );
      },
      onWarpRequested: () => this.initiateWarp(),
      onQuadrantSelected: () => {
        this.galacticMapOverlay.updateDisplay(
          this.galaxyModel,
          this.ship.currentSectorNumber,
          this.ship.targetSectorNumber,
        );
      },
    });
  }

  private toggleGalacticMap(): void {
    this.viewModeManager.toggleGalacticMap();
    if (this.viewModeManager.currentMode === ViewMode.GalacticMap) {
      this.galacticMapOverlay.updateDisplay(
        this.galaxyModel,
        this.ship.currentSectorNumber,
        this.ship.targetSectorNumber,
      );
      this.galacticMapOverlay.show();
      this.hud.hide();
    } else {
      this.galacticMapOverlay.hide();
      this.hud.show();
    }
  }

  /**
   * Initiate warp travel to target sector.
   * Ported from ZylonGameViewController.gridWarp() lines 482-522.
   */
  private initiateWarp(): void {
    if (this.ship.isCurrentlyInWarp || this.gameOver) return;
    if (this.ship.targetSectorNumber === this.ship.currentSectorNumber) return;

    const speedBeforeWarp = this.ship.currentSpeed;
    const targetAtWarp = this.ship.targetSectorNumber;

    // Deduct energy
    const energyUsed =
      Math.abs(this.ship.currentSectorNumber - this.ship.targetSectorNumber) *
      difficultyScalar(this.difficulty);
    this.ship.energyStore -= energyUsed;
    this.ship.isCurrentlyInWarp = true;

    // Clear current sector entities
    this.combatManager.clearSector();

    // Force forward view
    if (this.viewModeManager.currentMode === ViewMode.GalacticMap) {
      this.toggleGalacticMap();
    }
    if (this.viewModeManager.currentMode === ViewMode.AftView) {
      this.viewModeManager.setMode(ViewMode.ForeView);
    }

    // Max speed during warp
    this.ship.currentSpeed = 9;

    // Start warp visual — resolves after 6 seconds
    this.warpEffect.start().then(() => {
      if (this.gameOver) return;

      // Arrive at destination
      this.ship.currentSpeed = speedBeforeWarp;
      this.ship.isCurrentlyInWarp = false;
      this.ship.currentSectorNumber = targetAtWarp;

      // Pick a new random target
      this.ship.targetSectorNumber = randIntRange(0, 126);

      // Populate sector after 1 more second (7s total from warp start)
      setTimeout(() => {
        this.entitySpawner.populateSector(this.ship, this.galaxyModel);
      }, 1000);
    });
  }

  private startGameLoop(): void {
    const { engine, scene } = this.ctx;
    this.lastFrameTime = performance.now();

    engine.runRenderLoop(() => {
      const now = performance.now();
      const deltaSeconds = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      if (!this.gameOver && !this.paused) {
        // Phase 1: updateAtTime equivalent
        this.starfieldManager.updateStars(this.ship.currentSpeed);

        // Phase 2: didRenderScene equivalent — apply input and update ship
        if (!this.ship.isCurrentlyInWarp) {
          this.turnShip();

          // Phase 4: Combat update
          this.combatManager.update(
            this.ship,
            difficultyScalar(this.difficulty),
            deltaSeconds,
          );
        }
        this.ship.updateShipSystems(difficultyScalar(this.difficulty));

        // Phase 3: Update HUD
        this.hud.update(
          this.ship.energyStore,
          this.ship.shieldStrength,
          this.ship.currentSpeed,
          this.ship.currentSectorNumber,
          this.ship.targetSectorNumber,
          this.ship.isCurrentlyInWarp,
        );
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
    this.combatManager.dispose();
    this.starfieldManager.dispose();
    this.warpEffect.dispose();
    this.inputManager.dispose();
    this.hud.dispose();
    this.galacticMapOverlay.dispose();
    this.ctx.engine.dispose();
  }
}
