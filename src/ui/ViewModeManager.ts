/**
 * Manages view mode switching between foreView, aftView, and galacticMap.
 * Ported from ZylonGameViewController.swift renderer(_:didRenderScene:) lines 1557-1630.
 *
 * Controls which camera is active and which UI elements are visible.
 */

import { ViewMode } from '@/core/types';
import { CameraRig } from '@/scene/CameraRig';

export class ViewModeManager {
  private _currentMode: ViewMode = ViewMode.ForeView;
  private callbacks: ((mode: ViewMode) => void)[] = [];

  constructor(private cameraRig: CameraRig) {}

  get currentMode(): ViewMode {
    return this._currentMode;
  }

  setMode(mode: ViewMode): void {
    this._currentMode = mode;
    this.cameraRig.setMode(mode);
    for (const cb of this.callbacks) {
      cb(mode);
    }
  }

  /** Toggle between fore and aft view (from iOS "Toggle View" button) */
  toggleForeAft(): void {
    if (this._currentMode === ViewMode.ForeView) {
      this.setMode(ViewMode.AftView);
    } else {
      this.setMode(ViewMode.ForeView);
    }
  }

  /** Toggle galactic map on/off */
  toggleGalacticMap(): void {
    if (this._currentMode === ViewMode.GalacticMap) {
      this.setMode(ViewMode.ForeView);
    } else {
      this.setMode(ViewMode.GalacticMap);
    }
  }

  /** Register callback for mode changes */
  onModeChange(callback: (mode: ViewMode) => void): void {
    this.callbacks.push(callback);
  }
}
