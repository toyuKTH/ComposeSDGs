// ========== 音符映射模块 (0-100 → 10个音符) ==========

// 全局调式状态
let currentMode = 'major'; // 'major' 或 'minor'

/**
 * 设置当前调式
 * @param {string} mode - 'major' 或 'minor'
 */
export function setMode(mode) {
  if (mode === 'major' || mode === 'minor') {
    currentMode = mode;
    console.log('Mode switched to: ' + (mode === 'major' ? 'C major' : 'C minor'));
  }
}

/**
 * 获取当前调式
 * @returns {string} - 当前调式
 */
export function getMode() {
  return currentMode;
}

/**
 * 将 0-100 的数值映射到音符
 * @param {number} value - SDG 分数 (0-100)
 * @param {string} mode - 调式 ('major' 或 'minor')
 * @returns {Object} - 音符信息对象
 */
export function valueToNote(value, mode = null) {
  const useMode = mode || currentMode;
  const clampedValue = Math.max(0, Math.min(100, value));

  let noteName, frequency, octave, positionClass, needsLedgerLine;

  if (clampedValue <= 10) {
    noteName = 'C';
    frequency = 261.63;
    octave = 4;
    positionClass = 'note-value-0-10';
    needsLedgerLine = 'below';
  } else if (clampedValue <= 20) {
    noteName = 'D';
    frequency = 293.66;
    octave = 4;
    positionClass = 'note-value-11-20';
    needsLedgerLine = false;
  } else if (clampedValue <= 30) {
    if (useMode === 'minor') {
      noteName = 'Eb';
      frequency = 311.13;
    } else {
      noteName = 'E';
      frequency = 329.63;
    }
    octave = 4;
    positionClass = 'note-value-21-30';
    needsLedgerLine = false;
  } else if (clampedValue <= 40) {
    noteName = 'F';
    frequency = 349.23;
    octave = 4;
    positionClass = 'note-value-31-40';
    needsLedgerLine = false;
  } else if (clampedValue <= 50) {
    noteName = 'G';
    frequency = 392.00;
    octave = 4;
    positionClass = 'note-value-41-50';
    needsLedgerLine = false;
  } else if (clampedValue <= 60) {
    if (useMode === 'minor') {
      noteName = 'Ab';
      frequency = 415.30;
    } else {
      noteName = 'A';
      frequency = 440.00;
    }
    octave = 4;
    positionClass = 'note-value-51-60';
    needsLedgerLine = false;
  } else if (clampedValue <= 70) {
    if (useMode === 'minor') {
      noteName = 'Bb';
      frequency = 466.16;
    } else {
      noteName = 'B';
      frequency = 493.88;
    }
    octave = 4;
    positionClass = 'note-value-61-70';
    needsLedgerLine = false;
  } else if (clampedValue <= 80) {
    noteName = 'C';
    frequency = 523.25;
    octave = 5;
    positionClass = 'note-value-71-80';
    needsLedgerLine = false;
  } else if (clampedValue <= 90) {
    noteName = 'D';
    frequency = 587.33;
    octave = 5;
    positionClass = 'note-value-81-90';
    needsLedgerLine = false;
  } else {
    if (useMode === 'minor') {
      noteName = 'Eb';
      frequency = 622.25;
    } else {
      noteName = 'E';
      frequency = 659.25;
    }
    octave = 5;
    positionClass = 'note-value-91-100';
    needsLedgerLine = false;
  }

  return {
    noteName,
    frequency,
    octave,
    fullNoteName: `${noteName}${octave}`,
    positionClass,
    needsLedgerLine,
    value: clampedValue,
    mode: useMode
  };
}

/**
 * 批量值转音符
 */
export function sdgValuesToNotes(sdgValues) {
  const notes = [];
  for (const [sdg, value] of Object.entries(sdgValues)) {
    if (typeof value === 'number') {
      const noteInfo = valueToNote(value);
      noteInfo.sdg = sdg;
      notes.push(noteInfo);
    }
  }
  notes.sort((a, b) => a.frequency - b.frequency);
  return notes;
}

/**
 * 获取音程（半音差）
 */
export function getInterval(value1, value2) {
  const note1 = valueToNote(value1);
  const note2 = valueToNote(value2);
  return Math.round(12 * Math.log2(note2.frequency / note1.frequency));
}

/**
 * 判断是否和谐音程
 */
export function isHarmonic(value1, value2) {
  const interval = Math.abs(getInterval(value1, value2));
  const harmonicIntervals = [0, 3, 4, 5, 7, 8, 9, 12];
  return harmonicIntervals.includes(interval);
}


// ========== 17个SDG的原始 WebAudio 合成器音色配置（保持不动） ==========

const SDG_TIMBRES = {
  '1': { name: 'Pure Sine', oscillatorType: 'sine', harmonics: [1, 0.3, 0.1], attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.3 },
  '2': { name: 'Bright Saw', oscillatorType: 'sawtooth', harmonics: [1, 0.5, 0.3, 0.15], attack: 0.02, decay: 0.12, sustain: 0.7, release: 0.25 },
  '3': { name: 'Metal Edge', oscillatorType: 'square', harmonics: [1, 0.4, 0.2], attack: 0.005, decay: 0.15, sustain: 0.6, release: 0.2 },
  '4': { name: 'Perc Click', oscillatorType: 'triangle', harmonics: [1, 0.3], attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.05 },
  '5': { name: 'Deep Bass', oscillatorType: 'sawtooth', harmonics: [1, 0.6], attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.3 },
  '6': { name: 'Warm Pad', oscillatorType: 'sine', harmonics: [1, 0.2], attack: 0.3, decay: 0.4, sustain: 0.8, release: 1.0 },
  '7': { name: 'Noise Hit', oscillatorType: 'sawtooth', harmonics: [1, 0.8], attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 },
  '8': { name: 'Chip Tune', oscillatorType: 'square', harmonics: [1, 0.1], attack: 0.01, decay: 0.05, sustain: 0.9, release: 0.1 },
  '9': { name: 'Bouncy Synth', oscillatorType: 'triangle', harmonics: [1, 0.4], attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.15 },
  '10': { name: 'Metal Resonant', oscillatorType: 'sawtooth', harmonics: [1, 0.6], attack: 0.1, decay: 0.8, sustain: 0.2, release: 1.5 },
  '11': { name: 'Underwater', oscillatorType: 'sine', harmonics: [1, 0.15], attack: 0.2, decay: 0.3, sustain: 0.7, release: 0.8 },
  '12': { name: 'Pulse Rhythm', oscillatorType: 'square', harmonics: [1, 0.5], attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.05 },
  '13': { name: 'Wind Atmosphere', oscillatorType: 'sawtooth', harmonics: [1, 0.1], attack: 0.5, decay: 1.0, sustain: 0.3, release: 2.0 },
  '14': { name: 'Digital Glitch', oscillatorType: 'square', harmonics: [1, 0.7], attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
  '15': { name: 'Soft Bell', oscillatorType: 'triangle', harmonics: [1, 0.6], attack: 0.05, decay: 0.5, sustain: 0.1, release: 1.0 },
  '16': { name: 'Industrial', oscillatorType: 'sawtooth', harmonics: [1, 0.8], attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.4 },
  '17': { name: 'Sci-Fi', oscillatorType: 'sine', harmonics: [1, 0.4], attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.7 }
};


// ========== WebAudio 部分（用于非 SDG6，保持原样） ==========

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  }
  return audioContext;
}

export function warmupAudioContext() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.001);
}

export function playNote(frequency, duration = 0.5, volume = 0.3, sdg = '1') {
  const ctx = getAudioContext();
  const timbre = SDG_TIMBRES[sdg] || SDG_TIMBRES['1'];

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  timbre.harmonics.forEach((harmonicVolume, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = timbre.oscillatorType;
    osc.frequency.setValueAtTime(frequency * (index + 1), ctx.currentTime);

    const attackEnd = ctx.currentTime + timbre.attack;
    const decayEnd = attackEnd + timbre.decay;
    const releaseEnd = ctx.currentTime + duration;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * harmonicVolume, attackEnd);
    gain.gain.exponentialRampToValueAtTime(Math.max(timbre.sustain * volume * harmonicVolume, 0.01), decayEnd);
    gain.gain.exponentialRampToValueAtTime(0.01, releaseEnd);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(releaseEnd);
  });
}


// ========== Tone.js 部分（仅 SDG6） ==========

let toneReady = typeof Tone !== 'undefined';

// sdg1：Tubular Bells
let samplerSDG1 = null;

if (toneReady) {
  samplerSDG1 = new Tone.Sampler({
    urls: { C4: 'sdg1.wav' },
    baseUrl: './samples/'
  }).toDestination();
}

//sdg6：Marimba

let samplerSDG6 = null;

if (toneReady) {
  samplerSDG6 = new Tone.Sampler({
    urls: { C4: 'sdg6.wav' },
    baseUrl: './samples/'
  }).toDestination();
}

//sdg7
let samplerSDG7 = null;

if (toneReady) {
  samplerSDG7 = new Tone.Sampler({
    urls: { C4: 'sdg7.wav' },
    baseUrl: './samples/'
  }).toDestination();
}

//sdg10
let samplerSDG10 = null;

if (toneReady) {
  samplerSDG10 = new Tone.Sampler({
    urls: { C4: 'sdg10.wav' },
    baseUrl: './samples/'
  }).toDestination();
}

//sdg15
let samplerSDG15 = null;

if (toneReady) {
  samplerSDG15 = new Tone.Sampler({
    urls: { C4: 'sdg15.wav' },
    baseUrl: './samples/'
  }).toDestination();
}


function playSampleSDG1(noteName, duration = 0.5) {
  if (!toneReady || !samplerSDG1) return;
  samplerSDG1.triggerAttackRelease(noteName, duration);
}

function playSampleSDG6(noteName, duration = 0.5) {
  if (!toneReady || !samplerSDG6) {
    console.log('Tone.js not ready, fallback to WebAudio');
    return;
  }
  samplerSDG6.triggerAttackRelease(noteName, duration);
}

function playSampleSDG7(noteName, duration = 0.5) {
  if (!toneReady || !samplerSDG7) return;
  samplerSDG7.triggerAttackRelease(noteName, duration);
}

function playSampleSDG10(noteName, duration = 0.5) {
  if (!toneReady || !samplerSDG10) return;
  samplerSDG10.triggerAttackRelease(noteName, duration);
}

function playSampleSDG15(noteName, duration = 0.5) {
  if (!toneReady || !samplerSDG15) return;
  samplerSDG15.triggerAttackRelease(noteName, duration);
}


// ========== 综合播放接口（自动区分 SDG6） ==========

export function playValueNote(value, sdg = '1', duration = 0.5) {
  const note = valueToNote(value);

  if (sdg === '1') {
    playSampleSDG1(note.fullNoteName, duration);
    return;
  }

  if (sdg === '6') {
    playSampleSDG6(note.fullNoteName, duration);
    return;
  }

  if (sdg === '7') {
    playSampleSDG7(note.fullNoteName, duration);
    return;
  }

  if (sdg === '10') {
    playSampleSDG10(note.fullNoteName, duration);
    return;
  }


  if (sdg === '15') {
    playSampleSDG15(note.fullNoteName, duration);
    return;
  }

  playNote(note.frequency, duration, 0.3, sdg);
}

export function playValueChord(notesData, duration = 0.5) {
  notesData.forEach(n => {
    playValueNote(n.value, n.sdg, duration);
  });
}

export function getTimbreName(sdg) {
  return SDG_TIMBRES[sdg]?.name || 'Default';
}

export function getTimbreDescription(sdg) {
  return SDG_TIMBRES[sdg]?.description || 'Default timbre';
}

export function getAllTimbres() {
  return Object.entries(SDG_TIMBRES).map(([sdg, timbre]) => ({
    sdg,
    name: timbre.name,
    description: timbre.description
  }));
}

export function hasTimbre(sdg) {
  return SDG_TIMBRES.hasOwnProperty(sdg);
}
