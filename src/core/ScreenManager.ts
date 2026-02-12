/**
 * Screen transition manager — manages flow between menu, prologue, game, game over.
 * Equivalent to iOS storyboard segues with programmatic alpha fade transitions.
 *
 * Flow: MainMenu → Prologue (optional) → Game → GameOver → MainMenu
 */

export type ScreenName = 'mainMenu' | 'prologue' | 'game' | 'gameOver';

export interface Screen {
  show(): void;
  hide(): void;
  dispose(): void;
}

/** Default fade duration in seconds */
const FADE_DURATION = 1.0;

export class ScreenManager {
  private overlay: HTMLDivElement;
  private screens = new Map<ScreenName, Screen>();
  private currentScreen: ScreenName | null = null;

  constructor(private parent: HTMLElement) {
    // Full-screen fade overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'background:#000;opacity:0;pointer-events:none;z-index:200;' +
      'transition:opacity 1s ease;';
    parent.appendChild(this.overlay);
  }

  registerScreen(name: ScreenName, screen: Screen): void {
    this.screens.set(name, screen);
  }

  /** Transition to a new screen with a fade-to-black effect */
  transitionTo(name: ScreenName, fadeDuration = FADE_DURATION): Promise<void> {
    return new Promise((resolve) => {
      this.overlay.style.transition = `opacity ${fadeDuration}s ease`;
      this.overlay.style.opacity = '1';
      this.overlay.style.pointerEvents = 'all';

      setTimeout(() => {
        // Hide current screen
        if (this.currentScreen) {
          const current = this.screens.get(this.currentScreen);
          current?.hide();
        }

        // Show new screen
        const next = this.screens.get(name);
        next?.show();
        this.currentScreen = name;

        // Fade back in
        this.overlay.style.opacity = '0';

        setTimeout(() => {
          this.overlay.style.pointerEvents = 'none';
          resolve();
        }, fadeDuration * 1000);
      }, fadeDuration * 1000);
    });
  }

  /** Immediately show a screen without fade */
  showImmediate(name: ScreenName): void {
    if (this.currentScreen) {
      const current = this.screens.get(this.currentScreen);
      current?.hide();
    }
    const next = this.screens.get(name);
    next?.show();
    this.currentScreen = name;
  }

  get current(): ScreenName | null {
    return this.currentScreen;
  }

  dispose(): void {
    this.screens.forEach((screen) => screen.dispose());
    this.screens.clear();
    this.overlay.remove();
  }
}
