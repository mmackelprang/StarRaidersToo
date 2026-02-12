/**
 * HTML/CSS touch joystick controller.
 * Ported from JoyStickView.swift — outputs angle (0-360°, 0=north) and displacement (0-1).
 *
 * The iOS version uses UIView with touchesBegan/Moved/Ended.
 * The web version uses a positioned HTML div with pointer events.
 *
 * Angle convention (matching iOS):
 *   0° = up (north), 90° = right (east), 180° = down, 270° = left
 *
 * The thrust calculation (from ZylonGameViewController.swift lines 124-126):
 *   xThrust = cos(angle_radians) * displacement / 100
 *   yThrust = sin(angle_radians) * displacement / 100
 */

import { degreesToRadians } from '@/utils/MathUtils';

export interface JoystickState {
  angle: number;       // degrees, 0=north, clockwise
  displacement: number; // 0.0 to 1.0
}

export class JoystickController {
  private container: HTMLElement;
  private base: HTMLElement;
  private handle: HTMLElement;

  private _angle = 0;
  private _displacement = 0;
  private radius = 0;
  private active = false;

  /** Callback fired when joystick state changes */
  onUpdate: ((state: JoystickState) => void) | null = null;

  constructor(parentElement: HTMLElement) {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'joystick-container';
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '150px',
      height: '150px',
      touchAction: 'none',
      zIndex: '10',
    });

    // Base circle
    this.base = document.createElement('div');
    Object.assign(this.base.style, {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      backgroundColor: 'rgba(255,255,255,0.05)',
      boxSizing: 'border-box',
    });

    // Handle circle
    this.handle = document.createElement('div');
    Object.assign(this.handle.style, {
      position: 'absolute',
      width: '40%',
      height: '40%',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.4)',
      border: '1px solid rgba(255,255,255,0.6)',
      left: '30%',
      top: '30%',
      transition: 'none',
      boxSizing: 'border-box',
    });

    this.container.appendChild(this.base);
    this.container.appendChild(this.handle);
    parentElement.appendChild(this.container);

    this.radius = this.container.offsetWidth / 2;
    if (this.radius === 0) this.radius = 75; // fallback before layout

    this.bindEvents();
  }

  get angle(): number {
    return this._angle;
  }

  get displacement(): number {
    return this._displacement;
  }

  /**
   * Get xThrust for ship rotation (matches iOS exactly).
   * From ZylonGameViewController.swift line 125:
   *   cos(angle.degreesToRadians) * displacement / 100
   */
  get xThrust(): number {
    return Math.cos(degreesToRadians(this._angle)) * this._displacement / 100;
  }

  /**
   * Get yThrust for ship rotation (matches iOS exactly).
   * From ZylonGameViewController.swift line 126:
   *   sin(angle.degreesToRadians) * displacement / 100
   */
  get yThrust(): number {
    return Math.sin(degreesToRadians(this._angle)) * this._displacement / 100;
  }

  /**
   * Get inverted xThrust (for invertedAxis setting).
   * From ZylonGameViewController.swift line 1228:
   *   cos(angle.degreesToRadians + π) * displacement / 100
   */
  get invertedXThrust(): number {
    return Math.cos(degreesToRadians(this._angle) + Math.PI) * this._displacement / 100;
  }

  private bindEvents(): void {
    this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.container.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.container.addEventListener('pointerup', () => this.onPointerUp());
    this.container.addEventListener('pointercancel', () => this.onPointerUp());
    this.container.addEventListener('pointerleave', () => this.onPointerUp());
  }

  private onPointerDown(e: PointerEvent): void {
    this.active = true;
    this.container.setPointerCapture(e.pointerId);
    this.updateFromEvent(e);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.active) return;
    this.updateFromEvent(e);
  }

  private onPointerUp(): void {
    this.active = false;
    this._angle = 0;
    this._displacement = 0;
    this.resetHandlePosition();
    this.onUpdate?.({ angle: 0, displacement: 0 });
  }

  private updateFromEvent(e: PointerEvent): void {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Calculate displacement (0 to 1, clamped)
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.radius = rect.width / 2;
    const newDisplacement = Math.min(dist / this.radius, 1.0);

    // Calculate angle using atan2(dx, dy) for navigation convention (0=north, clockwise)
    // This matches the iOS JoyStickView.swift line 239:
    //   atan2f(Float(delta.dx), Float(delta.dy))
    const angleRadians = Math.atan2(dx, dy);

    // Convert to degrees: 180 - angleRadians * 180/π
    // This matches iOS line 294:
    //   180.0 - newAngleRadians * 180.0 / Float.pi
    const angleDegrees = newDisplacement !== 0 ? 180 - angleRadians * 180 / Math.PI : 0;

    this._displacement = newDisplacement;
    this._angle = angleDegrees;

    // Update handle visual position (clamped to circle)
    const clampedDist = Math.min(dist, this.radius);
    const normX = dist > 0 ? dx / dist : 0;
    const normY = dist > 0 ? dy / dist : 0;
    const handleX = normX * clampedDist;
    const handleY = normY * clampedDist;

    const handleSize = this.handle.offsetWidth;
    this.handle.style.left = `${rect.width / 2 - handleSize / 2 + handleX}px`;
    this.handle.style.top = `${rect.height / 2 - handleSize / 2 + handleY}px`;

    this.onUpdate?.({ angle: this._angle, displacement: this._displacement });
  }

  private resetHandlePosition(): void {
    const containerWidth = this.container.offsetWidth;
    const handleSize = this.handle.offsetWidth;
    this.handle.style.left = `${containerWidth / 2 - handleSize / 2}px`;
    this.handle.style.top = `${containerWidth / 2 - handleSize / 2}px`;
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'block' : 'none';
  }

  dispose(): void {
    this.container.remove();
  }
}
