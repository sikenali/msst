# 杀号规则 & 五行七列 设计文档

## 概述
在双色球/大乐透选号工具中新增两个功能：
1. **杀号规则** — 左侧浮动面板入口，提供历史数据展示和5条杀号规则开关
2. **五行七列** — 右侧浮动面板入口，提供五行七列矩阵图和杀号规则开关

## 架构

### 新增组件
| 组件 | 路径 | 说明 |
|------|------|------|
| `KillRulesModal.vue` | `src/components/` | 杀号规则弹框：历史数据tab + 杀号规则tab |
| `WuxingQilieModal.vue` | `src/components/` | 五行七列弹框：五行七列图tab + 杀号规则tab |

### 新增Composables
| Composable | 路径 | 说明 |
|------------|------|------|
| `useKillRules.ts` | `src/composables/` | 杀号规则状态、apply逻辑、SSQ/DLT双彩种 |
| `useWuxingQilie.ts` | `src/composables/` | 五行七列矩阵状态、断行断列分析 |
| `useHistoryData.ts` | `src/composables/` | 500.com历史数据抓取/解析/缓存 |

### 修改文件
| 文件 | 修改内容 |
|------|----------|
| `FloatingLeftPanel.vue` | +1 icon: 杀号规则 |
| `FloatingRightPanel.vue` | +1 icon: 五行七列(tips) |
| `HomePage.vue` | +modal路由、import新组件 |
| `useLottery.ts` | +杀号规则/五行七列集成到生成逻辑 |

## 功能细节

### 1. 杀号规则 (左侧面板)
- 图标: 剪刀/删除风格, 颜色 #EF4444
- 点击后弹框, 两个Tab:
  - **Tab 历史数据**: 抓取500.com SSQ历史页面HTML, 解析最近30-50期数据, 显示`期号 | 红球号码 | 蓝球`
    - 使用前端fetch + CORS代理或直接请求
    - 解析HTML table, 提取三字段
    - localStorage缓存, 每天22:00后自动刷新
  - **Tab 杀号规则**: 5条规则toggle开关:
    1. **尾数杀号** — 统计近10期尾数频率，排除连续遗漏5期以上冷尾数
    2. **除三余数杀号** — 012路，排除近5期最冷路数
    3. **断区杀号** — 四区(01-08,09-16,18-25,26-33)，排除连续热出后可能断区的区域
    4. **同尾杀号** — 上期同尾号码的延续排除
    5. **冷热号杀号** — 排除遗漏15期+极冷号和近5期出现3次+过热号

### 2. 五行七列 (右侧面板)
- 图标: 网格风格, 颜色 #8B5CF6
- 点击后弹框, 两个Tab:
  - **Tab 五行七列图**: 5行×7列矩阵
    ```
    金: 01 02 03 04 05 06 07
    木: 08 09 10 11 12 13 14
    水: 15 16 17 18 19 20 21
    火: 22 23 24 25 26 27 28
    土: 29 30 31 32 33
    ```
    - 基于历史数据分析断行/断列
    - 高亮 killed 号码
    - 提供 断行 / 断列 独立开关
  - **Tab 杀号规则**: 复用5条规则, 与杀号规则弹框共用状态

### 3. 生成集成
- `useLottery.ts` 中 `generateSSQ`/`generateDLT`:
  - 开启杀号规则时, 生成红球池后调用 `applyKillRules()` 过滤
  - 开启五行七列时, 先断行断列剔除, 再杀号规则过滤
  - 五行七列模式下蓝球随机
  - 规则默认关闭

### 4. 状态管理
- `useKillRules.ts`: 5条规则 `ssqKillRules` / `dltKillRules` ref; `applyKillRules()` 函数; SSR兼容
- `useWuxingQilie.ts`: 断行/断列 toggle + 矩阵状态; `analyzeBrokenRowColumn()` 分析函数
- `useHistoryData.ts`: `ssqHistoryData` ref; `fetchHistoryData()` 函数; localStorage缓存
