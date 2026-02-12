/**
 * FPS and draw call tracking for performance monitoring.
 * Provides real-time performance metrics for debugging and adaptive quality.
 */

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples = 60;
  private lastTime = 0;
  private _drawCalls = 0;

  /** Record a frame timestamp. Call once per frame. */
  recordFrame(): void {
    const now = performance.now();
    if (this.lastTime > 0) {
      this.frameTimes.push(now - this.lastTime);
      if (this.frameTimes.length > this.maxSamples) {
        this.frameTimes.shift();
      }
    }
    this.lastTime = now;
  }

  /** Average FPS over the sample window */
  get fps(): number {
    if (this.frameTimes.length === 0) return 0;
    const avgMs = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return avgMs > 0 ? 1000 / avgMs : 0;
  }

  /** Average frame time in milliseconds */
  get avgFrameTimeMs(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  /** Whether performance is below 30 FPS */
  get isLowPerformance(): boolean {
    return this.fps > 0 && this.fps < 30;
  }

  set drawCalls(count: number) {
    this._drawCalls = count;
  }

  get drawCalls(): number {
    return this._drawCalls;
  }

  reset(): void {
    this.frameTimes = [];
    this.lastTime = 0;
    this._drawCalls = 0;
  }
}
