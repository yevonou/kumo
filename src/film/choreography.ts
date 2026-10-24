/**
 * Deterministic Choreography, Cue Sheet, Easing & Soft-Body Physics Engine
 * Style: C4D / Octane "Soft & Satisfying" MoGraph Product Ident
 * Spec: 1920x1080 @ 24.000 fps, 10.000s (240 frames)
 * Every state is a pure, closed-form mathematical function of time t in [0, 10.0].
 */

export const FILM_FPS = 24;
export const FILM_DURATION = 10.0;
export const FILM_TOTAL_FRAMES = 240;

export interface CueEvent {
  id: string;
  time: number;
  frame: number;
  type: 'wave' | 'flip' | 'anticipation' | 'drop' | 'orbit' | 'hero_impact' | 'shimmer' | 'resolve';
  label: string;
  zhLabel: string;
  intensity: number;
  pitchHz: number;
  pan: number; // -1 left to +1 right
}

/**
 * Single source of truth Cue Sheet read by BOTH the 3D renderer and the audio synthesizer.
 */
export const CUE_SHEET: CueEvent[] = [
  {
    id: 'hook_wave',
    time: 0.04,
    frame: 1,
    type: 'wave',
    label: 'Opening MoGraph Sine Wave Sweep',
    zhLabel: '开场克隆阵列正弦波涌',
    intensity: 0.8,
    pitchHz: 220,
    pan: -0.35,
  },
  {
    id: 'domino_flip_1',
    time: 0.42,
    frame: 10,
    type: 'flip',
    label: 'Cloner Row Cascade Flip A',
    zhLabel: '糖果胶囊多米诺翻转 A',
    intensity: 0.75,
    pitchHz: 330,
    pan: -0.2,
  },
  {
    id: 'domino_flip_2',
    time: 1.00,
    frame: 24,
    type: 'flip',
    label: 'Cloner Row Cascade Flip B',
    zhLabel: '柔光陶瓷阵列翻转 B',
    intensity: 0.85,
    pitchHz: 392,
    pan: 0.25,
  },
  {
    id: 'stage_parting',
    time: 1.58,
    frame: 38,
    type: 'anticipation',
    label: 'Radial Effector Stage Parting & Camera Whip',
    zhLabel: '环形效果器蓄力开合',
    intensity: 0.9,
    pitchHz: 196,
    pan: 0.0,
  },
  {
    id: 'drop_S',
    time: 2.0833,
    frame: 50,
    type: 'drop',
    label: 'Hero Glyph "S" Soft-Body Drop & Squash',
    zhLabel: '主视觉字母 S 软胶坠落碰撞',
    intensity: 0.92,
    pitchHz: 146.83, // D3
    pan: -0.45,
  },
  {
    id: 'drop_O',
    time: 2.50,
    frame: 60,
    type: 'drop',
    label: 'Hero Glyph "O" Soft-Body Drop & Squash',
    zhLabel: '主视觉字母 O 弹性挤压回弹',
    intensity: 0.94,
    pitchHz: 174.61, // F3
    pan: -0.15,
  },
  {
    id: 'drop_F',
    time: 2.9167,
    frame: 70,
    type: 'drop',
    label: 'Hero Glyph "F" Soft-Body Drop & Squash',
    zhLabel: '主视觉字母 F 软体波纹扩散',
    intensity: 0.95,
    pitchHz: 220.0, // A3
    pan: 0.15,
  },
  {
    id: 'drop_T',
    time: 3.3333,
    frame: 80,
    type: 'drop',
    label: 'Hero Glyph "T" Soft-Body Drop & Squash',
    zhLabel: '主视觉字母 T 凝脂回弹定格',
    intensity: 0.96,
    pitchHz: 261.63, // C4
    pan: 0.45,
  },
  {
    id: 'orbital_swirl',
    time: 4.1667,
    frame: 100,
    type: 'orbit',
    label: 'Frosted Glass & Chrome Satellite Helix',
    zhLabel: '磨砂玻璃与香槟金卫星环绕',
    intensity: 0.82,
    pitchHz: 523.25,
    pan: 0.1,
  },
  {
    id: 'compression_lift',
    time: 5.50,
    frame: 132,
    type: 'anticipation',
    label: 'Zero-G Anti-Gravity Compression & Inhale',
    zhLabel: '失重悬浮聚拢蓄力',
    intensity: 0.95,
    pitchHz: 130.81,
    pan: 0.0,
  },
  {
    id: 'hero_climax_impact',
    time: 6.25,
    frame: 150,
    type: 'hero_impact',
    label: 'HERO MOMENT: Plush Jelly Core Impact & 360° Cloner Shockwave',
    zhLabel: '高潮时刻：凝脂果冻核轰击与全域波浪爆发',
    intensity: 1.0,
    pitchHz: 98.0, // G2 deep plush thud + bubbly chord
    pan: 0.0,
  },
  {
    id: 'harmonic_rebound',
    time: 7.0833,
    frame: 170,
    type: 'shimmer',
    label: 'Secondary Harmonic Crown Ripple & Bubble Pop',
    zhLabel: '次级谐波回荡与微泡绽放',
    intensity: 0.85,
    pitchHz: 659.25,
    pan: -0.1,
  },
  {
    id: 'long_tail_settle',
    time: 7.8333,
    frame: 188,
    type: 'resolve',
    label: 'Long-Tail Camera Settle into Hero Lockup',
    zhLabel: '长尾缓动定格主视觉构图',
    intensity: 0.88,
    pitchHz: 293.66,
    pan: 0.0,
  },
  {
    id: 'living_hold_chime',
    time: 8.75,
    frame: 210,
    type: 'shimmer',
    label: 'Hero End Frame Micro-Breathing & Crystalline Resonance',
    zhLabel: '尾帧微呼吸与通透余韵',
    intensity: 0.72,
    pitchHz: 880.0,
    pan: 0.0,
  },
];

export interface KeyframePreset {
  id: string;
  frame: number;
  time: number;
  title: string;
  zhTitle: string;
  caption: string;
}

export const KEYFRAME_PRESETS: KeyframePreset[] = [
  {
    id: 'kf1',
    frame: 4,
    time: 4 / 24,
    title: '01 · Hook Wave (0.17s)',
    zhTitle: '01 · 触感波涌（开场浅景深）',
    caption: 'f/1.8 macro sweep across the 165-pill pastel MoGraph cloner field',
  },
  {
    id: 'kf2',
    frame: 26,
    time: 26 / 24,
    title: '02 · Domino Cascade (1.08s)',
    zhTitle: '02 · 克隆翻转（多米诺级联）',
    caption: 'Plain & Random Effector domino rotation across gummy & ceramic rows',
  },
  {
    id: 'kf3',
    frame: 42,
    time: 42 / 24,
    title: '03 · Stage Parting (1.75s)',
    zhTitle: '03 · 蓄力开合（环形引力场）',
    caption: 'Central cloner field parts radially as camera whips to hero stage',
  },
  {
    id: 'kf4',
    frame: 62,
    time: 62 / 24,
    title: '04 · Squash & Stretch Drop (2.58s)',
    zhTitle: '04 · 弹性坠落（体积守恒形变）',
    caption: 'Inflated 3D letters S·O drop with volume-preserving squash & stretch',
  },
  {
    id: 'kf5',
    frame: 84,
    time: 84 / 24,
    title: '05 · Full Wordmark Jiggle (3.50s)',
    zhTitle: '05 · 四字齐聚（阻尼弹簧振荡）',
    caption: 'All four S·O·F·T sculptures settle in damped harmonic oscillation',
  },
  {
    id: 'kf6',
    frame: 136,
    time: 136 / 24,
    title: '06 · Zero-G Anticipation (5.67s)',
    zhTitle: '06 · 悬浮聚拢（反重力蓄势）',
    caption: 'Hero assembly levitates & compresses inward with frosted glass rings',
  },
  {
    id: 'kf7',
    frame: 152,
    time: 152 / 24,
    title: '07 · Hero Shockwave Climax (6.33s)',
    zhTitle: '07 · 高潮爆发（全域软体冲击波）',
    caption: 'Jelly Core impacts at 62.5% runtime, launching a 360° cloner wave crest',
  },
  {
    id: 'kf8',
    frame: 216,
    time: 216 / 24,
    title: '08 · Composed End Frame (9.00s)',
    zhTitle: '08 · 经典定格（云沫造物品牌尾帧）',
    caption: 'Long-tail camera ease resolves to the breathing hero brand lockup',
  },
];

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic seeded hash in [0, 1] for MoGraph Random Effector
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Signature C4D Long-Tail Ease:
 * Completes 80% of the displacement in the first 20% of normalized time u in [0, 1],
 * with an ultra-slow, silky-smooth asymptotic settle over the remaining 80%.
 */
export function c4dLongTailEase(u: number): number {
  const x = clamp(u, 0, 1);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // ln(0.2) / ln(0.8) = 7.212567439 => 1 - (1 - 0.2)^7.212567 = 0.80000
  const p = 7.212567439;
  const raw = 1 - Math.pow(1 - x, p);
  // Subtle micro-ramp over first 2% so derivative at 0 is smooth yet hits 0.80 at x=0.20
  const onset = smoothstep(0, 0.025, x);
  return raw * onset;
}

/**
 * Damped harmonic spring oscillation for soft-body squash-and-stretch
 * Returns displacement factor around 0 after impact at dt >= 0.
 */
export function dampedSpring(dt: number, angularFreq = 22.0, dampingRatio = 0.24): number {
  if (dt < 0) return 0;
  const wd = angularFreq * Math.sqrt(Math.max(0.01, 1 - dampingRatio * dampingRatio));
  return Math.exp(-dampingRatio * angularFreq * dt) * Math.sin(wd * dt);
}

/**
 * Volume-preserving 3D scale for soft-body squash & stretch:
 * sx * sy * sz === 1.0000 at all times.
 */
export function volumePreservingScale(sy: number): { sx: number; sy: number; sz: number } {
  const clampedSy = clamp(sy, 0.48, 1.65);
  const invSqrt = 1.0 / Math.sqrt(clampedSy);
  return {
    sx: invSqrt,
    sy: clampedSy,
    sz: invSqrt,
  };
}

export interface ClonerElementState {
  index: number;
  col: number;
  row: number;
  baseX: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  sx: number;
  sy: number;
  sz: number;
  materialType: 0 | 1 | 2 | 3; // 0: SSS Gummy Pink/Peach, 1: Glossy Cream/Lilac Plastic, 2: Frosted Glass, 3: Champagne Chrome
  colorVariant: number; // [0, 1]
  glowBoost: number;
}

export const CLONER_COLS = 15;
export const CLONER_ROWS = 11;
export const CLONER_COUNT = CLONER_COLS * CLONER_ROWS; // 165 elements
export const CLONER_SPACING_X = 0.86;
export const CLONER_SPACING_Z = 0.82;

export const HERO_LETTER_X = [-2.25, -0.75, 0.75, 2.25] as const;
export const HERO_DROP_TIMES = [2.0833, 2.50, 2.9167, 3.3333] as const;
export const HERO_CHARS = ['S', 'O', 'F', 'T'] as const;

/**
 * Evaluates a single MoGraph Cloner element at time t (seconds)
 */
export function evaluateClonerElement(col: number, row: number, t: number): ClonerElementState {
  const index = row * CLONER_COLS + col;
  const staggerX = (row % 2 === 0 ? -0.21 : 0.21);
  const baseX = (col - (CLONER_COLS - 1) * 0.5) * CLONER_SPACING_X + staggerX;
  const baseZ = (row - (CLONER_ROWS - 1) * 0.5) * CLONER_SPACING_Z;
  const distFromCenter = Math.hypot(baseX, baseZ);
  const angleFromCenter = Math.atan2(baseZ, baseX);

  const rnd1 = seededRandom(index * 17 + 3);
  const rnd2 = seededRandom(index * 31 + 11);

  // Assign material trio distribution across the cloner matrix
  let materialType: 0 | 1 | 2 | 3 = 0;
  if ((col + row) % 3 === 0) {
    materialType = 0; // SSS Gummy (Peach / Coral Rose)
  } else if ((col + row) % 3 === 1) {
    materialType = 1; // Glossy Ceramic Plastic (Cream / Soft Lilac)
  } else if (rnd1 > 0.32) {
    materialType = 2; // Frosted Dichroic Pastel Glass
  } else {
    materialType = 3; // Satin Champagne Chrome
  }

  // 1. Continuous MoGraph Sine + Plain Effector Wave (active from t=0.00s so frame 0 is lush & alive)
  const wavePhase = baseX * 0.68 - baseZ * 0.52 - t * 3.4 + (rnd1 - 0.5) * 0.35;
  const openingWaveAmp = mix(0.46, 0.22, smoothstep(1.5, 2.5, t));
  let y = Math.sin(wavePhase) * openingWaveAmp + Math.cos(distFromCenter * 1.15 - t * 2.6) * 0.14;

  let rotX = Math.cos(wavePhase) * 0.28;
  let rotY = (rnd2 - 0.5) * 0.25 + Math.sin(t * 0.9 + index * 0.1) * 0.15;
  let rotZ = -Math.sin(wavePhase) * 0.24;

  // 2. Domino Flip Cascades at t = 0.42s and t = 1.00s
  const flipWave1 = clamp((t - 0.35 - (col * 0.038 + row * 0.02)) / 0.55, 0, 1);
  const flipWave2 = clamp((t - 0.92 - ((CLONER_COLS - 1 - col) * 0.035 + row * 0.022)) / 0.55, 0, 1);
  const flipAngle1 = c4dLongTailEase(flipWave1) * Math.PI;
  const flipAngle2 = c4dLongTailEase(flipWave2) * Math.PI;
  rotX += flipAngle1 + flipAngle2;
  y += Math.sin(flipWave1 * Math.PI) * 0.34 + Math.sin(flipWave2 * Math.PI) * 0.38;

  // 3. Radial Stage Parting Effector (starts at t = 1.50s, holds during Act II & III)
  const partEnvelope = smoothstep(1.48, 2.05, t);
  const innerRadiusMask = 1.0 - smoothstep(0.6, 3.6, distFromCenter);
  const radialPush = partEnvelope * innerRadiusMask * 1.18;
  const dirX = distFromCenter > 0.001 ? baseX / distFromCenter : 0;
  const dirZ = distFromCenter > 0.001 ? baseZ / distFromCenter : 0;

  let x = baseX + dirX * radialPush;
  let z = baseZ + dirZ * radialPush;
  // Bowl depression in the center so hero letters sit in an amphitheater nest
  y -= partEnvelope * innerRadiusMask * 0.42;

  let sy = 1.0 + Math.sin(wavePhase * 1.5) * 0.08;
  let glowBoost = 0.15 + Math.max(0, Math.sin(wavePhase)) * 0.2;

  // 4. Individual Letter Drop Ripples (t = 2.08s, 2.50s, 2.92s, 3.33s)
  for (let i = 0; i < 4; i++) {
    const dropT = HERO_DROP_TIMES[i];
    const dt = t - dropT;
    if (dt > 0 && dt < 2.2) {
      const lx = HERO_LETTER_X[i];
      const lz = 0.0;
      const d = Math.hypot(x - lx, z - lz);
      const waveRadius = dt * 4.8;
      const ringDist = d - waveRadius;
      const ringEnv = Math.exp(-ringDist * ringDist * 1.45) * Math.exp(-dt * 1.65);
      const ripple = Math.cos(ringDist * 3.8) * ringEnv;
      y += ripple * 0.48;
      rotZ += (x - lx) * ripple * 0.25;
      rotX -= (z - lz) * ripple * 0.25;
      sy += ripple * 0.18;
      glowBoost += ringEnv * 0.45;
    }
  }

  // 5. Act II Orbital Helix Undulation (t = 3.8s .. 5.5s)
  const helixEnv = smoothstep(3.6, 4.2, t) * (1 - smoothstep(5.3, 5.8, t));
  if (helixEnv > 0.001) {
    const spiralWave = Math.sin(angleFromCenter * 3.0 + distFromCenter * 1.2 - t * 5.2);
    y += spiralWave * 0.32 * helixEnv;
    rotY += t * 0.6 * helixEnv;
  }

  // 6. Pre-Climax Zero-G Inhale Compression (t = 5.45s .. 6.25s)
  const inhaleEnv = smoothstep(5.45, 6.12, t) * (1 - smoothstep(6.20, 6.28, t));
  if (inhaleEnv > 0.001) {
    const pull = inhaleEnv * Math.exp(-distFromCenter * 0.28) * 0.55;
    x -= dirX * pull;
    z -= dirZ * pull;
    y += inhaleEnv * (0.28 * Math.sin(distFromCenter * 1.5 + t * 8.0));
    sy += inhaleEnv * 0.16;
    glowBoost += inhaleEnv * 0.35;
  }

  // 7. HERO MOMENT (t = 6.25s / Frame 150 — 62.5% runtime): 360° Plush Shockwave Eruption
  const climaxDt = t - 6.25;
  if (climaxDt > 0) {
    const shockSpeed = 5.6;
    const front = climaxDt * shockSpeed;
    const deltaR = distFromCenter - front;
    const packet = Math.exp(-deltaR * deltaR * 0.62) * Math.exp(-climaxDt * 0.92);
    const crest = Math.cos(deltaR * 2.4) * packet;

    // Secondary harmonic rebound ring
    const front2 = Math.max(0, climaxDt - 0.45) * 4.2;
    const deltaR2 = distFromCenter - front2;
    const packet2 = climaxDt > 0.45 ? Math.exp(-deltaR2 * deltaR2 * 0.85) * Math.exp(-(climaxDt - 0.45) * 1.25) : 0;

    y += crest * 1.15 + Math.cos(deltaR2 * 3.0) * packet2 * 0.52;
    x += dirX * packet * 0.42;
    z += dirZ * packet * 0.42;
    rotX += dirZ * crest * 1.25 + packet * Math.PI * 0.5;
    rotZ -= dirX * crest * 1.25;
    sy += crest * 0.32 + packet2 * 0.15;
    glowBoost += (packet * 0.95 + packet2 * 0.5);
  }

  // 8. End Frame Amphitheater Settle & Living Micro-Motion (t = 7.8s .. 10.0s)
  const settleEnv = smoothstep(7.5, 8.6, t);
  if (settleEnv > 0.001) {
    // Gentle terraced crown around the hero wordmark
    const amphitheaterLift = smoothstep(2.2, 5.8, distFromCenter) * 0.48;
    const livingBreath = Math.sin(t * 2.2 + distFromCenter * 0.85 - angleFromCenter * 2.0) * 0.09;
    y = mix(y, amphitheaterLift + livingBreath - innerRadiusMask * 0.35, settleEnv * 0.72);
    rotX = mix(rotX, Math.cos(t * 1.8 + index * 0.2) * 0.14, settleEnv * 0.75);
    rotZ = mix(rotZ, Math.sin(t * 1.8 + index * 0.2) * 0.14, settleEnv * 0.75);
    glowBoost = mix(glowBoost, 0.28 + 0.18 * Math.sin(t * 2.4 + distFromCenter), settleEnv);
  }

  const scale = volumePreservingScale(sy);
  const instanceScale = 0.88 + rnd1 * 0.24;

  return {
    index,
    col,
    row,
    baseX,
    baseZ,
    x,
    y,
    z,
    rotX,
    rotY,
    rotZ,
    sx: scale.sx * instanceScale,
    sy: scale.sy * instanceScale,
    sz: scale.sz * instanceScale,
    materialType,
    colorVariant: rnd2,
    glowBoost: clamp(glowBoost, 0, 1.5),
  };
}

export interface HeroLetterState {
  char: 'S' | 'O' | 'F' | 'T';
  index: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  sx: number;
  sy: number;
  sz: number;
  bottomFlatten: number; // [0, 1] for soft-body contact vertex flattening
  jigglePhase: number;
  sssIntensity: number;
  visible: boolean;
}

/**
 * Evaluates each of the 4 inflated 3D Hero Letters ('S', 'O', 'F', 'T') at time t
 */
export function evaluateHeroLetters(t: number): HeroLetterState[] {
  return HERO_CHARS.map((char, i) => {
    const dropTime = HERO_DROP_TIMES[i];
    const startTime = dropTime - 0.38; // begins falling 0.38s before impact
    const baseX = HERO_LETTER_X[i];
    const baseY = 0.92;
    const baseZ = 0.0;

    if (t < startTime) {
      return {
        char,
        index: i,
        x: baseX,
        y: 8.5,
        z: baseZ,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        sx: 0.001,
        sy: 0.001,
        sz: 0.001,
        bottomFlatten: 0,
        jigglePhase: 0,
        sssIntensity: 0,
        visible: false,
      };
    }

    let x = baseX;
    let y = baseY;
    let z = baseZ;
    let rotX = 0;
    let rotY = (i - 1.5) * -0.06;
    let rotZ = 0;
    let sy = 1.0;
    let bottomFlatten = 0.0;
    let sssIntensity = 0.55;

    if (t < dropTime) {
      // Falling phase: gravity acceleration + downward velocity stretch
      const fallProgress = clamp((t - startTime) / (dropTime - startTime), 0, 1);
      const quadFall = fallProgress * fallProgress;
      y = mix(6.8, baseY, quadFall);
      // Stretch vertically while falling fast
      sy = mix(0.92, 1.34, smoothstep(0.15, 0.95, fallProgress));
      rotZ = (1 - fallProgress) * (i % 2 === 0 ? 0.35 : -0.35);
      rotX = (1 - fallProgress) * 0.28;
    } else {
      // Post-impact damped spring squash & stretch
      const dt = t - dropTime;
      // Immediate deep squash on impact (dt = 0..0.09s), followed by damped spring bounce
      const spring = dampedSpring(dt, 21.5, 0.21);
      const impactDip = Math.exp(-dt * 4.2) * Math.cos(dt * 21.5);
      sy = 1.0 - 0.42 * impactDip + 0.12 * spring;

      // Center of mass vertical bounce on rebound
      const airBounce = Math.max(0, Math.sin(dt * 10.8)) * Math.exp(-dt * 3.2) * 0.58;
      y = baseY + airBounce - Math.max(0, 1.0 - sy) * 0.42;

      // Soft-body bottom contact flattening when squashed against the stage
      bottomFlatten = clamp((1.05 - sy) * 1.4, 0, 0.65) * Math.exp(-dt * 2.5);

      // Playful rotational wobble that damps out
      rotZ = dampedSpring(dt, 16.0, 0.26) * (i % 2 === 0 ? 0.22 : -0.22);
      rotX = dampedSpring(dt, 19.0, 0.25) * 0.18;
      sssIntensity = 0.6 + Math.exp(-dt * 2.5) * 0.55;
    }

    // Act II: Orbital buoyancy (t = 3.8s .. 5.45s)
    const orbitEnv = smoothstep(3.7, 4.3, t) * (1 - smoothstep(5.35, 5.65, t));
    if (orbitEnv > 0.001) {
      const wave = Math.sin(t * 3.6 - i * 0.85);
      y += wave * 0.22 * orbitEnv;
      rotY += Math.cos(t * 2.8 - i * 0.7) * 0.16 * orbitEnv;
      rotZ += Math.sin(t * 2.5 + i * 0.9) * 0.08 * orbitEnv;
    }

    // Act III Part 1: Zero-G Anti-Gravity Compression & Levitation (t = 5.45s .. 6.25s)
    const antiG = smoothstep(5.45, 6.15, t) * (1 - smoothstep(6.21, 6.26, t));
    if (antiG > 0.001) {
      // Letters draw slightly inward toward center and levitate up in anticipation
      x = mix(x, baseX * 0.78, antiG);
      y += antiG * 0.74;
      sy = mix(sy, 1.16, antiG);
      rotX += antiG * -0.22;
      rotY += antiG * (i - 1.5) * 0.22;
      sssIntensity += antiG * 0.45;
    }

    // Act III Part 2: HERO MOMENT (t >= 6.25s / Frame 150) — Shockwave Blast & Plush Rebound
    const climaxDt = t - 6.25;
    if (climaxDt >= 0) {
      // Radial stagger from center: inner letters ('O', 'F') react 0.02s before outer letters ('S', 'T')
      const radialDelay = Math.abs(i - 1.5) * 0.028;
      const localDt = Math.max(0, climaxDt - radialDelay);
      const climaxSpring = dampedSpring(localDt, 19.5, 0.19);
      const climaxCos = Math.exp(-localDt * 3.4) * Math.cos(localDt * 19.5);

      // Dramatic squash then high plush leap
      const syDelta = -0.45 * climaxCos + 0.18 * climaxSpring;
      sy += syDelta;

      // Outward radial impulse then elastic return to heroic kerning
      const outwardKick = Math.sin(Math.min(Math.PI, localDt * 4.5)) * Math.exp(-localDt * 2.1);
      x += Math.sign(i - 1.5) * outwardKick * 0.46;

      // Vertical heroic hop
      const hop = Math.max(0, Math.sin(localDt * 8.2)) * Math.exp(-localDt * 2.2) * 0.85;
      y = baseY + hop - Math.max(0, 1.0 - sy) * 0.45;

      rotZ += Math.sign(i - 1.5) * climaxSpring * 0.28;
      rotX += climaxSpring * 0.24;
      bottomFlatten = Math.max(bottomFlatten, clamp((1.02 - sy) * 1.5, 0, 0.7));
      sssIntensity = 0.72 + Math.exp(-localDt * 1.8) * 0.65;
    }

    // Act IV: Living Micro-Motion Hold (t = 8.2s .. 10.0s)
    const holdEnv = smoothstep(8.0, 8.8, t);
    if (holdEnv > 0.001) {
      const breath = Math.sin(t * 2.6 - i * 0.65);
      y += breath * 0.065 * holdEnv;
      rotY = mix(rotY, (i - 1.5) * -0.05 + Math.cos(t * 2.0 + i) * 0.04, holdEnv);
      sy = mix(sy, 1.0 + Math.sin(t * 5.2 - i * 0.65) * 0.028, holdEnv * 0.6);
      sssIntensity = mix(sssIntensity, 0.78 + 0.15 * breath, holdEnv);
    }

    const scale = volumePreservingScale(sy);

    return {
      char,
      index: i,
      x,
      y,
      z,
      rotX,
      rotY,
      rotZ,
      sx: scale.sx,
      sy: scale.sy,
      sz: scale.sz,
      bottomFlatten,
      jigglePhase: t * 14.0 + i * 1.5,
      sssIntensity,
      visible: true,
    };
  });
}

export interface JellyCoreState {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  sx: number;
  sy: number;
  sz: number;
  wobbleAmp: number;
  glowIntensity: number;
  ringExpand: number;
}

/**
 * Evaluates the central Sculptural Jelly Torus-Knot / Plush Emblem & Orbiting Glass Halo
 */
export function evaluateJellyCore(t: number): JellyCoreState {
  // Rises gently in Act I/II as a backdrop halo, compresses at t=5.5s, slams down as the Hero Crown at t=6.25s
  // Framed with generous top headroom so orbiting rings never clip the top frame edge
  let x = 0;
  let y = 1.28;
  let z = -1.25;
  let sy = 1.0;
  let wobbleAmp = 0.12;
  let glowIntensity = 0.48;
  let ringExpand = 0.92;

  if (t < 1.5) {
    const intro = c4dLongTailEase(clamp(t / 1.5, 0, 1));
    y = mix(0.35, 1.18, intro);
    sy = mix(0.68, 1.0, intro);
  } else if (t < 5.45) {
    y = 1.18 + Math.sin(t * 2.4) * 0.12;
    ringExpand = 0.92 + 0.08 * Math.sin(t * 1.8);
  } else if (t < 6.25) {
    // Zero-G anticipation lift before hero slam (stays well inside top safe margin)
    const u = smoothstep(5.45, 6.22, t);
    y = mix(1.18, 2.05, u);
    z = mix(-1.25, -0.75, u);
    sy = mix(1.0, 1.24, u);
    ringExpand = mix(0.92, 0.72, u);
    wobbleAmp = mix(0.12, 0.30, u);
    glowIntensity = mix(0.48, 0.85, u);
  } else {
    // HERO MOMENT SLAM at t = 6.25s (Frame 150)
    const dt = t - 6.25;
    const spring = dampedSpring(dt, 20.0, 0.18);
    const cosBounce = Math.exp(-dt * 3.1) * Math.cos(dt * 20.0);
    sy = 1.0 - 0.44 * cosBounce + 0.18 * spring;
    y = 1.42 + Math.max(0, Math.sin(dt * 7.5)) * Math.exp(-dt * 2.2) * 0.45 - Math.max(0, 1 - sy) * 0.32;
    z = mix(-0.75, -1.05, smoothstep(0, 1.8, dt));
    wobbleAmp = 0.08 + Math.exp(-dt * 1.8) * 0.36;
    glowIntensity = 0.62 + Math.exp(-dt * 1.5) * 0.55;
    ringExpand = 0.94 + c4dLongTailEase(clamp(dt / 2.2, 0, 1)) * 0.22 + spring * 0.14;
  }

  // Living breathing in final hold
  const hold = smoothstep(8.0, 8.8, t);
  y += Math.sin(t * 2.6 + 1.2) * 0.05 * hold;

  const scale = volumePreservingScale(sy);

  return {
    x,
    y,
    z,
    rotX: t * 0.55 + Math.sin(t * 1.7) * 0.25,
    rotY: t * 0.85,
    rotZ: Math.cos(t * 1.3) * 0.22,
    sx: scale.sx,
    sy: scale.sy,
    sz: scale.sz,
    wobbleAmp,
    glowIntensity,
    ringExpand,
  };
}

export interface CameraState {
  posX: number;
  posY: number;
  posZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
  roll: number;
  focusDistance: number;
  aperture: number; // f/1.8 shallow DOF strength
  motionBlurAmount: number; // [0, 1] instantaneous shutter velocity factor
  shotIndex: number;
}

/**
 * Evaluates the deterministic C4D Camera Rig with Long-Tail Eases, Impact Shake & Shallow DOF Focus Tracking
 */
export function evaluateCamera(t: number): CameraState {
  let posX = 0;
  let posY = 3.2;
  let posZ = 7.4;
  let targetX = 0;
  let targetY = 0.65;
  let targetZ = 0;
  let fov = 35;
  let roll = 0;
  let aperture = 1.8; // f/1.8 shallow depth of field
  let shotIndex = 1;

  if (t < 1.58) {
    // Shot 1: Low-angle macro sweep across the rippling pastel MoGraph cloner field
    shotIndex = 1;
    const u = c4dLongTailEase(clamp(t / 1.58, 0, 1));
    posX = mix(-3.4, -0.7, u);
    posY = mix(2.15, 2.55, u);
    posZ = mix(5.8, 6.6, u);
    targetX = mix(-0.7, 0.0, u);
    targetY = mix(0.45, 0.58, u);
    targetZ = mix(0.2, -0.1, u);
    fov = mix(34, 35, u);
    roll = mix(-0.04, 0.0, u);
    aperture = 1.7;
  } else if (t < 3.80) {
    // Shot 2: Fast long-tail whip-tilt into Hero Drop Stage as S-O-F-T drop and squash
    shotIndex = 2;
    const u = c4dLongTailEase(clamp((t - 1.58) / (3.80 - 1.58), 0, 1));
    posX = mix(-0.7, 0.30, u);
    posY = mix(2.55, 2.95, u);
    posZ = mix(6.6, 8.15, u);
    targetX = 0.0;
    targetY = mix(0.58, 0.85, u);
    targetZ = -0.1;
    fov = mix(35, 36, u);
    roll = mix(0.025, -0.01, u);
    aperture = 1.8;
  } else if (t < 5.50) {
    // Shot 3: Orbital parallax glide around the undulating S-O-F-T and frosted glass rings
    shotIndex = 3;
    const u = c4dLongTailEase(clamp((t - 3.80) / (5.50 - 3.80), 0, 1));
    const orbitAngle = mix(0.06, -0.35, u);
    const radius = mix(8.15, 7.25, u);
    posX = Math.sin(orbitAngle) * radius;
    posZ = Math.cos(orbitAngle) * radius;
    posY = mix(2.95, 2.45, u);
    targetX = mix(0.0, -0.12, u);
    targetY = mix(0.85, 1.05, u);
    targetZ = -0.2;
    fov = mix(36, 34, u);
    roll = mix(-0.01, -0.03, u);
    aperture = 1.75;
  } else if (t < 7.60) {
    // Shot 4: Zero-G inhale crane-up + HERO MOMENT Shockwave Impact (t = 6.25s)
    shotIndex = 4;
    if (t < 6.25) {
      const u = smootherstep(5.50, 6.25, t);
      posX = mix(-2.48, 0.0, u);
      posY = mix(2.45, 3.85, u);
      posZ = mix(6.82, 7.25, u);
      targetX = mix(-0.12, 0.0, u);
      targetY = mix(1.05, 1.18, u);
      targetZ = -0.25;
      fov = mix(34, 32, u);
      roll = mix(-0.03, 0.0, u);
    } else {
      const u = c4dLongTailEase(clamp((t - 6.25) / (7.60 - 6.25), 0, 1));
      posX = mix(0.0, 0.40, u);
      posY = mix(3.85, 3.15, u);
      posZ = mix(7.25, 8.45, u);
      targetX = 0.0;
      targetY = mix(1.18, 0.92, u);
      targetZ = -0.2;
      fov = mix(38, 35, u);
      roll = Math.sin((t - 6.25) * 9.0) * Math.exp(-(t - 6.25) * 3.5) * 0.025;
    }
    aperture = 1.8;
  } else {
    // Shot 5: Canonical C4D Long-Tail Ease (80% of move in first 20% of interval: 7.60s -> 8.08s),
    // ending on a poised, poster-worthy Hero Composition held ~1.4s with living micro-motion.
    shotIndex = 5;
    const u = c4dLongTailEase(clamp((t - 7.60) / (10.00 - 7.60), 0, 1));
    const microDriftX = Math.sin(t * 1.4) * 0.035;
    const microDriftY = Math.cos(t * 1.2) * 0.025;
    posX = mix(0.40, 0.0, u) + microDriftX;
    posY = mix(3.15, 2.58, u) + microDriftY;
    posZ = mix(8.45, 7.85, u);
    targetX = 0.0;
    targetY = mix(0.92, 0.96, u);
    targetZ = -0.22;
    fov = mix(35, 34, u);
    roll = 0.0;
    aperture = 1.8;
  }

  // Add subtle physical camera trauma shake on letter drops & hero impact
  let shakeY = 0;
  let shakeX = 0;
  for (let i = 0; i < 4; i++) {
    const dt = t - HERO_DROP_TIMES[i];
    if (dt > 0 && dt < 0.45) {
      const trauma = Math.exp(-dt * 11.0);
      shakeY -= Math.sin(dt * 42.0) * trauma * 0.065;
      shakeX += Math.cos(dt * 36.0 + i) * trauma * 0.035;
    }
  }
  const heroDt = t - 6.25;
  if (heroDt > 0 && heroDt < 0.85) {
    const trauma = Math.exp(-heroDt * 6.5);
    shakeY -= Math.sin(heroDt * 38.0) * trauma * 0.14;
    shakeX += Math.cos(heroDt * 31.0) * trauma * 0.08;
  }

  posX += shakeX;
  posY += shakeY;

  const focusDistance = Math.hypot(posX - targetX, posY - targetY, posZ - targetZ);

  // Compute instantaneous motion blur factor from camera whip transitions + active drops
  let motionBlurAmount = 0.25;
  if (Math.abs(t - 1.58) < 0.22 || Math.abs(t - 3.80) < 0.22 || Math.abs(t - 6.25) < 0.28 || Math.abs(t - 7.65) < 0.22) {
    motionBlurAmount = 0.85;
  }
  for (const dropT of HERO_DROP_TIMES) {
    if (t >= dropT - 0.18 && t <= dropT + 0.12) {
      motionBlurAmount = Math.max(motionBlurAmount, 0.78);
    }
  }

  return {
    posX,
    posY,
    posZ,
    targetX,
    targetY,
    targetZ,
    fov,
    roll,
    focusDistance,
    aperture,
    motionBlurAmount,
    shotIndex,
  };
}
