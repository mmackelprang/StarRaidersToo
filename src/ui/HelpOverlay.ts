/**
 * Help overlay — shows keybindings and controls.
 * Toggle with 'H' key.
 */

export class HelpOverlay {
  private container: HTMLDivElement;
  private _visible = false;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'help-overlay';
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'none',
      padding: '20px 28px',
      background: 'rgba(0, 0, 0, 0.75)',
      border: '1px solid #0a0',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '13px',
      whiteSpace: 'pre',
      lineHeight: '1.6',
      pointerEvents: 'none',
      zIndex: '45',
    });

    this.container.textContent =
      '         \u2500\u2500 CONTROLS \u2500\u2500\n' +
      '\n' +
      '  W / \u2191        Pitch Up\n' +
      '  S / \u2193        Pitch Down\n' +
      '  A / \u2190        Rotate Left\n' +
      '  D / \u2192        Rotate Right\n' +
      '  SPACE        Fire Torpedo\n' +
      '  V            Toggle Fore/Aft View\n' +
      '  G            Galactic Map\n' +
      '  T            Tactical Display\n' +
      '  H            This Help Screen';

    parentElement.appendChild(this.container);
  }

  get visible(): boolean {
    return this._visible;
  }

  toggle(): void {
    this._visible = !this._visible;
    this.container.style.display = this._visible ? 'block' : 'none';
  }

  show(): void {
    this._visible = true;
    this.container.style.display = 'block';
  }

  hide(): void {
    this._visible = false;
    this.container.style.display = 'none';
  }

  dispose(): void {
    this.container.remove();
  }
}
