/**
 * 2D classic grid map (8 rows x 16 cols = 128 sectors).
 * Ported from ClassicMap.swift — renders as an HTML overlay on the canvas.
 *
 * Sector layout: row = floor(index / 16), col = index % 16
 * Colors: green grid, red enemy icons, blue starbase icons,
 *         white = current sector, red highlight = target sector.
 */

import { GalaxyMapModel } from '@/galaxy/GalaxyMapModel';
import { SectorGridType } from '@/core/types';

const ROWS = 8;
const COLS = 16;

export class ClassicMapRenderer {
  private container: HTMLDivElement;
  private cells: HTMLDivElement[] = [];
  private currentSectorHighlight: HTMLDivElement | null = null;
  private targetSectorHighlight: HTMLDivElement | null = null;

  /** Visible quadrant range (0-based indices, inclusive) */
  private visibleMin = 0;
  private visibleMax = 127;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'classic-map';
    Object.assign(this.container.style, {
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      gap: '1px',
      width: '100%',
      height: '100%',
      background: '#000',
    });

    // Create 128 cells
    for (let i = 0; i < ROWS * COLS; i++) {
      const cell = document.createElement('div');
      Object.assign(cell.style, {
        background: '#001a00',
        border: '1px solid #003300',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
      });
      this.container.appendChild(cell);
      this.cells.push(cell);
    }

    parentElement.appendChild(this.container);
    this.hide();
  }

  setAvailable(min: number, max: number): void {
    this.visibleMin = min;
    this.visibleMax = max;
  }

  updateDisplay(galaxy: GalaxyMapModel, shipSector: number, targetSector: number): void {
    for (let i = 0; i < 128; i++) {
      const cell = this.cells[i];

      // Clear previous content
      cell.textContent = '';
      cell.style.background = '#001a00';

      // Fade sectors outside active quadrant range
      if (i >= this.visibleMin && i <= this.visibleMax) {
        cell.style.opacity = '1.0';
      } else {
        cell.style.opacity = '0.25';
      }

      const sector = galaxy.map[i];
      switch (sector.sectorType) {
        case SectorGridType.Enemy:
        case SectorGridType.Enemy2:
        case SectorGridType.Enemy3:
          cell.textContent = '\u2666'; // diamond
          cell.style.color = '#ff3333';
          break;
        case SectorGridType.Starbase:
          cell.textContent = '\u2726'; // star
          cell.style.color = '#3399ff';
          break;
        case SectorGridType.Empty:
          cell.textContent = '\u00B7'; // middle dot
          cell.style.color = '#004400';
          break;
      }
    }

    // Highlight current ship sector
    if (shipSector >= 0 && shipSector < 128) {
      this.cells[shipSector].style.background = 'rgba(255, 255, 255, 0.3)';
    }

    // Highlight target sector
    if (targetSector >= 0 && targetSector < 128) {
      this.cells[targetSector].style.background = 'rgba(255, 0, 0, 0.3)';
    }
  }

  show(): void {
    this.container.style.display = 'grid';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  get element(): HTMLDivElement {
    return this.container;
  }

  dispose(): void {
    this.container.remove();
  }
}
