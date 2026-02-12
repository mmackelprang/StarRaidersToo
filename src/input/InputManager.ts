/**
 * Unified input facade — combines joystick, keyboard (dev), and future gamepad.
 * Feeds xThrust/yThrust to the SectorObjectsNode for ship rotation.
 *
 * Keyboard controls (for development, not in original game):
 *   WASD / Arrow keys = ship steering
 *   Space = placeholder for fire
 */

import { JoystickController } from '@/input/JoystickController';

export interface InputState {
  xThrust: number;
  yThrust: number;
  invertedAxis: boolean;
}

export class InputManager {
  private joystick: JoystickController;
  private keysDown = new Set<string>();
  invertedAxis = false;

  /** Keyboard thrust magnitude (matches joystick feel) */
  private static readonly KB_THRUST = 0.008;

  constructor(parentElement: HTMLElement) {
    this.joystick = new JoystickController(parentElement);

    window.addEventListener('keydown', (e) => this.keysDown.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keysDown.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keysDown.clear());
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

    // Keyboard input (additive, for dev)
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) {
      xThrust += InputManager.KB_THRUST;
    }
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) {
      xThrust -= InputManager.KB_THRUST;
    }
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) {
      yThrust -= InputManager.KB_THRUST;
    }
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) {
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
