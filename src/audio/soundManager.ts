/**
 * Procedural Web Audio Sound Manager for Perdas Aceitáveis
 * Generates all gunfire, artillery blasts, trench whistles, ricochets, and ambient war audio in code.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientNoiseNode: AudioNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Play single rifle gunshot (Lee-Enfield or Gewehr 98)
   */
  public playRifleShot(isSuppressed: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const duration = isSuppressed ? 0.15 : 0.28;

    // White noise impulse for gunshot crack
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filter to shape crack into metallic barrel crack
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isSuppressed ? 1200 : 2200, t);
    filter.Q.setValueAtTime(3.0, t);

    // Body thud oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + duration);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    whiteNoise.start(t);
    osc.start(t);
    whiteNoise.stop(t + duration);
    osc.stop(t + duration);
  }

  /**
   * Play heavy machine gun burst (Lewis Gun / Maxim 08)
   */
  public playMachineGunBurst() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Rapid 3-round burst
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playRifleShot(true);
      }, i * 65);
    }
  }

  /**
   * Play incoming artillery whistle and devastating shell crater blast
   */
  public playArtilleryStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. Incoming screeching whistle (pitch dropping rapidly)
    const whistleOsc = this.ctx.createOscillator();
    whistleOsc.type = 'sine';
    whistleOsc.frequency.setValueAtTime(2800, t);
    whistleOsc.frequency.exponentialRampToValueAtTime(450, t + 1.2);

    const whistleGain = this.ctx.createGain();
    whistleGain.gain.setValueAtTime(0.01, t);
    whistleGain.gain.exponentialRampToValueAtTime(0.3, t + 1.0);
    whistleGain.gain.linearRampToValueAtTime(0.001, t + 1.25);

    whistleOsc.connect(whistleGain);
    whistleGain.connect(this.masterGain);

    whistleOsc.start(t);
    whistleOsc.stop(t + 1.25);

    // 2. Heavy explosion on impact
    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const blastTime = this.ctx.currentTime;
      const duration = 1.4;

      // Heavy low-pass noise rumble
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(380, blastTime);
      lowFilter.frequency.exponentialRampToValueAtTime(60, blastTime + duration);

      // Deep sub-bass drop oscillator
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, blastTime);
      subOsc.frequency.exponentialRampToValueAtTime(22, blastTime + 0.8);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.9, blastTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, blastTime + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.85, blastTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, blastTime + duration);

      noise.connect(lowFilter);
      lowFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      noise.start(blastTime);
      subOsc.start(blastTime);
      noise.stop(blastTime + duration);
      subOsc.stop(blastTime + duration);
    }, 1100);
  }

  /**
   * Trench whistle blown by squad corporal to rally soldiers
   */
  public playTrenchWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'square';

    // Characteristic brass two-tone whistle
    osc1.frequency.setValueAtTime(2200, t);
    osc2.frequency.setValueAtTime(2620, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
    gain.gain.setValueAtTime(0.2, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(6.0, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.55);
    osc2.stop(t + 0.55);
  }

  /**
   * Soldier impact / hit flesh or helmet ping
   */
  public playHitSound(isHelmet: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHelmet) {
      // Metallic ricochet ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else {
      // Flesh thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Field medic heal bandage sound
   */
  public playMedicHeal() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Pleasant uplifting harmonic chime
    [440, 554, 659].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.12, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.4);
    });
  }

  /**
   * UI Click confirmation sound
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const soundManager = new SoundManager();
