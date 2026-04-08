/**
 * 增强版号码生成算法
 * 结合农历、天干地支、星座、五行、八字等中国传统元素
 */

// ==================== 天干地支系统 ====================

// 十天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const TIAN_GAN_NUM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 十二地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const DI_ZHI_NUM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// 十二生肖
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 五行
const WU_XING = ['木', '火', '土', '金', '水']

// 五行数字对应（河图洛书）
const WU_XING_NUMBERS = {
  木: [3, 8],
  火: [2, 7],
  土: [5, 0],
  金: [4, 9],
  水: [1, 6],
}

// ==================== 星座系统 ====================

// 十二星座及其日期范围
const CONSTELLATIONS = [
  { name: '白羊', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: '金牛', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: '双子', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: '巨蟹', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: '狮子', startMonth: 7, endMonth: 8, startDay: 22, endDay: 23 },
  { name: '处女', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: '天秤', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: '天蝎', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: '射手', startMonth: 11, endMonth: 12, startDay: 23, endDay: 21 },
  { name: '摩羯', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: '水瓶', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: '双鱼', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
]

// 星座幸运数字
const CONSTELLATION_LUCKY = [
  [1, 9], [6, 4], [5, 7], [2, 8], [3, 6], [4, 5],
  [7, 3], [8, 2], [9, 1], [5, 8], [1, 7], [3, 9]
]

// ==================== 农历相关 ====================

// 农历月份（简化版）
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

// 农历日期
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

// ==================== 辅助函数 ====================

/**
 * 获取天干地支年份
 */
function getGanZhiYear(year: number): { gan: string; zhi: string; shengxiao: string } {
  const ganIndex = (year - 4) % 10
  const zhiIndex = (year - 4) % 12
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
    shengxiao: SHENG_XIAO[zhiIndex],
  }
}

/**
 * 获取星座
 */
function getConstellation(month: number, day: number): { name: string; index: number } {
  for (let i = 0; i < CONSTELLATIONS.length; i++) {
    const c = CONSTELLATIONS[i]
    if (c.startMonth < c.endMonth) {
      if ((month === c.startMonth && day >= c.startDay) ||
          (month === c.endMonth && day <= c.endDay)) {
        return { name: c.name, index: i }
      }
    } else {
      // 跨年的星座（摩羯、水瓶、双鱼）
      if ((month === c.startMonth && day >= c.startDay) ||
          (month === c.endMonth && day <= c.endDay)) {
        return { name: c.name, index: i }
      }
    }
  }
  return { name: '摩羯', index: 9 } // 默认
}

/**
 * 获取当日五行属性
 */
function getDayWuXing(): string {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000
  )
  return WU_XING[dayOfYear % 5]
}

/**
 * 获取当前时辰
 */
function getCurrentShichenIndex(): number {
  const hour = new Date().getHours()
  return Math.floor(((hour + 1) % 24) / 2)
}

/**
 * 生成综合运势种子值
 * 结合天干地支、星座、五行、时间等因素
 */
function generateFortuneSeed(): number {
  const now = new Date()
  
  // 天干地支年份数值
  const yearGanZhi = getGanZhiYear(now.getFullYear())
  const yearNum = TIAN_GAN_NUM[TIAN_GAN.indexOf(yearGanZhi.gan)] + 
                  DI_ZHI_NUM[DI_ZHI.indexOf(yearGanZhi.zhi)]
  
  // 星座幸运数字
  const constellation = getConstellation(now.getMonth() + 1, now.getDate())
  const luckyNum = CONSTELLATION_LUCKY[constellation.index][0]
  
  // 当日五行
  const dayWuXing = getDayWuXing()
  const wuXingNum = WU_XING_NUMBERS[dayWuXing as keyof typeof WU_XING_NUMBERS][0]
  
  // 当前时辰
  const shichenIdx = getCurrentShichenIndex()
  
  // 八卦偏移（结合日期和时间）
  const baguaOffset = (now.getFullYear() + now.getMonth() + now.getDate() + shichenIdx) % 8
  
  // 综合计算种子值
  const seed = (yearNum * 100 + luckyNum * 10 + wuXingNum + baguaOffset + shichenIdx * 3) % 1000
  
  return seed
}

/**
 * 基于增强算法生成随机号码
 * @param min 最小值
 * @param max 最大值
 * @param count 数量
 * @returns 排序后的数字数组
 */
export function generateEnhancedNumbers(min: number, max: number, count: number): number[] {
  const result = new Set<number>()
  const seed = generateFortuneSeed()
  const now = new Date()
  
  // 获取当前运势要素
  const constellation = getConstellation(now.getMonth() + 1, now.getDate())
  const dayWuXing = getDayWuXing()
  const wuXingNums = WU_XING_NUMBERS[dayWuXing as keyof typeof WU_XING_NUMBERS]
  const luckyNums = CONSTELLATION_LUCKY[constellation.index]
  
  // 幸运数字优先（20%概率）
  const allLuckyNums = [...wuXingNums, ...luckyNums].filter(n => n >= min && n <= max)
  
  while (result.size < count) {
    let num: number
    
    // 20%概率使用幸运数字
    if (Math.random() < 0.2 && allLuckyNums.length > 0) {
      num = allLuckyNums[Math.floor(Math.random() * allLuckyNums.length)]
    } else {
      // 使用增强种子生成随机数
      const rand = Math.random()
      const enhancedSeed = (seed + rand * 999 + now.getMilliseconds()) % 1000
      num = Math.floor((enhancedSeed / 1000) * (max - min + 1)) + min
    }
    
    if (num >= min && num <= max) {
      result.add(num)
    }
  }
  
  return Array.from(result).sort((a, b) => a - b)
}

/**
 * 获取当前运势信息（用于展示）
 */
export function getCurrentFortuneInfo() {
  const now = new Date()
  const yearGanZhi = getGanZhiYear(now.getFullYear())
  const constellation = getConstellation(now.getMonth() + 1, now.getDate())
  const dayWuXing = getDayWuXing()
  const shichenIdx = getCurrentShichenIndex()
  
  return {
    year: `${yearGanZhi.gan}${yearGanZhi.zhi}年`,
    shengxiao: yearGanZhi.shengxiao,
    constellation: constellation.name,
    wuxing: dayWuXing,
    shichen: `${DI_ZHI[shichenIdx]}时`,
    luckyNumbers: CONSTELLATION_LUCKY[constellation.index],
  }
}

// 导出常量
export {
  TIAN_GAN,
  DI_ZHI,
  SHENG_XIAO,
  WU_XING,
  WU_XING_NUMBERS,
  CONSTELLATIONS,
  CONSTELLATION_LUCKY,
}
