document.addEventListener('DOMContentLoaded', () => {
  // 檢查資料是否載入成功
  if (!window.zodiacData) {
    console.error('Zodiac data not found! Please check data.js.');
    return;
  }

  const { zodiacData, fortuneQuotes } = window;

  // --- 元素選取 ---
  const zodiacGrid = document.getElementById('zodiacGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  // 彈窗元素
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContainer = document.getElementById('modalContainer');
  const modalClose = document.getElementById('modalClose');

  // 配對器元素
  const selectorA = document.getElementById('zodiacA');
  const selectorB = document.getElementById('zodiacB');
  const previewA = document.getElementById('previewA');
  const previewB = document.getElementById('previewB');
  const btnMatch = document.getElementById('btnMatch');
  const matchResult = document.getElementById('matchResult');

  // 生日尋找器元素
  const birthdayInput = document.getElementById('birthdayInput');
  const btnFindZodiac = document.getElementById('btnFindZodiac');
  const finderResult = document.getElementById('finderResult');

  // 占卜元素
  const oracleCards = document.querySelectorAll('.oracle-card-wrapper');
  const fortuneResultBoard = document.getElementById('fortuneResultBoard');
  const btnResetOracle = document.getElementById('btnResetOracle');
  const oracleZodiacSelector = document.getElementById('oracleZodiacSelector');

  // --- 1. 星座牆卡片渲染與篩選 ---
  function renderZodiacCards(filterElement = 'all') {
    zodiacGrid.innerHTML = '';
    
    Object.entries(zodiacData).forEach(([key, data]) => {
      if (filterElement !== 'all' && data.element !== filterElement) {
        return;
      }
      
      const card = document.createElement('div');
      card.className = 'zodiac-card';
      card.setAttribute('data-element', data.element);
      card.setAttribute('data-key', key);
      
      card.innerHTML = `
        <span class="card-symbol">${data.symbol}</span>
        <h3 class="card-name">${data.name}</h3>
        <p class="card-eng">${data.engName}</p>
        <p class="card-date">${data.date}</p>
        <span class="card-tag">${data.elementName}</span>
      `;
      
      card.addEventListener('click', () => openZodiacModal(key));
      zodiacGrid.appendChild(card);
    });
  }

  // 篩選按鈕事件
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const element = btn.getAttribute('data-element');
      renderZodiacCards(element);
    });
  });

  // --- 2. 星座詳細資訊彈窗 (Modal) ---
  function openZodiacModal(zodiacKey) {
    const data = zodiacData[zodiacKey];
    if (!data) return;

    // 設定彈窗的四象屬性（供 CSS 調整主題色）
    modalContainer.setAttribute('data-element', data.element);

    // 填充彈窗內容
    document.getElementById('modalSymbol').innerText = data.symbol;
    document.getElementById('modalName').innerText = data.name;
    document.getElementById('modalEngName').innerText = data.engName;
    
    document.getElementById('metaDate').innerText = data.date;
    document.getElementById('metaElement').innerText = data.elementName;
    document.getElementById('metaPlanet').innerText = data.planet;
    document.getElementById('metaColor').innerText = data.luckyColor;
    document.getElementById('metaNumber').innerText = data.luckyNumber;
    
    document.getElementById('modalSummary').innerText = data.summary;
    document.getElementById('modalDescription').innerText = data.description;

    // 優缺點列表
    const strengthsList = document.getElementById('modalStrengths');
    strengthsList.innerHTML = '';
    data.strengths.forEach(str => {
      const li = document.createElement('li');
      li.innerText = str;
      strengthsList.appendChild(li);
    });

    const weaknessesList = document.getElementById('modalWeaknesses');
    weaknessesList.innerHTML = '';
    data.weaknesses.forEach(weak => {
      const li = document.createElement('li');
      li.innerText = weak;
      weaknessesList.appendChild(li);
    });

    // 顯示 Modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止底層捲動
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // --- 3. 星座配對計算器 ---
  // 動態更新配對預覽圖標
  function updateSelectorPreviews() {
    const dataA = zodiacData[selectorA.value];
    const dataB = zodiacData[selectorB.value];
    if (dataA) previewA.innerText = dataA.symbol;
    if (dataB) previewB.innerText = dataB.symbol;
  }

  selectorA.addEventListener('change', updateSelectorPreviews);
  selectorB.addEventListener('change', updateSelectorPreviews);

  // 配對運算邏輯
  btnMatch.addEventListener('click', () => {
    const keyA = selectorA.value;
    const keyB = selectorB.value;
    const dataA = zodiacData[keyA];
    const dataB = zodiacData[keyB];

    if (!dataA || !dataB) return;

    // 計算契合度分數
    let score = 75; // 預設基礎分數
    let compatibilityText = '';

    // 檢查是否有專屬配對文字
    if (dataA.compatibility && dataA.compatibility[keyB]) {
      compatibilityText = dataA.compatibility[keyB];
    } else if (dataB.compatibility && dataB.compatibility[keyA]) {
      compatibilityText = dataB.compatibility[keyA];
    }

    // 根據元素組合計算分數與文字補充
    const elA = dataA.element;
    const elB = dataB.element;

    if (elA === elB) {
      score = 95; // 同屬性
    } else if (
      (elA === 'fire' && elB === 'air') || (elA === 'air' && elB === 'fire') ||
      (elA === 'earth' && elB === 'water') || (elA === 'water' && elB === 'earth')
    ) {
      score = 88; // 互補生旺屬性
    } else if (
      (elA === 'fire' && elB === 'earth') || (elA === 'earth' && elB === 'fire') ||
      (elA === 'air' && elB === 'water') || (elA === 'water' && elB === 'air')
    ) {
      score = 65; // 中立屬性
    } else {
      score = 45; // 相剋或較具挑戰性的屬性
    }

    if (!compatibilityText) {
      if (score === 95) {
        compatibilityText = `同屬 ${dataA.elementName} 的你們默契十足！心靈相通的頻率極高，相處起來輕鬆自然，能給予彼此最強烈的共鳴。`;
      } else if (score === 88) {
        compatibilityText = `${dataA.name} 與 ${dataB.name} 的結合是完美的互補生旺組合。你們在性格與思維上能彼此滋養，共創幸福。`;
      } else if (score === 65) {
        compatibilityText = `你們代表著截然不同的世界，雖然性格差異大，但在磨合與互相學習中能找到穩定的相處平衡點。`;
      } else {
        compatibilityText = `這是一段極具考驗的動態關係。你們天生特質迥異，需要投入更多的包容、理解與耐心溝通，方能跨越障礙。`;
      }
    }

    // 渲染配對結果
    matchResult.innerHTML = `
      <h3 class="match-result-title">${dataA.name} ✖ ${dataB.name} 速配指數：<span style="color: var(--fire-color); font-size: 2.2rem; font-weight:800;">${score}%</span></h3>
      <p class="match-result-desc">${compatibilityText}</p>
    `;
    matchResult.style.display = 'block';
    
    // 滾動到結果區域
    matchResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // --- 4. 生日星座尋找器 ---
  btnFindZodiac.addEventListener('click', () => {
    const dateVal = birthdayInput.value;
    if (!dateVal) {
      alert('請先選擇您的生日！');
      return;
    }

    const date = new Date(dateVal);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let key = '';

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) key = 'aries';
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) key = 'taurus';
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) key = 'gemini';
    else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) key = 'cancer';
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) key = 'leo';
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) key = 'virgo';
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) key = 'libra';
    else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) key = 'scorpio';
    else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) key = 'sagittarius';
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) key = 'capricorn';
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) key = 'aquarius';
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) key = 'pisces';

    const data = zodiacData[key];
    if (data) {
      finderResult.innerHTML = `
        <div class="glass-panel" style="margin-top: 1.5rem; text-align: center; max-width: 450px; margin-left: auto; margin-right: auto; padding: 2rem;">
          <h4 style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 0.5rem;">分析結果您的星座是：</h4>
          <span style="font-size: 4rem; display: block; margin: 0.5rem 0;">${data.symbol}</span>
          <h3 style="font-family: var(--font-title); font-size: 2rem; color: var(--air-color); margin-bottom: 0.5rem;">${data.name}</h3>
          <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem;">${data.date} | ${data.elementName}</p>
          <button class="btn btn-primary" id="btnGoDetail" style="padding: 0.6rem 1.5rem; font-size:0.9rem;">查看性格深度分析</button>
        </div>
      `;
      finderResult.style.display = 'block';
      
      document.getElementById('btnGoDetail').addEventListener('click', () => {
        openZodiacModal(key);
      });
      
      finderResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // --- 5. 互動式占卜塔羅卡牌遊戲 ---
  // 卡片翻轉邏輯與結果生成
  let flippedCount = 0;
  const drawnFortunes = {
    overall: '',
    love: '',
    career: '',
    wealth: ''
  };

  oracleCards.forEach(card => {
    card.addEventListener('click', () => {
      // 確保使用者選擇了占卜的星座
      const selectedZodiacKey = oracleZodiacSelector.value;
      if (!selectedZodiacKey) {
        alert('請先在上方選擇您想要占卜的星座！');
        return;
      }

      if (card.classList.contains('flipped')) return;

      const type = card.getAttribute('data-type');
      
      // 隨機選取對應類別的運勢句子
      const quotesPool = fortuneQuotes[type];
      const randomQuote = quotesPool[Math.floor(Math.random() * quotesPool.length)];
      drawnFortunes[type] = randomQuote;

      // 將隨機結果塞入卡片正面
      const quoteEl = card.querySelector('.fortune-quote');
      if (quoteEl) {
        quoteEl.innerText = randomQuote;
      }

      // 翻轉卡片
      card.classList.add('flipped');
      flippedCount++;

      // 如果全部卡片翻轉完畢，顯示整合結果版面
      if (flippedCount === 4) {
        setTimeout(showFortuneBoard, 800);
      }
    });
  });

  function showFortuneBoard() {
    const zodiacKey = oracleZodiacSelector.value;
    const data = zodiacData[zodiacKey];
    if (!data) return;

    // 更新結果看板內容
    document.getElementById('boardZodiac').innerText = `${data.symbol} ${data.name}`;
    document.getElementById('resOverall').innerText = drawnFortunes.overall;
    document.getElementById('resLove').innerText = drawnFortunes.love;
    document.getElementById('resCareer').innerText = drawnFortunes.career;
    document.getElementById('resWealth').innerText = drawnFortunes.wealth;

    // 設定今天的日期
    const today = new Date();
    const formattedDate = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日`;
    document.getElementById('boardDate').innerText = `預測時間：${formattedDate}`;

    fortuneResultBoard.style.display = 'block';
    fortuneResultBoard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 重置占卜
  btnResetOracle.addEventListener('click', () => {
    oracleCards.forEach(card => {
      card.classList.remove('flipped');
    });
    flippedCount = 0;
    fortuneResultBoard.style.display = 'none';
  });

  // 當修改占卜星座時，自動重置占卜卡片以維持邏輯正確
  oracleZodiacSelector.addEventListener('change', () => {
    oracleCards.forEach(card => {
      card.classList.remove('flipped');
    });
    flippedCount = 0;
    fortuneResultBoard.style.display = 'none';
  });


  // --- 初始化啟動 ---
  renderZodiacCards();
  updateSelectorPreviews();
});
