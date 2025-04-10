// 获取数据
async function fetchData() {
  const url = "https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice";
  const params = {
    name: "ssq",
    issueCount: "300",
    pageNo: "1",
    pageSize: "300",
    systemType: "PC"
  };
  
  try {
    const response = await fetch(url + '?' + new URLSearchParams(params), {
      headers: {
        "Accept": "application/json",
        "Referer": "https://www.cwl.gov.cn/ygkj/wqkjgg/"
      }
    });
    
    const data = await response.json();
    if (data.result) {
      // 处理数据
      const processedData = data.result.map(item => ({
        date: item.date.split('(')[0],
        red: item.red.split(',').map(n => n.padStart(2, '0')),
        blue: item.blue.padStart(2, '0')
      }));
      
      // 保存到Chrome存储
      chrome.storage.local.set({ lotteryData: processedData });
      showResult('数据获取成功！');
      return processedData;
    }
  } catch (error) {
    showResult('获取数据失败：' + error.message);
  }
}

// 分析连号
function analyzeConsecutiveNumbers(data) {
  let result = {
    total: data.length,
    consecutive: 0,
    details: []
  };
  
  data.forEach(item => {
    const numbers = item.red.map(Number).sort((a, b) => a - b);
    let consecutiveGroups = [];
    let currentGroup = [numbers[0]];
    
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === numbers[i-1] + 1) {
        currentGroup.push(numbers[i]);
      } else {
        if (currentGroup.length > 1) {
          consecutiveGroups.push([...currentGroup]);
        }
        currentGroup = [numbers[i]];
      }
    }
    
    if (currentGroup.length > 1) {
      consecutiveGroups.push(currentGroup);
    }
    
    if (consecutiveGroups.length > 0) {
      result.consecutive++;
      result.details.push({
        date: item.date,
        red: item.red.join(','),
        groups: consecutiveGroups
      });
    }
  });
  
  return result;
}

// 分析热门号码
function analyzeHotNumbers(data) {
  // 统计红球出现次数
  const redStats = {};
  for (let i = 1; i <= 33; i++) {
    redStats[i.toString().padStart(2, '0')] = 0;
  }
  
  // 统计蓝球出现次数
  const blueStats = {};
  for (let i = 1; i <= 16; i++) {
    blueStats[i.toString().padStart(2, '0')] = 0;
  }
  
  // 计算每个号码出现次数
  data.forEach(item => {
    item.red.forEach(num => {
      redStats[num]++;
    });
    blueStats[item.blue]++;
  });
  
  // 转换为排序后的数组
  const redHot = Object.entries(redStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const blueCold = Object.entries(blueStats)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5);
    
  return {
    hotRed: redHot,
    coldBlue: blueCold
  };
}

// 分析遗漏号码
function analyzeMissingNumbers(data) {
  const lastAppearance = {};
  // 初始化所有号码
  for (let i = 1; i <= 33; i++) {
    lastAppearance[i.toString().padStart(2, '0')] = -1;
  }
  
  // 记录最近一次出现的期数
  data.forEach((item, index) => {
    item.red.forEach(num => {
      if (lastAppearance[num] === -1) {
        lastAppearance[num] = index;
      }
    });
  });
  
  // 计算遗漏期数
  const missing = Object.entries(lastAppearance)
    .map(([num, lastIndex]) => ({
      number: num,
      missing: lastIndex === -1 ? data.length : lastIndex
    }))
    .sort((a, b) => b.missing - a.missing);
    
  return missing.slice(0, 10); // 返回遗漏最多的10个号码
}

// 分析奇偶比例
function analyzeOddEvenRatio(data) {
  const ratios = data.map(item => {
    const odds = item.red.filter(n => Number(n) % 2 === 1).length;
    const evens = item.red.length - odds;
    return {
      date: item.date,
      ratio: `${odds}:${evens}`,
      numbers: item.red.join(',')
    };
  });
  
  // 统计各种比例出现的次数
  const ratioStats = {};
  ratios.forEach(item => {
    ratioStats[item.ratio] = (ratioStats[item.ratio] || 0) + 1;
  });
  
  return {
    recent: ratios.slice(0, 10),
    stats: ratioStats
  };
}

// 导出Excel
function exportToExcel(data, analysis) {
  // 使用第三方库如SheetJS来生成Excel文件
  const workbook = XLSX.utils.book_new();
  
  // 原始数据表
  const wsData = data.map(item => ({
    '日期': item.date,
    '红球': item.red.join(','),
    '蓝球': item.blue
  }));
  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(workbook, ws, '开奖历史');
  
  // 连号分析表
  const analysisWs = XLSX.utils.json_to_sheet(analysis.details);
  XLSX.utils.book_append_sheet(workbook, analysisWs, '连号分析');
  
  // 导出文件
  const filename = `双色球分析结果_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// 显示结果
function showResult(message) {
  document.getElementById('result').innerHTML = message;
}

// 在文件开头添加
function setActiveButton(activeId) {
  // 移除所有按钮的active类
  document.querySelectorAll('.button-group button').forEach(btn => {
    btn.classList.remove('active');
  });
  // 给当前点击的按钮添加active类
  if (activeId) {
    document.getElementById(activeId).classList.add('active');
  }
}

// 修改事件监听部分
document.getElementById('fetchData').addEventListener('click', async () => {
  const button = document.getElementById('fetchData');
  button.disabled = true;
  try {
    await fetchData();
  } finally {
    button.disabled = false;
  }
});

document.getElementById('analyzeData').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('lotteryData');
  if (data.lotteryData) {
    setActiveButton('analyzeData');
    const analysis = analyzeConsecutiveNumbers(data.lotteryData);
    showResult(`
      <h3 class="analysis-header">连号分析结果</h3>
      <div class="analysis-stats">
        <div class="stat-item">
          <div class="stat-label">总期数</div>
          <div class="stat-value">${analysis.total}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">连号出现期数</div>
          <div class="stat-value">${analysis.consecutive}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">连号出现概率</div>
          <div class="stat-value">${(analysis.consecutive/analysis.total*100).toFixed(2)}%</div>
        </div>
      </div>
      <h4 class="analysis-header">最近10期连号详情</h4>
      <table>
        <tr>
          <th>日期</th>
          <th>红球</th>
          <th>连号组</th>
        </tr>
        ${analysis.details.slice(0, 10).map(item => `
          <tr>
            <td>${item.date}</td>
            <td>${item.red}</td>
            <td>${item.groups.map(g => g.join('-')).join(', ')}</td>
          </tr>
        `).join('')}
      </table>
    `);
  } else {
    showResult('<div class="stat-item" style="margin: 10px 0">请先获取数据！</div>');
  }
});

document.getElementById('exportExcel').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('lotteryData');
  if (data.lotteryData) {
    const button = document.getElementById('exportExcel');
    button.disabled = true;
    try {
      const analysis = analyzeConsecutiveNumbers(data.lotteryData);
      await exportToExcel(data.lotteryData, analysis);
    } finally {
      button.disabled = false;
    }
  } else {
    showResult('<div class="stat-item" style="margin: 10px 0">请先获取数据！</div>');
  }
});

document.getElementById('analyzeHot').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('lotteryData');
  if (data.lotteryData) {
    setActiveButton('analyzeHot');
    const analysis = analyzeHotNumbers(data.lotteryData);
    showResult(`
      <h3>热门号码分析</h3>
      <h4>最热门的红球：</h4>
      <table>
        <tr><th>号码</th><th>出现次数</th></tr>
        ${analysis.hotRed.map(([num, count]) => `
          <tr><td>${num}</td><td>${count}</td></tr>
        `).join('')}
      </table>
      <h4>最冷门的蓝球：</h4>
      <table>
        <tr><th>号码</th><th>出现次数</th></tr>
        ${analysis.coldBlue.map(([num, count]) => `
          <tr><td>${num}</td><td>${count}</td></tr>
        `).join('')}
      </table>
    `);
  } else {
    showResult('<div class="stat-item" style="margin: 10px 0">请先获取数据！</div>');
  }
});

document.getElementById('analyzeMissing').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('lotteryData');
  if (data.lotteryData) {
    setActiveButton('analyzeMissing');
    const missing = analyzeMissingNumbers(data.lotteryData);
    showResult(`
      <h3>遗漏号码分析</h3>
      <table>
        <tr><th>号码</th><th>遗漏期数</th></tr>
        ${missing.map(item => `
          <tr><td>${item.number}</td><td>${item.missing}</td></tr>
        `).join('')}
      </table>
    `);
  } else {
    showResult('<div class="stat-item" style="margin: 10px 0">请先获取数据！</div>');
  }
});

document.getElementById('analyzeRatio').addEventListener('click', async () => {
  const data = await chrome.storage.local.get('lotteryData');
  if (data.lotteryData) {
    setActiveButton('analyzeRatio');
    const ratioAnalysis = analyzeOddEvenRatio(data.lotteryData);
    showResult(`
      <h3>奇偶比例分析</h3>
      <h4>最近10期奇偶比：</h4>
      <table>
        <tr><th>日期</th><th>奇偶比</th><th>号码</th></tr>
        ${ratioAnalysis.recent.map(item => `
          <tr>
            <td>${item.date}</td>
            <td>${item.ratio}</td>
            <td>${item.numbers}</td>
          </tr>
        `).join('')}
      </table>
      <h4>奇偶比例统计：</h4>
      <table>
        <tr><th>比例</th><th>出现次数</th></tr>
        ${Object.entries(ratioAnalysis.stats).map(([ratio, count]) => `
          <tr><td>${ratio}</td><td>${count}</td></tr>
        `).join('')}
      </table>
    `);
  } else {
    showResult('<div class="stat-item" style="margin: 10px 0">请先获取数据！</div>');
  }
}); 