/**
 * 3D Galactic map — rotatable 128-sector grid with animated blips.
 * Ported from GalaxyMapDisplay.swift and GalaxyBlip.swift.
 *
 * Enemy blips pulse yellow↔red (1s), station blips pulse blue↔white (0.2s).
 * All blips rotate 360°/4s. Supports pan/zoom/tap-to-select.
 */

import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { SectorGridType } from '@/core/types';

/** Visual constants from iOS */
const FADED_MAP_TRANSPARENCY = 0.03;
const ENEMY_PULSE_PERIOD = 1000;  // ms
const STATION_PULSE_PERIOD = 200; // ms
const BLIP_ROTATION_PERIOD = 4000; // ms
const MAP_ZOOM_MIN = 0.75;
const MAP_ZOOM_MAX = 1.2;
const MAP_PAN_X_MIN = -0.4; // radians
const MAP_PAN_X_MAX = 0.2;

export class GalacticMap3D {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx2d: CanvasRenderingContext2D;
  private animFrame = 0;
  private rotationZ = 0;
  private rotationX = 0;
  private scale = 1.0;
  private selectedSector = -1;
  private galaxyModel: GalaxyMapModel | null = null;
  private activeQuadrant = -1;
  private onSectorSelected: ((sector: number) => void) | null = null;

  // Drag state
  private isDragging = false;
  private lastDragX = 0;
  private lastDragY = 0;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'z-index:85;pointer-events:auto;display:none;';

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;';
    this.container.appendChild(this.canvas);
    parent.appendChild(this.container);

    this.ctx2d = this.canvas.getContext('2d')!;

    // Gesture handlers
    this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.container.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.container.addEventListener('pointerup', () => this.onPointerUp());
    this.container.addEventListener('wheel', (e) => this.onWheel(e));
    this.container.addEventListener('click', (e) => this.onClick(e));
  }

  setSectorSelectedCallback(cb: (sector: number) => void): void {
    this.onSectorSelected = cb;
  }

  show(model: GalaxyMapModel, currentSector: number, quadrant: number): void {
    this.galaxyModel = model;
    this.selectedSector = currentSector;
    this.activeQuadrant = quadrant;
    this.container.style.display = 'block';
    this.resizeCanvas();
    this.startAnimation();
  }

  hide(): void {
    this.container.style.display = 'none';
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = 0;
    }
  }

  private resizeCanvas(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  private startAnimation(): void {
    const animate = () => {
      this.render();
      this.animFrame = requestAnimationFrame(animate);
    };
    this.animFrame = requestAnimationFrame(animate);
  }

  private render(): void {
    const { ctx2d: ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    if (!this.galaxyModel) return;

    // Grid layout: 8 rows × 16 columns
    const cols = 16;
    const rows = 8;
    const cellW = (w * this.scale * 0.8) / cols;
    const cellH = (h * this.scale * 0.8) / rows;
    const offsetX = (w - cellW * cols) / 2 + this.rotationZ * 100;
    const offsetY = (h - cellH * rows) / 2 + this.rotationX * 100;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0,255,255,0.15)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + r * cellH);
      ctx.lineTo(offsetX + cols * cellW, offsetY + r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + c * cellW, offsetY);
      ctx.lineTo(offsetX + c * cellW, offsetY + rows * cellH);
      ctx.stroke();
    }

    // Draw sector blips
    for (let i = 0; i < 128; i++) {
      const sector = this.galaxyModel.map[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = offsetX + col * cellW + cellW / 2;
      const cy = offsetY + row * cellH + cellH / 2;

      // Quadrant fade
      const quadrant = Math.floor(i / 32);
      const alpha = this.activeQuadrant >= 0 && quadrant !== this.activeQuadrant
        ? FADED_MAP_TRANSPARENCY
        : 1.0;

      if (sector.sectorType === SectorGridType.Empty) continue;

      const blipRotation = (now % BLIP_ROTATION_PERIOD) / BLIP_ROTATION_PERIOD * Math.PI * 2;
      const blipSize = Math.min(cellW, cellH) * 0.35;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(blipRotation);
      ctx.globalAlpha = alpha;

      if (sector.sectorType === SectorGridType.Starbase) {
        // Station blip: blue↔white pulse
        const pulse = (Math.sin(now / STATION_PULSE_PERIOD * Math.PI * 2) + 1) / 2;
        const r = Math.round(pulse * 255);
        const g = Math.round(pulse * 255);
        const b = 255;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -blipSize);
        ctx.lineTo(blipSize, 0);
        ctx.lineTo(0, blipSize);
        ctx.lineTo(-blipSize, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // Enemy blip: yellow↔red pulse
        const pulse = (Math.sin(now / ENEMY_PULSE_PERIOD * Math.PI * 2) + 1) / 2;
        const g = Math.round(pulse * 200);
        ctx.fillStyle = `rgb(255,${g},0)`;
        // Triangle shape
        ctx.beginPath();
        ctx.moveTo(0, -blipSize);
        ctx.lineTo(blipSize * 0.8, blipSize * 0.6);
        ctx.lineTo(-blipSize * 0.8, blipSize * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Highlight selected sector
      if (i === this.selectedSector) {
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          offsetX + col * cellW + 2,
          offsetY + row * cellH + 2,
          cellW - 4,
          cellH - 4,
        );
      }
    }

    ctx.globalAlpha = 1.0;
  }

  // --- Gesture Handlers ---

  private onPointerDown(e: PointerEvent): void {
    this.isDragging = true;
    this.lastDragX = e.clientX;
    this.lastDragY = e.clientY;
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastDragX;
    const dy = e.clientY - this.lastDragY;
    this.rotationZ += dx * 0.005;
    this.rotationX = Math.max(MAP_PAN_X_MIN, Math.min(MAP_PAN_X_MAX,
      this.rotationX + dy * 0.005));
    this.lastDragX = e.clientX;
    this.lastDragY = e.clientY;
  }

  private onPointerUp(): void {
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.scale = Math.max(MAP_ZOOM_MIN, Math.min(MAP_ZOOM_MAX,
      this.scale - e.deltaY * 0.001));
  }

  private onClick(e: MouseEvent): void {
    if (!this.galaxyModel) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    const cols = 16;
    const rows = 8;
    const cellW = (this.canvas.width * this.scale * 0.8) / cols;
    const cellH = (this.canvas.height * this.scale * 0.8) / rows;
    const offsetX = (this.canvas.width - cellW * cols) / 2 + this.rotationZ * 100;
    const offsetY = (this.canvas.height - cellH * rows) / 2 + this.rotationX * 100;

    const col = Math.floor((mx - offsetX) / cellW);
    const row = Math.floor((my - offsetY) / cellH);

    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const sector = row * cols + col;
      if (sector >= 0 && sector < 128) {
        this.selectedSector = sector;
        this.onSectorSelected?.(sector);
      }
    }
  }

  dispose(): void {
    this.hide();
    this.container.remove();
  }
}
