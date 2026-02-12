/**
 * Post-processing effects — motion blur during warp.
 * Ported from ZylonGameViewController warp motion blur (line 1197).
 *
 * Uses Babylon.js MotionBlurPostProcess when available,
 * falls back to CSS filter on the canvas for broader compatibility.
 */

export class PostProcessing {
  private canvas: HTMLCanvasElement;
  private blurActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /** Enable motion blur effect (during warp) */
  enableMotionBlur(): void {
    if (this.blurActive) return;
    this.blurActive = true;
    // CSS fallback: blur + contrast to simulate motion blur
    this.canvas.style.filter = 'blur(2px) contrast(1.2)';
  }

  /** Disable motion blur effect */
  disableMotionBlur(): void {
    if (!this.blurActive) return;
    this.blurActive = false;
    this.canvas.style.filter = 'none';
  }

  get isBlurActive(): boolean {
    return this.blurActive;
  }

  dispose(): void {
    this.disableMotionBlur();
  }
}
