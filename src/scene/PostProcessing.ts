/**
 * Post-processing effects — motion blur during warp.
 * Ported from ZylonGameViewController warp motion blur (line 1197).
 *
 * Uses Babylon.js MotionBlurPostProcess when available,
 * falls back to CSS filter on the canvas for broader compatibility.
 */

import { MotionBlurPostProcess } from '@babylonjs/core/PostProcesses/motionBlurPostProcess';
import type { Camera } from '@babylonjs/core/Cameras/camera';
import type { Scene } from '@babylonjs/core/scene';

export class PostProcessing {
  private canvas: HTMLCanvasElement;
  private motionBlur: MotionBlurPostProcess | null = null;
  private scene: Scene | null = null;
  private camera: Camera | null = null;
  private blurActive = false;

  constructor(canvas: HTMLCanvasElement, scene?: Scene, camera?: Camera) {
    this.canvas = canvas;
    if (scene && camera) {
      this.scene = scene;
      this.camera = camera;
    }
  }

  /** Enable motion blur effect (during warp) */
  enableMotionBlur(): void {
    if (this.blurActive) return;
    this.blurActive = true;
    if (this.scene && this.camera) {
      // Create lazily so the pre-pass renderer is only active during warp
      this.motionBlur = new MotionBlurPostProcess(
        'warpMotionBlur', this.scene, 1.0, this.camera,
      );
      this.motionBlur.motionStrength = 1.0;
      this.motionBlur.motionBlurSamples = 16;
      this.motionBlur.isObjectBased = false;
    } else {
      // CSS fallback if no scene/camera provided
      this.canvas.style.filter = 'blur(2px) contrast(1.2)';
    }
  }

  /** Disable motion blur effect */
  disableMotionBlur(): void {
    if (!this.blurActive) return;
    this.blurActive = false;
    if (this.motionBlur) {
      this.motionBlur.dispose();
      this.motionBlur = null;
    } else {
      this.canvas.style.filter = 'none';
    }
  }

  get isBlurActive(): boolean {
    return this.blurActive;
  }

  dispose(): void {
    this.disableMotionBlur();
    this.motionBlur?.dispose();
  }
}
