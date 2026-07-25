<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── Navigation Modules ───
interface ModuleDef {
  id: string
  label: string
  icon: string
}
const modules: ModuleDef[] = [
  { id: 'kill', label: '杀号', icon: 'crosshair' },
  { id: 'select', label: '选号', icon: 'filter' },
  { id: 'bold', label: '定胆', icon: 'star' },
  { id: 'blue', label: '蓝球', icon: 'circle-dot' },
  { id: 'back', label: '后区', icon: 'layers' },
  { id: 'reduce', label: '缩水', icon: 'grid' },
  { id: 'filter', label: '过滤', icon: 'sliders' },
  { id: 'flow', label: '流程', icon: 'git-branch' },
  { id: 'result', label: '结果', icon: 'bar-chart' },
]
const activeModule = ref('kill')
const sidebarExpanded = ref(false)

// ─── Lottery Type ───
const lotteryType = ref<'ssq' | 'dlt'>('ssq')

// ─── Kill Methods ───
interface KillMethod {
  name: string
  desc: string
  enabled: boolean
  kills: number
  group: 'basic' | 'advanced'
}
const killMethods = ref<KillMethod[]>([
  { name: '减法差值杀号', desc: '两两相减取差值', enabled: true, kills: 9, group: 'basic' },
  { name: '龙头杀号', desc: '杀上期最小红球', enabled: true, kills: 1, group: 'basic' },
  { name: '凤尾杀号', desc: '杀上期最大红球', enabled: true, kills: 1, group: 'basic' },
  { name: '龙头+蓝球杀号', desc: '龙头+蓝球运算', enabled: false, kills: 1, group: 'basic' },
  { name: '尾数杀号', desc: '冷尾/热尾排除', enabled: true, kills: 4, group: 'basic' },
  { name: '和值尾数杀号', desc: '和值个位对应号全杀', enabled: true, kills: 3, group: 'basic' },
  { name: '断区杀号', desc: '四分区连续断区', enabled: false, kills: 3, group: 'basic' },
  { name: '012路杀号', desc: '某路过热则杀', enabled: true, kills: 3, group: 'basic' },
  { name: '斜连杀号', desc: '斜三连延长线', enabled: false, kills: 1, group: 'basic' },
  { name: '极冷号排除', desc: '遗漏>22期', enabled: true, kills: 2, group: 'basic' },
  { name: '九维交叉杀号', desc: '9规则≥3命中必杀', enabled: true, kills: 12, group: 'advanced' },
  { name: '五行七列杀号', desc: '5行7列矩阵断区', enabled: false, kills: 8, group: 'advanced' },
  { name: '尾数对码杀号', desc: '1↔9,2↔8冷热交替', enabled: true, kills: 5, group: 'advanced' },
  { name: '6点交叉验证', desc: '6独立杀号点≥3必杀', enabled: true, kills: 7, group: 'advanced' },
  { name: '四重杀红法', desc: '4层叠加杀10-16红', enabled: false, kills: 11, group: 'advanced' },
])
const totalKills = computed(() => killMethods.value.filter(m => m.enabled).reduce((s, m) => s + m.kills, 0))
const remainingRed = computed(() => (lotteryType.value === 'ssq' ? 33 : 35) - totalKills.value)

// ─── Selection Methods ───
interface SelectMethod {
  name: string
  desc: string
  applies: string[]
  active: boolean
}
const selectMethods = ref<SelectMethod[]>([
  { name: '横标纵标法', desc: '7横标×5纵标交叉定位', applies: ['dlt'], active: true },
  { name: '质合数螺旋选号', desc: '质合配比+三层圈层', applies: ['ssq'], active: true },
  { name: '三点合围选号', desc: '本位+顺延+对称合围', applies: ['ssq'], active: false },
  { name: '奖号时钟法', desc: '33码时钟热3冷5', applies: ['ssq'], active: true },
  { name: '万能13码', desc: '70期数据13码覆盖', applies: ['ssq'], active: false },
  { name: '九宫选号法', desc: '洛书九宫飞星推演', applies: ['ssq', 'dlt'], active: true },
  { name: '后区双子星组合', desc: '6组固定配对筛选', applies: ['dlt'], active: true },
  { name: '黄金分割法', desc: '0.618基准点22/13', applies: ['dlt'], active: false },
])
const visibleSelectMethods = computed(() =>
  selectMethods.value.filter(m => m.applies.includes(lotteryType.value))
)

// ─── Bold Methods ───
interface BoldMethod {
  name: string
  output: string
  active: boolean
}
const boldMethods = ref<BoldMethod[]>([
  { name: '和值对半取胆', output: '1胆', active: true },
  { name: '跨度加均值定胆', output: '1胆', active: true },
  { name: '尾和取个位定胆', output: '3胆', active: false },
  { name: '首尾相加折半', output: '1胆', active: true },
  { name: '34对称对码定胆', output: '参考胆', active: false },
  { name: '奇异数定胆杀号', output: '胆+杀', active: true },
  { name: '红相减5码胆组', output: '5胆', active: false },
])
const boldedNumbers = ref<number[]>([7, 13, 21, 28])

function toggleBoldNumber(n: number) {
  const idx = boldedNumbers.value.indexOf(n)
  if (idx >= 0) boldedNumbers.value.splice(idx, 1)
  else if (boldedNumbers.value.length < 5) boldedNumbers.value.push(n)
}

// ─── Blue Ball Analysis ───
interface BlueMethod {
  name: string
  desc: string
  active: boolean
}
const blueMethods = ref<BlueMethod[]>([
  { name: '红蓝一体三区定位', desc: '和值定大小+跨度定区间+尾数定冷热', active: true },
  { name: '蓝球12杀法', desc: '四轮12种杀法 16→3-5', active: true },
  { name: '奇偶连出法', desc: '近3期同奇偶则反向', active: false },
  { name: '振幅锁定', desc: '上期蓝球±3/4/5', active: true },
  { name: '012路法', desc: '连续2期同路则杀', active: false },
])
const blueCandidates = ref<number[]>([3, 7, 11, 14])

// ─── Back Zone (DLT) ───
const twinStarGroups: [number, number][] = [
  [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12]
]
const activeStarGroups = ref<number[]>([0, 2, 4])

// ─── Matrix Reduce ───
interface MatrixMode {
  name: string
  input: string
  output: string
  guarantee: string
}
const matrixModes: MatrixMode[] = [
  { name: '双色球8码', input: '8红', output: '12注', guarantee: '中4保3' },
  { name: '双色球9-10码', input: '9-10红', output: '22-30注', guarantee: '中5保4' },
  { name: '大乐透前区7码', input: '7前', output: '7注', guarantee: '中4保3' },
  { name: '大乐透前区8-10码', input: '8-10前', output: '12-22注', guarantee: '中5保4' },
  { name: '大乐透后区3码', input: '3后', output: '3注', guarantee: '—' },
  { name: '大乐透后区4码', input: '4后', output: '6注', guarantee: '—' },
]
const activeMatrix = ref(0)
const matrixInputCount = ref(8)

// ─── Filters ───
interface FilterRule {
  name: string
  keep: string
  exclude: string
  enabled: boolean
}
const filterRules = ref<FilterRule[]>([
  { name: '奇偶比', keep: '3:3, 2:4, 4:2', exclude: '0:6, 6:0, 1:5, 5:1', enabled: true },
  { name: '大小比', keep: '3:3, 2:4, 4:2', exclude: '全大/全小', enabled: true },
  { name: '三区比', keep: '2:2:2, 1:2:3 等6种', exclude: '极端分布', enabled: false },
  { name: '连号', keep: '最多1组二连号', exclude: '三连号/多组', enabled: true },
  { name: '尾数', keep: '4-5种不同尾数', exclude: '3+同尾', enabled: true },
  { name: '和值(红球)', keep: '80-120', exclude: '超出范围', enabled: true },
  { name: '和值(前区)', keep: '70-130', exclude: '超出范围', enabled: false },
  { name: '质合比', keep: '2:4, 3:3, 4:2', exclude: '其余组合', enabled: true },
])

// ─── Results ───
const sampleCombos = ref<number[][]>([
  [3, 11, 17, 22, 28, 31],
  [5, 8, 14, 19, 26, 33],
  [2, 7, 13, 21, 25, 30],
])

// ─── Lucide Icons as inline SVGs ───
const iconPaths: Record<string, string> = {
  crosshair: 'M12 2a10 10 0 1 0 10 10M12 6a6 6 0 1 0 6 6M12 10a2 2 0 1 0 2 2',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'circle-dot': 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  'git-branch': 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'check': 'M20 6L9 17l-5-5',
  'plus': 'M12 5v14M5 12h14',
  'x': 'M18 6L6 18M6 6l12 12',
  'info': 'M12 16v-4M12 8h.01M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z',
}

function spanIcon(name: string, size = 20): string {
  const d = iconPaths[name] || iconPaths['info']
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
}

function toggleKill(index: number) {
  killMethods.value[index].enabled = !killMethods.value[index].enabled
}

function toggleFilter(index: number) {
  filterRules.value[index].enabled = !filterRules.value[index].enabled
}

function toggleStarGroup(index: number) {
  const i = activeStarGroups.value.indexOf(index)
  if (i >= 0) activeStarGroups.value.splice(i, 1)
  else activeStarGroups.value.push(index)
}
</script>

<template>
  <div
    class="rule-analysis"
    @mouseenter="sidebarExpanded = true"
    @mouseleave="sidebarExpanded = false"
  >
    <!-- Background Layer -->
    <div class="bg-layer">
      <div class="bg-image" role="presentation" aria-hidden="true" />
      <div class="bg-overlay" />
      <div class="bg-grain" />
    </div>

    <!-- Top Bar -->
    <header class="top-bar">
      <div class="top-inner">
        <a href="/" class="top-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span class="top-logo-text">妙手神透</span>
        </a>
        <div class="top-actions">
          <div class="type-switch">
            <button
              :class="['type-btn', { active: lotteryType === 'ssq' }]"
              @click="lotteryType = 'ssq'"
            >双色球</button>
            <button
              :class="['type-btn', { active: lotteryType === 'dlt' }]"
              @click="lotteryType = 'dlt'"
            >大乐透</button>
          </div>
          <span class="top-divider" aria-hidden="true" />
          <div class="top-period">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="period-text">2026065 期</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Sidebar -->
      <nav :class="['sidebar', { expanded: sidebarExpanded }]" role="navigation" aria-label="功能模块导航">
        <div class="sidebar-items">
          <button
            v-for="mod in modules"
            :key="mod.id"
            :class="['sidebar-item', { active: activeModule === mod.id }]"
            @click="activeModule = mod.id"
            :title="mod.label"
            :aria-label="mod.label"
          >
            <span class="sidebar-icon" v-html="spanIcon(mod.icon)"></span>
            <span :class="['sidebar-label', { visible: sidebarExpanded }]">{{ mod.label }}</span>
          </button>
        </div>
        <div class="sidebar-footer">
          <span class="sidebar-version">v2.0</span>
        </div>
      </nav>

      <!-- Content -->
      <main class="content">
        <div class="content-scroll">

          <!-- ═══ KILL MODULE ═══ -->
          <section v-if="activeModule === 'kill'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('crosshair', 22)"></span>
                杀号配置
              </h2>
              <div class="module-stats">
                <div class="stat-badge">
                  <span class="stat-label">已杀</span>
                  <span class="stat-value kill-count">{{ totalKills }}</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-label">剩余</span>
                  <span class="stat-value remain-count">{{ remainingRed }}</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-label">{{ lotteryType === 'ssq' ? '红球范围' : '前区范围' }}</span>
                  <span class="stat-value">{{ lotteryType === 'ssq' ? '01-33' : '01-35' }}</span>
                </div>
              </div>
            </div>

            <!-- Basic Kill Methods -->
            <div class="method-group">
              <h3 class="group-title">基础杀号</h3>
              <div class="method-grid">
                <div
                  v-for="(m, i) in killMethods.filter(x => x.group === 'basic')"
                  :key="m.name"
                  :class="['method-card', { active: m.enabled }]"
                >
                  <div class="method-head">
                    <label class="toggle-wrap">
                      <input type="checkbox" :checked="m.enabled" @change="toggleKill(i)" class="toggle-input">
                      <span class="toggle-track">
                        <span class="toggle-thumb" />
                      </span>
                    </label>
                    <span class="method-name">{{ m.name }}</span>
                  </div>
                  <p class="method-desc">{{ m.desc }}</p>
                  <div class="method-foot">
                    <span v-if="m.enabled" class="kill-tag">杀{{ m.kills }}码</span>
                    <span v-else class="kill-tag disabled">已关闭</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Advanced Kill Methods -->
            <div class="method-group">
              <h3 class="group-title">
                高级杀号
                <span class="group-badge">cp1.md</span>
              </h3>
              <div class="method-grid">
                <div
                  v-for="(m, i) in killMethods.filter(x => x.group === 'advanced')"
                  :key="m.name"
                  :class="['method-card', { active: m.enabled }]"
                >
                  <div class="method-head">
                    <label class="toggle-wrap">
                      <input type="checkbox" :checked="m.enabled" @change="toggleKill(i + killMethods.filter(x => x.group === 'basic').length)" class="toggle-input">
                      <span class="toggle-track">
                        <span class="toggle-thumb" />
                      </span>
                    </label>
                    <span class="method-name">{{ m.name }}</span>
                  </div>
                  <p class="method-desc">{{ m.desc }}</p>
                  <div class="method-foot">
                    <span v-if="m.enabled" class="kill-tag">杀{{ m.kills }}码</span>
                    <span v-else class="kill-tag disabled">已关闭</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kill Preview -->
            <div class="preview-box">
              <div class="preview-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <span>杀号预览</span>
              </div>
              <div class="preview-numbers">
                <span
                  v-for="n in [1,4,6,9,12,15,18,20,23,25,28,30,32]"
                  :key="n"
                  class="num-tag killed"
                >{{ String(n).padStart(2, '0') }}</span>
                <span class="num-sep" aria-hidden="true">|</span>
                <span
                  v-for="n in [2,3,5,7,8,10,11,13,14,16,17,19,21,22,24,26,27,29,31,33]"
                  :key="n"
                  class="num-tag remaining"
                >{{ String(n).padStart(2, '0') }}</span>
              </div>
            </div>
          </section>

          <!-- ═══ SELECT MODULE ═══ -->
          <section v-if="activeModule === 'select'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('filter', 22)"></span>
                选号方法
              </h2>
            </div>
            <div class="method-grid select-grid">
              <div
                v-for="m in visibleSelectMethods"
                :key="m.name"
                :class="['method-card select-card', { active: m.active, 'dlt-only': m.applies.length === 1 && m.applies[0] === 'dlt' }]"
              >
                <div class="select-head">
                  <label class="toggle-wrap">
                    <input type="checkbox" v-model="m.active" class="toggle-input">
                    <span class="toggle-track">
                      <span class="toggle-thumb" />
                    </span>
                  </label>
                  <span class="method-name">{{ m.name }}</span>
                  <span v-if="m.applies.length === 1 && m.applies[0] === 'dlt'" class="tag-dlt">DLT</span>
                </div>
                <p class="method-desc">{{ m.desc }}</p>
                <div class="select-preview">
                  <span class="select-preview-label">推荐号码</span>
                  <div class="preview-numbers">
                    <span class="num-tag remaining">07</span>
                    <span class="num-tag remaining">13</span>
                    <span class="num-tag remaining">19</span>
                    <span class="num-tag remaining">24</span>
                    <span class="num-tag remaining">31</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="preview-box">
              <div class="preview-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>方法交叉验证</span>
              </div>
              <div class="cross-bars">
                <div class="cross-row">
                  <span class="cross-name">横标纵标法</span>
                  <div class="cross-track"><div class="cross-fill" style="width:87%"></div></div>
                  <span class="cross-pct">87%</span>
                </div>
                <div class="cross-row">
                  <span class="cross-name">质合数螺旋</span>
                  <div class="cross-track"><div class="cross-fill" style="width:82%"></div></div>
                  <span class="cross-pct">82%</span>
                </div>
                <div class="cross-row">
                  <span class="cross-name">奖号时钟法</span>
                  <div class="cross-track"><div class="cross-fill" style="width:76%"></div></div>
                  <span class="cross-pct">76%</span>
                </div>
                <div class="cross-row">
                  <span class="cross-name">九宫选号法</span>
                  <div class="cross-track"><div class="cross-fill" style="width:91%"></div></div>
                  <span class="cross-pct">91%</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ BOLD MODULE ═══ -->
          <section v-if="activeModule === 'bold'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('star', 22)"></span>
                定胆配置
              </h2>
              <div class="module-stats">
                <div class="stat-badge">
                  <span class="stat-label">已选胆码</span>
                  <span class="stat-value bold-count">{{ boldedNumbers.length }}</span>
                </div>
              </div>
            </div>

            <div class="method-group">
              <h3 class="group-title">定胆方法</h3>
              <div class="method-grid mini-grid">
                <div v-for="m in boldMethods" :key="m.name" :class="['method-card mini-card', { active: m.active }]">
                  <div class="method-head">
                    <label class="toggle-wrap">
                      <input type="checkbox" v-model="m.active" class="toggle-input">
                      <span class="toggle-track">
                        <span class="toggle-thumb" />
                      </span>
                    </label>
                    <span class="method-name">{{ m.name }}</span>
                  </div>
                  <span class="mini-output">{{ m.output }}</span>
                </div>
              </div>
            </div>

            <div class="number-grid-wrap">
              <h3 class="group-title">号码盘 · 点击标记胆码</h3>
              <div class="number-grid">
                <button
                  v-for="n in (lotteryType === 'ssq' ? 33 : 35)"
                  :key="n"
                  :class="['num-cell', { bolded: boldedNumbers.includes(n), prime: [2,3,5,7,11,13,17,19,23,29,31].includes(n) }]"
                  @click="toggleBoldNumber(n)"
                  :aria-label="`号码 ${n}${boldedNumbers.includes(n) ? '（已标记为胆码）' : ''}`"
                >
                  <span class="num-cell-value">{{ String(n).padStart(2, '0') }}</span>
                  <span v-if="boldedNumbers.includes(n)" class="bold-dot" />
                </button>
              </div>
              <div class="grid-legend">
                <span class="legend-item"><span class="legend-dot prime-dot" /> 质数</span>
                <span class="legend-item"><span class="legend-dot bold-dot-legend" /> 胆码</span>
              </div>
            </div>
          </section>

          <!-- ═══ BLUE BALL MODULE ═══ -->
          <section v-if="activeModule === 'blue'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('circle-dot', 22)"></span>
                蓝球分析
              </h2>
              <div class="module-stats">
                <div class="stat-badge">
                  <span class="stat-label">候选蓝球</span>
                  <span class="stat-value blue-count">{{ blueCandidates.length }}</span>
                </div>
              </div>
            </div>

            <div class="method-group">
              <h3 class="group-title">蓝球推演方法</h3>
              <div class="method-grid mini-grid">
                <div v-for="m in blueMethods" :key="m.name" :class="['method-card mini-card', { active: m.active }]">
                  <div class="method-head">
                    <label class="toggle-wrap">
                      <input type="checkbox" v-model="m.active" class="toggle-input">
                      <span class="toggle-track">
                        <span class="toggle-thumb" />
                      </span>
                    </label>
                    <span class="method-name">{{ m.name }}</span>
                  </div>
                  <span class="mini-output">{{ m.desc }}</span>
                </div>
              </div>
            </div>

            <div class="blue-display">
              <div class="blue-ring">
                <div
                  v-for="(n, i) in 16"
                  :key="n"
                  :class="['blue-slot', { candidate: blueCandidates.includes(n) }]"
                  :style="{ '--angle': `${(i / 16) * 360}deg` }"
                >
                  <span class="blue-num">{{ String(n).padStart(2, '0') }}</span>
                </div>
                <div class="ring-center">
                  <span class="ring-label">候选</span>
                  <span class="ring-count">{{ blueCandidates.length }}</span>
                </div>
              </div>
              <div class="blue-list">
                <div class="blue-list-header">筛选结果</div>
                <div class="blue-candidates">
                  <div v-for="n in blueCandidates" :key="n" class="blue-cand-item">
                    <span class="blue-cand-num">{{ String(n).padStart(2, '0') }}</span>
                    <span class="blue-cand-reason">振幅锁定 + 奇偶交替</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ BACK ZONE MODULE ═══ -->
          <section v-if="activeModule === 'back'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('layers', 22)"></span>
                后区分析 · 双子星组合
              </h2>
            </div>
            <p class="module-subtitle">12个后区号码分为6组固定配对，冷热+012路+奇偶大小三轮筛选</p>
            <div class="star-grid">
              <div
                v-for="(group, i) in twinStarGroups"
                :key="i"
                :class="['star-card', { active: activeStarGroups.includes(i) }]"
                @click="toggleStarGroup(i)"
              >
                <div class="star-label">
                  <span class="star-name">双子星 {{ i + 1 }} 组</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div class="star-nums">
                  <span class="star-num">{{ String(group[0]).padStart(2, '0') }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="star-link" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span class="star-num">{{ String(group[1]).padStart(2, '0') }}</span>
                </div>
                <div class="star-status">
                  <span v-if="activeStarGroups.includes(i)" class="star-badge active-badge">已选</span>
                  <span v-else class="star-badge">点击选择</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ REDUCE MODULE ═══ -->
          <section v-if="activeModule === 'reduce'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('grid', 22)"></span>
                矩阵缩水
              </h2>
            </div>
            <div class="matrix-select">
              <button
                v-for="(mode, i) in matrixModes"
                :key="mode.name"
                :class="['matrix-btn', { active: activeMatrix === i }]"
                @click="activeMatrix = i"
              >{{ mode.name }}</button>
            </div>
            <div class="matrix-detail">
              <div class="matrix-row">
                <span class="matrix-label">输入</span>
                <span class="matrix-val">{{ matrixModes[activeMatrix].input }}</span>
              </div>
              <div class="matrix-row">
                <span class="matrix-label">输出</span>
                <span class="matrix-val highlight">{{ matrixModes[activeMatrix].output }}</span>
              </div>
              <div class="matrix-row">
                <span class="matrix-label">保障</span>
                <span class="matrix-val">{{ matrixModes[activeMatrix].guarantee }}</span>
              </div>
              <div class="matrix-slider">
                <span class="slider-label">备选数量</span>
                <input type="range" v-model.number="matrixInputCount" :min="lotteryType === 'ssq' ? 6 : 5" :max="lotteryType === 'ssq' ? 16 : 14" class="range-input">
                <span class="slider-val">{{ matrixInputCount }}</span>
              </div>
              <button class="matrix-gen-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                生成矩阵
              </button>
            </div>
          </section>

          <!-- ═══ FILTER MODULE ═══ -->
          <section v-if="activeModule === 'filter'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('sliders', 22)"></span>
                组合过滤
              </h2>
              <div class="module-stats">
                <div class="stat-badge">
                  <span class="stat-label">启用</span>
                  <span class="stat-value">{{ filterRules.filter(f => f.enabled).length }}/{{ filterRules.length }}</span>
                </div>
              </div>
            </div>
            <div class="filter-grid">
              <div v-for="(f, i) in filterRules" :key="f.name" :class="['filter-card', { active: f.enabled }]">
                <div class="filter-head">
                  <label class="toggle-wrap">
                    <input type="checkbox" :checked="f.enabled" @change="toggleFilter(i)" class="toggle-input">
                    <span class="toggle-track">
                      <span class="toggle-thumb" />
                    </span>
                  </label>
                  <span class="filter-name">{{ f.name }}</span>
                </div>
                <div class="filter-body">
                  <div class="filter-rule">
                    <span class="filter-label">保留</span>
                    <span class="filter-val keep">{{ f.keep }}</span>
                  </div>
                  <div class="filter-rule">
                    <span class="filter-label">排除</span>
                    <span class="filter-val exclude">{{ f.exclude }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ FLOW MODULE ═══ -->
          <section v-if="activeModule === 'flow'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('git-branch', 22)"></span>
                完整流程
              </h2>
            </div>
            <p class="module-subtitle">{{ lotteryType === 'ssq' ? '双色球五步标准流程' : '大乐透四步标准流程' }}</p>
            <div class="flow-steps">
              <div v-for="(step, i) in (lotteryType === 'ssq' ? ssqSteps : dltSteps)" :key="i" class="flow-step">
                <div class="step-indicator">
                  <span class="step-num">{{ i + 1 }}</span>
                  <div v-if="i < (lotteryType === 'ssq' ? 4 : 3)" class="step-line" />
                </div>
                <div class="step-content">
                  <div class="step-header">
                    <span class="step-title">{{ step.title }}</span>
                    <span class="step-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                  <p class="step-desc">{{ step.desc }}</p>
                  <div class="step-preview">
                    <span v-for="n in step.numbers" :key="n" class="num-tag remaining">{{ String(n).padStart(2, '0') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ RESULT MODULE ═══ -->
          <section v-if="activeModule === 'result'" class="module-section">
            <div class="module-header">
              <h2 class="module-title">
                <span class="module-icon" v-html="spanIcon('bar-chart', 22)"></span>
                结果看板
              </h2>
            </div>

            <div class="result-stats">
              <div class="stat-card">
                <span class="stat-card-label">生成注数</span>
                <span class="stat-card-value">3 注</span>
              </div>
              <div class="stat-card">
                <span class="stat-card-label">红球和值</span>
                <span class="stat-card-value">112</span>
              </div>
              <div class="stat-card">
                <span class="stat-card-label">奇偶比</span>
                <span class="stat-card-value">3:3</span>
              </div>
              <div class="stat-card">
                <span class="stat-card-label">大小比</span>
                <span class="stat-card-value">4:2</span>
              </div>
              <div class="stat-card">
                <span class="stat-card-label">跨度</span>
                <span class="stat-card-value">28</span>
              </div>
              <div class="stat-card">
                <span class="stat-card-label">质合比</span>
                <span class="stat-card-value">2:4</span>
              </div>
            </div>

            <div class="result-combos">
              <h3 class="group-title">号码详情</h3>
              <div v-for="(combo, i) in sampleCombos" :key="i" class="combo-row">
                <span class="combo-index">第{{ i + 1 }}注</span>
                <div class="combo-balls">
                  <span v-for="n in combo" :key="n" :class="['ball', n <= 16 && lotteryType === 'ssq' ? 'ball-blue' : 'ball-red']">{{ String(n).padStart(2, '0') }}</span>
                </div>
                <div class="combo-meta">
                  <span>和{{ combo.reduce((a, b) => a + b, 0) }}</span>
                  <span>奇{{ combo.filter(n => n % 2 === 1).length }}</span>
                  <span>偶{{ combo.filter(n => n % 2 === 0).length }}</span>
                </div>
              </div>
            </div>

            <div class="result-chart">
              <h3 class="group-title">号码分布</h3>
              <div class="dist-chart">
                <div v-for="(count, zone) in { '01-11': 6, '12-22': 8, '23-33': 4 }" :key="zone" class="dist-bar-wrap">
                  <span class="dist-label">{{ zone }}</span>
                  <div class="dist-track">
                    <div class="dist-fill" :style="{ width: `${(count / 18) * 100}%` }" />
                  </div>
                  <span class="dist-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
// ─── Step Data (outside setup for template access) ───
interface StepDef {
  title: string
  desc: string
  numbers: number[]
}
const ssqSteps: StepDef[] = [
  { title: '杀号', desc: '排除15-18个废号，剩余约15个红球', numbers: [3,5,7,8,11,13,14,17,19,21,22,24,26,28,30] },
  { title: '定胆', desc: '多公式交叉验证，锁定2-3个核心号', numbers: [7, 21, 28] },
  { title: '选号', desc: '质合比+区间均衡+冷热温搭配', numbers: [3,5,7,8,11,13,14,17,19,21,22,24] },
  { title: '矩阵缩水', desc: '旋转矩阵缩水至12-30注', numbers: [] },
  { title: '组合过滤', desc: '奇偶/大小/区间/连号/和值校验', numbers: [] },
]
const dltSteps: StepDef[] = [
  { title: '横标纵标缩号', desc: '7横标±5纵标 → 8-12码', numbers: [3,7,11,14,18,22,25,29,33] },
  { title: '后区筛选', desc: '双子星冷热+012路 → 2-4码', numbers: [4, 10] },
  { title: '旋转矩阵缩水', desc: '8-10码 → 12-22注', numbers: [] },
  { title: '过滤检查', desc: '三区间/奇偶/大小/和值校验', numbers: [] },
]
</script>

<style scoped>
/* ═══════════════════════════════════════
   JADE & INK — Rule Analysis Theme
   ═══════════════════════════════════════ */

:root {
  --ink-bg: #0a0c15;
  --ink-surface: #111422;
  --ink-card: #161a2e;
  --ink-border: #1e2440;
  --ink-hover: #1c2340;
  --jade: #3ba873;
  --jade-glow: rgba(59, 168, 115, 0.25);
  --jade-light: #5ddb92;
  --jade-dark: #2d8a5e;
  --gold: #c9a84c;
  --gold-dim: #8a7535;
  --vermillion: #d94f4f;
  --vermillion-dim: #8a3030;
  --text-primary: #e8e6e3;
  --text-secondary: #9492a0;
  --text-dim: #5c5a6a;
  --font-display: 'Noto Serif SC', 'SourceHanSerifSC', serif;
  --font-body: 'Noto Sans SC', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

.rule-analysis {
  min-height: 100vh;
  background: var(--ink-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  position: relative;
  overflow: hidden;
}

/* ─── Background ─── */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* TODO: configure PEXELS_API_KEY for dynamic image loading */
.bg-image {
  position: absolute;
  inset: 0;
  background-image: url('https://images.pexels.com/photos/4737484/pexels-photo-4737484.jpeg?auto=compress&cs=tinysrgb&w=1920');
  background-size: cover;
  background-position: center 30%;
  opacity: 0.08;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(59, 168, 115, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(201, 168, 76, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(217, 79, 79, 0.03) 0%, transparent 50%);
}

.bg-grain {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}

/* ─── Top Bar ─── */
.top-bar {
  position: relative;
  z-index: 20;
  border-bottom: 1px solid var(--ink-border);
  background: rgba(10, 12, 21, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.top-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--jade-light);
  text-decoration: none;
}

.top-logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--jade-light), var(--gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.type-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid var(--ink-border);
}

.type-btn {
  padding: 4px 14px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.type-btn.active {
  background: var(--jade);
  color: #fff;
  font-weight: 600;
}

.top-divider {
  width: 1px;
  height: 20px;
  background: var(--ink-border);
}

.top-period {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
}

/* ─── Main Layout ─── */
.main-layout {
  position: relative;
  z-index: 10;
  display: flex;
  height: calc(100vh - 56px);
}

/* ─── Sidebar ─── */
.sidebar {
  width: 56px;
  background: rgba(10, 12, 21, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid var(--ink-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.expanded {
  width: 180px;
}

.sidebar-items {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-family: var(--font-body);
  transition: all 0.15s;
  white-space: nowrap;
  position: relative;
}

.sidebar-item:hover {
  background: rgba(59, 168, 115, 0.08);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: rgba(59, 168, 115, 0.12);
  color: var(--jade-light);
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--jade);
  border-radius: 0 2px 2px 0;
}

.sidebar-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-label {
  opacity: 0;
  transition: opacity 0.15s;
}

.sidebar-label.visible {
  opacity: 1;
}

.sidebar-footer {
  padding: 12px 16px;
}

.sidebar-version {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

/* ─── Content ─── */
.content {
  flex: 1;
  overflow: hidden;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
  padding: 32px 40px;
  max-width: 1100px;
}

.content-scroll::-webkit-scrollbar {
  width: 4px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: var(--ink-border);
  border-radius: 2px;
}

/* ─── Module Section ─── */
.module-section {
  animation: fadeUp 0.3s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.module-icon {
  color: var(--jade);
}

.module-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: -16px 0 24px;
  padding-left: 32px;
}

.module-stats {
  display: flex;
  gap: 8px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--ink-border);
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-dim);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.kill-count { color: var(--vermillion); }
.remain-count { color: var(--jade-light); }
.bold-count { color: var(--gold); }
.blue-count { color: #5b9bd5; }

/* ─── Method Groups ─── */
.method-group {
  margin-bottom: 28px;
}

.group-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(201, 168, 76, 0.12);
  color: var(--gold);
  border-radius: 4px;
  font-family: var(--font-mono);
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.method-card {
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 10px;
  transition: all 0.2s;
}

.method-card.active {
  background: rgba(59, 168, 115, 0.04);
  border-color: rgba(59, 168, 115, 0.2);
}

.method-card:hover {
  background: rgba(255, 255, 255, 0.04);
}

.method-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.method-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.method-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0 8px;
  line-height: 1.4;
}

.method-foot {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kill-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(217, 79, 79, 0.1);
  color: var(--vermillion);
  font-family: var(--font-mono);
}

.kill-tag.disabled {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-dim);
}

.mini-grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.mini-card .method-head {
  margin-bottom: 0;
}

.mini-output {
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  margin-top: 4px;
  display: block;
}

/* ─── Toggle Switch ─── */
.toggle-wrap {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  width: 32px;
  height: 18px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  position: relative;
  transition: background 0.2s;
  border: 1px solid var(--ink-border);
}

.toggle-input:checked + .toggle-track {
  background: var(--jade);
  border-color: var(--jade-dark);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(14px);
}

/* ─── Preview Box ─── */
.preview-box {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 10px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.preview-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.num-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 600;
}

.num-tag.killed {
  background: rgba(217, 79, 79, 0.12);
  color: var(--vermillion-dim);
  text-decoration: line-through;
}

.num-tag.remaining {
  background: rgba(59, 168, 115, 0.1);
  color: var(--jade-light);
}

.num-sep {
  color: var(--ink-border);
  margin: 0 4px;
}

/* ─── Select Module ─── */
.select-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.select-card {
  padding: 16px;
}

.select-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-dlt {
  font-size: 10px;
  padding: 1px 5px;
  background: rgba(59, 130, 246, 0.15);
  color: #5b9bd5;
  border-radius: 3px;
  margin-left: auto;
}

.select-preview {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.select-preview-label {
  font-size: 11px;
  color: var(--text-dim);
  display: block;
  margin-bottom: 6px;
}

/* ─── Cross Validation Bars ─── */
.cross-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cross-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cross-name {
  width: 100px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.cross-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.cross-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--jade-dark), var(--jade-light));
  border-radius: 3px;
  transition: width 0.6s ease;
}

.cross-pct {
  width: 36px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--jade-light);
  text-align: right;
}

/* ─── Number Grid ─── */
.number-grid-wrap {
  margin-top: 8px;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.num-cell {
  position: relative;
  aspect-ratio: 1;
  border: 1px solid var(--ink-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  transition: all 0.15s;
  padding: 0;
}

.num-cell:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(59, 168, 115, 0.3);
}

.num-cell.prime {
  color: var(--gold-dim);
}

.num-cell.prime .num-cell-value {
  font-weight: 600;
}

.num-cell.bolded {
  background: rgba(201, 168, 76, 0.12);
  border-color: var(--gold);
  color: var(--gold);
}

.bold-dot {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  background: var(--gold);
  border-radius: 50%;
}

.grid-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-dim);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.prime-dot {
  background: var(--gold-dim);
}

.bold-dot-legend {
  background: var(--gold);
}

/* ─── Blue Ball Display ─── */
.blue-display {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-top: 12px;
}

.blue-ring {
  position: relative;
  width: 260px;
  height: 260px;
  flex-shrink: 0;
}

.blue-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  transform: rotate(var(--angle)) translateY(-100px) rotate(calc(-1 * var(--angle)));
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--ink-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.blue-slot.candidate {
  background: rgba(59, 168, 115, 0.12);
  border-color: var(--jade);
  box-shadow: 0 0 12px var(--jade-glow);
}

.blue-num {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.blue-slot.candidate .blue-num {
  color: var(--jade-light);
  font-weight: 700;
}

.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
}

.ring-count {
  font-size: 28px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--jade-light);
}

.blue-list {
  flex: 1;
  min-width: 200px;
}

.blue-list-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.blue-candidates {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blue-cand-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 8px;
}

.blue-cand-num {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--jade-light);
  width: 32px;
}

.blue-cand-reason {
  font-size: 12px;
  color: var(--text-dim);
}

/* ─── Star Groups ─── */
.star-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.star-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.star-card:hover {
  border-color: rgba(59, 168, 115, 0.2);
}

.star-card.active {
  background: rgba(59, 168, 115, 0.06);
  border-color: var(--jade);
}

.star-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 14px;
  color: var(--text-secondary);
  font-size: 13px;
}

.star-card.active .star-label {
  color: var(--jade-light);
}

.star-nums {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.star-num {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.star-link {
  color: var(--text-dim);
}

.star-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
}

.star-badge.active-badge {
  background: var(--jade);
  color: #fff;
}

/* ─── Matrix ─── */
.matrix-select {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.matrix-btn {
  padding: 6px 14px;
  border: 1px solid var(--ink-border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
}

.matrix-btn.active {
  background: var(--jade);
  color: #fff;
  border-color: var(--jade-dark);
}

.matrix-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.04);
}

.matrix-detail {
  max-width: 400px;
}

.matrix-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.matrix-label {
  width: 60px;
  font-size: 13px;
  color: var(--text-dim);
}

.matrix-val {
  font-size: 14px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.matrix-val.highlight {
  color: var(--jade-light);
  font-weight: 700;
  font-size: 18px;
}

.matrix-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.slider-label {
  font-size: 13px;
  color: var(--text-dim);
  white-space: nowrap;
}

.range-input {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--ink-border);
  border-radius: 2px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--jade);
  cursor: pointer;
}

.slider-val {
  width: 24px;
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--jade-light);
  text-align: right;
}

.matrix-gen-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: var(--jade);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 8px;
}

.matrix-gen-btn:hover {
  background: var(--jade-dark);
}

/* ─── Filter ─── */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.filter-card {
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 10px;
  transition: all 0.2s;
}

.filter-card.active {
  background: rgba(59, 168, 115, 0.04);
  border-color: rgba(59, 168, 115, 0.15);
}

.filter-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.filter-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.filter-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-rule {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 11px;
  color: var(--text-dim);
  width: 36px;
  flex-shrink: 0;
}

.filter-val {
  font-size: 12px;
}

.filter-val.keep {
  color: var(--jade-light);
}

.filter-val.exclude {
  color: var(--vermillion-dim);
}

/* ─── Flow Steps ─── */
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.flow-step {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--jade);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-line {
  width: 1px;
  flex: 1;
  background: linear-gradient(to bottom, var(--jade-dark), var(--ink-border));
  margin: 4px 0;
}

.flow-step:last-child .step-line {
  display: none;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-display);
}

.step-arrow {
  color: var(--jade);
  display: flex;
}

.step-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 10px;
}

.step-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* ─── Result Dashboard ─── */
.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 10px;
  text-align: center;
}

.stat-card-label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.stat-card-value {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--jade-light);
}

.result-combos {
  margin-bottom: 24px;
}

.combo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--ink-border);
  border-radius: 10px;
  margin-bottom: 8px;
}

.combo-index {
  font-size: 12px;
  color: var(--text-dim);
  width: 48px;
  flex-shrink: 0;
}

.combo-balls {
  display: flex;
  gap: 5px;
  flex: 1;
}

.ball {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 700;
}

.ball-red {
  background: rgba(217, 79, 79, 0.15);
  color: #f08080;
  border: 1px solid rgba(217, 79, 79, 0.3);
}

.ball-blue {
  background: rgba(59, 168, 115, 0.15);
  color: var(--jade-light);
  border: 1px solid rgba(59, 168, 115, 0.3);
}

.combo-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-dim);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* ─── Distribution Chart ─── */
.result-chart {
  margin-top: 8px;
}

.dist-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dist-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dist-label {
  width: 50px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.dist-track {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 5px;
  overflow: hidden;
}

.dist-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--jade-dark), var(--jade-light));
  border-radius: 5px;
}

.dist-count {
  width: 24px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--jade-light);
  text-align: right;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .sidebar {
    width: 48px;
  }
  .sidebar.expanded {
    width: 48px;
  }
  .sidebar-label {
    display: none;
  }
  .content-scroll {
    padding: 20px 16px;
  }
  .method-grid {
    grid-template-columns: 1fr;
  }
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .blue-display {
    flex-direction: column;
    align-items: center;
  }
  .number-grid {
    grid-template-columns: repeat(7, 1fr);
  }
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .combo-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .result-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .top-inner {
    padding: 0 12px;
  }
  .top-period {
    display: none;
  }
  .number-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  .result-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
