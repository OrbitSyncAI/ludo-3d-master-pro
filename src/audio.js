/**
 * Ludo 3D Pro - Web Audio API Sound Synthesizer + Mobile Haptics
 * High-fidelity, zero-latency procedural game audio & vibration
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.vibrationEnabled = true;
    this.volume = 0.7;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(isMuted) {
    this.muted = isMuted;
  }

  vibrate(pattern) {
    if (this.vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Modern UI Button Click
  playButtonClick() {
    this.vibrate(15);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Realistic 3D Dice Clattering
  playDiceRoll() {
    this.vibrate([20, 30, 20, 40]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const count = 5;
    for (let i = 0; i < count; i++) {
      const delay = i * 0.045 + Math.random() * 0.02;
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const baseFreq = 180 + Math.random() * 120;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      }, delay * 1000);
    }
  }

  // Dice Result Landing Clack
  playDiceResult() {
    this.vibrate(35);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Pawn Token Hop Step
  playTokenStep(pitchMultiplier = 1.0) {
    this.vibrate(12);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = 440 * pitchMultiplier;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Token Unlocked from Yard (Magic Chime)
  playTokenSpawn() {
    this.vibrate([30, 40, 50]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  // Token Capture / Knockout Explosion
  playTokenCapture() {
    this.vibrate([60, 50, 100]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Whoosh / punch impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Second bounce tone
    setTimeout(() => {
      if (!this.ctx || this.muted) return;
      const now2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(150, now2);
      osc2.frequency.exponentialRampToValueAtTime(30, now2 + 0.2);
      gain2.gain.setValueAtTime(0.3 * this.volume, now2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.2);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now2);
      osc2.stop(now2 + 0.2);
    }, 80);
  }

  // Safe Star Zone Celestial Ring
  playSafeZone() {
    this.vibrate([20, 40]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [659.25, 987.77, 1318.51]; // E5, B5, E6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // Victory Celebration Fanfare
  playVictory() {
    this.vibrate([100, 50, 100, 50, 200]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.40 }, // C6
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.5, d: 0.60 }  // C6
    ];

    let timeOffset = 0;
    melody.forEach((note) => {
      const startT = this.ctx.currentTime + timeOffset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, startT);

      gain.gain.setValueAtTime(0.35 * this.volume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + note.d);

      timeOffset += note.d + 0.04;
    });
  }

  // Defeat / Loss Jingle (Minor downward cadence)
  playDefeat() {
    this.vibrate([100, 80, 200]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      { f: 392.00, d: 0.20 }, // G4
      { f: 349.23, d: 0.20 }, // F4
      { f: 311.13, d: 0.24 }, // Eb4
      { f: 261.63, d: 0.55 }  // C4
    ];

    let timeOffset = 0;
    melody.forEach((note) => {
      const startT = this.ctx.currentTime + timeOffset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, startT);

      gain.gain.setValueAtTime(0.25 * this.volume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + note.d);

      timeOffset += note.d + 0.05;
    });
  }

  // Ethereal Royal Game Opening Chime
  playSplashIntro() {
    this.vibrate([30, 50, 40]);
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { f: 523.25, d: 0.6, t: 0.00 }, // C5
      { f: 659.25, d: 0.6, t: 0.08 }, // E5
      { f: 783.99, d: 0.7, t: 0.16 }, // G5
      { f: 1046.50, d: 0.9, t: 0.24 } // C6
    ];

    chords.forEach(note => {
      const startT = this.ctx.currentTime + note.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, startT);

      gain.gain.setValueAtTime(0.18 * this.volume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + note.d);
    });
  }
}

export const sounds = new SoundEngine();
