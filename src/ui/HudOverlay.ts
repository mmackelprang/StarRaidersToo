/**
 * Heads-up display overlay showing energy, shields, speed, and sector info.
 * Ported from ZylonGameViewController HUD elements.
 *
 * This is a minimal Phase 3 HUD — Phase 5 will add crosshairs, scanner, and alerts.
 */

import { sectorQuadrant, sectorQuadrantNumber } from '@/galaxy/SectorGrid';

export class HudOverlay {
  private container: HTMLDivElement;
  private energyLabel: HTMLSpanElement;
  private shieldLabel: HTMLSpanElement;
  private speedLabel: HTMLSpanElement;
  private sectorLabel: HTMLSpanElement;
  private targetLabel: HTMLSpanElement;
  private warpIndicator: HTMLSpanElement;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'hud-overlay';
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 16px',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '13px',
      pointerEvents: 'none',
      zIndex: '20',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
      boxSizing: 'border-box',
    });

    this.energyLabel = this.createLabel('E:10000');
    this.shieldLabel = this.createLabel('S:100');
    this.speedLabel = this.createLabel('SPD:0');
    this.sectorLabel = this.createLabel('SEC:--');
    this.targetLabel = this.createLabel('TGT:--');
    this.warpIndicator = this.createLabel('');
    this.warpIndicator.style.color = '#f33';

    this.container.appendChild(this.energyLabel);
    this.container.appendChild(this.shieldLabel);
    this.container.appendChild(this.speedLabel);
    this.container.appendChild(this.sectorLabel);
    this.container.appendChild(this.targetLabel);
    this.container.appendChild(this.warpIndicator);

    parentElement.appendChild(this.container);
  }

  private createLabel(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }

  update(
    energy: number,
    shields: number,
    speed: number,
    currentSector: number,
    targetSector: number,
    isWarping: boolean,
  ): void {
    this.energyLabel.textContent = `E:${energy}`;
    this.shieldLabel.textContent = `S:${shields}`;
    this.speedLabel.textContent = `SPD:${speed}`;

    const cQuad = sectorQuadrant(currentSector + 1);
    const cNum = sectorQuadrantNumber(currentSector + 1);
    this.sectorLabel.textContent = `SEC:${cQuad.charAt(0).toUpperCase()}${cNum}`;

    const tQuad = sectorQuadrant(targetSector + 1);
    const tNum = sectorQuadrantNumber(targetSector + 1);
    this.targetLabel.textContent = `TGT:${tQuad.charAt(0).toUpperCase()}${tNum}`;

    this.warpIndicator.textContent = isWarping ? 'WARP' : '';
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  dispose(): void {
    this.container.remove();
  }
}
