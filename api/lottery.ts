import axios from 'axios';
import { load } from 'cheerio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SSQ_URL = 'https://datachart.500.com/ssq/history/history.shtml';
const DLT_URL = 'https://datachart.500.com/dlt/history/history.shtml';
const ALTERNATE_SSQ_URL = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount=30';
const ALTERNATE_DLT_URL = 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=dlt&issueCount=30';

const CACHE_DURATION = 86400000;
const RETRY_MAX = 2;
const REQUEST_TIMEOUT = 15000;

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

let ssqCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };
let dltCache: CacheEntry = { data: [], timestamp: 0, lastUpdated: '' };

async function fetchWithRetry(url: string, attempt = 0): Promise<any> {
  try {
    return await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: REQUEST_TIMEOUT,
      maxRedirects: 5
    });
  } catch (error) {
    if (attempt < RETRY_MAX) {
      console.log(`Retry ${attempt + 1}/${RETRY_MAX} for ${url}`);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      return fetchWithRetry(url, attempt + 1);
    }
    throw error;
  }
}

function parseSSQHtml(html: string): LotteryEntry[] {
  try {
    const $ = load(html);
    const results: Array<{ issue: string; red: number[]; blue: number }> = [];

    $('tbody tr').each((_index, element) => {
      try {
        const cells = $(element).find('td');
        if (cells.length < 9) return;

        const issueEl = $(cells[0]).find('a').length > 0 ? $(cells[0]).find('a').text().trim() : $(cells[0]).text().trim();
        if (!issueEl || !/^\d{5,6}$/.test(issueEl)) return;

        const red: number[] = [];
        for (let i = 1; i <= 6; i++) {
          const numText = $(cells[i]).text().trim();
          const num = parseInt(numText, 10);
          if (!isNaN(num) && num >= 1 && num <= 33) red.push(num);
        }
        if (red.length !== 6) return;

        const blueText = $(cells[7]).text().trim();
        const blue = parseInt(blueText, 10);
        if (isNaN(blue) || blue < 1 || blue > 16) return;

        results.push({ issue: issueEl, red, blue });
      } catch (_e) {}
    });

    return results.slice(0, 30);
  } catch (error: any) {
    console.error('parseSSQHtml error:', error.message);
    return [];
  }
}

function parseDLTHtml(html: string): LotteryEntry[] {
  try {
    const $ = load(html);
    const results: Array<{ issue: string; front: number[]; back: number[] }> = [];

    $('tbody tr').each((_index, element) => {
      try {
        const cells = $(element).find('td');
        if (cells.length < 9) return;

        const issueEl = $(cells[0]).find('a').length > 0 ? $(cells[0]).find('a').text().trim() : $(cells[0]).text().trim();
        if (!issueEl || !/^\d{5,6}$/.test(issueEl)) return;

        const front: number[] = [];
        for (let i = 1; i <= 5; i++) {
          const num = parseInt($(cells[i]).text().trim(), 10);
          if (!isNaN(num) && num >= 1 && num <= 35) front.push(num);
        }
        if (front.length !== 5) return;

        const back: number[] = [];
        for (let i = 6; i <= 7; i++) {
          const num = parseInt($(cells[i]).text().trim(), 10);
          if (!isNaN(num) && num >= 1 && num <= 12) back.push(num);
        }
        if (back.length !== 2) return;

        results.push({ issue: issueEl, front, back });
      } catch (_e) {}
    });

    return results.slice(0, 30);
  } catch (error: any) {
    console.error('parseDLTHtml error:', error.message);
    return [];
  }
}

function parseSSQJson(data: any): LotteryEntry[] {
  try {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item: any) => {
      const redStr = item.red || '';
      const red = redStr.split(',').map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n) && n >= 1 && n <= 33);
      const blue = parseInt(item.blue || '0', 10);
      return { issue: item.code || '', red: red.length === 6 ? red : [], blue: blue >= 1 && blue <= 16 ? blue : 0 };
    }).filter((e: LotteryEntry) => e.issue && e.red?.length === 6 && e.blue && e.blue >= 1);
  } catch {
    return [];
  }
}

function parseDLTJson(data: any): LotteryEntry[] {
  try {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item: any) => {
      const frontStr = item.front || '';
      const backStr = item.back || '';
      const front = frontStr.split(',').map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n) && n >= 1 && n <= 35);
      const back = backStr.split(',').map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n) && n >= 1 && n <= 12);
      return { issue: item.code || '', front: front.length === 5 ? front : [], back: back.length === 2 ? back : [] };
    }).filter((e: LotteryEntry) => e.issue && e.front?.length === 5 && e.back?.length === 2);
  } catch {
    return [];
  }
}

function fetchFallbackSSQ(): Promise<LotteryEntry[]> {
  return axios.get(ALTERNATE_SSQ_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    timeout: 10000
  }).then(res => parseSSQJson(res.data));
}

function fetchFallbackDLT(): Promise<LotteryEntry[]> {
  return axios.get(ALTERNATE_DLT_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    timeout: 10000
  }).then(res => parseDLTJson(res.data));
}

async function fetchSSQData(): Promise<LotteryEntry[]> {
  const now = Date.now();
  if (now - ssqCache.timestamp < CACHE_DURATION && ssqCache.data.length > 0) {
    return ssqCache.data;
  }

  let data: LotteryEntry[] = [];
  try {
    const response = await fetchWithRetry(SSQ_URL);
    data = parseSSQHtml(response.data);
    if (data.length === 0) throw new Error('Parsed 0 entries');
  } catch (error: any) {
    console.error('SSQ primary source failed:', error.message);
  }

  if (data.length === 0) {
    try {
      console.log('Falling back to cwl.gov.cn for SSQ...');
      data = await fetchFallbackSSQ();
    } catch (error2: any) {
      console.error('SSQ fallback also failed:', error2.message);
    }
  }

  if (data.length > 0) {
    ssqCache = { data, timestamp: now, lastUpdated: new Date(now).toLocaleString('zh-CN') };
  }

  return data.length > 0 ? data : ssqCache.data;
}

async function fetchDLTData(): Promise<LotteryEntry[]> {
  const now = Date.now();
  if (now - dltCache.timestamp < CACHE_DURATION && dltCache.data.length > 0) {
    return dltCache.data;
  }

  let data: LotteryEntry[] = [];
  try {
    const response = await fetchWithRetry(DLT_URL);
    data = parseDLTHtml(response.data);
    if (data.length === 0) throw new Error('Parsed 0 entries');
  } catch (error: any) {
    console.error('DLT primary source failed:', error.message);
  }

  if (data.length === 0) {
    try {
      console.log('Falling back to cwl.gov.cn for DLT...');
      data = await fetchFallbackDLT();
    } catch (error2: any) {
      console.error('DLT fallback also failed:', error2.message);
    }
  }

  if (data.length > 0) {
    dltCache = { data, timestamp: now, lastUpdated: new Date(now).toLocaleString('zh-CN') };
  }

  return data.length > 0 ? data : dltCache.data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

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
        lastUpdated: ssqCache.lastUpdated,
        cached: Date.now() - ssqCache.timestamp < CACHE_DURATION
      });
    }

    if (type === 'dlt') {
      const data = await fetchDLTData();
      return res.status(200).json({
        success: true,
        data,
        count: data.length,
        lastUpdated: dltCache.lastUpdated,
        cached: Date.now() - dltCache.timestamp < CACHE_DURATION
      });
    }

    if (type === 'refresh') {
      ssqCache = { data: [], timestamp: 0, lastUpdated: '' };
      dltCache = { data: [], timestamp: 0, lastUpdated: '' };
      await Promise.all([fetchSSQData(), fetchDLTData()]);
      return res.status(200).json({ success: true, message: '数据已刷新' });
    }

    if (type === 'health') {
      return res.status(200).json({
        success: true,
        ssq: { entries: ssqCache.data.length, lastUpdated: ssqCache.lastUpdated },
        dlt: { entries: dltCache.data.length, lastUpdated: dltCache.lastUpdated }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid type. Use "ssq", "dlt", "refresh", or "health"'
    });
  } catch (error: any) {
    console.error('API error:', error.message);
    return res.status(500).json({
      success: false,
      error: '获取数据失败，请稍后重试'
    });
  }
}
