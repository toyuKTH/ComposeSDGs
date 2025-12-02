// =============== SDG Map + Floating Card + Composer Toggle ===============

// ------------------- 导入 -------------------
import { setupYearControl, getCurrentYear } from './yearControl.js';
import { sdgColors, sdgNames, getSDGIndicator, formatIndicatorHTML, formatIndicatorText } from './sdgfile.js';
import { valueToNote, playValueNote, playValueChord, setMode, getMode } from './notemapping.js';

setupYearControl(); // 初始化年份控制

// ------------------- 只显示5个SDG -------------------
const selectedSDGList = [1, 6, 7, 10, 15];

// ------------------- 全局状态 -------------------
let currentSelectedIso = null;
let currentSelectedName = null;
let notePositions = []; // 存储已添加的音符位置

// ------------------- 播放控制全局变量 -------------------
let isPlaying = false;
let playIntervalId = null;

// ------------------- 拖拽状态变量 -------------------
let draggedElement = null;
let draggedPosition = null;

// ------------------- 获取下一个可用位置 -------------------
function getNextAvailablePosition() {
  // 找出所有已占用的位置
  const occupiedPositions = notePositions.map(n => n.position);

  // 从1到8找第一个未占用的位置
  for (let i = 1; i <= 8; i++) {
    if (!occupiedPositions.includes(i)) {
      return i;
    }
  }

  return null; // 没有可用位置
}

// ------------------- 检查是否还有空位 -------------------
function hasAvailableSpace() {
  return notePositions.length < 8;
}

// ------------------- 渲染 SDG 选择区（带试听按钮）-------------------
function renderSDGCheckboxes() {
  const container = document.getElementById("sdg_checkbox_list");
  if (!container) return;
  container.innerHTML = "";

  selectedSDGList.forEach(i => {
    // 🎵 创建包装容器，包含 label 和试听按钮
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "6px";

    const label = document.createElement("label");
    label.classList.add("sdg-label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";
    label.style.padding = "6px 10px";
    label.style.borderRadius = "6px";
    label.style.cursor = "pointer";
    label.style.transition = "background-color 0.2s";
    label.style.color = sdgColors[i.toString()] || "#ccc";
    label.style.flex = "1"; // 让 label 占据剩余空间

    const dot = document.createElement("span");
    dot.style.width = "12px";
    dot.style.height = "12px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = sdgColors[i.toString()] || "#999";
    dot.style.flexShrink = "0";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = i;
    checkbox.style.marginRight = "4px";

    label.appendChild(checkbox);
    label.appendChild(dot);
    label.append(`SDG ${i}: ${sdgNames[i.toString()] || ""}`);

    //  添加指标信息 hover tooltip
    const indicatorInfo = getSDGIndicator(i);
    if (indicatorInfo) {
      // label.title = formatIndicatorText(i);
      label.style.position = "relative";

      // 创建 tooltip 元素
      const tooltip = document.createElement("div");
      tooltip.className = "sdg-indicator-tooltip";
      tooltip.innerHTML = formatIndicatorHTML(i);
      tooltip.style.display = "none";

      // Hover 事件
      label.addEventListener("mouseenter", () => {
        tooltip.style.display = "block";
      });

      label.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });

      label.appendChild(tooltip);
    }

    // 🎵 创建试听按钮
    const previewBtn = document.createElement("button");
    previewBtn.className = "sdg-preview-btn";
    previewBtn.innerHTML = "♪"; // 音符符号
    previewBtn.title = "Preview sound (Middle C)";
    previewBtn.style.width = "32px";
    previewBtn.style.height = "32px";
    previewBtn.style.border = "none";
    previewBtn.style.borderRadius = "50%";
    previewBtn.style.backgroundColor = sdgColors[i.toString()] || "#667eea";
    previewBtn.style.color = "white";
    previewBtn.style.fontSize = "18px";
    previewBtn.style.cursor = "pointer";
    previewBtn.style.transition = "all 0.2s ease";
    previewBtn.style.flexShrink = "0";
    previewBtn.style.display = "flex";
    previewBtn.style.alignItems = "center";
    previewBtn.style.justifyContent = "center";
    previewBtn.style.fontWeight = "bold";

    // 悬停效果
    previewBtn.addEventListener("mouseenter", () => {
      previewBtn.style.transform = "scale(1.1)";
      previewBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    });

    previewBtn.addEventListener("mouseleave", () => {
      previewBtn.style.transform = "scale(1)";
      previewBtn.style.boxShadow = "none";
    });

    // 点击播放中央C音高 (值为 50，对应 G4)
    previewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 播放中央C的音高 (值 50 对应 G4 在此系统中)
      // 🎵 预热音频上下文
      console.log(" 试听按钮被点击:", { originalSDG: i, convertedSDG: String(i), type: typeof String(i) });
      playValueNote(5, String(i), 1);

      // 视觉反馈：按下动画
      previewBtn.style.transform = "scale(0.9)";
      setTimeout(() => {
        previewBtn.style.transform = "scale(1.1)";
        setTimeout(() => {
          previewBtn.style.transform = "scale(1)";
        }, 100);
      }, 100);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(previewBtn);
    container.appendChild(wrapper);
  });

  // 限制最多选择 4 个 SDG
  container.addEventListener("change", (e) => {
    const checkboxes = container.querySelectorAll("input[type='checkbox']");
    const checked = Array.from(checkboxes).filter(cb => cb.checked);

    if (checked.length >= 4) {
      checkboxes.forEach(cb => {
        if (!cb.checked) cb.disabled = true;
      });
      if (checked.length === 4 && e.target.checked) {
        showMessage("You can select up to 4 SDGs.");
      }
    } else {
      checkboxes.forEach(cb => (cb.disabled = false));
    }

    // 如果当前有选中的国家，更新卡片显示
    if (currentSelectedIso && currentSelectedName) {
      const year = getCurrentYear();
      updateFloatingCardContent(currentSelectedIso, currentSelectedName, getSelectedSDGs(), year, sdgData);
    }
  });
}

function getSelectedSDGs() {
  const checkboxes = document.querySelectorAll("#sdg_checkbox_list input[type='checkbox']");
  const selected = [];
  checkboxes.forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected;
}
// ------------------- Mapbox 初始化 -------------------
mapboxgl.accessToken =
  "pk.eyJ1IjoidG95dWt0aCIsImEiOiJjbTdmeDRtZmswbW5yMmpxenN1cGdtMnN1In0.hzy7P7NJDCSYkc9gsunmyw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/toyukth/cmc38ef6801je01qxefcwfg00",
  //   projection: 'globe',
  zoom: 0.96,
  center: [105.7, 39.1],
  antialias: true
});
map.doubleClickZoom.disable();

// 固定高亮层：使用内置 country_boundaries，初始不过滤任何国家
map.on('load', () => {
  if (!map.getLayer('highlight-country')) {
    map.addLayer({
      id: 'highlight-country',
      type: 'line',
      source: 'composite',
      'source-layer': 'country_boundaries',
      paint: {
        'line-color': '#FFC107',
        'line-width': 2.5
      },
      filter: ['==', ['get', 'iso_3166_1_alpha_3'], ''] // 初始不选任何国家
    });
  }
});

// ------------------- 数据加载 -------------------
let sdgData = {};
fetch("./data/sdg_fake_data_mapped.json")
  .then(r => r.json())
  .then(json => {
    sdgData = json;
    console.log("SDG 数据加载成功");
  })
  .catch(err => console.error(" 加载 SDG 数据失败:", err));

// ------------------- 工具函数 -------------------
function showMessage(msg, duration = 2000) {
  let box = document.getElementById("message-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "message-box";
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.classList.remove("hidden");
  clearTimeout(box.hideTimer);
  box.hideTimer = setTimeout(() => box.classList.add("hidden"), duration);
}

function getSDGValue(data, iso, year, sdg) {
  const key = `sdg${sdg}`;
  if (!data || !data[iso] || !data[iso][year]) return null;
  const value = data[iso][year][key];
  return typeof value === "number" ? value : null;
}

// ------------------- 高亮逻辑（改为 filter 方式，自动拼接完整国界） -------------------
function highlightCountry(map, iso /*, feature */) {
  try {
    if (map.getLayer('highlight-country')) {
      map.setFilter('highlight-country', ['==', ['get', 'iso_3166_1_alpha_3'], iso]);
    }
  } catch (e) {
    console.error("设置高亮失败:", e);
  }
}

function unhighlightCountry(map /*, iso */) {
  try {
    if (map.getLayer('highlight-country')) {
      map.setFilter('highlight-country', ['==', ['get', 'iso_3166_1_alpha_3'], '']);
    }
  } catch (e) {
    console.error("取消高亮失败:", e);
  }
}

// ------------------- 浮动卡片逻辑 -------------------
function ensureFloatingCard() {
  let card = document.getElementById("floating-info-card");
  if (card) return card;

  card = document.createElement("div");
  card.id = "floating-info-card";
  card.className = "sdg-card hidden";
  card.innerHTML = `
    <div class="card-header">
      <span class="country-name"></span>
      <span class="close-btn" style="cursor: pointer; font-size: 24px; font-weight: bold;">&times;</span>
    </div>
    <div class="card-content">
      <div id="floating-sdg-items"></div>
      <button id="add-to-staff-btn" class="add-to-staff-btn">+ Add to Staff</button>
    </div>
  `;
  document.body.appendChild(card);

  return card;
}

function closeFloatingCard() {
  const card = document.getElementById("floating-info-card");
  if (card) {
    card.classList.add("hidden");
  }
  if (currentSelectedIso) {
    unhighlightCountry(map, currentSelectedIso);
    currentSelectedIso = null;
    currentSelectedName = null;
  }
}

function updateFloatingCardContent(iso, name, sdgList, year, data) {
  const card = ensureFloatingCard();
  const nameSpan = card.querySelector(".country-name");
  const container = card.querySelector("#floating-sdg-items");
  const addBtn = card.querySelector("#add-to-staff-btn");

  nameSpan.textContent = name || iso;
  container.innerHTML = "";

  sdgList.forEach(sdg => {
    const v = getSDGValue(data, iso, year, sdg);
    const display = typeof v === "number" ? v.toFixed(1) : "no value";

    // 获取音符信息
    let noteName = "𝄽"; // 休止符 (Unicode)
    if (typeof v === "number") {
      const noteInfo = valueToNote(v);
      noteName = noteInfo.fullNoteName;
    }

    // 获取SDG颜色
    const color = sdgColors[sdg] || "#667eea";

    const row = document.createElement("div");
    row.className = "sdg-item";
    row.innerHTML = `
  <span style="color: ${color}; font-weight: 700;">SDG ${sdg}</span>
  <span style="color: ${color}; font-weight: 700;">${display}</span>
  <span style="color: ${color}; font-weight: 700;">${noteName}</span>
  <button class="sdg-play-btn" style="
      background:${color};
      border:none;
      border-radius:50%;
      color:#fff;
      width:28px;
      height:28px;
      font-size:16px;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.15);
  ">♪</button>
`;

    const playBtn = row.querySelector('.sdg-play-btn');
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof v === "number") playValueNote(v, sdg, 0.5);
    });

    container.appendChild(row);
  });

  // 更新按钮状态
  const composerArea = document.getElementById("composer-area");
  const hasSpace = hasAvailableSpace();

  if (composerArea.classList.contains("hidden") || sdgList.length === 0) {
    addBtn.classList.add("disabled");
    addBtn.disabled = true;
    addBtn.textContent = composerArea.classList.contains("hidden")
      ? "Open Composer First"
      : "Select SDG First";
  } else if (!hasSpace) {
    addBtn.classList.add("disabled");
    addBtn.disabled = true;
    addBtn.textContent = "Staff is Full";
  } else {
    addBtn.classList.remove("disabled");
    addBtn.disabled = false;
    const availableCount = 8 - notePositions.length;
    addBtn.textContent = `+ Add to Staff (${availableCount} left)`;
  }

  // 重新绑定关闭按钮事件
  const closeBtn = card.querySelector(".close-btn");
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  newCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeFloatingCard();
  });

  // 重新绑定 Add 按钮事件
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);

  newAddBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!newAddBtn.disabled && sdgList.length > 0 && hasAvailableSpace()) {
      addNoteToStaff(name, sdgList, iso);

      // 再次更新按钮状态
      const stillHasSpace = hasAvailableSpace();
      if (!stillHasSpace) {
        newAddBtn.classList.add("disabled");
        newAddBtn.disabled = true;
        newAddBtn.textContent = "Staff is Full";
      } else {
        const availableCount = 8 - notePositions.length;
        newAddBtn.textContent = `+ Add to Staff (${availableCount} left)`;
      }
    }
  });
}

function positionFloatingCardAtPoint(point) {
  const card = ensureFloatingCard();
  const mapRect = document.getElementById("map").getBoundingClientRect();

  // 计算初始位置
  let x = point.x + mapRect.left;
  let y = point.y + mapRect.top;

  // 先设置位置以获取卡片尺寸
  card.style.position = "absolute";
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.style.transform = "translate(-20px, -20px)";
  card.classList.remove("hidden");

  // 获取卡片和视口尺寸
  const cardRect = card.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 检查右侧溢出
  if (cardRect.right > viewportWidth) {
    x = viewportWidth - cardRect.width - 20; // 左移，留20px边距
  }

  // 检查左侧溢出
  if (cardRect.left < 0) {
    x = 20; // 右移，留20px边距
  }

  // 检查底部溢出
  if (cardRect.bottom > viewportHeight) {
    y = viewportHeight - cardRect.height - 20; // 上移，留20px边距
  }

  // 检查顶部溢出
  if (cardRect.top < 60) { // 60px 是 header 高度
    y = 80; // 下移到 header 下方
  }

  // 应用调整后的位置
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
}

function hideFloatingCard() {
  const card = document.getElementById("floating-info-card");
  if (card) card.classList.add("hidden");
}

// ------------------- 创建4分音符或和弦（带音高映射）-------------------
function createQuarterNote(sdg, color, value) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "quarter-note chord-note";
  noteDiv.dataset.sdg = String(sdg);
  noteDiv.dataset.value = value;

  // 🎵 应用音高位置
  const noteInfo = valueToNote(value);
  noteDiv.classList.add(noteInfo.positionClass);

  // 如果是 C (0-10)，添加下加线
  if (noteInfo.needsLedgerLine === 'below') {
    const ledgerLine = document.createElement('div');
    ledgerLine.className = 'ledger-line-below ledger-line-c';
    noteDiv.appendChild(ledgerLine);
  }

  const noteHead = document.createElement("div");
  noteHead.className = "note-head";
  noteHead.style.backgroundColor = color;
  noteHead.style.color = color;

  const noteStem = document.createElement("div");
  noteStem.className = "note-stem";
  noteStem.style.backgroundColor = color;

  noteDiv.appendChild(noteHead);
  noteDiv.appendChild(noteStem);

  // 设置提示信息
  noteDiv.title = `SDG ${sdg}- Value:${value} (${noteInfo.fullNoteName})`;

  return noteDiv;
}

// ------------------- 添加音符到五线谱 -------------------
function addNoteToStaff(countryName, sdgList, iso) {
  const nextPos = getNextAvailablePosition();

  if (nextPos === null) {
    showMessage("Staff is full! Maximum 8 notes allowed.");
    return;
  }

  const container = document.getElementById("treble-container");
  const placeholder = container.querySelector(`.note-placeholder[data-position="${nextPos}"]`);

  if (!placeholder) {
    console.warn("位置不存在");
    return;
  }

  const year = getCurrentYear();

  // 创建音符组容器
  const noteGroup = document.createElement("div");
  noteGroup.className = "note-group";
  noteGroup.dataset.country = countryName;
  noteGroup.dataset.iso = iso;
  noteGroup.dataset.position = nextPos;
  noteGroup.title = `${countryName} - SDG ${sdgList.join(', ')}`;

  // 创建删除按钮
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-note-btn";
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeNoteFromStaff(noteGroup);
  });
  noteGroup.appendChild(deleteBtn);

  // 🎵 先检查所有 SDG 是否都有值
  const allValues = sdgList.map(sdg => getSDGValue(sdgData, iso, year, sdg));
  const hasAnyValue = allValues.some(val => val !== null);

  // 根据 SDG 数量创建单音符或和弦
  // 统一使用 .chord 容器以保持定位上下文一致
  const chord = document.createElement("div");
  chord.className = "chord";

  if (!hasAnyValue) {
    //  所有 SDG 都没有值 - 显示休止符
    const restSymbol = document.createElement("div");
    restSymbol.className = "rest-symbol";
    restSymbol.innerHTML = "𝄽"; // Unicode 休止符
    restSymbol.style.fontSize = "32px";
    restSymbol.style.color = "#868e96";
    restSymbol.style.position = "relative";
    restSymbol.style.top = "30px";
    restSymbol.dataset.isRest = "true";
    chord.appendChild(restSymbol);
  } else if (sdgList.length === 1) {
    // 单个音符
    const sdg = sdgList[0];
    const value = getSDGValue(sdgData, iso, year, sdg);
    if (value !== null) {
      const note = createQuarterNote(sdg, sdgColors[sdg] || "#667eea", value);
      chord.appendChild(note);
    }
  } else {
    // 和弦（多个音符堆叠）
    // 收集所有音符数据并按值排序（低音在下）
    const notesData = sdgList.map(sdg => ({
      sdg,
      value: getSDGValue(sdgData, iso, year, sdg),
      color: sdgColors[sdg] || "#667eea"
    })).filter(data => data.value !== null); // 过滤掉没有数据的

    // 按值排序（从低到高）
    notesData.sort((a, b) => a.value - b.value);

    //  检测相同音高的音符并分组
    const valueGroups = {};
    notesData.forEach(data => {
      const key = Math.floor(data.value / 10) * 10; // 按10分值区间分组（相同音符）
      if (!valueGroups[key]) valueGroups[key] = [];
      valueGroups[key].push(data);
    });

    notesData.forEach(data => {
      const note = createQuarterNote(data.sdg, data.color, data.value);

      //  如果同一音高有多个音符，左右对称错开显示
      const key = Math.floor(data.value / 10) * 10;
      const group = valueGroups[key];
      if (group.length > 1) {
        //  重叠显示但设置透明度，让用户能看出重叠
        note.style.opacity = '0.7';
      }

      chord.appendChild(note);
    });
  }

  noteGroup.appendChild(chord);

  // 添加国家标签
  const label = document.createElement("div");
  label.className = "note-label";
  label.textContent = countryName;
  noteGroup.appendChild(label);

  //  添加点击播放功能
  noteGroup.addEventListener("click", (e) => {
    // 如果点击的是删除按钮，不播放声音
    if (e.target.classList.contains('delete-note-btn')) return;

    // 获取所有音符数据
    const notes = noteGroup.querySelectorAll('.chord-note[data-value]');
    const notesData = Array.from(notes)
      .map(n => ({
        value: parseFloat(n.dataset.value),
        sdg: n.dataset.sdg
      }))
      .filter(n => !isNaN(n.value));

    if (notesData.length === 1) {
      // 单音符
      playValueNote(notesData[0].value, notesData[0].sdg, 0.4);
    } else if (notesData.length > 1) {
      // 和弦
      playValueChord(notesData, 0.4);
    }

    // 视觉反馈：短暂闪烁
    noteGroup.style.transform = 'scale(1.1)';
    setTimeout(() => {
      noteGroup.style.transform = '';
    }, 100);
  });

  // 替换占位符
  placeholder.replaceWith(noteGroup);
  notePositions.push({
    position: nextPos,
    country: countryName,
    iso: iso,
    sdgs: sdgList
  });

  showMessage(` Added ${countryName} to staff!`);
  console.log(` 添加音符: ${countryName} (${sdgList.length} SDG${sdgList.length > 1 ? 's' : ''}) 在位置 ${nextPos}`);
  console.log(` 当前占用: ${notePositions.length}/8`);

  // 🎵 启用拖拽功能
  enableDragging(noteGroup);
}

// ------------------- 删除音符 -------------------
function removeNoteFromStaff(noteGroup) {
  const actualPosition = parseInt(noteGroup.dataset.position);

  // 创建占位符（不显示数字）
  const placeholder = document.createElement("div");
  placeholder.className = "note-placeholder";
  placeholder.dataset.position = actualPosition;

  // 替换音符组
  noteGroup.replaceWith(placeholder);

  // 从数组中移除
  notePositions = notePositions.filter(n => n.position !== actualPosition);

  console.log(`删除音符位置 ${actualPosition}`);
  console.log(`当前占用: ${notePositions.length}/8`);

  //  更新卡片按钮状态
  if (currentSelectedIso && currentSelectedName) {
    const year = getCurrentYear();
    updateFloatingCardContent(currentSelectedIso, currentSelectedName, getSelectedSDGs(), year, sdgData);
  }

  showMessage(`Removed note from position ${actualPosition}`);
}

// ------------------- Composer Toggle 逻辑 -------------------
const startComposeBtn = document.getElementById("start-compose-btn");
const closeComposeBtn = document.getElementById("close-compose-btn");
const composerArea = document.getElementById("composer-area");
const mainArea = document.getElementById("main");

startComposeBtn.addEventListener("click", () => {
  composerArea.classList.remove("hidden");
  mainArea.classList.add("composer-open");

  if (currentSelectedIso && currentSelectedName) {
    const year = getCurrentYear();
    updateFloatingCardContent(currentSelectedIso, currentSelectedName, getSelectedSDGs(), year, sdgData);
  }

  setTimeout(() => {
    map.resize();
    console.log(" 地图大小已调整 (Composer 打开)");
  }, 350);
});

closeComposeBtn.addEventListener("click", () => {
  composerArea.classList.add("hidden");
  mainArea.classList.remove("composer-open");

  if (currentSelectedIso && currentSelectedName) {
    const year = getCurrentYear();
    updateFloatingCardContent(currentSelectedIso, currentSelectedName, getSelectedSDGs(), year, sdgData);
  }

  setTimeout(() => {
    map.resize();
    console.log(" 地图大小已调整 (Composer 关闭)");
  }, 350);
});

window.addEventListener('resize', () => {
  map.resize();
});

// ------------------- 地图点击逻辑 -------------------
map.on("click", e => {
  const selectedSDGs = getSelectedSDGs();
  if (selectedSDGs.length === 0) {
    showMessage("Please select at least one SDG.");
    return;
  }

  const features = map.queryRenderedFeatures(e.point);
  const countryFeature = features.find(f => f.sourceLayer === "country_boundaries");
  if (!countryFeature) return;

  const iso = countryFeature.properties.iso_3166_1_alpha_3;
  const name = countryFeature.properties.name_en || countryFeature.properties.name || iso;
  const year = getCurrentYear();

  // 再次点击同国取消
  if (currentSelectedIso === iso) {
    unhighlightCountry(map, iso);
    hideFloatingCard();
    currentSelectedIso = null;
    currentSelectedName = null;
    return;
  }

  // 取消上一个
  if (currentSelectedIso && currentSelectedIso !== iso) {
    unhighlightCountry(map, currentSelectedIso);
  }

  // 高亮当前（用 filter 方式，一次性拼出完整国界）
  currentSelectedIso = iso;
  currentSelectedName = name;
  highlightCountry(map, iso /*, countryFeature*/);
  updateFloatingCardContent(iso, name, selectedSDGs, year, sdgData);
  positionFloatingCardAtPoint(e.point);
});

// ------------------- Play Melody 播放/停止功能 -------------------
document.getElementById("play-melody").addEventListener("click", () => {
  const playButton = document.getElementById("play-melody");
  
  if (isPlaying) {
    // 停止播放
    stopPlayback();
    playButton.textContent = "▶ Play";
    isPlaying = false;
  } else {
    // 开始播放
    const noteGroups = document.querySelectorAll('.note-group');
    
    if (noteGroups.length === 0) {
      showMessage("No notes to play!");
      return;
    }
    
    playButton.textContent = "⏹ Stop";
    isPlaying = true;
    startLoopPlayback(noteGroups);
  }
});

// ------------------- 开始循环播放 -------------------
function startLoopPlayback(noteGroups) {
  const tempoInput = document.getElementById("tempo-input");
  const tempo = parseInt(tempoInput.value) || 86;
  const beatDuration = (60 / tempo) * 1000;
  const noteDuration = beatDuration / 1000;
  
  // 立即播放一次
  playMelodyOnce(noteGroups, beatDuration, noteDuration);
  
  // 计算整个旋律的总时长
  const totalDuration = noteGroups.length * beatDuration;
  
  // 设置循环
  playIntervalId = setInterval(() => {
    if (isPlaying) {
      playMelodyOnce(noteGroups, beatDuration, noteDuration);
    }
  }, totalDuration);
}

// ------------------- 播放一次完整旋律 -------------------
function playMelodyOnce(noteGroups, beatDuration, noteDuration) {
  // 清除所有之前的高亮
  noteGroups.forEach(g => g.classList.remove('playing'));
  
  noteGroups.forEach((group, index) => {
    setTimeout(() => {
      if (!isPlaying) return; // 如果已停止，不再播放
      
      // 添加高亮效果
      highlightNoteGroup(group);
      
      const notes = group.querySelectorAll('.chord-note[data-value]');
      const notesData = Array.from(notes)
        .map(n => ({
          value: parseFloat(n.dataset.value),
          sdg: n.dataset.sdg
        }))
        .filter(n => !isNaN(n.value));
      
      if (notesData.length === 1) {
        playValueNote(notesData[0].value, notesData[0].sdg, noteDuration);
      } else if (notesData.length > 1) {
        playValueChord(notesData, noteDuration);
      }
      
      // 音符播放完毕后移除高亮
      setTimeout(() => {
        removeHighlightNoteGroup(group);
      }, beatDuration * 0.9);
      
    }, index * beatDuration);
  });
}

// ------------------- 停止播放 -------------------
function stopPlayback() {
  if (playIntervalId) {
    clearInterval(playIntervalId);
    playIntervalId = null;
  }
  
  // 清除所有高亮
  const noteGroups = document.querySelectorAll('.note-group');
  noteGroups.forEach(g => {
    g.classList.remove('playing');
    g.style.transform = '';
  });
  
  showMessage("Playback stopped");
}

// ------------------- 高亮音符组 -------------------
function highlightNoteGroup(group) {
  group.classList.add('playing');
  group.style.transform = 'scale(1.15)';
  group.style.transition = 'transform 0.1s ease-out';
  console.log('Now playing: ' + group.dataset.country);
}

// ------------------- 移除音符组高亮 -------------------
function removeHighlightNoteGroup(group) {
  group.classList.remove('playing');
  group.style.transform = '';
}

// ------------------- Clear All -------------------
document.getElementById("clear-all").addEventListener("click", () => {
  // 先停止播放
  if (isPlaying) {
    stopPlayback();
    document.getElementById("play-melody").textContent = "▶ Play";
    isPlaying = false;
  }
  
  if (currentSelectedIso) {
    unhighlightCountry(map, currentSelectedIso);
    currentSelectedIso = null;
    currentSelectedName = null;
  }
  hideFloatingCard();

  // 清空五线谱
  const container = document.getElementById("treble-container");
  container.innerHTML = "";

  // 重新添加占位符（不显示数字）
  for (let i = 1; i <= 8; i++) {
    const placeholder = document.createElement("div");
    placeholder.className = "note-placeholder";
    placeholder.dataset.position = i;
    container.appendChild(placeholder);
  }

  notePositions = [];

  console.log(" 清空所有选择和音符");
  console.log(` 当前占用: 0/8`);
});

// ------------------- Shuffle 随机打乱 -------------------
document.getElementById("shuffle-notes").addEventListener("click", () => {
  const noteGroups = document.querySelectorAll('.note-group');

  if (noteGroups.length === 0) {
    showMessage("No notes to shuffle!");
    return;
  }

  if (noteGroups.length === 1) {
    showMessage("Need at least 2 notes to shuffle!");
    return;
  }

  // 先停止播放
  if (isPlaying) {
    stopPlayback();
    document.getElementById("play-melody").textContent = "▶ Play";
    isPlaying = false;
  }

  //  Fisher-Yates 随机打乱算法
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // 保存当前音符数据
  const currentNotes = notePositions.map(notePos => ({
    ...notePos
  }));

  // 随机打乱音符数据
  const shuffledNotes = shuffleArray(currentNotes);

  const container = document.getElementById("treble-container");

  // 添加淡出动画
  container.style.transition = "opacity 0.3s ease";
  container.style.opacity = "0";

  setTimeout(() => {
    // 清空容器
    container.innerHTML = "";

    // 重新创建所有位置（1-8）
    const allPositions = Array.from({ length: 8 }, (_, i) => i + 1);

    allPositions.forEach(position => {
      const shuffledIndex = position - 1;

      if (shuffledIndex < shuffledNotes.length) {
        // 这个位置有音符 - 重新创建音符
        const noteData = shuffledNotes[shuffledIndex];
        const year = getCurrentYear();

        // 创建新的音符组
        const noteGroup = document.createElement("div");
        noteGroup.className = "note-group";
        noteGroup.dataset.position = position;

        // 添加删除按钮
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-note-btn";
        deleteBtn.textContent = "×";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeNoteFromStaff(noteGroup);
        });
        noteGroup.appendChild(deleteBtn);

        // 创建和弦容器
        const chord = document.createElement("div");
        chord.className = "chord";

        // 🎵 先检查所有 SDG 是否都有值
        const allValues = noteData.sdgs.map(sdg => getSDGValue(sdgData, noteData.iso, year, sdg));
        const hasAnyValue = allValues.some(val => val !== null);

        if (!hasAnyValue) {
          // 🎵 所有 SDG 都没有值 - 显示休止符
          const restSymbol = document.createElement("div");
          restSymbol.className = "rest-symbol";
          restSymbol.innerHTML = "𝄽"; // Unicode 休止符
          restSymbol.style.fontSize = "32px";
          restSymbol.style.color = "#868e96";
          restSymbol.style.position = "relative";
          restSymbol.style.top = "30px";
          restSymbol.dataset.isRest = "true";
          chord.appendChild(restSymbol);
        } else if (noteData.sdgs.length === 1) {
          // 单个音符
          const sdg = noteData.sdgs[0];
          const value = getSDGValue(sdgData, noteData.iso, year, sdg);
          if (value !== null) {
            const note = createQuarterNote(sdg, sdgColors[sdg] || "#667eea", value);
            chord.appendChild(note);
          }
        } else {
          // 和弦
          const notesData = noteData.sdgs.map(sdg => ({
            sdg,
            value: getSDGValue(sdgData, noteData.iso, year, sdg),
            color: sdgColors[sdg] || "#667eea"
          })).filter(data => data.value !== null);

          notesData.sort((a, b) => a.value - b.value);

          const valueGroups = {};
          notesData.forEach(data => {
            const key = Math.floor(data.value / 10) * 10;
            if (!valueGroups[key]) valueGroups[key] = [];
            valueGroups[key].push(data);
          });

          notesData.forEach(data => {
            const note = createQuarterNote(data.sdg, data.color, data.value);
            const key = Math.floor(data.value / 10) * 10;
            const group = valueGroups[key];
            if (group.length > 1) {
              note.style.opacity = '0.7';
            }
            chord.appendChild(note);
          });
        }

        noteGroup.appendChild(chord);

        // 添加国家标签
        const label = document.createElement("div");
        label.className = "note-label";
        label.textContent = noteData.country;
        noteGroup.appendChild(label);

        // 添加点击播放功能
        noteGroup.addEventListener("click", (e) => {
          if (e.target.classList.contains('delete-note-btn')) return;

          const notes = noteGroup.querySelectorAll('.chord-note[data-value]');
          const notesData = Array.from(notes)
            .map(n => ({
              value: parseFloat(n.dataset.value),
              sdg: n.dataset.sdg
            }))
            .filter(n => !isNaN(n.value));

          if (notesData.length === 1) {
            playValueNote(notesData[0].value, notesData[0].sdg, 0.4);
          } else if (notesData.length > 1) {
            playValueChord(notesData, 0.4);
          }

          noteGroup.style.transform = 'scale(1.1)';
          setTimeout(() => {
            noteGroup.style.transform = '';
          }, 100);
        });

        container.appendChild(noteGroup);

      } else {
        // 这个位置是空的 - 添加占位符
        const placeholder = document.createElement("div");
        placeholder.className = "note-placeholder";
        placeholder.dataset.position = position;
        container.appendChild(placeholder);
      }
    });

    // 更新 notePositions 数组
    notePositions = shuffledNotes.map((noteData, index) => ({
      position: index + 1,
      country: noteData.country,
      iso: noteData.iso,
      sdgs: noteData.sdgs
    }));

    // 淡入动画
    container.style.opacity = "1";

    showMessage(" Notes shuffled!");
    console.log("音符已随机打乱");
    console.log("新顺序:", notePositions.map(n => n.country).join(", "));

  }, 300);
});


// ------------------- 初始化 -------------------
renderSDGCheckboxes();
updateKeySignature(); // 初始化调号显示
console.log(" SDG Map Ready with Smart Position Management and Note Mapping!");

// 🎵 初始化拖拽功能
initializeDragging();

// ------------------- Tempo 输入验证 -------------------
const tempoInput = document.getElementById("tempo-input");
if (tempoInput) {
  // 当输入框失去焦点或按下回车时验证
  const validateTempo = () => {
    let value = parseInt(tempoInput.value);

    // 如果输入为空或无效,设为默认值
    if (isNaN(value) || tempoInput.value === '') {
      tempoInput.value = 86;
      return;
    }

    // 限制在40-240之间
    if (value < 40) {
      tempoInput.value = 40;

    } else if (value > 240) {
      tempoInput.value = 240;

    }
  };

  tempoInput.addEventListener("blur", validateTempo);

  tempoInput.addEventListener("keypress", (e) => {
    // 允许数字和回车键
    if (e.key === 'Enter') {
      validateTempo();
      tempoInput.blur();
    } else if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });
}


// ------------------- 调式切换按钮 -------------------

// ------------------- 更新调号显示 -------------------
function updateKeySignature() {
  const keySignatureContainer = document.getElementById("key-signature");
  if (!keySignatureContainer) return;

  const currentMode = getMode();

  // 清空现有调号
  keySignatureContainer.innerHTML = "";

  if (currentMode === 'minor') {
    // C小调：显示三个降号（B♭, E♭, A♭）
    // 位置：第三线(B), 第五线(E), 第四间(A)
    const flats = [
      { line: 3, note: 'B' },  // B♭ 在第三线
      { line: 5, note: 'E' },  // E♭ 在第五线  
      { line: 4, note: 'A', isSpace: true }   // A♭ 在第四间
    ];

    flats.forEach((flat, index) => {
      const flatSymbol = document.createElement("div");
      flatSymbol.className = `key-flat key-flat-${index + 1}`;
      flatSymbol.innerHTML = "♭";
      flatSymbol.dataset.line = flat.line;
      flatSymbol.dataset.note = flat.note;
      if (flat.isSpace) {
        flatSymbol.classList.add('is-space');
      }
      keySignatureContainer.appendChild(flatSymbol);
    });
  }
  // 大调模式：不显示调号（C大调无升降号）

  console.log(` 调号已更新: ${currentMode === 'major' ? 'C大调 (无升降号)' : 'C小调 (三个降号)'}`);
}

const modeToggleBtn = document.getElementById("mode-toggle");

if (modeToggleBtn) {
  modeToggleBtn.addEventListener("click", () => {
    // 获取当前调式
    const currentMode = modeToggleBtn.dataset.mode;

    if (currentMode === "major") {
      // 切换到小调
      setMode("minor");
      modeToggleBtn.dataset.mode = "minor";
      modeToggleBtn.textContent = "Minor Scale";
      showMessage("Switched to C Minor Scale");
    } else {
      // 切换到大调
      setMode("major");
      modeToggleBtn.dataset.mode = "major";
      modeToggleBtn.textContent = "Major Scale";
      showMessage("Switched to C Major Scale");
    }

    // 刷新五线谱上的所有音符
    refreshAllNotes();
    updateKeySignature();
  });
}


/**
 * 刷新五线谱上的所有音符（调式切换时使用）
 */
function refreshAllNotes() {
  const container = document.getElementById("treble-container");
  const year = getCurrentYear();

  // 保存当前所有音符的数据
  const savedNotes = notePositions.map(notePos => ({ ...notePos }));

  // 清空容器
  container.innerHTML = "";

  // 重新创建所有位置
  const allPositions = Array.from({ length: 8 }, (_, i) => i + 1);

  allPositions.forEach(position => {
    const noteIndex = position - 1;

    if (noteIndex < savedNotes.length) {
      // 这个位置有音符 - 使用新调式重新创建
      const noteData = savedNotes[noteIndex];

      // 创建新的音符组
      const noteGroup = document.createElement("div");
      noteGroup.className = "note-group";
      noteGroup.dataset.position = position;

      // 添加删除按钮
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-note-btn";
      deleteBtn.textContent = "×";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeNoteFromStaff(noteGroup);
      });
      noteGroup.appendChild(deleteBtn);

      // 创建和弦容器
      const chord = document.createElement("div");
      chord.className = "chord";

      // 检查所有 SDG 是否都有值
      const allValues = noteData.sdgs.map(sdg => getSDGValue(sdgData, noteData.iso, year, sdg));
      const hasAnyValue = allValues.some(val => val !== null);

      if (!hasAnyValue) {
        // 所有 SDG 都没有值 - 显示休止符
        const restSymbol = document.createElement("div");
        restSymbol.className = "rest-symbol";
        restSymbol.innerHTML = "𝄽";
        restSymbol.style.fontSize = "32px";
        restSymbol.style.color = "#868e96";
        restSymbol.style.position = "relative";
        restSymbol.style.top = "30px";
        restSymbol.dataset.isRest = "true";
        chord.appendChild(restSymbol);
      } else if (noteData.sdgs.length === 1) {
        // 单个音符
        const sdg = noteData.sdgs[0];
        const value = getSDGValue(sdgData, noteData.iso, year, sdg);
        if (value !== null) {
          const note = createQuarterNote(sdg, sdgColors[sdg] || "#667eea", value);
          chord.appendChild(note);
        }
      } else {
        // 和弦
        const notesData = noteData.sdgs.map(sdg => ({
          sdg,
          value: getSDGValue(sdgData, noteData.iso, year, sdg),
          color: sdgColors[sdg] || "#667eea"
        })).filter(data => data.value !== null);

        notesData.sort((a, b) => a.value - b.value);

        const valueGroups = {};
        notesData.forEach(data => {
          const key = Math.floor(data.value / 10) * 10;
          if (!valueGroups[key]) valueGroups[key] = [];
          valueGroups[key].push(data);
        });

        notesData.forEach(data => {
          const note = createQuarterNote(data.sdg, data.color, data.value);
          const key = Math.floor(data.value / 10) * 10;
          const group = valueGroups[key];
          if (group.length > 1) {
            note.style.opacity = '0.7';
          }
          chord.appendChild(note);
        });
      }

      noteGroup.appendChild(chord);

      // 添加国家标签
      const label = document.createElement("div");
      label.className = "note-label";
      label.textContent = noteData.country;
      noteGroup.appendChild(label);

      // 添加点击播放功能
      noteGroup.addEventListener("click", (e) => {
        if (e.target.classList.contains('delete-note-btn')) return;

        const notes = noteGroup.querySelectorAll('.chord-note[data-value]');
        const notesData = Array.from(notes)
          .map(n => ({
            value: parseFloat(n.dataset.value),
            sdg: n.dataset.sdg
          }))
          .filter(n => !isNaN(n.value));

        if (notesData.length === 1) {
          playValueNote(notesData[0].value, notesData[0].sdg, 0.4);
        } else if (notesData.length > 1) {
          playValueChord(notesData, 0.4);
        }

        noteGroup.style.transform = 'scale(1.1)';
        setTimeout(() => {
          noteGroup.style.transform = '';
        }, 100);
      });

      container.appendChild(noteGroup);

      //  启用拖拽
      enableDragging(noteGroup);

    } else {
      // 这个位置是空的 - 添加占位符
      const placeholder = document.createElement("div");
      placeholder.className = "note-placeholder";
      placeholder.dataset.position = position;
      container.appendChild(placeholder);
      //  启用拖拽
      enableDragging(placeholder);
    }
  });

  console.log(` 音符已刷新为 ${getMode() === 'major' ? 'C大调' : 'C小调'}`);
}// ========== 拖拽功能模块 ==========
// 在 NewScript.js 末尾添加此代码

// ------------------- 拖拽状态变量（添加到全局变量区域） -------------------
// 在第21行后添加：
// let draggedElement = null;
// let draggedPosition = null;

// ------------------- 启用拖拽功能 -------------------
/**
 * 为一个元素（note-group 或 note-placeholder）启用拖拽
 * @param {HTMLElement} element - 要启用拖拽的元素
 */
function enableDragging(element) {
  element.setAttribute('draggable', 'true');
  element.style.cursor = 'move';

  // 开始拖拽
  element.addEventListener('dragstart', handleDragStart);
  
  // 拖拽经过
  element.addEventListener('dragover', handleDragOver);
  
  // 拖拽进入
  element.addEventListener('dragenter', handleDragEnter);
  
  // 拖拽离开
  element.addEventListener('dragleave', handleDragLeave);
  
  // 放置
  element.addEventListener('drop', handleDrop);
  
  // 拖拽结束
  element.addEventListener('dragend', handleDragEnd);
}

// ------------------- 拖拽事件处理函数 -------------------

function handleDragStart(e) {
  draggedElement = this;
  draggedPosition = parseInt(this.dataset.position);
  
  // 添加拖拽样式
  this.style.opacity = '0.5';
  this.classList.add('dragging');
  
  // 设置拖拽数据
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  
  console.log(` 开始拖拽位置 ${draggedPosition}`);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // 允许放置
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  // 如果不是拖拽的元素本身，添加高亮
  if (this !== draggedElement) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // 阻止浏览器默认行为
  }
  
  this.classList.remove('drag-over');
  
  // 不能放到自己身上
  if (draggedElement === this) {
    return false;
  }
  
  const targetPosition = parseInt(this.dataset.position);
  
  console.log(` 交换位置: ${draggedPosition} ↔ ${targetPosition}`);
  
  // 执行交换
  swapPositions(draggedPosition, targetPosition);
  
  return false;
}

function handleDragEnd(e) {
  // 移除所有拖拽样式
  this.style.opacity = '1';
  this.classList.remove('dragging');
  
  // 移除所有元素的 drag-over 样式
  const allElements = document.querySelectorAll('.note-group, .note-placeholder');
  allElements.forEach(el => {
    el.classList.remove('drag-over');
  });
  
  console.log(` 拖拽结束`);
}

// ------------------- 交换两个位置的内容 -------------------
function swapPositions(pos1, pos2) {
  const container = document.getElementById("treble-container");
  
  // 获取两个位置的元素
  const element1 = container.querySelector(`[data-position="${pos1}"]`);
  const element2 = container.querySelector(`[data-position="${pos2}"]`);
  
  if (!element1 || !element2) {
    console.error("无法找到要交换的元素");
    return;
  }
  
  // 保存 notePositions 数据的引用
  const noteData1 = notePositions.find(n => n.position === pos1);
  const noteData2 = notePositions.find(n => n.position === pos2);
  
  // 创建一个临时标记节点用于交换位置
  const tempMarker = document.createElement('div');
  
  // 交换DOM节点
  // 1. 在 element1 前插入标记
  element1.parentNode.insertBefore(tempMarker, element1);
  
  // 2. 将 element1 插入到 element2 的位置
  element2.parentNode.insertBefore(element1, element2);
  
  // 3. 将 element2 插入到标记的位置（原来 element1 的位置）
  tempMarker.parentNode.insertBefore(element2, tempMarker);
  
  // 4. 移除临时标记
  tempMarker.remove();
  
  // 交换 data-position 属性
  element1.dataset.position = pos2;
  element2.dataset.position = pos1;
  
  // 更新 notePositions 数组中的位置
  if (noteData1) {
    noteData1.position = pos2;
  }
  if (noteData2) {
    noteData2.position = pos1;
  }
  
  console.log(" 当前 notePositions:", notePositions);
}

// ------------------- 为 note-group 附加事件监听器 -------------------
function attachNoteGroupEvents(noteGroup) {
  // 删除按钮
  const deleteBtn = noteGroup.querySelector('.delete-note-btn');
  if (deleteBtn) {
    // 先移除旧的监听器（通过克隆）
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.replaceWith(newDeleteBtn);
    
    newDeleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeNoteFromStaff(noteGroup);
    });
  }
  
  // 点击播放 - 直接在原元素上添加（不克隆）
  noteGroup.addEventListener("click", (e) => {
    if (e.target.classList.contains('delete-note-btn')) return;
    
    const notes = noteGroup.querySelectorAll('.chord-note[data-value]');
    const notesData = Array.from(notes)
      .map(n => ({
        value: parseFloat(n.dataset.value),
        sdg: n.dataset.sdg
      }))
      .filter(n => !isNaN(n.value));
    
    if (notesData.length === 1) {
      playValueNote(notesData[0].value, notesData[0].sdg, 0.4);
    } else if (notesData.length > 1) {
      playValueChord(notesData, 0.4);
    }
    
    noteGroup.style.transform = 'scale(1.1)';
    setTimeout(() => {
      noteGroup.style.transform = '';
    }, 100);
  });
  
  // 重新启用拖拽
  enableDragging(noteGroup);
  
  return noteGroup;
}

// ------------------- 初始化所有拖拽 -------------------
/**
 * 为五线谱上的所有元素启用拖拽
 */
function initializeDragging() {
  const container = document.getElementById("treble-container");
  const allElements = container.querySelectorAll('.note-group, .note-placeholder');
  
  allElements.forEach(element => {
    enableDragging(element);
  });
  
  console.log(` 已启用 ${allElements.length} 个位置的拖拽功能`);
}

// ------------------- 导出函数（如果使用模块化） -------------------
// export { enableDragging, initializeDragging, swapPositions };