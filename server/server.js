const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml';
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml';

let ssqCache = { data: [], timestamp: 0 };
let dltCache = { data: [], timestamp: 0 };
const CACHE_DURATION = 86400000;

function parseSSQHtml(html) {
  const $ = cheerio.load(html);
  const results = [];
  
  $('table tr').each((index, element) => {
    const cells = $(element).find('td');
    if (cells.length < 9) return;
    
    const issue = $(cells[0]).text().trim();
    if (!issue || !/^\d{5,6}$/.test(issue)) return;
    
    const red = [];
    for (let i = 1; i <= 6; i++) {
      const num = parseInt($(cells[i]).text().trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 33) {
        red.push(num);
      }
    }
    if (red.length !== 6) return;
    
    const blue = parseInt($(cells[7]).text().trim(), 10);
    if (isNaN(blue) || blue < 1 || blue > 16) return;
    
    results.push({
      issue,
      red,
      blue
    });
  });
  
  return results.slice(0, 30);
}

function parseDLTHtml(html) {
  const $ = cheerio.load(html);
  const results = [];
  
  $('table tr').each((index, element) => {
    const cells = $(element).find('td');
    if (cells.length < 9) return;
    
    const issue = $(cells[0]).text().trim();
    if (!issue || !/^\d{5,6}$/.test(issue)) return;
    
    const front = [];
    for (let i = 1; i <= 5; i++) {
      const num = parseInt($(cells[i]).text().trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 35) {
        front.push(num);
      }
    }
    if (front.length !== 5) return;
    
    const back = [];
    for (let i = 6; i <= 7; i++) {
      const num = parseInt($(cells[i]).text().trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 12) {
        back.push(num);
      }
    }
    if (back.length !== 2) return;
    
    results.push({
      issue,
      front,
      back
    });
  });
  
  return results.slice(0, 30);
}

async function fetchSSQData() {
  const now = Date.now();
  if (now - ssqCache.timestamp < CACHE_DURATION && ssqCache.data.length > 0) {
    return ssqCache.data;
  }
  
  try {
    const response = await axios.get(SSQ_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    const data = parseSSQHtml(response.data);
    if (data.length > 0) {
      ssqCache = { data, timestamp: now };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch SSQ data:', error.message);
    return ssqCache.data.length > 0 ? ssqCache.data : [];
  }
}

async function fetchDLTData() {
  const now = Date.now();
  if (now - dltCache.timestamp < CACHE_DURATION && dltCache.data.length > 0) {
    return dltCache.data;
  }
  
  try {
    const response = await axios.get(DLT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    const data = parseDLTHtml(response.data);
    if (data.length > 0) {
      dltCache = { data, timestamp: now };
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch DLT data:', error.message);
    return dltCache.data.length > 0 ? dltCache.data : [];
  }
}

app.get('/api/ssq', async (req, res) => {
  try {
    const data = await fetchSSQData();
    res.json({
      success: true,
      data,
      count: data.length,
      lastUpdated: new Date(ssqCache.timestamp).toLocaleString('zh-CN')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/dlt', async (req, res) => {
  try {
    const data = await fetchDLTData();
    res.json({
      success: true,
      data,
      count: data.length,
      lastUpdated: new Date(dltCache.timestamp).toLocaleString('zh-CN')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    ssqCache = { data: [], timestamp: 0 };
    dltCache = { data: [], timestamp: 0 };
    
    await Promise.all([fetchSSQData(), fetchDLTData()]);
    
    res.json({
      success: true,
      message: '数据已刷新'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

async function refreshAllData() {
  console.log('[调度] 开始刷新所有数据...');
  ssqCache = { data: [], timestamp: 0 };
  dltCache = { data: [], timestamp: 0 };
  await Promise.all([fetchSSQData(), fetchDLTData()]);
  console.log('[调度] 数据刷新完成');
}

function scheduleMidnightRefresh() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const delay = midnight.getTime() - now.getTime();

  console.log(`[调度] 距下次自动更新还有 ${Math.round(delay / 1000 / 60)} 分钟`);
  setTimeout(async () => {
    await refreshAllData();
    setInterval(refreshAllData, 86400000);
  }, delay);
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  scheduleMidnightRefresh();
});

module.exports = app;
