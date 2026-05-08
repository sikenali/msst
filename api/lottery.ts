import axios from 'axios';
import cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml';
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml';

const CACHE_DURATION = 86400000; // 24 小时

interface CacheEntry {
  data: any[];
  timestamp: number;
  lastUpdated: string;
}

const ssqCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };
const dltCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };

function parseSSQHtml(html: string) {
  const $ = cheerio.load(html);
  const results: Array<{ issue: string; red: number[]; blue: number }> = [];
  
  $('table tr').each((index, element) => {
    const cells = $(element).find('td');
    if (cells.length < 9) return;
    
    const issue = $(cells[0]).text().trim();
    if (!issue || !/^\d{5,6}$/.test(issue)) return;
    
    const red: number[] = [];
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

function parseDLTHtml(html: string) {
  const $ = cheerio.load(html);
  const results: Array<{ issue: string; front: number[]; back: number[] }> = [];
  
  $('table tr').each((index, element) => {
    const cells = $(element).find('td');
    if (cells.length < 9) return;
    
    const issue = $(cells[0]).text().trim();
    if (!issue || !/^\d{5,6}$/.test(issue)) return;
    
    const front: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const num = parseInt($(cells[i]).text().trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 35) {
        front.push(num);
      }
    }
    if (front.length !== 5) return;
    
    const back: number[] = [];
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
      ssqCache.data = data;
      ssqCache.timestamp = now;
      ssqCache.lastUpdated = new Date(now).toLocaleString('zh-CN');
    }
    
    return data;
  } catch (error: any) {
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
      dltCache.data = data;
      dltCache.timestamp = now;
      dltCache.lastUpdated = new Date(now).toLocaleString('zh-CN');
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch DLT data:', error.message);
    return dltCache.data.length > 0 ? dltCache.data : [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    if (type === 'ssq') {
      const data = await fetchSSQData();
      return res.status(200).json({
        success: true,
        data,
        count: data.length,
        lastUpdated: ssqCache.lastUpdated
      });
    } else if (type === 'dlt') {
      const data = await fetchDLTData();
      return res.status(200).json({
        success: true,
        data,
        count: data.length,
        lastUpdated: dltCache.lastUpdated
      });
    } else if (type === 'refresh') {
      // 刷新缓存
      ssqCache.data = [];
      ssqCache.timestamp = 0;
      dltCache.data = [];
      dltCache.timestamp = 0;
      
      await Promise.all([fetchSSQData(), fetchDLTData()]);
      
      return res.status(200).json({
        success: true,
        message: '数据已刷新'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type parameter. Use "ssq", "dlt", or "refresh"'
      });
    }
  } catch (error: any) {
    console.error('API error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
