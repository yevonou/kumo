import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FILM_FPS,
  FILM_DURATION,
  FILM_TOTAL_FRAMES,
  CUE_SHEET,
  c4dLongTailEase,
  volumePreservingScale,
  evaluateClonerElement,
  evaluateHeroLetters,
  evaluateCamera,
  evaluateJellyCore,
} from './choreography';

test('film spec constants match 24fps and 10.000s (240 frames)', () => {
  assert.equal(FILM_FPS, 24);
  assert.equal(FILM_DURATION, 10.0);
  assert.equal(FILM_TOTAL_FRAMES, 240);
});

test('c4dLongTailEase completes ~80% of displacement in the first 20% of normalized time', () => {
  assert.equal(c4dLongTailEase(0), 0);
  assert.equal(c4dLongTailEase(1), 1);
  const at20Percent = c4dLongTailEase(0.20);
  assert.ok(
    at20Percent >= 0.78 && at20Percent <= 0.82,
    `Expected ~0.80 at u=0.20, got ${at20Percent}`
  );
  // Strictly monotonic increasing
  let prev = 0;
  for (let u = 0.05; u <= 1.0; u += 0.05) {
    const curr = c4dLongTailEase(u);
    assert.ok(curr >= prev, `Non-monotonic at u=${u}: ${curr} < ${prev}`);
    prev = curr;
  }
});

test('volumePreservingScale strictly conserves 3D volume (sx * sy * sz === 1)', () => {
  for (const sy of [0.55, 0.72, 1.0, 1.28, 1.5]) {
    const { sx, sy: outSy, sz } = volumePreservingScale(sy);
    const volume = sx * outSy * sz;
    assert.ok(Math.abs(volume - 1.0) < 1e-6, `Volume not conserved for sy=${sy}: got ${volume}`);
  }
});

test('cue sheet has hook in first 0.5s, hero impact at 60-75% runtime (6.25s), and sorted times', () => {
  assert.ok(CUE_SHEET.length >= 10);
  assert.ok(CUE_SHEET[0].time <= 0.3, 'First hook cue must occur within 0.3s');
  const heroCue = CUE_SHEET.find((c) => c.type === 'hero_impact');
  assert.ok(heroCue, 'Must include hero_impact cue');
  assert.ok(
    heroCue.time >= 6.0 && heroCue.time <= 7.5,
    `Hero moment must be at 60-75% of 10s, got ${heroCue.time}`
  );
  for (let i = 1; i < CUE_SHEET.length; i++) {
    assert.ok(CUE_SHEET[i].time > CUE_SHEET[i - 1].time, 'Cues must be strictly chronological');
  }
});

test('deterministic evaluation produces identical output for any time t and valid camera/hero states', () => {
  const clonerA = evaluateClonerElement(7, 5, 6.25);
  const clonerB = evaluateClonerElement(7, 5, 6.25);
  assert.deepEqual(clonerA, clonerB);

  const lettersAtStart = evaluateHeroLetters(0.1);
  assert.equal(lettersAtStart.every((l) => !l.visible), true);

  const lettersAtEnd = evaluateHeroLetters(9.2);
  assert.equal(lettersAtEnd.every((l) => l.visible), true);
  for (const l of lettersAtEnd) {
    assert.ok(Math.abs(l.sx * l.sy * l.sz - 1.0) < 1e-5);
  }

  const camStart = evaluateCamera(0.0);
  const camHero = evaluateCamera(6.25);
  const camEnd = evaluateCamera(9.5);
  assert.ok(camStart.focusDistance > 2 && camStart.focusDistance < 15);
  assert.ok(camHero.focusDistance > 2 && camHero.focusDistance < 15);
  assert.equal(camEnd.shotIndex, 5);

  const jelly = evaluateJellyCore(6.3);
  assert.ok(Math.abs(jelly.sx * jelly.sy * jelly.sz - 1.0) < 1e-5);
});

test('audio synthesizer produces 480,000 stereo samples (10.0s @ 48kHz) with true peak <= -1 dBTP and synced onsets', async () => {
  const { generateFilmAudioSamples, AUDIO_TOTAL_SAMPLES } = await import('./soundEngine');
  const buf = generateFilmAudioSamples();
  assert.equal(buf.left.length, AUDIO_TOTAL_SAMPLES);
  assert.equal(buf.right.length, AUDIO_TOTAL_SAMPLES);

  let maxPeak = 0;
  for (let i = 0; i < AUDIO_TOTAL_SAMPLES; i++) {
    const l = Math.abs(buf.left[i]);
    const r = Math.abs(buf.right[i]);
    assert.ok(!Number.isNaN(l) && !Number.isNaN(r), `NaN sample at ${i}`);
    if (l > maxPeak) maxPeak = l;
    if (r > maxPeak) maxPeak = r;
  }
  // -1.0 dBTP is 10^(-1/20) = 0.89125
  assert.ok(maxPeak <= 0.891, `Expected peak <= 0.891 (-1 dBTP), got ${maxPeak}`);
  assert.ok(maxPeak >= 0.5, `Expected audible signal peak >= 0.5, got ${maxPeak}`);

  // Check energy burst at Hero Impact t = 6.25s (sample 300,000)
  const heroSample = Math.floor(6.25 * 48000);
  let heroEnergy = 0;
  for (let i = heroSample; i < heroSample + 4800; i++) {
    heroEnergy += buf.left[i] * buf.left[i] + buf.right[i] * buf.right[i];
  }
  assert.ok(heroEnergy > 150, `Expected strong audio hit at hero impact 6.25s, got ${heroEnergy}`);
});

