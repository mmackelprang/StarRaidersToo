/**
 * Galactic map overlay with quadrant buttons and sector selector.
 * Ported from ZylonGameViewController quadrant button actions (lines 530-620).
 *
 * Layout: 4 quadrant buttons (Alpha/Beta/Gamma/Delta) + All button,
 *         a sector slider (range depends on selected quadrant),
 *         warp button, and the ClassicMapRenderer.
 */

import { KnownQuadrants } from '@/core/types';
import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { sectorQuadrant, sectorQuadrantNumber, QUADRANT_RANGES } from '@/galaxy/SectorGrid';
import { ClassicMapRenderer } from '@/ui/ClassicMapRenderer';

export interface GalacticMapCallbacks {
  onTargetChanged: (sectorIndex: number) => void;
  onWarpRequested: () => void;
  onQuadrantSelected: (quadrant: KnownQuadrants | null) => void;
}

export class GalacticMapOverlay {
  private overlay: HTMLDivElement;
  private classicMap: ClassicMapRenderer;
  private sectorSlider: HTMLInputElement;
  private targetLabel: HTMLSpanElement;
  private callbacks: GalacticMapCallbacks;
  private currentQuadrant: KnownQuadrants | null = null;

  constructor(parentElement: HTMLElement, callbacks: GalacticMapCallbacks) {
    this.callbacks = callbacks;

    this.overlay = document.createElement('div');
    this.overlay.className = 'galactic-map-overlay';
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#0f0',
      fontFamily: 'monospace',
      zIndex: '50',
    });

    // Quadrant buttons row
    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
      display: 'flex',
      gap: '8px',
      marginBottom: '8px',
    });

    const quadrants: (KnownQuadrants | null)[] = [
      KnownQuadrants.Alpha,
      KnownQuadrants.Beta,
      KnownQuadrants.Gamma,
      KnownQuadrants.Delta,
      null, // "All" button
    ];

    for (const q of quadrants) {
      const btn = document.createElement('button');
      btn.textContent = q ? q.toUpperCase() : 'ALL';
      Object.assign(btn.style, {
        padding: '4px 12px',
        background: '#002200',
        color: '#0f0',
        border: '1px solid #0f0',
        fontFamily: 'monospace',
        cursor: 'pointer',
        fontSize: '12px',
      });
      btn.addEventListener('click', () => this.selectQuadrant(q));
      buttonRow.appendChild(btn);
    }
    this.overlay.appendChild(buttonRow);

    // Target label
    this.targetLabel = document.createElement('span');
    this.targetLabel.style.marginBottom = '4px';
    this.targetLabel.style.fontSize = '14px';
    this.overlay.appendChild(this.targetLabel);

    // Sector slider
    this.sectorSlider = document.createElement('input');
    this.sectorSlider.type = 'range';
    this.sectorSlider.min = '0';
    this.sectorSlider.max = '127';
    this.sectorSlider.value = '68';
    Object.assign(this.sectorSlider.style, {
      width: '80%',
      marginBottom: '8px',
    });
    this.sectorSlider.addEventListener('input', () => {
      const idx = parseInt(this.sectorSlider.value, 10);
      this.callbacks.onTargetChanged(idx);
    });
    this.overlay.appendChild(this.sectorSlider);

    // Warp button
    const warpBtn = document.createElement('button');
    warpBtn.textContent = 'ENGAGE WARP';
    Object.assign(warpBtn.style, {
      padding: '8px 24px',
      background: '#220000',
      color: '#f33',
      border: '1px solid #f33',
      fontFamily: 'monospace',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '12px',
    });
    warpBtn.addEventListener('click', () => this.callbacks.onWarpRequested());
    this.overlay.appendChild(warpBtn);

    // Classic 2D map
    const mapContainer = document.createElement('div');
    Object.assign(mapContainer.style, {
      width: '80%',
      maxWidth: '640px',
      height: '40%',
    });
    this.classicMap = new ClassicMapRenderer(mapContainer);
    this.classicMap.show();
    this.overlay.appendChild(mapContainer);

    parentElement.appendChild(this.overlay);
  }

  private selectQuadrant(quadrant: KnownQuadrants | null): void {
    this.currentQuadrant = quadrant;

    if (quadrant) {
      const range = QUADRANT_RANGES[quadrant];
      this.sectorSlider.min = String(range.min);
      this.sectorSlider.max = String(range.max);
      this.classicMap.setAvailable(range.min, range.max);
      // Set target to quadrant midpoint
      const mid = Math.floor((range.min + range.max) / 2);
      this.sectorSlider.value = String(mid);
      this.callbacks.onTargetChanged(mid);
    } else {
      this.sectorSlider.min = '0';
      this.sectorSlider.max = '127';
      this.classicMap.setAvailable(0, 127);
    }

    this.callbacks.onQuadrantSelected(quadrant);
  }

  updateDisplay(galaxy: GalaxyMapModel, shipSector: number, targetSector: number): void {
    this.classicMap.updateDisplay(galaxy, shipSector, targetSector);
    this.sectorSlider.value = String(targetSector);

    const quad = sectorQuadrant(targetSector + 1); // 1-based for quadrant calc
    const qNum = sectorQuadrantNumber(targetSector + 1);
    this.targetLabel.textContent = `Target: ${quad.toUpperCase()} ${qNum}`;
  }

  show(): void {
    this.overlay.style.display = 'flex';
  }

  hide(): void {
    this.overlay.style.display = 'none';
  }

  dispose(): void {
    this.classicMap.dispose();
    this.overlay.remove();
  }
}
