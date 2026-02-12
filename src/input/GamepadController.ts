/**
 * Gamepad controller input via the Gamepad API.
 * Ported from ZylonGameViewController processGameControllerInput() lines 88-246.
 *
 * Button mapping:
 *   LStick = steer (÷40), RT/A = fire, LT = shields,
 *   B = toggle view, LB = galactic map
 *
 * Hides touch joystick when a gamepad is connected.
 */

/** Gamepad axis scaling factor (matches iOS leftThumbstick ÷ 40) */
const GAMEPAD_STICK_DIVISOR = 40;

/** Standard gamepad button indices (Standard Gamepad mapping) */
const BUTTON = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
} as const;

export interface GamepadActions {
  onFire(): void;
  onToggleShields(): void;
  onToggleView(): void;
  onToggleGalacticMap(): void;
}

export class GamepadController {
  private actions: GamepadActions;
  private connected = false;
  private prevButtons = new Map<number, boolean>();
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  private connectHandler: (e: GamepadEvent) => void;
  private disconnectHandler: (e: GamepadEvent) => void;

  constructor(actions: GamepadActions) {
    this.actions = actions;

    this.connectHandler = (e) => {
      if (e.gamepad.mapping === 'standard') {
        this.connected = true;
        this.onConnectCallback?.();
      }
    };

    this.disconnectHandler = () => {
      this.connected = false;
      this.onDisconnectCallback?.();
    };

    window.addEventListener('gamepadconnected', this.connectHandler);
    window.addEventListener('gamepaddisconnected', this.disconnectHandler);
  }

  onConnect(cb: () => void): void {
    this.onConnectCallback = cb;
  }

  onDisconnect(cb: () => void): void {
    this.onDisconnectCallback = cb;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  /** Get the current gamepad (if any) */
  private getGamepad(): Gamepad | null {
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp && gp.mapping === 'standard') return gp;
    }
    return null;
  }

  /**
   * Poll gamepad state. Call once per frame.
   * Returns stick axes for steering.
   */
  poll(): { xThrust: number; yThrust: number } {
    const gp = this.getGamepad();
    if (!gp) return { xThrust: 0, yThrust: 0 };

    // Process button presses (edge-triggered)
    this.checkButton(gp, BUTTON.A, () => this.actions.onFire());
    this.checkButton(gp, BUTTON.RT, () => this.actions.onFire());
    this.checkButton(gp, BUTTON.LT, () => this.actions.onToggleShields());
    this.checkButton(gp, BUTTON.B, () => this.actions.onToggleView());
    this.checkButton(gp, BUTTON.LB, () => this.actions.onToggleGalacticMap());

    // Left stick axes (÷40, matching iOS)
    const rawX = gp.axes[0] ?? 0;
    const rawY = gp.axes[1] ?? 0;

    // Apply deadzone
    const deadzone = 0.1;
    const x = Math.abs(rawX) > deadzone ? rawX / GAMEPAD_STICK_DIVISOR : 0;
    const y = Math.abs(rawY) > deadzone ? rawY / GAMEPAD_STICK_DIVISOR : 0;

    return { xThrust: x, yThrust: -y }; // Invert Y (gamepad Y is down-positive)
  }

  /** Edge-detect: fire action only on press, not hold */
  private checkButton(gp: Gamepad, index: number, action: () => void): void {
    const pressed = gp.buttons[index]?.pressed ?? false;
    const wasPressed = this.prevButtons.get(index) ?? false;

    if (pressed && !wasPressed) {
      action();
    }
    this.prevButtons.set(index, pressed);
  }

  dispose(): void {
    window.removeEventListener('gamepadconnected', this.connectHandler);
    window.removeEventListener('gamepaddisconnected', this.disconnectHandler);
  }
}
