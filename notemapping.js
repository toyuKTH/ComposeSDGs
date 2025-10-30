// ========== 音符映射模块 (0-100 → 10个音符) ==========

/**
 * 将 0-100 的数值映射到音符
 * @param {number} value - SDG 分数 (0-100)
 * @returns {Object} - 包含音符信息的对象
 */
export function valueToNote(value) {
  // 确保值在 0-100 范围内
  const clampedValue = Math.max(0, Math.min(100, value));
  
  let noteName, frequency, octave, positionClass, needsLedgerLine;
  
  if (clampedValue <= 10) {
    // 0-10: C (下加一线)
    noteName = 'C';
    frequency = 261.63; // C4
    octave = 4;
    positionClass = 'note-value-0-10';
    needsLedgerLine = 'below'; // 需要下加线
  } else if (clampedValue <= 20) {
    // 11-20: D
    noteName = 'D';
    frequency = 293.66; // D4
    octave = 4;
    positionClass = 'note-value-11-20';
    needsLedgerLine = false;
  } else if (clampedValue <= 30) {
    // 21-30: E (第5线)
    noteName = 'E';
    frequency = 329.63; // E4
    octave = 4;
    positionClass = 'note-value-21-30';
    needsLedgerLine = false;
  } else if (clampedValue <= 40) {
    // 31-40: F
    noteName = 'F';
    frequency = 349.23; // F4
    octave = 4;
    positionClass = 'note-value-31-40';
    needsLedgerLine = false;
  } else if (clampedValue <= 50) {
    // 41-50: G (第4线)
    noteName = 'G';
    frequency = 392.00; // G4
    octave = 4;
    positionClass = 'note-value-41-50';
    needsLedgerLine = false;
  } else if (clampedValue <= 60) {
    // 51-60: A
    noteName = 'A';
    frequency = 440.00; // A4 (标准音)
    octave = 4;
    positionClass = 'note-value-51-60';
    needsLedgerLine = false;
  } else if (clampedValue <= 70) {
    // 61-70: B (第3线，中间线)
    noteName = 'B';
    frequency = 493.88; // B4
    octave = 4;
    positionClass = 'note-value-61-70';
    needsLedgerLine = false;
  } else if (clampedValue <= 80) {
    // 71-80: C' (高八度)
    noteName = 'C';
    frequency = 523.25; // C5
    octave = 5;
    positionClass = 'note-value-71-80';
    needsLedgerLine = false;
  } else if (clampedValue <= 90) {
    // 81-90: D' (第2线)
    noteName = 'D';
    frequency = 587.33; // D5
    octave = 5;
    positionClass = 'note-value-81-90';
    needsLedgerLine = false;
  } else {
    // 91-100: E'
    noteName = 'E';
    frequency = 659.25; // E5
    octave = 5;
    positionClass = 'note-value-91-100';
    needsLedgerLine = false;
  }
  
  return {
    noteName,           // 音符名称，如 'C', 'D', 'E'
    frequency,          // 频率 (Hz)
    octave,             // 八度，4 或 5
    fullNoteName: `${noteName}${octave}`, // 完整名称，如 'C4', 'E5'
    positionClass,      // CSS类名，用于定位
    needsLedgerLine,    // 是否需要加线 ('below', 'above', 或 false)
    value: clampedValue // 原始数值
  };
}

/**
 * 批量转换多个 SDG 值到音符
 * @param {Object} sdgValues - SDG值对象，如 {sdg1: 45, sdg3: 67}
 * @returns {Array} - 音符信息数组
 */
export function sdgValuesToNotes(sdgValues) {
  const notes = [];
  
  for (const [sdg, value] of Object.entries(sdgValues)) {
    if (typeof value === 'number') {
      const noteInfo = valueToNote(value);
      noteInfo.sdg = sdg; // 添加 SDG 标识
      notes.push(noteInfo);
    }
  }
  
  // 按音高排序（从低到高）
  notes.sort((a, b) => a.frequency - b.frequency);
  
  return notes;
}

/**
 * 获取音符之间的音程
 * @param {number} value1 - 第一个值
 * @param {number} value2 - 第二个值
 * @returns {number} - 半音数差异
 */
export function getInterval(value1, value2) {
  const note1 = valueToNote(value1);
  const note2 = valueToNote(value2);
  
  // 计算半音数差异（简化版）
  const semitones = Math.round(12 * Math.log2(note2.frequency / note1.frequency));
  return semitones;
}

/**
 * 判断是否为和谐音程
 * @param {number} value1 - 第一个值
 * @param {number} value2 - 第二个值  
 * @returns {boolean} - 是否和谐
 */
export function isHarmonic(value1, value2) {
  const interval = Math.abs(getInterval(value1, value2));
  // 和谐音程：纯一度(0)、大三度(4)、纯四度(5)、纯五度(7)、大六度(9)、纯八度(12)
  const harmonicIntervals = [0, 3, 4, 5, 7, 8, 9, 12];
  return harmonicIntervals.includes(interval);
}

// ========== 🎵 5个SDG的音色配置 ==========

/**
 * SDG 音色映射表
 * SDG 1 (无贫穷): 温暖的钢琴音色
 * SDG 3 (良好健康): 明亮的木琴音色
 * SDG 7 (清洁能源): 科技感的合成音色
 * SDG 13 (气候行动): 空灵的长笛音色
 * SDG 16 (和平正义): 庄重的弦乐音色
 */
const SDG_TIMBRES = {
  '1': {
    name: '钢琴 (Piano)',
    oscillatorType: 'triangle',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
    harmonics: [1, 0.3, 0.1]  // 基频 + 泛音
  },
  '3': {
    name: '木琴 (Xylophone)',
    oscillatorType: 'sine',
    attack: 0.001,
    decay: 0.05,
    sustain: 0.3,
    release: 0.1,
    harmonics: [1, 0.5, 0.2, 0.1]
  },
  '7': {
    name: '合成器 (Synth)',
    oscillatorType: 'sawtooth',
    attack: 0.05,
    decay: 0.1,
    sustain: 0.6,
    release: 0.2,
    harmonics: [1, 0.4, 0.3]
  },
  '13': {
    name: '长笛 (Flute)',
    oscillatorType: 'sine',
    attack: 0.08,
    decay: 0.05,
    sustain: 0.8,
    release: 0.2,
    harmonics: [1, 0.2, 0.05]
  },
  '16': {
    name: '弦乐 (Strings)',
    oscillatorType: 'sawtooth',
    attack: 0.15,
    decay: 0.1,
    sustain: 0.9,
    release: 0.4,
    harmonics: [1, 0.6, 0.4, 0.2]
  }
};

// ========== 音频播放支持 (Web Audio API) ==========

let audioContext = null;

/**
 * 初始化音频上下文
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * 播放单个音符（带音色）
 * @param {number} frequency - 频率 (Hz)
 * @param {number} duration - 持续时间（秒）
 * @param {number} volume - 音量 (0-1)
 * @param {string} sdg - SDG编号 ('1', '3', '7', '13', '16')
 */
export function playNote(frequency, duration = 0.5, volume = 0.3, sdg = '1') {
  const ctx = getAudioContext();
  const timbre = SDG_TIMBRES[sdg] || SDG_TIMBRES['1'];
  
  // 创建增益节点
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  
  // 根据音色配置创建多个振荡器（泛音）
  timbre.harmonics.forEach((harmonicVolume, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // 设置振荡器类型和频率
    oscillator.type = timbre.oscillatorType;
    oscillator.frequency.setValueAtTime(frequency * (index + 1), ctx.currentTime);
    
    // ADSR 包络
    const attackTime = timbre.attack;
    const decayTime = timbre.decay;
    const sustainLevel = timbre.sustain * volume * harmonicVolume;
    const releaseTime = timbre.release;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * harmonicVolume, ctx.currentTime + attackTime); // Attack
    gainNode.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.01), ctx.currentTime + attackTime + decayTime); // Decay
    gainNode.gain.setValueAtTime(sustainLevel, ctx.currentTime + duration - releaseTime); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration); // Release
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  });
}

/**
 * 播放和弦（多个音符同时，可以有不同音色）
 * @param {Array} noteData - 音符数据数组 [{frequency, sdg}, ...]
 * @param {number} duration - 持续时间（秒）
 * @param {number} volume - 音量 (0-1)
 */
export function playChord(noteData, duration = 0.5, volume = 0.3) {
  // 降低单个音符音量以避免削波
  const noteVolume = volume / Math.sqrt(noteData.length);
  
  noteData.forEach(note => {
    playNote(note.frequency, duration, noteVolume, note.sdg);
  });
}

/**
 * 根据值和SDG播放音符
 * @param {number} value - SDG 分数
 * @param {string} sdg - SDG编号
 * @param {number} duration - 持续时间（秒）
 */
export function playValueNote(value, sdg = '1', duration = 0.5) {
  const note = valueToNote(value);
  playNote(note.frequency, duration, 0.3, sdg);
}

/**
 * 播放多个值组成的和弦（带SDG信息）
 * @param {Array} notesData - 音符数据 [{value, sdg}, ...]
 * @param {number} duration - 持续时间（秒）
 */
export function playValueChord(notesData, duration = 0.5) {
  const chordData = notesData.map(note => ({
    frequency: valueToNote(note.value).frequency,
    sdg: note.sdg
  }));
  playChord(chordData, duration);
}

/**
 * 获取 SDG 的音色名称
 * @param {string} sdg - SDG编号
 * @returns {string} - 音色名称
 */
export function getTimbreName(sdg) {
  return SDG_TIMBRES[sdg]?.name || '钢琴';
}