/**
 * 八卦时辰计算模块
 * 结合当天日期、时辰（12时辰）和八卦方位推荐号码
 */

// 十二时辰对照表 (每两小时为一个时辰)
const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 八卦方位与数字对应 (先天八卦)
// 乾(1) 兑(2) 离(3) 震(4) 巽(5) 坎(6) 艮(7) 坤(8)
const BAGUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
const BAGUA_NUM = [1, 2, 3, 4, 5, 6, 7, 8]

// 五行与数字
const WUXING = {
  木: [3, 8],
  火: [2, 7],
  土: [5, 0],
  金: [4, 9],
  水: [1, 6],
}

/**
 * 获取当前时辰索引 (0-11)
 */
export function getCurrentShichen(): number {
  const hour = new Date().getHours()
  return Math.floor(((hour + 1) % 24) / 2)
}

/**
 * 获取今日八卦基数
 * 根据年月日计算当日的八卦偏移值
 */
function getTodayBaguaOffset(): number {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  
  // 简易梅花易数算法：(年+月+日) % 8
  return ((y + m + d) % 8)
}

/**
 * 获取今日时辰八卦偏移值
 * 结合时辰和当日基数
 */
function getShichenBaguaOffset(): number {
  const shichenIdx = getCurrentShichen()
  const todayOffset = getTodayBaguaOffset()
  return (todayOffset + shichenIdx) % 8
}

/**
 * 生成基于八卦的随机数
 * @param min 最小值
 * @param max 最大值
 * @param count 数量
 * @returns 排序后的数字数组
 */
export function generateBaguaNumbers(min: number, max: number, count: number): number[] {
  const result = new Set<number>()
  const offset = getShichenBaguaOffset()
  
  // 使用八卦偏移值作为种子基础
  const seedBase = offset + getCurrentShichen()
  
  while (result.size < count) {
    // 结合时间戳和八卦偏移生成随机数
    const rand = Math.random()
    const shiftedSeed = (seedBase + rand * (max - min + 1)) % (max - min + 1)
    const num = Math.floor(shiftedSeed) + min
    
    if (num >= min && num <= max) {
      result.add(num)
    }
  }
  
  return Array.from(result).sort((a, b) => a - b)
}

// 导出原方法
export { SHICHEN, BAGUA, WUXING }
