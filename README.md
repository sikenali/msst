# 妙手神透 - 智能彩票号码生成器

> 融合传统文化、五行八卦与现代 AI 算法的彩票助手

[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?logo=vercel)](https://vercel.com)
[![Vue 3](https://img.shields.io/badge/vue-3.5-green?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-6.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

***

## 📖 项目简介

**妙手神透**是一款基于 Vue 3 + TypeScript 开发的智能彩票号码生成器，支持**双色球**和**大乐透**两种玩法。

项目将中国传统八卦时辰文化与现代随机算法相结合，通过独特的"法号/道号"系统、五行七列图分析、历史数据智能杀号等功能，为用户提供兼具文化底蕴与科学随机性的选号体验。

✨ **核心特色**：

- 🎯 支持双色球/大乐透两种玩法
- 🔮 法号/道号系统：生日、星座、幸运数字智能融合
- 📊 五行七列图：传统五行理论可视化分析
- 🤖 智能杀号规则：基于历史数据的断行断列分析
- 📱 响应式设计：完美适配 Web 端和移动端
- 🔗 短链接分享：一键分享号码给好友

***

## 🎮 功能特性

### 🎯 核心玩法

| 功能         | 说明                     |
| ---------- | ---------------------- |
| **双玩法支持**  | 双色球 / 大乐透自由切换，独立配置     |
| **智能模式判断** | 根据用户选号自动识别单式/复式/胆拖模式   |
| **注数配置**   | 支持 1-99 注灵活选择          |
| **八卦旋转**   | 生成号码时触发八卦图旋转动画，仪式感满满   |
| **结果展示**   | 模拟真实彩票票据样式，支持胆码/拖码视觉区分 |
| **图片导出**   | 一键生成高清结果图片，保存分享        |
| **短链接分享**  | 生成简短分享链接，好友可查看原号码并重新生成 |

### 🔮 法号/道号系统（个性化选号）

用户可以通过以下维度设置个人幸运号码，系统会智能融合到生成算法中：

| 功能入口    | 说明                 | 对应彩种          |
| ------- | ------------------ | ------------- |
| **蓝若寺** | 手动选择蓝球号码           | 双色球蓝球 / 大乐透后区 |
| **红佛女** | 手动选择红球号码           | 双色球红球 / 大乐透前区 |
| **生日**  | 输入出生日期，自动计算幸运数字    | 通用            |
| **星座**  | 选择星座，获取对应幸运数字      | 通用            |
| **生辰**  | 基于天干地支五行计算生辰幸运数    | 通用            |
| **幸运数** | 自定义输入纪念日、证件号等有意义数字 | 通用            |

### 📊 五行七列图（杀号分析）

基于传统五行理论的号码分析工具：

- **五行分区**：金、木、水、火、土五行，每行 7 列
- **断行规则**：分析最近 10 期历史数据，排除冷门行
- **断列规则**：分析 7 列命中情况，排除冷列和空开列
- **可视化展示**：五行七列图表，号码分布一目了然
- **智能补充**：双色球"水"行使用生财、有道图标补充缺位

### 🤖 智能杀号规则

基于历史数据的自动化杀号功能：

| 杀号规则     | 说明                | 数据来源        |
| -------- | ----------------- | ----------- |
| **断行杀号** | 分析五行行命中情况，排除冷门行   | 最近 10 期历史数据 |
| **断列杀号** | 分析 7 列命中情况，排除冷列   | 最近 10 期历史数据 |
| **历史数据** | 自动获取最近 30 期开奖数据   | 500.com 数据源 |
| **定时更新** | 每天 22:00 自动同步最新数据 | 本地缓存 1 小时   |

### 🎨 视觉设计

- **液态玻璃风格**：大量使用 `backdrop-filter: blur()` 打造通透质感
- **双色主题配色**：双色球（红/金）、大乐透（蓝/靛）两套完整主题
- **丰富动画**：八卦旋转、雨滴背景、弹窗缩放、浮动面板展开等
- **响应式布局**：完美适配手机、平板、桌面端

***

## 🛠️ 技术栈

### 前端技术

| 类型   | 技术                       | 版本     |
| ---- | ------------------------ | ------ |
| 前端框架 | Vue 3 (Composition API)  | 3.5.32 |
| 编程语言 | TypeScript               | 6.0.2  |
| 构建工具 | Vite                     | 8.0.3  |
| 路由管理 | Vue Router               | 4.6.4  |
| 样式方案 | Tailwind CSS + PostCSS   | 4.2.2  |
| 图标库  | Remix Icon Vue           | 4.9.0  |
| 图片生成 | html2canvas              | 1.4.1  |
| 测试框架 | Vitest + @vue/test-utils | 4.1.2  |

### 后端技术（Vercel Serverless）

| 类型     | 技术                          | 说明          |
| ------ | --------------------------- | ----------- |
| 运行环境   | Vercel Serverless Functions | Node.js 运行时 |
| API 框架 | Native TypeScript           | 无服务器架构      |
| 数据爬取   | Axios + Cheerio             | 500.com 数据源 |
| 缓存机制   | 内存缓存 + localStorage         | 24 小时缓存策略   |

***

## 📦 项目结构

```
msst/
├── src/
│   ├── assets/            # 静态资源（全局样式、字体）
│   ├── components/        # 公共组件（30+ 个）
│   │   ├── BaguaDiagram.vue       # 八卦图（核心视觉）
│   │   ├── ModeSelector.vue       # 模式选择器
│   │   ├── NoteCounter.vue        # 注数计数器
│   │   ├── NumberBall.vue         # 号码球
│   │   ├── ResultCard.vue         # 结果卡片
│   │   ├── FloatingLeftPanel.vue  # 左浮动面板（法号）
│   │   ├── FloatingRightPanel.vue # 右浮动面板（道号）
│   │   ├── WuxingQilieModal.vue   # 五行七列图（新增）
│   │   ├── KillRulesModal.vue     # 杀号规则（新增）
│   │   ├── IconModal.vue          # 通用弹框
│   │   ├── BirthdayPicker.vue     # 生日选择器
│   │   ├── ConstellationPicker.vue # 星座选择器
│   │   ├── LuckyNumberPicker.vue  # 幸运数选择器
│   │   └── ...                    # 其他 SVG 图标组件
│   ├── composables/       # 组合式函数（核心算法）
│   │   ├── useLottery.ts          # 号码生成主逻辑
│   │   ├── useUserSelections.ts   # 全局状态管理
│   │   ├── useWuxingQilie.ts      # 五行七列分析（新增）
│   │   ├── useKillRules.ts        # 杀号规则（新增）
│   │   ├── useHistoryData.ts      # 历史数据管理（新增）
│   │   ├── useBagua.ts            # 八卦数字算法
│   │   └── useFortune.ts          # 运势增强算法
│   ├── views/             # 页面视图
│   │   ├── HomePage.vue           # 首页
│   │   └── ResultPage.vue         # 结果页
│   ├── router/            # 路由配置
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── api/                   # Vercel Serverless API（新增）
│   └── lottery.ts         # 历史数据爬取 API
├── server/                # 传统 Node.js 服务器（兼容方案）
│   ├── server.js          # Express 服务器
│   └── package.json       # 服务器依赖
├── public/                # 公共资源（Logo、图标）
├── vercel.json            # Vercel 部署配置
└── package.json           # 项目依赖
```

***

## 🎲 号码生成规则

### 双色球规则

| 项目   | 规则                         |
| ---- | -------------------------- |
| 红球范围 | 1-33，每注选 6 个               |
| 蓝球范围 | 1-16，每注选 1 个               |
| 单式   | 6 红 + 1 蓝，每注 2 元           |
| 复式   | 红球≥7 个 或 蓝球≥2 个，系统自动组合所有可能 |
| 胆拖   | 胆码（必选）+ 拖码（可选），自动组合        |

### 大乐透规则

| 项目   | 规则                     |
| ---- | ---------------------- |
| 前区范围 | 1-35，每注选 5 个           |
| 后区范围 | 1-12，每注选 2 个           |
| 单式   | 5 前 + 2 后，每注 2 元       |
| 复式   | 前区≥6 个 或 后区≥3 个，系统自动组合 |
| 胆拖   | 胆码（必选）+ 拖码（可选），自动组合    |

### 智能模式判断

系统根据用户通过"蓝若寺/红佛女"选中的号码数量，自动判断生成模式：

**双色球示例**：

| 红球数量 | 蓝球数量 | 生成模式 | 说明                     |
| ---- | ---- | ---- | ---------------------- |
| 0    | 0    | 单式   | 6 随机红球 + 1 随机蓝球        |
| 1-5  | 0    | 单式   | 选中红球 + 随机补足 6 + 1 随机蓝球 |
| ≥6   | 0    | 复式   | 固定红球 + 1-2 随机蓝球        |
| 0    | ≥2   | 复式   | 算法推荐红球 + 固定蓝球          |
| 已选   | 已选   | 智能判断 | 固定号码 + 法号推荐智能去重        |

**大乐透示例**：

| 前区数量 | 后区数量 | 生成模式 | 说明                     |
| ---- | ---- | ---- | ---------------------- |
| 0    | 0    | 单式   | 5 随机前区 + 2 随机后区        |
| 1-4  | 0    | 单式   | 选中前区 + 随机补足 5 + 2 随机后区 |
| ≥5   | 0    | 复式   | 固定前区 + 2-3 随机后区        |
| 0    | ≥3   | 复式   | 算法推荐前区 + 固定后区          |

***

## 🧮 算法介绍

### 1. 基础随机算法

采用 Fisher-Yates 洗牌算法的变体，确保号码不重复且均匀分布：

```typescript
const getRandomNumsFromPool = (pool: number[], count: number): number[] => {
  const res: number[] = []
  const p = [...pool]
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * p.length)
    res.push(p[idx])
    p.splice(idx, 1)
  }
  return res.sort((a, b) => a - b)
}
```

### 2. 运势增强算法 (`useFortune.ts`)

结合天干地支、星座、五行等中国传统元素生成综合运势种子值：

```
种子值 = (天干地支年数值 × 100 + 星座幸运数 × 10 + 五行数值 + 八卦偏移 + 时辰 × 3) % 1000
```

- **天干地支**：根据年份计算对应天干地支
- **星座**：根据当前日期获取星座及其幸运数字
- **五行**：根据当日在一年中的天数确定五行属性
- **时辰**：根据当前小时确定十二时辰
- **八卦**：结合日期和时辰计算八卦偏移量

生成号码时，**20% 概率优先使用运势幸运数字**，其余使用增强种子值生成随机数。

### 3. 加权池算法

将用户设置的**生日、星座、幸运数**等多个来源的数字合并为加权池，提升"法号"命中概率：

```typescript
const getDivineNumberPools = (maxRange: number) => {
  // 来源 1：生日拆解 + 组合运算
  const birthNums = getBirthdayLuckyNumbers()  // 年月日数字拆解 + 组合数

  // 来源 2：星座幸运数字映射表
  const constNums = getConstellationLuckyNumbers()  // 每个星座 4 个幸运数

  // 来源 3：用户自定义幸运数
  const luckyNums = getUserLuckyNumbers()  // 蓝若寺/红佛女/幸运数选择器

  // 合并去重，范围过滤，权重增强（每个数字重复 3 次）
  return getWeightedPool([birthNums, constNums, luckyNums], [1, maxRange])
}
```

**权重增强逻辑**：

1. 合并所有来源的数字，去重后过滤范围
2. 每个数字重复 3 次加入池中
3. 随机选取时，池中的数字有 3 倍概率被选中

### 4. 智能合并算法

将用户固定选中的号码与法号推荐号码智能合并：

1. **固定号码优先保留** — 蓝若寺/红佛女选中的号码始终包含
2. **法号推荐去重** — 生日/星座/幸运数推荐，与固定号码重复则忽略
3. **60% 命中率** — 加权池中非重复号码有 60% 概率被选中
4. **不足随机补充** — 合并后仍不足目标数量时，从剩余号码中随机补足

```typescript
const mergeNumbers = (fixed, pool, range, target) => {
  const unique = new Set(fixed)
  const filteredPool = pool.filter(n => !fixed.includes(n))
  
  // 加权池 60% 命中率
  for (const n of shuffle(filteredPool)) {
    if (unique.size >= target) break
    if (Math.random() < 0.6) unique.add(n)
  }
  
  // 不足则随机补充
  while (unique.size < target) {
    unique.add(randomFrom(remaining))
  }
  return sort(unique)
}
```

### 5. 五行七列杀号算法 (`useWuxingQilie.ts`)

基于传统五行理论的号码分析：

**数据结构**：

```typescript
// 双色球（33 个红球）
WUXING_ROWS = [
  { name: '金', numbers: [1, 2, 3, 4, 5, 6, 7], color: '#FFD700' },
  { name: '木', numbers: [8, 9, 10, 11, 12, 13, 14], color: '#22C55E' },
  { name: '水', numbers: [29, 30, 31, 32, 33], color: '#3B82F6' }, // + 生财/有道图标
  { name: '火', numbers: [22, 23, 24, 25, 26, 27, 28], color: '#EF4444' },
  { name: '土', numbers: [15, 16, 17, 18, 19, 20, 21], color: '#A855F7' }
]

// 大乐透（35 个前区）
WUXING_ROWS_DLT = [
  { name: '金', numbers: [1, 2, 3, 4, 5, 6, 7], color: '#FFD700' },
  { name: '木', numbers: [8, 9, 10, 11, 12, 13, 14], color: '#22C55E' },
  { name: '水', numbers: [29, 30, 31, 32, 33, 34, 35], color: '#3B82F6' },
  { name: '火', numbers: [22, 23, 24, 25, 26, 27, 28], color: '#EF4444' },
  { name: '土', numbers: [15, 16, 17, 18, 19, 20, 21], color: '#A855F7' }
]
```

**断行规则**：

- 分析最近 10 期历史数据
- 统计每行命中次数和连续空开期数
- 排除命中<2 次或连续空开≥5 期的行

**断列规则**：

- 分析 7 列的命中情况
- 排除命中<3 次或连续空开≥4 期的列

### 6. 期号计算算法

根据参考日期和开奖规则动态计算下一期期号：

- **双色球**：每周二、四、日 21:00 开奖，每年约 150 期
- **大乐透**：每周一、三、六 21:00 开奖，每年约 156 期
- 21 点前显示当期，21 点后自动 +1 显示下一期

***

## 🔗 分享流程

1. **结果页点击"好运链链"** → 生成短链接（如 `/result?shareId=msst_m5x3k_a7f2b`）
2. **完整数据存入 sessionStorage**（号码、期号、模式、时间等全部保存）
3. **好友打开链接** → **直接进入结果页**，显示分享者的原号码
4. **好友点击底部"和气生财/道亦有道"** → 跳转首页，八卦图旋转，**生成属于自己的新号码**

***

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd msst

# 安装依赖
npm install

# 启动开发服务器（前端）
npm run dev
# 访问 http://localhost:5173

# 启动后端服务器（可选，开发环境使用 Vite 代理）
cd server
npm install
npm start
# 后端运行在 http://localhost:3001
```

### 构建

```bash
# 类型检查 + 生产构建
npm run build

# 构建产物在 dist/ 目录
```

### 测试

```bash
npm run test
```

***

## ☁️ 部署

### Vercel 部署（推荐）

项目已配置为 Vercel Serverless 架构，支持一键部署：

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod
```

**自动部署**：

- 推送到 GitHub 后自动触发 Vercel 部署
- 大约 1-2 分钟完成构建和部署
- 自动更新到生产环境

**环境变量配置**：

```env
VITE_API_BASE_URL=/api
```

**API 端点**：

```
# 双色球历史数据
https://your-project.vercel.app/api?type=ssq

# 大乐透历史数据
https://your-project.vercel.app/api?type=dlt

# 刷新缓存
https://your-project.vercel.app/api?type=refresh
```

### 其他部署方案

#### Render（传统服务器）

```bash
cd server
# 在 Render 创建 Web Service
# Root Directory: server
# Build Command: npm install
# Start Command: node server.js
```

#### Railway

- 导入 GitHub 仓库
- 设置 Root Directory 为 `server`
- 自动部署

***

## 📊 API 文档

### 历史数据接口

**请求参数**：

```
GET /api?type=ssq|dlt|refresh
```

**响应格式**：

```json
{
  "success": true,
  "data": [
    {
      "issue": "2024001",
      "red": [1, 2, 3, 4, 5, 6],
      "blue": 7
    }
  ],
  "count": 30,
  "lastUpdated": "2024-01-01 22:00:00"
}
```

**缓存策略**：

- 本地缓存：1 小时
- 服务器缓存：24 小时
- 自动刷新：每天 22:00

***

## 📝 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 使用 Tailwind CSS 原子类编写样式
- 提交信息遵循 Conventional Commits 规范

***

## 📄 许可证

MIT License

***

## 🙏 致谢

- 数据源：[500.com](https://datachart.500.com)
- 图标库：[Remix Icon](https://remixicon.com)
- 部署平台：[Vercel](https://vercel.com)

***

**⚠️ 免责声明**：本项目仅供学习和娱乐使用，彩票有风险，投注需谨慎。
