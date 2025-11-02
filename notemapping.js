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
    console.log(`🎼 调式切换为: ${mode === 'major' ? 'C大调' : 'C小调'}`);
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
 * @param {string} mode - 调式 ('major' 或 'minor')，默认使用全局调式
 * @returns {Object} - 包含音符信息的对象
 */
export function valueToNote(value, mode = null) {
  // 使用传入的调式或全局调式
  const useMode = mode || currentMode;

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
    // 21-30: E (大调) 或 Eb (小调) - 3级音
    if (useMode === 'minor') {
      noteName = 'Eb';
      frequency = 311.13; // Eb4 (降3级音)
    } else {
      noteName = 'E';
      frequency = 329.63; // E4
    }
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
    // 51-60: A (大调) 或 Ab (小调) - 6级音
    if (useMode === 'minor') {
      noteName = 'Ab';
      frequency = 415.30; // Ab4 (降6级音)
    } else {
      noteName = 'A';
      frequency = 440.00; // A4 (标准音)
    }
    octave = 4;
    positionClass = 'note-value-51-60';
    needsLedgerLine = false;
  } else if (clampedValue <= 70) {
    // 61-70: B (大调) 或 Bb (小调) - 7级音
    if (useMode === 'minor') {
      noteName = 'Bb';
      frequency = 466.16; // Bb4 (降7级音)
    } else {
      noteName = 'B';
      frequency = 493.88; // B4
    }
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
    // 91-100: E' (大调) 或 Eb' (小调)
    if (useMode === 'minor') {
      noteName = 'Eb';
      frequency = 622.25; // Eb5 (降3级音，高八度)
    } else {
      noteName = 'E';
      frequency = 659.25; // E5
    }
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
    value: clampedValue, // 原始数值
    mode: useMode       // 当前使用的调式
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
  // ===== 1. 纯正基音（干净、中性） =====
  '1': {
    name: 'Pure Sine',
    oscillatorType: 'sine',
    harmonics: [1, 0.3, 0.1],
    attack: 0.05,
    decay: 0.1,
    sustain: 0.9,
    release: 0.3,
    filterType: 'lowpass',
    filterFrequency: 1200,
    gain: 0.9,
    description: '纯净正弦波，干净中性'
  },

  // ===== 2. 粗糙明亮（带能量） =====
  '2': {
    name: 'Bright Saw',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.5, 0.3, 0.15],
    attack: 0.02,
    decay: 0.12,
    sustain: 0.7,
    release: 0.25,
    filterType: 'highpass',
    filterFrequency: 1500,
    gain: 0.85,
    description: '明亮粗糙的锯齿音'
  },

  // ===== 3. 金属锐利（电子风） =====
  '3': {
    name: 'Metal Edge',
    oscillatorType: 'square',
    harmonics: [1, 0.4, 0.2, 0.1],
    attack: 0.005,
    decay: 0.15,
    sustain: 0.6,
    release: 0.2,
    filterType: 'bandpass',
    filterFrequency: 2500,
    gain: 0.9,
    description: '锐利金属方波'
  },

  // ===== 4. 短促打击（清脆瞬态） =====
  '4': {
    name: 'Perc Click',
    oscillatorType: 'triangle',
    harmonics: [1, 0.3, 0.15],
    attack: 0.001,
    decay: 0.1,
    sustain: 0.1,
    release: 0.05,
    filterType: 'highpass',
    filterFrequency: 2000,
    gain: 0.9,
    description: '清脆短促的打击感'
  },

  // ===== 5. 厚重低沉（包裹感强） =====
  '5': {
    name: 'Deep Bass',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.6, 0.4, 0.2],
    attack: 0.05,
    decay: 0.1,
    sustain: 0.9,
    release: 0.3,
    filterType: 'lowpass',
    filterFrequency: 800,
    gain: 0.95,
    description: '低沉厚重的底音'
  },

  // ===== 6. 温暖柔和（氛围感） =====
  '6': {
    name: 'Warm Pad',
    oscillatorType: 'sine',
    harmonics: [1, 0.2, 0.1, 0.05],
    attack: 0.3,
    decay: 0.4,
    sustain: 0.8,
    release: 1.0,
    filterType: 'lowpass',
    filterFrequency: 600,
    gain: 0.8,
    description: '温暖柔和的长音氛围'
  },

  // ===== 7. 尖锐噪声（冲击感） =====
  '7': {
    name: 'Noise Hit',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.8, 0.6, 0.4, 0.3],
    attack: 0.001,
    decay: 0.05,
    sustain: 0.0,
    release: 0.1,
    filterType: 'highpass',
    filterFrequency: 3000,
    gain: 0.7,
    description: '尖锐的噪声冲击音'
  },

  // ===== 8. 复古芯片（8-bit风） =====
  '8': {
    name: 'Chip Tune',
    oscillatorType: 'square',
    harmonics: [1, 0.1],
    attack: 0.01,
    decay: 0.05,
    sustain: 0.9,
    release: 0.1,
    filterType: 'bandpass',
    filterFrequency: 1800,
    gain: 0.85,
    description: '复古游戏芯片音色'
  },

  // ===== 9. 弹性合成（弹跳感） =====
  '9': {
    name: 'Bouncy Synth',
    oscillatorType: 'triangle',
    harmonics: [1, 0.4, 0.2],
    attack: 0.02,
    decay: 0.2,
    sustain: 0.3,
    release: 0.15,
    filterType: 'lowpass',
    filterFrequency: 1500,
    gain: 0.9,
    description: '弹性跳跃的合成音'
  },

  // ===== 10. 金属共鸣（钟声感） =====
  '10': {
    name: 'Metal Resonant',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.3, 0.6, 0.4, 0.2],
    attack: 0.1,
    decay: 0.8,
    sustain: 0.2,
    release: 1.5,
    filterType: 'bandpass',
    filterFrequency: 1200,
    gain: 0.75,
    description: '金属共鸣钟声效果'
  },

  // ===== 11. 水下模糊（朦胧感） =====
  '11': {
    name: 'Underwater',
    oscillatorType: 'sine',
    harmonics: [1, 0.15, 0.3, 0.1],
    attack: 0.2,
    decay: 0.3,
    sustain: 0.7,
    release: 0.8,
    filterType: 'lowpass',
    filterFrequency: 400,
    gain: 0.8,
    description: '水下朦胧模糊音色'
  },

  // ===== 12. 脉冲节奏（规律感） =====
  '12': {
    name: 'Pulse Rhythm',
    oscillatorType: 'square',
    harmonics: [1, 0.5],
    attack: 0.005,
    decay: 0.08,
    sustain: 0.1,
    release: 0.05,
    filterType: 'highpass',
    filterFrequency: 1000,
    gain: 0.9,
    description: '脉冲节奏型音色'
  },

  // ===== 13. 风声氛围（自然感） =====
  '13': {
    name: 'Wind Atmosphere',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.1, 0.05, 0.02],
    attack: 0.5,
    decay: 1.0,
    sustain: 0.3,
    release: 2.0,
    filterType: 'lowpass',
    filterFrequency: 800,
    gain: 0.6,
    description: '风声般的氛围音效'
  },

  // ===== 14. 数字故障（Glitch感） =====
  '14': {
    name: 'Digital Glitch',
    oscillatorType: 'square',
    harmonics: [1, 0.7, 0.5, 0.3, 0.1],
    attack: 0.001,
    decay: 0.02,
    sustain: 0.0,
    release: 0.01,
    filterType: 'highpass',
    filterFrequency: 2500,
    gain: 0.8,
    description: '数字故障干扰音'
  },

  // ===== 15. 柔和铃音（梦幻感） =====
  '15': {
    name: 'Soft Bell',
    oscillatorType: 'triangle',
    harmonics: [1, 0.6, 0.4, 0.3, 0.2],
    attack: 0.05,
    decay: 0.5,
    sustain: 0.1,
    release: 1.0,
    filterType: 'bandpass',
    filterFrequency: 2000,
    gain: 0.7,
    description: '柔和梦幻的铃音'
  },

  // ===== 16. 工业机械（粗糙感） =====
  '16': {
    name: 'Industrial',
    oscillatorType: 'sawtooth',
    harmonics: [1, 0.8, 0.6, 0.7, 0.4],
    attack: 0.01,
    decay: 0.3,
    sustain: 0.4,
    release: 0.4,
    filterType: 'lowpass',
    filterFrequency: 900,
    gain: 0.95,
    description: '工业机械粗糙音色'
  },

  // ===== 17. 太空科幻（未来感） =====
  '17': {
    name: 'Sci-Fi',
    oscillatorType: 'sine',
    harmonics: [1, 0.4, 0.8, 0.3],
    attack: 0.1,
    decay: 0.2,
    sustain: 0.6,
    release: 0.7,
    filterType: 'bandpass',
    filterFrequency: 1500,
    gain: 0.8,
    description: '太空科幻未来音色'
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

    // ADSR 包络 - 修复时间顺序问题
    const attackTime = timbre.attack;
    const decayTime = timbre.decay;
    const sustainLevel = timbre.sustain * volume * harmonicVolume;
    const releaseTime = timbre.release;

    // 确保时间点按顺序递增
    const attackEnd = ctx.currentTime + attackTime;
    const decayEnd = attackEnd + decayTime;
    const sustainEnd = Math.max(decayEnd, ctx.currentTime + duration - releaseTime);
    const releaseEnd = ctx.currentTime + duration;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * harmonicVolume, attackEnd); // Attack
    gainNode.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.01), decayEnd); // Decay

    // 只有当有足够时间时才设置Sustain
    if (sustainEnd > decayEnd) {
      gainNode.gain.setValueAtTime(sustainLevel, sustainEnd); // Sustain
    }

    gainNode.gain.exponentialRampToValueAtTime(0.01, releaseEnd); // Release


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
  console.log(' playValueNote 调用:', {
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
  console.log(' playValueChord 调用 (和弦):', {
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