
let currentYear = 2024;

export function setupYearControl() {
  const currentYearDis = document.getElementById('current_year');
  const yearIncrease = document.getElementById('increase_year');
  const yearDecrease = document.getElementById('decrease_year');

  // 初始化显示
  currentYearDis.innerText = currentYear;

  // 增加年份
  yearIncrease.addEventListener('click', () => {
    if (currentYear < 2024) {
      currentYear++;
      currentYearDis.innerText = currentYear;
      const currentMode = getCurrentMode();
      if (currentMode === 'multi_s+multi_c' || currentMode === 'single_s+multi_c') {
        updateDrawer();
      }
      if (currentMode === 'multi_s+single_c') {
        const selectedCountries = getAllSelectedCountries();
        if (selectedCountries.length > 0) {
          showSdgInfoCard(selectedCountries[0]);
        }
      }
    }
  });

  // 减少年份
  yearDecrease.addEventListener('click', () => {
    if (currentYear > 2015) {
      currentYear--;
      currentYearDis.innerText = currentYear;
      const currentMode = getCurrentMode();
      if (currentMode === 'multi_s+multi_c' || currentMode === 'single_s+multi_c') {
        updateDrawer();
      }
      if (currentMode === 'multi_s+single_c') {
        const selectedCountries = getAllSelectedCountries();
        if (selectedCountries.length > 0) {
          showSdgInfoCard(selectedCountries[0]);
        }
      }
    }
  });
}

export function getCurrentYear() {
  return currentYear;
}


