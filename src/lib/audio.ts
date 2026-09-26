/**
 * Synthesised sound effects via the Web Audio API — zero audio files.
 * The AudioContext is created lazily on the first user gesture (required by
 * iOS Safari) and every sound is a few oscillators + envelopes.
 */

type SoundName = "tick" | "flip" | "chime" | "pop" | "whoosh" | "success" | "error";

type AudioCtor = typeof AudioContext;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor: AudioCtor | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Call from any pointer/keyboard handler to unlock audio on iOS. */
  unlock() {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.master);
    src.start(0);
  }

  setMuted(m: boolean) {
    this.muted = m;
  }

  play(name: SoundName, opts: { intensity?: number } = {}) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    switch (name) {
      case "tick":
        return this.tick(ctx, t, opts.intensity ?? 1);
      case "flip":
        return this.flip(ctx, t);
      case "chime":
        return this.chime(ctx, t);
      case "pop":
        return this.tone(ctx, t, 660, 0.08, "triangle", 0.25, 990);
      case "whoosh":
        return this.whoosh(ctx, t);
      case "success":
        this.tone(ctx, t, 523.25, 0.12, "sine", 0.22);
        this.tone(ctx, t + 0.09, 783.99, 0.18, "sine", 0.22);
        return;
      case "error":
        this.tone(ctx, t, 220, 0.14, "square", 0.08);
        this.tone(ctx, t + 0.12, 196, 0.2, "square", 0.08);
        return;
    }
  }

  private tone(
    ctx: AudioContext,
    t: number,
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    glideTo?: number,
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Wooden peg click: a short high blip layered with a filtered noise transient. */
  private tick(ctx: AudioContext, t: number, intensity: number) {
    this.tone(ctx, t, 1800 + Math.random() * 200, 0.035, "square", 0.05 * intensity);
    const src = ctx.createBufferSource();
    src.buffer = this.getNoise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18 * intensity, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t, 0, 0.04);
  }

  /** Card flip: a quick band-passed noise sweep. */
  private flip(ctx: AudioContext, t: number) {
    const src = ctx.createBufferSource();
    src.buffer = this.getNoise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.exponentialRampToValueAtTime(4200, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t, 0, 0.2);
  }

  private whoosh(ctx: AudioContext, t: number) {
    const src = ctx.createBufferSource();
    src.buffer = this.getNoise(ctx);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(400, t);
    lp.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(lp).connect(g).connect(this.master!);
    src.start(t, 0, 0.5);
  }

  /** Celebratory bell arpeggio (C major 9) with a shimmering tail. */
  private chime(ctx: AudioContext, t: number) {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1174.66];
    notes.forEach((f, i) => {
      const start = t + i * 0.085;
      [1, 2.01, 3.02].forEach((partial, j) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f * partial;
        const vol = [0.16, 0.05, 0.025][j];
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, start + 1.4 - j * 0.3);
        osc.connect(g).connect(this.master!);
        osc.start(start);
        osc.stop(start + 1.5);
      });
    });
  }

  private getNoise(ctx: AudioContext): AudioBuffer {
    if (this.noise) return this.noise;
    const len = ctx.sampleRate * 0.5;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
    return buf;
  }
}

export const sound = new SoundEngine();
export type { SoundName };
