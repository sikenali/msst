import axios from 'axios';
import cheerio from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml';
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml';

const CACHE_DURATION = 86400000; // 24 小时

interface LotteryEntry {
  issue: string;
  red?: number[];
  blue?: number;
  front?: number[];
  back?: number[];
}

interface CacheEntry {
  data: LotteryEntry[];
  timestamp: number;
  lastUpdated: string;
}

// 使用全局变量存储缓存（Vercel Serverless 会在实例间共享）
let ssqCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };
let dltCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };

function parseSSQHtml(html: string): LotteryEntry[] {
  try {
    const $ = cheerio.load(html);
    const results: Array<{ issue: string; red: number[]; blue: number }> = [];
    
    // 更精确的选择器，针对 datachart.500.com 的表格结构
    $('tbody tr').each((index, element) => {
      try {
        const cells = $(element).find('td');
        if (cells.length < 9) return;
        
        // 期号
        const issueEl = $(cells[0]).find('a').length > 0 ? $(cells[0]).find('a').text().trim() : $(cells[0]).text().trim();
        const issue = issueEl;
        if (!issue || !/^\d{5,6}$/.test(issue)) return;
        
        // 红球
        const red: number[] = [];
        for (let i = 1; i <= 6; i++) {
          try {
            const numText = $(cells[i]).text().trim();
            const num = parseInt(numText, 10);
            if (!isNaN(num) && num >= 1 && num <= 33) {
              red.push(num);
            }
          } catch (e) {
            // 跳过单个单元格解析错误
          }
        }
        if (red.length !== 6) return;
        
        // 蓝球
        try {
          const blueText = $(cells[7]).text().trim();
          const blue = parseInt(blueText, 10);
          if (isNaN(blue) || blue < 1 || blue > 16) return;
          
          results.push({
            issue,
            red,
            blue
          });
        } catch (e) {
          // 跳过蓝球解析错误
        }
      } catch (e) {
        // 跳过单行解析错误
      }
    });
    
    console.log(`Parsed ${results.length} SSQ entries from HTML`);
    return results.slice(0, 30);
  } catch (error: any) {
    console.error('Error in parseSSQHtml:', error.message);
    return [];
  }
}

function parseDLTHtml(html: string): LotteryEntry[] {
  try {
    const $ = cheerio.load(html);
    const results: Array<{ issue: string; front: number[]; back: number[] }> = [];
    
    // 更精确的选择器，针对 datachart.500.com 的表格结构
    $('tbody tr').each((index, element) => {
      try {
        const cells = $(element).find('td');
        if (cells.length < 9) return;
        
        // 期号
        const issueEl = $(cells[0]).find('a').length > 0 ? $(cells[0]).find('a').text().trim() : $(cells[0]).text().trim();
        const issue = issueEl;
        if (!issue || !/^\d{5,6}$/.test(issue)) return;
        
        // 前区
        const front: number[] = [];
        for (let i = 1; i <= 5; i++) {
          try {
            const numText = $(cells[i]).text().trim();
            const num = parseInt(numText, 10);
            if (!isNaN(num) && num >= 1 && num <= 35) {
              front.push(num);
            }
          } catch (e) {
            // 跳过单个单元格解析错误
          }
        }
        if (front.length !== 5) return;
        
        // 后区
        const back: number[] = [];
        for (let i = 6; i <= 7; i++) {
          try {
            const numText = $(cells[i]).text().trim();
            const num = parseInt(numText, 10);
            if (!isNaN(num) && num >= 1 && num <= 12) {
              back.push(num);
            }
          } catch (e) {
            // 跳过单个单元格解析错误
          }
        }
        if (back.length !== 2) return;
        
        results.push({
          issue,
          front,
          back
        });
      } catch (e) {
        // 跳过单行解析错误
      }
    });
    
    console.log(`Parsed ${results.length} DLT entries from HTML`);
    return results.slice(0, 30);
  } catch (error: any) {
    console.error('Error in parseDLTHtml:', error.message);
    return [];
  }
}

async function fetchSSQData(): Promise<LotteryEntry[]> {
  const now = Date.now();
  if (now - ssqCache.timestamp < CACHE_DURATION && ssqCache.data.length > 0) {
    console.log('Returning cached SSQ data');
    return ssqCache.data;
  }
  
  try {
    console.log('Fetching SSQ data from 500.com...');
    const response = await axios.get(SSQ_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 10000,
      maxRedirects: 5
    });
    
    console.log('SSQ response status:', response.status);
    
    if (!response.data) {
      throw new Error('Empty response from 500.com');
    }
    
    const data = parseSSQHtml(response.data);
    console.log('Parsed SSQ data count:', data.length);
    
    if (data.length > 0) {
      ssqCache.data = data;
      ssqCache.timestamp = now;
      ssqCache.lastUpdated = new Date(now).toLocaleString('zh-CN');
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch SSQ data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.substring(0, 200));
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    // 返回缓存数据，如果没有则返回空数组
    return ssqCache.data.length > 0 ? ssqCache.data : [];
  }
}

async function fetchDLTData(): Promise<LotteryEntry[]> {
  const now = Date.now();
  if (now - dltCache.timestamp < CACHE_DURATION && dltCache.data.length > 0) {
    console.log('Returning cached DLT data');
    return dltCache.data;
  }
  
  try {
    console.log('Fetching DLT data from 500.com...');
    const response = await axios.get(DLT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 10000,
      maxRedirects: 5
    });
    
    console.log('DLT response status:', response.status);
    
    if (!response.data) {
      throw new Error('Empty response from 500.com');
    }
    
    const data = parseDLTHtml(response.data);
    console.log('Parsed DLT data count:', data.length);
    
    if (data.length > 0) {
      dltCache.data = data;
      dltCache.timestamp = now;
      dltCache.lastUpdated = new Date(now).toLocaleString('zh-CN');
    }
    
    return data;
  } catch (error: any) {
    console.error('Failed to fetch DLT data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.substring(0, 200));
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    // 返回缓存数据，如果没有则返回空数组
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
  console.log('API request received, type:', type);

  try {
    if (type === 'ssq') {
      console.log('Processing SSQ request...');
      const data = await fetchSSQData();
      console.log('Returning SSQ response with', data.length, 'entries');
      return res.status(200).json({
        success: true,
        data,
        count: data.length,
        lastUpdated: ssqCache.lastUpdated
      });
    } else if (type === 'dlt') {
      console.log('Processing DLT request...');
      const data = await fetchDLTData();
      console.log('Returning DLT response with', data.length, 'entries');
      return res.status(200).json({
        success: true,
        data,
        count: data.length,
        lastUpdated: dltCache.lastUpdated
      });
    } else if (type === 'refresh') {
      // 刷新缓存
      console.log('Refreshing cache...');
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
      console.log('Invalid type parameter:', type);
      return res.status(400).json({
        success: false,
        error: 'Invalid type parameter. Use "ssq", "dlt", or "refresh"'
      });
    }
  } catch (error: any) {
    console.error('API error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
