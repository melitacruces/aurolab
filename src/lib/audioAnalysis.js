import { camelotCode } from "./musicMath";

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export async function analyzeAudioFile(file, onProgress = () => {}) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("WEB_AUDIO_UNSUPPORTED");
  }

  const context = new AudioContextClass();

  try {
    onProgress("decoding");
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));

    onProgress("transients");
    const mono = mixToMono(audioBuffer);
    const bpm = await estimateBpm(mono, audioBuffer.sampleRate, onProgress);

    onProgress("estimatingKey");
    const key = await estimateKey(mono, audioBuffer.sampleRate, onProgress);

    return {
      bpm,
      key,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
    };
  } finally {
    await context.close?.();
  }
}

function mixToMono(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);

  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      mono[i] += data[i] / channelCount;
    }
  }

  return mono;
}

async function estimateBpm(samples, sampleRate, onProgress) {
  const frameSize = 1024;
  const hopSize = 512;
  const frameCount = Math.floor((samples.length - frameSize) / hopSize);
  if (frameCount < 4) {
    return {
      value: null,
      confidence: 0,
      peaks: 0,
      alternatives: [],
    };
  }

  const envelope = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame += 1) {
    const offset = frame * hopSize;
    let energy = 0;

    for (let i = 0; i < frameSize; i += 1) {
      const value = samples[offset + i];
      energy += value * value;
    }

    envelope[frame] = Math.sqrt(energy / frameSize);
  }

  const flux = new Float32Array(frameCount);
  for (let i = 1; i < frameCount; i += 1) {
    flux[i] = Math.max(0, envelope[i] - envelope[i - 1]);
  }

  const stats = getStats(flux);
  const threshold = stats.mean + stats.std * 0.75;
  const minGapFrames = Math.max(1, Math.round((sampleRate * 0.08) / hopSize));
  const peaks = [];
  let lastPeak = -minGapFrames;

  for (let i = 2; i < flux.length - 2; i += 1) {
    if (
      flux[i] > threshold &&
      flux[i] >= flux[i - 1] &&
      flux[i] >= flux[i + 1] &&
      i - lastPeak >= minGapFrames
    ) {
      peaks.push({
        time: (i * hopSize) / sampleRate,
        strength: flux[i],
      });
      lastPeak = i;
    }
  }

  if (peaks.length < 4) {
    return {
      value: null,
      confidence: 0,
      peaks: peaks.length,
      alternatives: [],
    };
  }

  const strongest = peaks
    .slice()
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 900)
    .sort((a, b) => a.time - b.time);

  const histogram = new Map();
  const minBpm = 60;
  const maxBpm = 200;

  for (let i = 0; i < strongest.length; i += 1) {
    for (let j = i + 1; j < Math.min(strongest.length, i + 18); j += 1) {
      const delta = strongest[j].time - strongest[i].time;
      if (delta < 0.25 || delta > 3) continue;

      for (let multiple = 1; multiple <= 4; multiple += 1) {
        let bpm = (60 * multiple) / delta;
        while (bpm < minBpm) bpm *= 2;
        while (bpm > maxBpm) bpm /= 2;

        const rounded = Math.round(bpm);
        if (rounded < minBpm || rounded > maxBpm) continue;

        const weight = (strongest[i].strength + strongest[j].strength) / (1 + Math.abs(multiple - 2) * 0.35);
        histogram.set(rounded, (histogram.get(rounded) || 0) + weight);
      }
    }

    if (i % 160 === 0) {
      onProgress("scoringTempos");
      await idle();
    }
  }

  const scored = Array.from(histogram.entries())
    .map(([tempo, score]) => ({
      tempo,
      score: smoothTempoScore(histogram, tempo),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) {
    return {
      value: null,
      confidence: 0,
      peaks: peaks.length,
      alternatives: [],
    };
  }

  const nearbyRejected = [];
  const alternatives = [];
  for (const candidate of scored) {
    if (Math.abs(candidate.tempo - best.tempo) <= 3) {
      nearbyRejected.push(candidate);
      continue;
    }
    if (!alternatives.some((item) => Math.abs(item.tempo - candidate.tempo) <= 3)) {
      alternatives.push(candidate);
    }
    if (alternatives.length === 3) break;
  }

  const secondScore = alternatives[0]?.score || nearbyRejected[1]?.score || 0;
  const confidence = clamp01((best.score - secondScore) / Math.max(best.score, 1));

  return {
    value: best.tempo,
    confidence,
    peaks: peaks.length,
    alternatives: alternatives.map((item) => item.tempo),
  };
}

function smoothTempoScore(histogram, tempo) {
  return (
    (histogram.get(tempo - 2) || 0) * 0.25 +
    (histogram.get(tempo - 1) || 0) * 0.55 +
    (histogram.get(tempo) || 0) +
    (histogram.get(tempo + 1) || 0) * 0.55 +
    (histogram.get(tempo + 2) || 0) * 0.25
  );
}

async function estimateKey(samples, sampleRate, onProgress) {
  const windowSize = 4096;
  const maxWindows = 120;
  const usableLength = Math.max(0, samples.length - windowSize);
  const step = Math.max(windowSize, Math.floor(usableLength / maxWindows));
  const chroma = new Array(12).fill(0);
  const hann = buildHann(windowSize);
  let analyzedWindows = 0;

  for (let start = 0; start < usableLength; start += step) {
    const rms = windowRms(samples, start, windowSize);
    if (rms < 0.006) continue;

    for (let midi = 36; midi <= 84; midi += 1) {
      const frequency = 440 * 2 ** ((midi - 69) / 12);
      const power = goertzelPower(samples, start, windowSize, sampleRate, frequency, hann);
      chroma[midi % 12] += Math.log1p(power) * rms;
    }

    analyzedWindows += 1;

    if (analyzedWindows % 8 === 0) {
      onProgress("comparingProfiles");
      await idle();
    }
  }

  if (analyzedWindows < 2 || chroma.every((value) => value === 0)) {
    return {
      name: null,
      confidence: 0,
      chroma,
      alternatives: [],
    };
  }

  const normalized = normalize(chroma);
  const candidates = [];

  for (let tonic = 0; tonic < 12; tonic += 1) {
    candidates.push({
      tonic,
      mode: "major",
      camelot: camelotCode(tonic, "major"),
      score: cosineSimilarity(normalized, rotateProfile(MAJOR_PROFILE, tonic)),
    });
    candidates.push({
      tonic,
      mode: "minor",
      camelot: camelotCode(tonic, "minor"),
      score: cosineSimilarity(normalized, rotateProfile(MINOR_PROFILE, tonic)),
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const second = candidates.find((candidate) => candidate.tonic !== best.tonic || candidate.mode !== best.mode);
  const peak = normalized.reduce((maxIndex, value, index, arr) => (value > arr[maxIndex] ? index : maxIndex), 0);

  return {
    camelot: best.camelot,
    tonic: best.tonic,
    mode: best.mode,
    peak,
    confidence: clamp01((best.score - (second?.score || 0)) / Math.max(Math.abs(best.score), 0.0001)),
    chroma: normalized,
    alternatives: candidates.slice(1, 4).map((candidate) => ({ tonic: candidate.tonic, mode: candidate.mode })),
  };
}

function buildHann(size) {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i += 1) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return window;
}

function goertzelPower(samples, start, size, sampleRate, frequency, window) {
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const coeff = 2 * Math.cos(omega);
  let q0 = 0;
  let q1 = 0;
  let q2 = 0;

  for (let i = 0; i < size; i += 1) {
    q0 = coeff * q1 - q2 + samples[start + i] * window[i];
    q2 = q1;
    q1 = q0;
  }

  return q1 * q1 + q2 * q2 - q1 * q2 * coeff;
}

function windowRms(samples, start, size) {
  let sum = 0;
  for (let i = 0; i < size; i += 1) {
    const value = samples[start + i];
    sum += value * value;
  }
  return Math.sqrt(sum / size);
}

function normalize(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const centered = values.map((value) => Math.max(0, value - mean * 0.35));
  const total = centered.reduce((sum, value) => sum + value, 0) || 1;
  return centered.map((value) => value / total);
}

function rotateProfile(profile, tonic) {
  const rotated = new Array(12);
  for (let i = 0; i < 12; i += 1) {
    rotated[(i + tonic) % 12] = profile[i];
  }
  return normalize(rotated);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

function getStats(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return {
    mean,
    std: Math.sqrt(variance),
  };
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function idle() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}
