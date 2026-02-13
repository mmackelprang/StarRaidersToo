/**
 * Central audio manager — Web Audio context, preloading, and buffer cache.
 * Ported from ZylonGameViewController audio setup.
 *
 * Manages the AudioContext lifecycle and provides a buffer cache
 * for loaded audio files. All audio goes through a master gain node.
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private _muted = false;

  getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  get muted(): boolean {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;
    if (this.masterGain) {
      this.masterGain.gain.value = value ? 0 : 1;
    }
  }

  /**
   * Load an audio file and cache the buffer.
   * Supports .ogg and .mp3 with fallback.
   */
  async loadSound(name: string, url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(name)) {
      return this.bufferCache.get(name)!;
    }

    const ctx = this.getContext();
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(name, audioBuffer);
      return audioBuffer;
    } catch {
      // Return a silent buffer on failure
      const silent = ctx.createBuffer(1, 1, ctx.sampleRate);
      this.bufferCache.set(name, silent);
      return silent;
    }
  }

  /** Play a cached sound. Returns the source node for control. */
  playSound(name: string, loop = false, volume = 1.0): AudioBufferSourceNode | null {
    const buffer = this.bufferCache.get(name);
    if (!buffer) return null;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.getMasterGain());
    source.loop = loop;
    source.start();
    return source;
  }

  /** Play a one-shot sound at a given volume */
  playOneShot(name: string, volume = 1.0): void {
    this.playSound(name, false, volume);
  }

  /** Get a cached buffer by name (for direct-playback use) */
  getBuffer(name: string): AudioBuffer | null {
    return this.bufferCache.get(name) ?? null;
  }

  /** Check if a sound is cached */
  hasSound(name: string): boolean {
    return this.bufferCache.has(name);
  }

  dispose(): void {
    this.bufferCache.clear();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
