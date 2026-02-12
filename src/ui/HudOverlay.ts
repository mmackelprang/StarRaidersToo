/**
 * Heads-up display overlay showing energy, shields, speed, sector info,
 * crosshairs, and shield flash effect.
 * Ported from HUD.swift and ZylonGameViewController HUD elements.
 */

import { ViewMode } from '@/core/types';
import { sectorQuadrant, sectorQuadrantNumber } from '@/galaxy/SectorGrid';

export class HudOverlay {
  private container: HTMLDivElement;
  private energyLabel: HTMLSpanElement;
  private shieldLabel: HTMLSpanElement;
  private speedLabel: HTMLSpanElement;
  private sectorLabel: HTMLSpanElement;
  private targetLabel: HTMLSpanElement;
  private warpIndicator: HTMLSpanElement;
  private enemyIndicator: HTMLSpanElement;
  private crosshairs: HTMLDivElement;
  private shieldOverlay: HTMLDivElement;

  constructor(parentElement: HTMLElement) {
    // Shield flash overlay (full screen blue tint)
    this.shieldOverlay = document.createElement('div');
    Object.assign(this.shieldOverlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 80, 255, 0.14)',
      pointerEvents: 'none',
      zIndex: '15',
      transition: 'opacity 0.1s',
    });
    parentElement.appendChild(this.shieldOverlay);

    // Crosshairs overlay (centered)
    this.crosshairs = document.createElement('div');
    Object.assign(this.crosshairs.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '40px',
      height: '40px',
      pointerEvents: 'none',
      zIndex: '18',
    });
    // Draw crosshairs with CSS borders
    const hLine = document.createElement('div');
    Object.assign(hLine.style, {
      position: 'absolute',
      top: '50%',
      left: '0',
      width: '100%',
      height: '1px',
      background: '#0f0',
      opacity: '0.6',
    });
    const vLine = document.createElement('div');
    Object.assign(vLine.style, {
      position: 'absolute',
      left: '50%',
      top: '0',
      width: '1px',
      height: '100%',
      background: '#0f0',
      opacity: '0.6',
    });
    this.crosshairs.appendChild(hLine);
    this.crosshairs.appendChild(vLine);
    parentElement.appendChild(this.crosshairs);

    // Bottom status bar
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

    // Enemy indicator (below alert area)
    this.enemyIndicator = document.createElement('span');
    Object.assign(this.enemyIndicator.style, {
      position: 'absolute',
      top: '42px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#0f0',
      pointerEvents: 'none',
      zIndex: '22',
    });
    parentElement.appendChild(this.enemyIndicator);
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

  /** Update enemy indicator text */
  updateEnemyIndicator(count: number): void {
    if (count > 0) {
      this.enemyIndicator.textContent = `ENEMIES IN RANGE: ${count}`;
      this.enemyIndicator.style.color = '#f33';
    } else {
      this.enemyIndicator.textContent = 'SECTOR CLEARED';
      this.enemyIndicator.style.color = '#0f0';
    }
  }

  /**
   * Shield flash effect — 3 rapid flashes from HUD.swift shieldFlash().
   * Alpha goes 0.14 → 0.6 → 0.14 three times.
   */
  shieldFlash(): void {
    let step = 0;
    const flash = () => {
      if (step >= 6) {
        this.shieldOverlay.style.opacity = '1'; // back to base 0.14
        return;
      }
      this.shieldOverlay.style.opacity = step % 2 === 0 ? '4.3' : '1'; // 0.6/0.14 ≈ 4.3x
      step++;
      setTimeout(flash, 50 + Math.random() * 50);
    };
    flash();
  }

  /** Update crosshairs for view mode */
  setViewMode(mode: ViewMode): void {
    if (mode === ViewMode.GalacticMap) {
      this.crosshairs.style.display = 'none';
    } else {
      this.crosshairs.style.display = 'block';
    }
  }

  show(): void {
    this.container.style.display = 'flex';
    this.crosshairs.style.display = 'block';
    this.shieldOverlay.style.display = 'block';
  }

  hide(): void {
    this.container.style.display = 'none';
    this.crosshairs.style.display = 'none';
    this.shieldOverlay.style.display = 'none';
  }

  dispose(): void {
    this.container.remove();
    this.crosshairs.remove();
    this.shieldOverlay.remove();
    this.enemyIndicator.remove();
  }
}
