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
import { InputManager } from '@/input/InputManager';
import { ViewModeManager } from '@/ui/ViewModeManager';
import { HudOverlay } from '@/ui/HudOverlay';
import { GalacticMapOverlay } from '@/ui/GalacticMapOverlay';
import { ScannerDisplay } from '@/ui/ScannerDisplay';
import { TacticalDisplay } from '@/ui/TacticalDisplay';
import { AlertSystem } from '@/ui/AlertSystem';
import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { CombatManager } from '@/combat/CombatManager';
import { EntitySpawner } from '@/scene/EntitySpawner';
import { Difficulty, difficultyScalar, ViewMode } from '@/core/types';
import { GameStateManager } from '@/core/GameStateManager';
import { AudioManager } from '@/audio/AudioManager';
import { EngineSound } from '@/audio/EngineSound';
import { PhotonSoundPool } from '@/audio/PhotonSoundPool';
import { SoundEffects } from '@/audio/SoundEffects';
import { VoiceAnnouncer } from '@/audio/VoiceAnnouncer';
import { WarpSoundSequence } from '@/audio/WarpSoundSequence';
import { radiansToDegrees, randIntRange } from '@/utils/MathUtils';

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
  private scannerDisplay!: ScannerDisplay;
  private tacticalDisplay!: TacticalDisplay;
  private alertSystem!: AlertSystem;
  private galaxyModel!: GalaxyMapModel;
  private combatManager!: CombatManager;
  private entitySpawner!: EntitySpawner;
  private stateManager: GameStateManager;
  private audioManager!: AudioManager;
  private engineSound!: EngineSound;
  private photonSoundPool!: PhotonSoundPool;
  private soundEffects!: SoundEffects;
  private voiceAnnouncer!: VoiceAnnouncer;
  private warpSoundSequence!: WarpSoundSequence;

  private gameOver = false;
  private paused = false;
  private lastFrameTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.stateManager = new GameStateManager();
    this.ctx = createScene(canvas);
    this.setupAudio();
    this.setupScene();
    this.setupInput();
    this.setupUI();
    this.startGameLoop();
  }

  private get difficulty(): Difficulty {
    return this.stateManager.settings.difficulty;
  }

  private setupAudio(): void {
    this.audioManager = new AudioManager();
    this.engineSound = new EngineSound(this.audioManager);
    this.photonSoundPool = new PhotonSoundPool(this.audioManager);
    this.soundEffects = new SoundEffects(this.audioManager);
    this.voiceAnnouncer = new VoiceAnnouncer(this.audioManager);
    this.warpSoundSequence = new WarpSoundSequence(this.audioManager);
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
        this.soundEffects.deathExplosion();
        this.engineSound.stop();
        // Phase 8 will add game over screen
      },
      onEnemyDestroyed: (enemy) => {
        this.soundEffects.explosion();
        this.galaxyModel.map[this.ship.currentSectorNumber].numberOfSectorObjects -= 1;
        if (this.galaxyModel.map[this.ship.currentSectorNumber].numberOfSectorObjects <= 0) {
          this.galaxyModel.clearSector(this.ship.currentSectorNumber);
        }
      },
      onStationDestroyed: () => {
        this.galaxyModel.clearSector(this.ship.currentSectorNumber);
        this.soundEffects.explosion();
        setTimeout(() => this.soundEffects.badIdea(), 1700);
      },
      onPlayerShieldHit: () => {
        this.hud.shieldFlash();
        this.soundEffects.shieldHit();
      },
      onSectorCleared: () => {
        this.alertSystem.deactivateAlert();
        this.hud.updateEnemyIndicator(0);
      },
    });

    this.entitySpawner = new EntitySpawner(this.combatManager);

    // Start with speed 2 (matches iOS setupShip line 813)
    this.ship.currentSpeed = 2;

    // Start engine hum
    this.engineSound.start();
  }

  private setupInput(): void {
    this.inputManager = new InputManager(document.body);
    this.inputManager.invertedAxis = this.stateManager.settings.invertedAxis;

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'v':
          this.viewModeManager.toggleForeAft();
          this.soundEffects.beep();
          break;
        case 'g':
          this.toggleGalacticMap();
          this.soundEffects.beep();
          break;
        case 't':
          // Toggle tactical display
          this.tacticalDisplay.toggle();
          if (this.tacticalDisplay.engaged) {
            this.scannerDisplay.show();
          } else {
            this.scannerDisplay.hide();
          }
          break;
        case ' ':
          // Fire torpedo
          if (!this.ship.isCurrentlyInWarp && !this.gameOver) {
            const fired = this.combatManager.fireZylonTorpedo(
              this.ship,
              difficultyScalar(this.difficulty),
              this.viewModeManager.currentMode,
            );
            if (fired) {
              this.photonSoundPool.play();
            } else {
              this.photonSoundPool.playFail();
            }
          }
          break;
      }
    });
  }

  private setupUI(): void {
    const parent = this.ctx.engine.getRenderingCanvas()!.parentElement!;

    this.hud = new HudOverlay(parent);
    this.scannerDisplay = new ScannerDisplay(parent);
    this.tacticalDisplay = new TacticalDisplay(parent);
    this.alertSystem = new AlertSystem(parent);

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

    // Play warp sound sequence
    this.warpSoundSequence.play();

    // Start warp visual — resolves after 6 seconds
    this.warpEffect.start().then(() => {
      if (this.gameOver) return;

      // Arrive at destination
      this.ship.currentSpeed = speedBeforeWarp;
      this.ship.isCurrentlyInWarp = false;
      this.ship.currentSectorNumber = targetAtWarp;

      // Pick a new random target
      this.ship.targetSectorNumber = randIntRange(0, 126);

      // Announce sector arrival
      this.voiceAnnouncer.announceSector(targetAtWarp);

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

        // Update engine sound volume based on speed
        this.engineSound.setSpeed(this.ship.currentSpeed);

        // Update HUD
        this.hud.update(
          this.ship.energyStore,
          this.ship.shieldStrength,
          this.ship.currentSpeed,
          this.ship.currentSectorNumber,
          this.ship.targetSectorNumber,
          this.ship.isCurrentlyInWarp,
        );
        this.hud.updateEnemyIndicator(this.combatManager.enemyCount);

        // Update scanner
        this.scannerDisplay.render(deltaSeconds);

        // Update tactical display
        if (this.tacticalDisplay.engaged) {
          const eulerX = this.sectorObjects.node.rotationQuaternion
            ? radiansToDegrees(this.sectorObjects.node.rotation.x) : 0;
          const eulerY = this.sectorObjects.node.rotationQuaternion
            ? radiansToDegrees(this.sectorObjects.node.rotation.y) : 0;
          this.tacticalDisplay.update(
            eulerX,
            eulerY,
            this.ship.shieldsAreUp,
            this.ship.shieldStrength,
            this.ship.energyStore,
            this.combatManager.enemyCount,
            null, // Phase 4+ will compute nearest enemy distance
          );
        }
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
    this.scannerDisplay.dispose();
    this.tacticalDisplay.dispose();
    this.alertSystem.dispose();
    this.galacticMapOverlay.dispose();
    this.engineSound.dispose();
    this.photonSoundPool.dispose();
    this.soundEffects.dispose();
    this.voiceAnnouncer.dispose();
    this.warpSoundSequence.dispose();
    this.audioManager.dispose();
    this.ctx.engine.dispose();
  }
}
