/**
 * Unified input facade — combines joystick, keyboard (dev), and future gamepad.
 * Feeds xThrust/yThrust to the SectorObjectsNode for ship rotation.
 *
 * Keyboard controls (for development, not in original game):
 *   WASD / Arrow keys = ship steering
 *   Space = placeholder for fire
 *
 * Uses e.code (physical key position) instead of e.key so that an active IME
 * on Windows (where e.key becomes "Process" for character keys) cannot break WASD.
 */

import { JoystickController } from '@/input/JoystickController';

export interface InputState {
  xThrust: number;
  yThrust: number;
  invertedAxis: boolean;
}

export class InputManager {
  private joystick: JoystickController;
  private codesDown = new Set<string>();
  invertedAxis = false;

  /** Keyboard thrust magnitude (matches joystick feel) */
  private static readonly KB_THRUST = 0.008;

  constructor(parentElement: HTMLElement) {
    this.joystick = new JoystickController(parentElement);

    window.addEventListener('keydown', (e) => this.codesDown.add(e.code));
    window.addEventListener('keyup', (e) => this.codesDown.delete(e.code));
    window.addEventListener('blur', () => this.codesDown.clear());
  }

  /**
   * Get current input state. Called every frame.
   * Combines joystick and keyboard input.
   */
  getInput(): InputState {
    let xThrust = 0;
    let yThrust = 0;

    // Joystick input (primary)
    if (this.joystick.displacement > 0) {
      xThrust = this.invertedAxis ? this.joystick.invertedXThrust : this.joystick.xThrust;
      yThrust = this.joystick.yThrust;
    }

    // Keyboard input (additive) — uses e.code for IME resilience
    if (this.codesDown.has('KeyW') || this.codesDown.has('ArrowUp')) {
      xThrust += InputManager.KB_THRUST;
    }
    if (this.codesDown.has('KeyS') || this.codesDown.has('ArrowDown')) {
      xThrust -= InputManager.KB_THRUST;
    }
    if (this.codesDown.has('KeyA') || this.codesDown.has('ArrowLeft')) {
      yThrust -= InputManager.KB_THRUST;
    }
    if (this.codesDown.has('KeyD') || this.codesDown.has('ArrowRight')) {
      yThrust += InputManager.KB_THRUST;
    }

    return { xThrust, yThrust, invertedAxis: this.invertedAxis };
  }

  get joystickController(): JoystickController {
    return this.joystick;
  }

  /** Hide touch joystick (when gamepad connects) */
  hideJoystick(): void {
    this.joystick.hide();
  }

  /** Show touch joystick (when gamepad disconnects) */
  showJoystick(): void {
    this.joystick.show();
  }

  dispose(): void {
    this.joystick.dispose();
  }
}
