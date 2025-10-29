// =============== SDG Map + Floating Card + Composer Toggle ===============

// ------------------- 导入 -------------------
import { setupYearControl, getCurrentYear } from './yearControl.js';
import { sdgColors, sdgNames } from './sdgfile.js';
import { valueToNote, playValueNote, playValueChord } from './noteMapping.js';

setupYearControl(); // 初始化年份控制

// ------------------- 只显示5个SDG -------------------
const selectedSDGList = [1, 3, 7, 13, 16];

// ------------------- 全局状态 -------------------
let currentSelectedIso = null;
let currentSelectedName = null;
let notePositions = []; // 存储已添加的音符位置

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

// ------------------- 渲染 SDG 选择区 -------------------
function renderSDGCheckboxes() {
  const container = document.getElementById("sdg_checkbox_list");
  if (!container) return;
  container.innerHTML = "";

  selectedSDGList.forEach(i => {
    const label = document.createElement("label");
    label.classList.add("sdg-label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";
    label.style.padding = "6px 10px";
    label.style.marginBottom = "6px";
    label.style.borderRadius = "6px";
    label.style.cursor = "pointer";
    label.style.transition = "background-color 0.2s";
    label.style.color = sdgColors[i.toString()] || "#ccc";

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

    container.appendChild(label);
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

// ------------------- 数据加载 -------------------
let sdgData = {};
fetch("./data/sdg_fake_data_mapped.json")
  .then(r => r.json())
  .then(json => {
    sdgData = json;
    console.log("✅ SDG 数据加载成功");
  })
  .catch(err => console.error("❌ 加载 SDG 数据失败:", err));

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

// ------------------- 高亮逻辑 -------------------
function highlightCountry(map, iso, feature) {
  const layerId = "highlight-" + iso;
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(layerId)) map.removeSource(layerId);

  try {
    map.addSource(layerId, {
      type: "geojson",
      data: feature.toJSON ? feature.toJSON() : feature
    });
    map.addLayer({
      id: layerId,
      type: "line",
      source: layerId,
      paint: {
        "line-color": "#FFC107",
        "line-width": 2.5
      }
    });
  } catch (e) {
    console.error("添加高亮失败:", e);
  }
}

function unhighlightCountry(map, iso) {
  const layerId = "highlight-" + iso;
  if (map.getLayer(layerId)) map.removeLayer(layerId);
  if (map.getSource(layerId)) map.removeSource(layerId);
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
    const display = typeof v === "number" ? v.toFixed(1) : "N/A";
    const row = document.createElement("div");
    row.className = "sdg-item";
    row.innerHTML = `<span>SDG ${sdg}</span><span>${display}</span>`;
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
  const x = point.x + mapRect.left;
  const y = point.y + mapRect.top;
  card.style.position = "absolute";
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.style.transform = "translate(-20px, -20px)";
  card.classList.remove("hidden");
}

function hideFloatingCard() {
  const card = document.getElementById("floating-info-card");
  if (card) card.classList.add("hidden");
}

// ------------------- 创建4分音符或和弦（带音高映射）-------------------
function createQuarterNote(sdg, color, value) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "quarter-note chord-note";
  noteDiv.dataset.sdg = sdg;
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
  noteDiv.title = `${noteInfo.fullNoteName} (Value: ${value})`;
  
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
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "delete-note-btn";
  deleteBtn.innerHTML = "×";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeNoteFromStaff(noteGroup);
  });
  noteGroup.appendChild(deleteBtn);

  // 根据 SDG 数量创建单音符或和弦
  // 统一使用 .chord 容器以保持定位上下文一致
  const chord = document.createElement("div");
  chord.className = "chord";
  
  if (sdgList.length === 1) {
    // 单个音符
    const sdg = sdgList[0];
    const value = getSDGValue(sdgData, iso, year, sdg);
    const note = createQuarterNote(sdg, sdgColors[sdg] || "#667eea", value);
    chord.appendChild(note);
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
    
    notesData.forEach(data => {
      const note = createQuarterNote(data.sdg, data.color, data.value);
      chord.appendChild(note);
    });
  }
  
  noteGroup.appendChild(chord);

  // 添加国家标签
  const label = document.createElement("div");
  label.className = "note-label";
  label.textContent = countryName;
  noteGroup.appendChild(label);

  // 替换占位符
  placeholder.replaceWith(noteGroup);
  notePositions.push({
    position: nextPos,
    country: countryName,
    iso: iso,
    sdgs: sdgList
  });
  
  showMessage(`✅ Added ${countryName} to staff!`);
  console.log(`✅ 添加音符: ${countryName} (${sdgList.length} SDG${sdgList.length > 1 ? 's' : ''}) 在位置 ${nextPos}`);
  console.log(`📊 当前占用: ${notePositions.length}/8`);
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
  
  console.log(`🗑 删除音符位置 ${actualPosition}`);
  console.log(`📊 当前占用: ${notePositions.length}/8`);
  
  // 🔧 更新卡片按钮状态
  if (currentSelectedIso && currentSelectedName) {
    const year = getCurrentYear();
    updateFloatingCardContent(currentSelectedIso, currentSelectedName, getSelectedSDGs(), year, sdgData);
  }
  
  showMessage(`🗑 Removed note from position ${actualPosition}`);
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
    console.log("✅ 地图大小已调整 (Composer 打开)");
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
    console.log("✅ 地图大小已调整 (Composer 关闭)");
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

  // 高亮当前
  currentSelectedIso = iso;
  currentSelectedName = name;
  highlightCountry(map, iso, countryFeature);
  updateFloatingCardContent(iso, name, selectedSDGs, year, sdgData);
  positionFloatingCardAtPoint(e.point);
});

// ------------------- Play Melody 播放功能 -------------------
document.getElementById("play-melody").addEventListener("click", () => {
  const noteGroups = document.querySelectorAll('.note-group');
  
  if (noteGroups.length === 0) {
    showMessage("No notes to play!");
    return;
  }
  
  showMessage("🎵 Playing melody...");
  
  noteGroups.forEach((group, index) => {
    setTimeout(() => {
      const notes = group.querySelectorAll('.chord-note[data-value]');
      const values = Array.from(notes)
        .map(n => parseFloat(n.dataset.value))
        .filter(v => !isNaN(v));
      
      if (values.length === 1) {
        // 单音符
        playValueNote(values[0], 0.6);
      } else if (values.length > 1) {
        // 和弦
        playValueChord(values, 0.6);
      }
    }, index * 700); // 每个音符间隔 0.7 秒
  });
});

// ------------------- Clear All -------------------
document.getElementById("clear-all").addEventListener("click", () => {
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
  
  console.log("🗑 清空所有选择和音符");
  console.log(`📊 当前占用: 0/8`);
});

// ------------------- 初始化 -------------------
renderSDGCheckboxes();
console.log("🌍 SDG Map Ready with Smart Position Management and Note Mapping!");