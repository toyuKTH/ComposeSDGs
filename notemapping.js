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

// ========== 🎵 17个SDG的完整音色配置 ==========

/**
 * SDG 音色映射表 (完整版 - 所有17个SDG)
 * 
 * SDG 1  (无贫穷): 温暖的钢琴音色 - 代表温暖与希望
 * SDG 2  (零饥饿): 饱满的大提琴音色 - 代表丰盛与滋养
 * SDG 3  (良好健康): 明亮的木琴音色 - 代表活力与生机
 * SDG 4  (优质教育): 清晰的钟琴音色 - 代表智慧与启发
 * SDG 5  (性别平等): 和谐的竖琴音色 - 代表平衡与优雅
 * SDG 6  (清洁饮水): 流动的马林巴音色 - 代表水的流动性
 * SDG 7  (清洁能源): 科技感的合成音色 - 代表现代与创新
 * SDG 8  (体面工作): 稳定的管风琴音色 - 代表坚实与发展
 * SDG 9  (产业创新): 电子合成器音色 - 代表科技与进步
 * SDG 10 (减少不平等): 融合的混合音色 - 代表包容与多元
 * SDG 11 (可持续城市): 都市铜管音色 - 代表城市活力
 * SDG 12 (负责任消费): 节制的古筝音色 - 代表平衡消费
 * SDG 13 (气候行动): 空灵的长笛音色 - 代表大气与环境
 * SDG 14 (水下生物): 波浪般的振音器 - 代表海洋的波动
 * SDG 15 (陆地生物): 自然的木管音色 - 代表森林与大地
 * SDG 16 (和平正义): 庄重的弦乐音色 - 代表公正与稳定
 * SDG 17 (伙伴关系): 丰富的交响音色 - 代表合作与融合
 */
const SDG_TIMBRES = {
  '1': {
    name: '钢琴 (Piano)',
    oscillatorType: 'triangle',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
    harmonics: [1, 0.3, 0.1],
    description: '温暖的钢琴 - 希望与温暖'
  },
  '2': {
    name: '大提琴 (Cello)',
    oscillatorType: 'sawtooth',
    attack: 0.08,
    decay: 0.15,
    sustain: 0.85,
    release: 0.4,
    harmonics: [1, 0.5, 0.3, 0.15],
    description: '饱满的大提琴 - 丰盛与滋养'
  },
  '3': {
    name: '木琴 (Xylophone)',
    oscillatorType: 'sine',
    attack: 0.001,
    decay: 0.05,
    sustain: 0.3,
    release: 0.1,
    harmonics: [1, 0.5, 0.2, 0.1],
    description: '明亮的木琴 - 活力与健康'
  },
  '4': {
    name: '钟琴 (Glockenspiel)',
    oscillatorType: 'sine',
    attack: 0.002,
    decay: 0.08,
    sustain: 0.4,
    release: 0.15,
    harmonics: [1, 0.6, 0.3, 0.2, 0.1],
    description: '清晰的钟琴 - 智慧与启发'
  },
  '5': {
    name: '竖琴 (Harp)',
    oscillatorType: 'triangle',
    attack: 0.005,
    decay: 0.2,
    sustain: 0.5,
    release: 0.25,
    harmonics: [1, 0.4, 0.2, 0.05],
    description: '优雅的竖琴 - 平衡与和谐'
  },
  '6': {
    name: '马林巴 (Marimba)',
    oscillatorType: 'sine',
    attack: 0.003,
    decay: 0.1,
    sustain: 0.4,
    release: 0.2,
    harmonics: [1, 0.45, 0.25, 0.1],
    description: '流动的马林巴 - 水的灵动'
  },
  '7': {
    name: '合成器 (Synth)',
    oscillatorType: 'sawtooth',
    attack: 0.05,
    decay: 0.1,
    sustain: 0.6,
    release: 0.2,
    harmonics: [1, 0.4, 0.3],
    description: '科技合成器 - 能源与创新'
  },
  '8': {
    name: '管风琴 (Organ)',
    oscillatorType: 'square',
    attack: 0.02,
    decay: 0.05,
    sustain: 0.9,
    release: 0.3,
    harmonics: [1, 0.7, 0.5, 0.3],
    description: '稳固的管风琴 - 工作与增长'
  },
  '9': {
    name: '电子合成器 (Electronic Synth)',
    oscillatorType: 'square',
    attack: 0.03,
    decay: 0.08,
    sustain: 0.65,
    release: 0.25,
    harmonics: [1, 0.5, 0.4, 0.2],
    description: '现代电子音 - 创新与基建'
  },
  '10': {
    name: '混合音色 (Blended)',
    oscillatorType: 'triangle',
    attack: 0.04,
    decay: 0.12,
    sustain: 0.75,
    release: 0.3,
    harmonics: [1, 0.45, 0.35, 0.2, 0.1],
    description: '融合音色 - 包容与平等'
  },
  '11': {
    name: '铜管 (Brass)',
    oscillatorType: 'sawtooth',
    attack: 0.06,
    decay: 0.08,
    sustain: 0.8,
    release: 0.2,
    harmonics: [1, 0.6, 0.4, 0.25],
    description: '明亮铜管 - 城市活力'
  },
  '12': {
    name: '古筝 (Guzheng)',
    oscillatorType: 'triangle',
    attack: 0.01,
    decay: 0.15,
    sustain: 0.55,
    release: 0.35,
    harmonics: [1, 0.35, 0.15, 0.08],
    description: '节制古筝 - 负责任消费'
  },
  '13': {
    name: '长笛 (Flute)',
    oscillatorType: 'sine',
    attack: 0.08,
    decay: 0.05,
    sustain: 0.8,
    release: 0.2,
    harmonics: [1, 0.2, 0.05],
    description: '空灵长笛 - 气候与大气'
  },
  '14': {
    name: '振音器 (Vibraphone)',
    oscillatorType: 'sine',
    attack: 0.004,
    decay: 0.12,
    sustain: 0.5,
    release: 0.3,
    harmonics: [1, 0.55, 0.3, 0.15, 0.05],
    description: '波动振音 - 海洋生态'
  },
  '15': {
    name: '木管 (Woodwind)',
    oscillatorType: 'triangle',
    attack: 0.06,
    decay: 0.1,
    sustain: 0.75,
    release: 0.25,
    harmonics: [1, 0.4, 0.25, 0.1],
    description: '自然木管 - 陆地生态'
  },
  '16': {
    name: '弦乐 (Strings)',
    oscillatorType: 'sawtooth',
    attack: 0.15,
    decay: 0.1,
    sustain: 0.9,
    release: 0.4,
    harmonics: [1, 0.6, 0.4, 0.2],
    description: '庄重弦乐 - 和平正义'
  },
  '17': {
    name: '交响乐 (Orchestra)',
    oscillatorType: 'sawtooth',
    attack: 0.1,
    decay: 0.12,
    sustain: 0.85,
    release: 0.35,
    harmonics: [1, 0.5, 0.4, 0.3, 0.15],
    description: '交响合奏 - 全球伙伴'
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
    
    // 确保音频上下文已启动
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
  return audioContext;
}

/**
 * 预热音频上下文（在第一次播放前调用）
 */
export function warmupAudioContext() {
  const ctx = getAudioContext();
  
  // 创建一个静音的短音符来"预热"音频系统
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime); // 静音
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.001); // 保持很短，1毫秒
  
  console.log('🎵 Audio context warmed up');
}

/**
 * 播放单个音符（带音色）
 * @param {number} frequency - 频率 (Hz)
 * @param {number} duration - 持续时间（秒）
 * @param {number} volume - 音量 (0-1)
 * @param {string} sdg - SDG编号 ('1'-'17')
 */
export function playNote(frequency, duration = 0.5, volume = 0.3, sdg = '1') {
  const ctx = getAudioContext();
  const timbre = SDG_TIMBRES[sdg] || SDG_TIMBRES['1'];
  
  // 🎵 调试日志
  console.log('🎵 播放音符:', {
    sdg: sdg,
    sdgType: typeof sdg,
    timbreName: timbre.name,
    timbreDescription: timbre.description,
    frequency: frequency.toFixed(2) + ' Hz',
    oscillatorType: timbre.oscillatorType,
    foundTimbre: SDG_TIMBRES[sdg] ? '✓ 找到音色' : '✗ 使用默认音色'
  });
  
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
  console.log('🎼 playValueNote 调用:', {
    value: value,
    sdg: sdg,
    sdgType: typeof sdg,
    duration: duration
  });
  
  const note = valueToNote(value);
  playNote(note.frequency, duration, 0.3, sdg);
}

/**
 * 播放多个值组成的和弦（带SDG信息）
 * @param {Array} notesData - 音符数据 [{value, sdg}, ...]
 * @param {number} duration - 持续时间（秒）
 */
export function playValueChord(notesData, duration = 0.5) {
  console.log('🎹 playValueChord 调用 (和弦):', {
    noteCount: notesData.length,
    notes: notesData.map(n => ({
      value: n.value,
      sdg: n.sdg,
      sdgType: typeof n.sdg
    }))
  });
  
  const chordData = notesData.map(note => ({
    frequency: valueToNote(note.value).frequency,
    sdg: note.sdg
  }));
  playChord(chordData, duration);
}

/**
 * 获取 SDG 的音色名称
 * @param {string} sdg - SDG编号 ('1'-'17')
 * @returns {string} - 音色名称
 */
export function getTimbreName(sdg) {
  return SDG_TIMBRES[sdg]?.name || '钢琴';
}

/**
 * 获取 SDG 的音色描述
 * @param {string} sdg - SDG编号 ('1'-'17')
 * @returns {string} - 音色描述
 */
export function getTimbreDescription(sdg) {
  return SDG_TIMBRES[sdg]?.description || '温暖的钢琴 - 希望与温暖';
}

/**
 * 获取所有可用的 SDG 音色列表
 * @returns {Array} - SDG音色信息数组
 */
export function getAllTimbres() {
  return Object.entries(SDG_TIMBRES).map(([sdg, timbre]) => ({
    sdg,
    name: timbre.name,
    description: timbre.description
  }));
}

/**
 * 检查 SDG 是否有定义的音色
 * @param {string} sdg - SDG编号
 * @returns {boolean} - 是否有定义
 */
export function hasTimbre(sdg) {
  return SDG_TIMBRES.hasOwnProperty(sdg);
}