/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let audioMuted = false;

const MUTE_KEY = "devmon_muted_v1";

export function initAudioPreference(): void {
  try {
    audioMuted = localStorage.getItem(MUTE_KEY) === "1";
  } catch (e) {
    audioMuted = false;
  }
}

export function isMuted(): boolean {
  return audioMuted;
}

export function toggleMute(): boolean {
  audioMuted = !audioMuted;
  try {
    localStorage.setItem(MUTE_KEY, audioMuted ? "1" : "0");
  } catch (e) {
    // Silently ignore
  }
  return audioMuted;
}

function ensureAudioCtx(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  } catch (e) {
    audioCtx = null;
  }
  return audioCtx;
}

export function unlockAudio(): void {
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(() => {
      startBgmScheduler();
    });
  } else {
    startBgmScheduler();
  }
}

interface ToneOptions {
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  slideTo?: number;
}

export function playTone(freq: number, duration: number, opts: ToneOptions = {}): void {
  if (audioMuted) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;

  const type = opts.type || "square";
  const volume = opts.volume !== undefined ? opts.volume : 0.12;
  const delay = opts.delay || 0;
  const slideTo = opts.slideTo;

  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) {
    osc.frequency.linearRampToValueAtTime(slideTo, t0 + duration);
  }

  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

interface Note {
  freq: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  delay: number;
  slideTo?: number;
}

export function playSequence(notes: Note[]): void {
  notes.forEach((n) => {
    playTone(n.freq, n.duration, {
      type: n.type,
      volume: n.volume,
      delay: n.delay,
      slideTo: n.slideTo,
    });
  });
}

// Named Sound Effects
export function sfxCursor(): void {
  playTone(520, 0.05, { type: "square", volume: 0.06 });
}

export function sfxMenuOpen(): void {
  playTone(440, 0.07, { type: "square", volume: 0.08, slideTo: 660 });
}

export function sfxMenuClose(): void {
  playTone(440, 0.07, { type: "square", volume: 0.08, slideTo: 260 });
}

export function sfxFootstep(): void {
  playTone(180, 0.04, { type: "square", volume: 0.025 });
}

export function sfxEncounter(): void {
  playSequence([
    { freq: 220, duration: 0.12, type: "sawtooth", volume: 0.1, delay: 0 },
    { freq: 180, duration: 0.12, type: "sawtooth", volume: 0.1, delay: 0.1 },
    { freq: 140, duration: 0.18, type: "sawtooth", volume: 0.1, delay: 0.2 },
  ]);
}

export function sfxCorrect(): void {
  playSequence([
    { freq: 523, duration: 0.09, type: "square", volume: 0.1, delay: 0 },
    { freq: 659, duration: 0.09, type: "square", volume: 0.1, delay: 0.08 },
    { freq: 880, duration: 0.14, type: "square", volume: 0.11, delay: 0.16 },
  ]);
}

export function sfxWrong(): void {
  playTone(160, 0.28, { type: "sawtooth", volume: 0.11, slideTo: 90 });
}

export function sfxAttackHit(): void {
  playTone(140, 0.1, { type: "square", volume: 0.14 });
  playTone(90, 0.16, { type: "triangle", volume: 0.1, delay: 0.03 });
}

export function sfxCrit(): void {
  playTone(180, 0.06, { type: "square", volume: 0.16 });
  playTone(110, 0.08, { type: "square", volume: 0.16, delay: 0.05 });
  playTone(70, 0.2, { type: "triangle", volume: 0.13, delay: 0.1 });
}

export function sfxSuperEffective(): void {
  playSequence([
    { freq: 700, duration: 0.07, type: "square", volume: 0.1, delay: 0 },
    { freq: 980, duration: 0.1, type: "square", volume: 0.12, delay: 0.06 },
  ]);
}

export function sfxFaint(): void {
  playTone(300, 0.4, { type: "sawtooth", volume: 0.1, slideTo: 60 });
}

export function sfxLevelUp(): void {
  playSequence([
    { freq: 392, duration: 0.08, type: "square", volume: 0.1, delay: 0 },
    { freq: 523, duration: 0.08, type: "square", volume: 0.1, delay: 0.08 },
    { freq: 659, duration: 0.08, type: "square", volume: 0.11, delay: 0.16 },
    { freq: 880, duration: 0.22, type: "square", volume: 0.12, delay: 0.24 },
  ]);
}

export function sfxEvolve(): void {
  playSequence([
    { freq: 262, duration: 0.15, type: "sawtooth", volume: 0.09, delay: 0, slideTo: 392 },
    { freq: 392, duration: 0.15, type: "sawtooth", volume: 0.1, delay: 0.15, slideTo: 523 },
    { freq: 523, duration: 0.3, type: "sawtooth", volume: 0.12, delay: 0.3, slideTo: 1046 },
  ]);
}

export function sfxCatchThrow(): void {
  playTone(300, 0.15, { type: "triangle", volume: 0.08, slideTo: 500 });
}

export function sfxCatchShake(): void {
  playTone(220, 0.08, { type: "square", volume: 0.07 });
}

export function sfxCatchSuccess(): void {
  playSequence([
    { freq: 523, duration: 0.1, type: "square", volume: 0.11, delay: 0 },
    { freq: 659, duration: 0.1, type: "square", volume: 0.11, delay: 0.1 },
    { freq: 784, duration: 0.1, type: "square", volume: 0.11, delay: 0.2 },
    { freq: 1046, duration: 0.28, type: "square", volume: 0.13, delay: 0.3 },
  ]);
}

export function sfxCatchFail(): void {
  playTone(220, 0.25, { type: "sawtooth", volume: 0.1, slideTo: 140 });
}

export function sfxGold(): void {
  playTone(880, 0.06, { type: "square", volume: 0.07, slideTo: 1100 });
}

export function sfxBadge(): void {
  playSequence([
    { freq: 523, duration: 0.12, type: "square", volume: 0.12, delay: 0 },
    { freq: 784, duration: 0.12, type: "square", volume: 0.12, delay: 0.12 },
    { freq: 1046, duration: 0.3, type: "square", volume: 0.14, delay: 0.24 },
  ]);
}

export function sfxVictory(): void {
  playSequence([
    { freq: 523, duration: 0.14, type: "square", volume: 0.12, delay: 0 },
    { freq: 659, duration: 0.14, type: "square", volume: 0.12, delay: 0.14 },
    { freq: 784, duration: 0.14, type: "square", volume: 0.12, delay: 0.28 },
    { freq: 1046, duration: 0.5, type: "square", volume: 0.14, delay: 0.42 },
  ]);
}

export function sfxBattleStart(): void {
  playSequence([
    { freq: 165, duration: 0.08, type: "square", volume: 0.12, delay: 0 },
    { freq: 165, duration: 0.08, type: "square", volume: 0.12, delay: 0.12 },
    { freq: 220, duration: 0.16, type: "square", volume: 0.13, delay: 0.24 },
  ]);
}

// ============================================================================
// BACKGROUND MUSIC (BGM) PROCEDURAL SYSTEM
// ============================================================================

let bgmSchedulerTimer: any = null;
let currentTrackName: string | null = null;
let nextNoteTime = 0;
let stepIndex = 0;
let bgmRunning = false;
let currentBpm = 110;
let targetBpm = 110;
let bgmGainNode: GainNode | null = null;

// Conversion helper
const midiToFreq = (note: number) => note > 0 ? Math.pow(2, (note - 69) / 12) * 440 : 0;

interface BGMTrack {
  bpm: number;
  bass: number[];
  melody: number[];
  bassType: OscillatorType;
  melodyType: OscillatorType;
}

const TRACKS: Record<string, BGMTrack> = {
  town: {
    bpm: 105,
    bass: [45, 0, 45, 0, 41, 0, 41, 0, 48, 0, 48, 0, 43, 0, 43, 0],
    melody: [57, 60, 64, 60, 57, 60, 64, 67, 69, 67, 64, 60, 62, 0, 64, 0],
    bassType: "triangle",
    melodyType: "sine",
  },
  feature: {
    bpm: 120,
    bass: [50, 0, 50, 50, 46, 0, 46, 46, 48, 0, 48, 48, 45, 0, 45, 50],
    melody: [62, 65, 69, 65, 67, 0, 69, 70, 72, 69, 67, 65, 62, 64, 65, 67],
    bassType: "triangle",
    melodyType: "triangle",
  },
  review: {
    bpm: 115,
    bass: [40, 40, 0, 40, 43, 43, 0, 43, 45, 45, 0, 45, 38, 38, 40, 0],
    melody: [64, 67, 0, 64, 71, 0, 67, 0, 69, 0, 64, 0, 67, 69, 67, 64],
    bassType: "triangle",
    melodyType: "square",
  },
  hq: {
    bpm: 125,
    bass: [43, 43, 50, 43, 46, 46, 53, 46, 48, 48, 55, 48, 41, 41, 48, 41],
    melody: [67, 70, 74, 75, 74, 70, 67, 70, 69, 72, 74, 72, 69, 65, 67, 69],
    bassType: "sawtooth",
    melodyType: "triangle",
  },
  battle: {
    bpm: 135,
    bass: [45, 45, 45, 45, 48, 48, 48, 48, 50, 50, 50, 50, 47, 47, 47, 47],
    melody: [57, 57, 60, 62, 64, 64, 67, 69, 72, 69, 67, 64, 62, 60, 62, 64],
    bassType: "sawtooth",
    melodyType: "square",
  },
  battle_critical: {
    bpm: 165,
    bass: [45, 45, 45, 45, 48, 48, 48, 48, 50, 50, 50, 50, 47, 47, 47, 47],
    melody: [69, 69, 72, 74, 76, 76, 79, 81, 84, 81, 79, 76, 74, 72, 74, 76],
    bassType: "sawtooth",
    melodyType: "sawtooth",
  }
};

function getBgmGain(): GainNode | null {
  const ctx = ensureAudioCtx();
  if (!ctx) return null;
  if (!bgmGainNode) {
    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.value = audioMuted ? 0 : 0.04; // Gentle baseline BGM volume
    bgmGainNode.connect(ctx.destination);
  }
  return bgmGainNode;
}

function playRetroDrum(type: "hat" | "snare" | "kick", time: number) {
  const ctx = ensureAudioCtx();
  const bgmGain = getBgmGain();
  if (!ctx || !bgmGain) return;

  const gain = ctx.createGain();
  gain.connect(bgmGain);

  if (type === "hat") {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(10000, time);
    
    gain.gain.setValueAtTime(0.004, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);
    
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 0.03);
  } else if (type === "snare") {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.06);
    
    gain.gain.setValueAtTime(0.012, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 0.08);
  } else if (type === "kick") {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.09);
    
    gain.gain.setValueAtTime(0.035, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + 0.11);
  }
}

function playScheduledTone(freq: number, startTime: number, duration: number, type: OscillatorType, volume: number) {
  const ctx = ensureAudioCtx();
  const bgmGain = getBgmGain();
  if (!ctx || !bgmGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
  gain.gain.setValueAtTime(volume, startTime + duration - 0.012);
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(bgmGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.015);
}

function advanceStep() {
  const stepDuration = 60.0 / currentBpm / 2.0;
  nextNoteTime += stepDuration;
  stepIndex = (stepIndex + 1) % 16;
  
  if (currentBpm < targetBpm) {
    currentBpm = Math.min(targetBpm, currentBpm + 2);
  } else if (currentBpm > targetBpm) {
    currentBpm = Math.max(targetBpm, currentBpm - 2);
  }
}

function scheduleNextStep(time: number) {
  if (!currentTrackName) return;
  const track = TRACKS[currentTrackName];
  if (!track) return;

  const bassMidi = track.bass[stepIndex];
  const melodyMidi = track.melody[stepIndex];
  const duration = (60.0 / currentBpm / 2.0) * 0.85;

  if (bassMidi > 0) {
    const bassFreq = midiToFreq(bassMidi);
    playScheduledTone(bassFreq, time, duration, track.bassType, 0.07);
  }

  if (melodyMidi > 0) {
    const melodyFreq = midiToFreq(melodyMidi);
    playScheduledTone(melodyFreq, time, duration, track.melodyType, 0.04);
  }

  let kick = false;
  let snare = false;
  let hat = false;

  if (currentTrackName === "town") {
    if (stepIndex % 4 === 0) hat = true;
  } else if (currentTrackName === "feature") {
    if (stepIndex === 0 || stepIndex === 8) kick = true;
    if (stepIndex === 4 || stepIndex === 12) snare = true;
    if (stepIndex % 2 === 0 && stepIndex % 4 !== 0) hat = true;
  } else if (currentTrackName === "review") {
    if (stepIndex === 0 || stepIndex === 8) kick = true;
    if (stepIndex === 4 || stepIndex === 12) snare = true;
    if (stepIndex % 2 !== 0) hat = true;
  } else if (currentTrackName === "hq") {
    if (stepIndex % 4 === 0) kick = true;
    if (stepIndex % 4 === 2) snare = true;
    if (stepIndex % 2 !== 0) hat = true;
  } else if (currentTrackName === "battle" || currentTrackName === "battle_critical") {
    if (stepIndex % 4 === 0) kick = true;
    if (stepIndex === 4 || stepIndex === 12) snare = true;
    if (stepIndex % 2 !== 0) hat = true;
  }

  if (kick) playRetroDrum("kick", time);
  if (snare) playRetroDrum("snare", time);
  if (hat) playRetroDrum("hat", time);
}

function scheduler() {
  const ctx = ensureAudioCtx();
  if (!ctx || !bgmRunning) return;

  while (nextNoteTime < ctx.currentTime + 0.12) {
    if (currentTrackName) {
      scheduleNextStep(nextNoteTime);
    }
    advanceStep();
  }
}

export function startBgmScheduler(): void {
  if (bgmRunning) return;
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  
  bgmRunning = true;
  nextNoteTime = ctx.currentTime + 0.05;
  stepIndex = 0;
  
  if (bgmSchedulerTimer) {
    clearInterval(bgmSchedulerTimer);
  }
  
  bgmSchedulerTimer = setInterval(scheduler, 40);
}

export function updateBGM(mapId: string, inBattle: boolean, hpPercent?: number): void {
  let targetTrack: string = "town";
  if (inBattle) {
    if (hpPercent !== undefined && hpPercent < 0.25) {
      targetTrack = "battle_critical";
    } else {
      targetTrack = "battle";
    }
  } else {
    if (mapId === "town") {
      targetTrack = "town";
    } else if (mapId === "stakeholderfloor") {
      targetTrack = "review";
    } else if (mapId === "customerhq") {
      targetTrack = "hq";
    } else {
      targetTrack = "feature";
    }
  }

  if (currentTrackName === targetTrack) return;

  const ctx = ensureAudioCtx();
  const isBattleTransition = 
    (currentTrackName === "battle" && targetTrack === "battle_critical") ||
    (currentTrackName === "battle_critical" && targetTrack === "battle");

  if (isBattleTransition) {
    currentTrackName = targetTrack;
    const track = TRACKS[targetTrack];
    if (track) {
      targetBpm = track.bpm;
    }
    return;
  }

  currentTrackName = targetTrack;
  const track = TRACKS[targetTrack];
  if (track) {
    targetBpm = track.bpm;
    if (!bgmRunning) {
      currentBpm = track.bpm;
    }
  }

  if (ctx) {
    nextNoteTime = ctx.currentTime + 0.05;
    stepIndex = 0;
  }
}

