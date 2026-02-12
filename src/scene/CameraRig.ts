/**
 * Camera system with forward, rear, and sector-scan cameras.
 * Ported from ZylonGameViewController.setupShip() lines 771-814.
 *
 * Forward camera: at origin, looking down -Z, zFar=1500
 * Rear camera: at origin, rotated 180° on X axis, zFar=1500
 * Sector scan camera: 200 units above, looking down at origin
 */

import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Constants } from '@/core/Constants';
import { ViewMode } from '@/core/types';

export class CameraRig {
  readonly forwardCamera: FreeCamera;
  readonly rearCamera: FreeCamera;
  readonly sectorScanCamera: FreeCamera;

  private activeMode: ViewMode = ViewMode.ForeView;

  constructor(private scene: Scene, shipNode: TransformNode) {
    // Forward camera — at origin, looking down negative Z
    this.forwardCamera = new FreeCamera('forwardCamera', Vector3.Zero(), scene);
    this.forwardCamera.maxZ = Constants.cameraFalloff;
    this.forwardCamera.minZ = 0.1;
    this.forwardCamera.setTarget(new Vector3(0, 0, -1));
    this.forwardCamera.inputs.clear();
    this.forwardCamera.parent = shipNode;

    // Rear camera — at origin, rotated 180° around X (looking back)
    // In SceneKit: rearCameraNode.rotation = SCNVector4(1, 0, 0, π)
    this.rearCamera = new FreeCamera('rearCamera', Vector3.Zero(), scene);
    this.rearCamera.maxZ = Constants.cameraFalloff;
    this.rearCamera.minZ = 0.1;
    this.rearCamera.setTarget(new Vector3(0, 0, 1));
    this.rearCamera.inputs.clear();
    this.rearCamera.parent = shipNode;

    // Sector scan camera — 200 units above, looking down at origin
    this.sectorScanCamera = new FreeCamera('sectorScanCamera', new Vector3(0, 200, 0), scene);
    this.sectorScanCamera.setTarget(Vector3.Zero());
    this.sectorScanCamera.inputs.clear();
    this.sectorScanCamera.parent = shipNode;

    // Default to forward camera
    scene.activeCamera = this.forwardCamera;
  }

  get currentMode(): ViewMode {
    return this.activeMode;
  }

  setMode(mode: ViewMode): void {
    this.activeMode = mode;
    switch (mode) {
      case ViewMode.ForeView:
        this.scene.activeCamera = this.forwardCamera;
        break;
      case ViewMode.AftView:
        this.scene.activeCamera = this.rearCamera;
        break;
      case ViewMode.GalacticMap:
        // Map view will be handled by UI overlay, keep forward camera
        // but the 3D scene may be hidden
        break;
    }
  }

  /** Toggle between fore and aft view */
  toggleForeAft(): void {
    if (this.activeMode === ViewMode.ForeView) {
      this.setMode(ViewMode.AftView);
    } else {
      this.setMode(ViewMode.ForeView);
    }
  }
}
