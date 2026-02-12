/**
 * Tactical readout overlay — shows detailed ship and sector information.
 * Ported from ZylonGameViewController.updateTactical() lines 1292-1329.
 *
 * Displays: Theta (pitch), Phi (yaw), Shields, Energy, Enemy count, Target distance.
 * Toggle with 'T' key (matches iOS toggleTacticalDisplay).
 */

export class TacticalDisplay {
  private container: HTMLDivElement;
  private thetaLabel: HTMLSpanElement;
  private phiLabel: HTMLSpanElement;
  private shieldsLabel: HTMLSpanElement;
  private energyLabel: HTMLSpanElement;
  private enemiesLabel: HTMLSpanElement;
  private distanceLabel: HTMLSpanElement;
  private _engaged = false;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'tactical-display';
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '40px',
      right: '10px',
      display: 'none',
      flexDirection: 'column',
      gap: '2px',
      padding: '8px',
      background: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid #0a0',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '11px',
      pointerEvents: 'none',
      zIndex: '25',
    });

    this.thetaLabel = this.addLine('\u0398: 0.00');      // Theta
    this.phiLabel = this.addLine('\u0278: 0.00');         // Phi
    this.shieldsLabel = this.addLine('Shields: DOWN');
    this.energyLabel = this.addLine('Energy: 10000');
    this.enemiesLabel = this.addLine('Enemies: 0');
    this.distanceLabel = this.addLine('NO ENEMY TARGETS');

    parentElement.appendChild(this.container);
  }

  private addLine(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = text;
    this.container.appendChild(span);
    return span;
  }

  get engaged(): boolean {
    return this._engaged;
  }

  toggle(): void {
    this._engaged = !this._engaged;
    this.container.style.display = this._engaged ? 'flex' : 'none';
  }

  show(): void {
    this._engaged = true;
    this.container.style.display = 'flex';
  }

  hide(): void {
    this._engaged = false;
    this.container.style.display = 'none';
  }

  update(
    thetaDeg: number,
    phiDeg: number,
    shieldsUp: boolean,
    shieldStrength: number,
    energy: number,
    enemyCount: number,
    targetDistance: number | null,
  ): void {
    if (!this._engaged) return;

    const roundedTheta = Math.round(thetaDeg * 100) / 100;
    const roundedPhi = Math.round(phiDeg * 100) / 100;

    this.thetaLabel.textContent = `\u0398: ${roundedTheta}`;
    this.phiLabel.textContent = `\u0278: ${roundedPhi}`;
    this.shieldsLabel.textContent = shieldsUp
      ? `Shields: ${shieldStrength}%`
      : 'Shields: DOWN';
    this.energyLabel.textContent = `Energy: ${energy}`;
    this.enemiesLabel.textContent = `Enemies In Sector: ${enemyCount}`;
    this.distanceLabel.textContent = targetDistance !== null
      ? `DISTANCE TO TARGET - ${Math.round(targetDistance)}`
      : 'NO ENEMY TARGETS';
  }

  dispose(): void {
    this.container.remove();
  }
}
