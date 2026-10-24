import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { generateFilmAudioSamples, AUDIO_SAMPLE_RATE, AUDIO_TOTAL_SAMPLES } from '../src/film/soundEngine';

/**
 * Writes a stereo 32-bit IEEE Float WAV file from our deterministic soundEngine
 * and runs FFmpeg two-pass EBU R128 loudnorm to master to -14.0 LUFS, TP <= -1.0 dBTP.
 */
function writeWavFile(filePath: string, left: Float32Array, right: Float32Array, sampleRate: number) {
  const numChannels = 2;
  const bytesPerSample = 4; // 32-bit float
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = left.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk (IEEE Float = format 3)
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(3, 20); // IEEE float
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(32, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    buffer.writeFloatLE(left[i], offset);
    buffer.writeFloatLE(right[i], offset + 4);
    offset += 8;
  }

  fs.writeFileSync(filePath, buffer);
}

const rawWav = '/tmp/kumo_raw.wav';
const masteredWav = '/tmp/kumo_mastered.wav';

console.log('Synthesizing 48kHz stereo audio from CUE_SHEET...');
const pcm = generateFilmAudioSamples();
writeWavFile(rawWav, pcm.left, pcm.right, AUDIO_SAMPLE_RATE);
console.log(`Wrote ${AUDIO_TOTAL_SAMPLES} stereo samples to ${rawWav}`);

// Pass 1: Measure loudness with ffmpeg loudnorm
const pass1Cmd = `ffmpeg -hide_banner -y -i ${rawWav} -af "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json" -f null - 2>&1`;
const pass1Out = execSync(pass1Cmd).toString();
const jsonMatch = pass1Out.match(/\{[\s\S]*?"input_i"[\s\S]*?\}/);
if (!jsonMatch) {
  throw new Error('Failed to parse loudnorm JSON output:\n' + pass1Out);
}
const stats = JSON.parse(jsonMatch[0]);
console.log('Pass 1 Loudness Stats:', stats);

// Pass 2: Apply exact linear loudnorm + true-peak limiter at 48kHz
const pass2Cmd = `ffmpeg -hide_banner -y -i ${rawWav} -af "loudnorm=I=-14:TP=-1.2:LRA=9:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true" -ar 48000 -ac 2 -c:a pcm_s24le ${masteredWav}`;
execSync(pass2Cmd, { stdio: 'inherit' });

// Verify mastered WAV loudness
const verifyCmd = `ffmpeg -hide_banner -i ${masteredWav} -af "ebur128=peak=true" -f null - 2>&1 | tail -n 18`;
console.log('Mastered WAV EBU R128 Verification:');
console.log(execSync(verifyCmd).toString());
