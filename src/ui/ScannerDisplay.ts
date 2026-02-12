/**
 * Mini radar display with rotating beam and enemy blips.
 * Ported from Scanner.swift.
 *
 * The scanner is a small circular radar in the bottom-left of the screen.
 * A beam rotates 360 degrees in 1.5 seconds.
 * Enemy blips appear as dots scaled from world position (x/100, y/90, z/90).
 * Color: yellow (off-screen) or red (on-screen).
 */

export interface ScannerTarget {
  worldX: number;
  worldY: number;
  worldZ: number;
  isVisible: boolean;
}

export class ScannerDisplay {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx2d: CanvasRenderingContext2D;
  private beamAngle = 0;
  private targets: ScannerTarget[] = [];
  private visible = false;

  /** Beam rotation: 360 degrees in 1.5 seconds = 240 deg/s */
  private static readonly BEAM_SPEED = (2 * Math.PI) / 1.5;
  private static readonly SIZE = 120;
  private static readonly RADIUS = 55;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '50px',
      left: '10px',
      width: `${ScannerDisplay.SIZE}px`,
      height: `${ScannerDisplay.SIZE}px`,
      zIndex: '25',
      pointerEvents: 'none',
      display: 'none',
    });

    this.canvas = document.createElement('canvas');
    this.canvas.width = ScannerDisplay.SIZE;
    this.canvas.height = ScannerDisplay.SIZE;
    this.ctx2d = this.canvas.getContext('2d')!;

    this.container.appendChild(this.canvas);
    parentElement.appendChild(this.container);
  }

  updateTargets(targets: ScannerTarget[]): void {
    this.targets = targets;
  }

  /** Per-frame render */
  render(deltaSeconds: number): void {
    if (!this.visible) return;

    this.beamAngle += ScannerDisplay.BEAM_SPEED * deltaSeconds;
    if (this.beamAngle > 2 * Math.PI) this.beamAngle -= 2 * Math.PI;

    const ctx = this.ctx2d;
    const cx = ScannerDisplay.SIZE / 2;
    const cy = ScannerDisplay.SIZE / 2;
    const r = ScannerDisplay.RADIUS;

    // Clear
    ctx.clearRect(0, 0, ScannerDisplay.SIZE, ScannerDisplay.SIZE);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 20, 0, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#0a0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 60, 0, 0.5)';
    ctx.lineWidth = 0.5;
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();
    // Range ring
    ctx.beginPath();
    ctx.arc(cx, cy, r / 2, 0, 2 * Math.PI);
    ctx.stroke();

    // Rotating beam
    const beamEndX = cx + Math.cos(this.beamAngle) * r;
    const beamEndY = cy + Math.sin(this.beamAngle) * r;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(beamEndX, beamEndY);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Blips
    for (const target of this.targets) {
      // Scale world position to scanner coordinates
      const bx = cx + (target.worldX / 100) * r;
      const by = cy - (target.worldZ / 90) * r; // Z maps to vertical on scanner

      // Clamp to scanner bounds
      const dx = bx - cx;
      const dy = by - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) continue;

      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, 2 * Math.PI);
      ctx.fillStyle = target.isVisible ? '#ff3333' : '#ffff00';
      ctx.fill();
    }
  }

  show(): void {
    this.visible = true;
    this.container.style.display = 'block';
  }

  hide(): void {
    this.visible = false;
    this.container.style.display = 'none';
  }

  get isVisible(): boolean {
    return this.visible;
  }

  dispose(): void {
    this.container.remove();
  }
}
