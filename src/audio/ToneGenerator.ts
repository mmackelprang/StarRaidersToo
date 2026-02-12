/**
 * Web Audio oscillator-based tone generator.
 * Ported from HUD.swift AVTonePlayerUnit usage.
 *
 * Used for alert alarm (486Hz/334Hz alternating) and UI beeps.
 */

export class ToneGenerator {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private _frequency = 486;
  private _playing = false;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  get frequency(): number {
    return this._frequency;
  }

  set frequency(hz: number) {
    this._frequency = hz;
    if (this.oscillator) {
      this.oscillator.frequency.value = hz;
    }
  }

  get playing(): boolean {
    return this._playing;
  }

  play(): void {
    if (this._playing) return;

    const ctx = this.getContext();
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this._frequency;
    this.gainNode.gain.value = 0.15; // Not too loud

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);
    this.oscillator.start();
    this._playing = true;
  }

  stop(): void {
    if (!this._playing) return;

    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this._playing = false;
  }

  /** Play a short beep at the given frequency */
  beep(hz: number, durationMs = 100): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.value = 0.1;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setTimeout(() => {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    }, durationMs);
  }

  dispose(): void {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
