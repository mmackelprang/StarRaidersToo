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
  private camera: Camera | null = null;
  private blurActive = false;

  constructor(canvas: HTMLCanvasElement, scene?: Scene, camera?: Camera) {
    this.canvas = canvas;
    if (scene && camera) {
      this.camera = camera;
      this.motionBlur = new MotionBlurPostProcess(
        'warpMotionBlur', scene, 1.0, camera,
      );
      this.motionBlur.motionStrength = 1.0;
      this.motionBlur.motionBlurSamples = 16;
      this.motionBlur.isObjectBased = false;
      // Start disabled — detach immediately
      camera.detachPostProcess(this.motionBlur);
    }
  }

  /** Enable motion blur effect (during warp) */
  enableMotionBlur(): void {
    if (this.blurActive) return;
    this.blurActive = true;
    if (this.motionBlur && this.camera) {
      this.camera.attachPostProcess(this.motionBlur);
    } else {
      // CSS fallback if no scene/camera provided
      this.canvas.style.filter = 'blur(2px) contrast(1.2)';
    }
  }

  /** Disable motion blur effect */
  disableMotionBlur(): void {
    if (!this.blurActive) return;
    this.blurActive = false;
    if (this.motionBlur && this.camera) {
      this.camera.detachPostProcess(this.motionBlur);
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
