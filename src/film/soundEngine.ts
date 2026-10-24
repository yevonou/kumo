import { CUE_SHEET, FILM_DURATION, clamp, smoothstep, seededRandom } from './choreography';

export const AUDIO_SAMPLE_RATE = 48000;
export const AUDIO_TOTAL_SAMPLES = AUDIO_SAMPLE_RATE * FILM_DURATION; // 480,000 samples

export interface StereoBuffer {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
}

/**
 * Minnaert physical acoustic bubble / gummy pop synthesizer:
 * Real bubbles & soft silicone cavities rise in pitch as their radius contracts.
 */
function addBubblePop(
  left: Float32Array,
  right: Float32Array,
  startTime: number,
  baseFreq: number,
  duration: number,
  amp: number,
  pan: number
) {
  const startIdx = Math.max(0, Math.floor(startTime * AUDIO_SAMPLE_RATE));
  const len = Math.floor(duration * AUDIO_SAMPLE_RATE);
  const endIdx = Math.min(AUDIO_TOTAL_SAMPLES, startIdx + len);

  const gainL = Math.cos(((pan + 1) * 0.25) * Math.PI);
  const gainR = Math.sin(((pan + 1) * 0.25) * Math.PI);

  let phase = 0;
  for (let i = startIdx; i < endIdx; i++) {
    const dt = (i - startIdx) / AUDIO_SAMPLE_RATE;
    const u = dt / duration;
    // Characteristic upward frequency chirp of a bubble/silicone pop
    const instFreq = baseFreq * (1.0 + 1.65 * Math.pow(u, 1.8));
    phase += (2 * Math.PI * instFreq) / AUDIO_SAMPLE_RATE;

    const env = Math.sin(u * Math.PI) * Math.exp(-u * 2.4);
    const sig = (Math.sin(phase) + 0.25 * Math.sin(phase * 2.0)) * env * amp;

    left[i] += sig * gainL;
    right[i] += sig * gainR;
  }
}

/**
 * Synthesizes an ASMR Soft-Body Plush Thud + Elastic Jelly Squish locked to a drop/impact cue.
 */
function addPlushImpactAndSquish(
  left: Float32Array,
  right: Float32Array,
  impactTime: number,
  rootHz: number,
  amp: number,
  pan: number,
  isHeroClimax = false
) {
  const dur = isHeroClimax ? 1.15 : 0.62;
  const startIdx = Math.max(0, Math.floor(impactTime * AUDIO_SAMPLE_RATE));
  const endIdx = Math.min(AUDIO_TOTAL_SAMPLES, startIdx + Math.floor(dur * AUDIO_SAMPLE_RATE));

  const gainL = Math.cos(((pan + 1) * 0.25) * Math.PI);
  const gainR = Math.sin(((pan + 1) * 0.25) * Math.PI);

  let subPhase = 0;
  let bodyPhase = 0;
  let squishPhase = 0;

  for (let i = startIdx; i < endIdx; i++) {
    const dt = (i - startIdx) / AUDIO_SAMPLE_RATE;

    // 1. Plush rounded sub-bass thud (exponential pitch drop 180Hz -> 46Hz with soft attack)
    const attack = smoothstep(0.0, 0.004, dt);
    const subFreq = 46.0 + (isHeroClimax ? 145.0 : 115.0) * Math.exp(-dt * 28.0);
    subPhase += (2 * Math.PI * subFreq) / AUDIO_SAMPLE_RATE;
    const subEnv = attack * Math.exp(-dt * (isHeroClimax ? 5.2 : 8.5));
    const subSig = Math.tanh(Math.sin(subPhase) * 1.35) * subEnv * 0.62;

    // 2. Woody/marimba-like pastel ceramic mallet body
    const bodyFreq = rootHz * (1.0 + 0.15 * Math.exp(-dt * 40.0));
    bodyPhase += (2 * Math.PI * bodyFreq) / AUDIO_SAMPLE_RATE;
    const bodyEnv = attack * Math.exp(-dt * 11.0);
    const bodySig = (Math.sin(bodyPhase) + 0.35 * Math.sin(bodyPhase * 2.98)) * bodyEnv * 0.34;

    // 3. Damped spring jelly squish formant (oscillates at 21.5 rad/s matching choreography.ts!)
    const springMod = Math.exp(-dt * 4.5) * Math.sin(dt * 21.5);
    const squishFreq = 380.0 + springMod * 240.0 + Math.sin(dt * 55.0) * 65.0;
    squishPhase += (2 * Math.PI * squishFreq) / AUDIO_SAMPLE_RATE;
    const squishEnv = smoothstep(0.005, 0.03, dt) * Math.exp(-dt * 6.8);
    const squishSig = Math.sin(squishPhase + Math.sin(squishPhase * 0.5) * 0.8) * squishEnv * 0.22;

    const total = (subSig + bodySig + squishSig) * amp;
    left[i] += total * gainL;
    right[i] += total * gainR;
  }

  // Add a cluster of micro-bubble pops around the impact & rebound
  const bubbleCount = isHeroClimax ? 28 : 8;
  for (let b = 0; b < bubbleCount; b++) {
    const r1 = seededRandom(Math.floor(impactTime * 1000) + b * 19);
    const r2 = seededRandom(Math.floor(impactTime * 1000) + b * 43 + 7);
    const offset = isHeroClimax
      ? 0.015 + Math.pow(b / bubbleCount, 1.15) * 0.88
      : 0.012 + b * 0.032 + r1 * 0.015;
    const popFreq = 420 + r2 * 980 + (isHeroClimax ? b * 22 : 0);
    const popPan = clamp(pan + (r1 - 0.5) * (isHeroClimax ? 1.5 : 0.6), -0.9, 0.9);
    addBubblePop(left, right, impactTime + offset, popFreq, 0.024 + r1 * 0.018, amp * 0.22, popPan);
  }
}

/**
 * Synthesizes a crystalline frosted-glass / celesta chime note
 */
function addGlassChime(
  left: Float32Array,
  right: Float32Array,
  startTime: number,
  freq: number,
  duration: number,
  amp: number,
  pan: number
) {
  const startIdx = Math.max(0, Math.floor(startTime * AUDIO_SAMPLE_RATE));
  const endIdx = Math.min(AUDIO_TOTAL_SAMPLES, startIdx + Math.floor(duration * AUDIO_SAMPLE_RATE));

  const gainL = Math.cos(((pan + 1) * 0.25) * Math.PI);
  const gainR = Math.sin(((pan + 1) * 0.25) * Math.PI);

  for (let i = startIdx; i < endIdx; i++) {
    const dt = (i - startIdx) / AUDIO_SAMPLE_RATE;
    const attack = smoothstep(0, 0.006, dt);
    const env1 = attack * Math.exp(-dt * 3.2);
    const env2 = attack * Math.exp(-dt * 7.5);
    const env3 = attack * Math.exp(-dt * 14.0);

    const w = 2 * Math.PI * freq * dt;
    const sig =
      (Math.sin(w) * env1 * 0.65 +
        Math.sin(w * 2.0) * env2 * 0.22 +
        Math.sin(w * 3.98) * env3 * 0.13) *
      amp;

    left[i] += sig * gainL;
    right[i] += sig * gainR;
  }
}

/**
 * Generates the complete 10.000s stereo soundtrack (48kHz) locked deterministically to CUE_SHEET.
 */
export function generateFilmAudioSamples(): StereoBuffer {
  const left = new Float32Array(AUDIO_TOTAL_SAMPLES);
  const right = new Float32Array(AUDIO_TOTAL_SAMPLES);

  // ============================================================================
  // LAYER 1: Airy Cinematic Pastel Pad & Harmonic Progression (0.00s - 10.00s)
  // ============================================================================
  // Chord voicings:
  // 0.0 - 2.0s: Fmaj9 (F2, C3, E3, G3, A3, D4)
  // 2.0 - 5.45s: Bbmaj9#11 (Bb2, F3, A3, C4, D4, E4)
  // 5.45 - 6.25s: Rising Zero-G Tension (C3, G3, Bb3, D4, F4)
  // 6.25 - 10.0s: Lush Hero Resolution Fmaj9 -> Cmaj9#11 warm glow (F2, C3, F3, A3, C4, E4, G4)
  const chord1 = [87.31, 130.81, 164.81, 196.0, 220.0, 293.66];
  const chord2 = [116.54, 174.61, 220.0, 261.63, 293.66, 329.63];
  const chord3 = [130.81, 196.0, 233.08, 293.66, 349.23, 440.0];
  const chord4 = [87.31, 130.81, 174.61, 220.0, 261.63, 329.63, 392.0];

  for (let i = 0; i < AUDIO_TOTAL_SAMPLES; i++) {
    const t = i / AUDIO_SAMPLE_RATE;

    // Master pad envelope (immediate hook at t=0.02s, inhale dip right before 6.25s, warm tail to 10.0s)
    const fadeIn = smoothstep(0.0, 0.12, t);
    const fadeOut = 1.0 - smoothstep(9.55, 9.99, t);
    const preImpactDuck = 1.0 - 0.55 * smoothstep(5.85, 6.22, t) * (1.0 - smoothstep(6.24, 6.32, t));
    const padEnv = fadeIn * fadeOut * preImpactDuck * 0.18;

    const w1 = 1.0 - smoothstep(1.7, 2.3, t);
    const w2 = smoothstep(1.7, 2.3, t) * (1.0 - smoothstep(5.2, 5.6, t));
    const w3 = smoothstep(5.2, 5.6, t) * (1.0 - smoothstep(6.22, 6.28, t));
    const w4 = smoothstep(6.23, 6.45, t);

    let sigL = 0;
    let sigR = 0;

    if (w1 > 0.001) {
      for (let v = 0; v < chord1.length; v++) {
        const f = chord1[v];
        const detune = Math.sin(t * 1.4 + v) * 0.35;
        sigL += Math.sin(2 * Math.PI * (f + detune * 0.1) * t + v) * w1;
        sigR += Math.sin(2 * Math.PI * (f - detune * 0.1) * t + v + 0.4) * w1;
      }
    }
    if (w2 > 0.001) {
      for (let v = 0; v < chord2.length; v++) {
        const f = chord2[v];
        sigL += Math.sin(2 * Math.PI * f * 1.001 * t + v * 0.7) * w2;
        sigR += Math.sin(2 * Math.PI * f * 0.999 * t + v * 0.7 + 0.5) * w2;
      }
    }
    if (w3 > 0.001) {
      // Zero-G rising pitch glide during anticipation (5.45s -> 6.25s)
      const inhaleRise = 1.0 + smoothstep(5.45, 6.24, t) * 0.08;
      for (let v = 0; v < chord3.length; v++) {
        const f = chord3[v] * inhaleRise;
        sigL += Math.sin(2 * Math.PI * f * t + v) * w3;
        sigR += Math.sin(2 * Math.PI * f * t + v + 0.6) * w3;
      }
    }
    if (w4 > 0.001) {
      for (let v = 0; v < chord4.length; v++) {
        const f = chord4[v];
        const shimmer = 1.0 + 0.25 * Math.sin(t * 3.2 + v);
        sigL += Math.sin(2 * Math.PI * f * 1.0012 * t + v) * shimmer * w4;
        sigR += Math.sin(2 * Math.PI * f * 0.9988 * t + v + 0.45) * shimmer * w4;
      }
    }

    left[i] += (sigL / 5.5) * padEnv;
    right[i] += (sigR / 5.5) * padEnv;
  }

  // ============================================================================
  // LAYER 2: Cue-Locked Foley, Soft-Body Impacts, Domino Cascades & Bubble Pops
  // ============================================================================
  for (const cue of CUE_SHEET) {
    if (cue.type === 'wave') {
      // Opening tactile wave sweep + bubbly shimmer arpeggio
      const notes = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25];
      for (let n = 0; n < notes.length; n++) {
        const tPop = cue.time + n * 0.055;
        const pan = -0.6 + (n / (notes.length - 1)) * 1.2;
        addBubblePop(left, right, tPop, notes[n] * 1.5, 0.038, 0.28, pan);
        addGlassChime(left, right, tPop, notes[n], 0.42, 0.16, pan);
      }
    } else if (cue.type === 'flip') {
      // Domino Cloner Cascade: 14 rapid pitched silicone-ceramic clicks & pops across stereo field
      const steps = 14;
      for (let s = 0; s < steps; s++) {
        const dt = s * 0.032;
        const freq = cue.pitchHz * Math.pow(1.045, s);
        const pan = cue.pan + ((s / steps) - 0.5) * 1.1;
        addBubblePop(left, right, cue.time + dt, freq * 1.4, 0.026, 0.26 * cue.intensity, clamp(pan, -0.9, 0.9));
        if (s % 3 === 0) {
          addGlassChime(left, right, cue.time + dt, freq, 0.25, 0.12, clamp(pan, -0.9, 0.9));
        }
      }
    } else if (cue.type === 'anticipation') {
      // Soft pneumatic inhale whoosh + deep elastic stretch
      const dur = 0.55;
      const startIdx = Math.floor(cue.time * AUDIO_SAMPLE_RATE);
      const endIdx = Math.min(AUDIO_TOTAL_SAMPLES, startIdx + Math.floor(dur * AUDIO_SAMPLE_RATE));
      let phase = 0;
      for (let i = startIdx; i < endIdx; i++) {
        const dt = (i - startIdx) / AUDIO_SAMPLE_RATE;
        const u = dt / dur;
        const env = Math.sin(u * Math.PI) * 0.28 * cue.intensity;
        const sweepFreq = cue.pitchHz * (0.85 + 0.95 * u * u);
        phase += (2 * Math.PI * sweepFreq) / AUDIO_SAMPLE_RATE;
        const sig = (Math.sin(phase) + 0.3 * Math.sin(phase * 1.5)) * env;
        left[i] += sig * 0.72;
        right[i] += sig * 0.72;
      }
    } else if (cue.type === 'drop') {
      // Hero Letter Drop: Plush Soft-Body Thud + Damped Spring Jelly Squish + Harmonic Chime
      addPlushImpactAndSquish(left, right, cue.time, cue.pitchHz, 0.78 * cue.intensity, cue.pan, false);
      addGlassChime(left, right, cue.time + 0.01, cue.pitchHz * 2.0, 0.65, 0.22, cue.pan);
      // Secondary rebound squish 0.22s later
      addBubblePop(left, right, cue.time + 0.21, cue.pitchHz * 3.2, 0.042, 0.24, cue.pan);
    } else if (cue.type === 'orbit') {
      // Sparkling Frosted Glass Helix Arpeggio
      const arp = [523.25, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
      for (let k = 0; k < arp.length; k++) {
        const tNote = cue.time + k * 0.14;
        const pan = Math.sin(k * 1.1) * 0.65;
        addGlassChime(left, right, tNote, arp[k], 0.55, 0.18, pan);
        addBubblePop(left, right, tNote + 0.02, arp[k] * 0.8, 0.032, 0.18, -pan);
      }
    } else if (cue.type === 'hero_impact') {
      // UNMISTAKABLE HERO MOMENT @ 6.25s (Frame 150):
      // Massive plush soft-body impact + 360° bubbly shockwave + radiant chord bloom
      addPlushImpactAndSquish(left, right, cue.time, cue.pitchHz, 0.96, 0.0, true);
      const bloomNotes = [261.63, 349.23, 440.0, 523.25, 659.25, 783.99, 1046.5];
      for (let n = 0; n < bloomNotes.length; n++) {
        const pan = ((n / (bloomNotes.length - 1)) - 0.5) * 1.3;
        addGlassChime(left, right, cue.time + n * 0.018, bloomNotes[n], 1.35, 0.20, pan);
      }
    } else if (cue.type === 'shimmer' || cue.type === 'resolve') {
      const chord = [440.0, 523.25, 659.25, 880.0];
      for (let n = 0; n < chord.length; n++) {
        const tNote = cue.time + n * 0.065;
        const pan = ((n / 3) - 0.5) * 0.8;
        addGlassChime(left, right, tNote, chord[n], 1.1, 0.17 * cue.intensity, pan);
        addBubblePop(left, right, tNote + 0.015, chord[n] * 1.2, 0.035, 0.16 * cue.intensity, -pan);
      }
    }
  }

  // ============================================================================
  // LAYER 3: Master Soft-Knee Limiter & Loudness Normalization (-14 LUFS Target)
  // ============================================================================
  // Compute RMS power first
  let sumSq = 0;
  for (let i = 0; i < AUDIO_TOTAL_SAMPLES; i++) {
    sumSq += left[i] * left[i] + right[i] * right[i];
  }
  const rms = Math.sqrt(sumSq / (AUDIO_TOTAL_SAMPLES * 2));
  // Target RMS ~ 0.195 (~ -14.0 LUFS integrated) with soft-knee tanh ceiling at -1.1 dBTP (0.881)
  const targetRms = 0.205;
  const gain = rms > 1e-6 ? targetRms / rms : 1.0;
  const ceiling = 0.865; // -1.25 dBTP safe true-peak ceiling

  for (let i = 0; i < AUDIO_TOTAL_SAMPLES; i++) {
    left[i] = ceiling * Math.tanh((left[i] * gain) / ceiling);
    right[i] = ceiling * Math.tanh((right[i] * gain) / ceiling);
  }

  return {
    left,
    right,
    sampleRate: AUDIO_SAMPLE_RATE,
  };
}
