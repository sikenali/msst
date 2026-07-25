<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RiCloseLine, RiRefreshLine } from '@remixicon/vue'
import { getHistoryData } from '@/composables/useTrendData'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

type TabType = '10' | '30' | '50'
type LotteryType = 'ssq' | 'dlt'

const activeTab = ref<TabType>('10')
const activeLottery = ref<LotteryType>('ssq')
const loading = ref(false)
const records = ref<any[]>([])
const refreshTime = ref('')

const tabs = [
  { key: '10' as TabType, label: '近10期' },
  { key: '30' as TabType, label: '近30期' },
  { key: '50' as TabType, label: '近50期' },
]

async function loadData() {
  loading.value = true
  try {
    const data = await getHistoryData(activeLottery.value, Number(activeTab.value))
    records.value = data.map((r: any, i: number) => ({ ...r, idx: i }))
    refreshTime.value = new Date().toLocaleTimeString('zh-CN')
  } catch {
    refreshTime.value = '数据获取失败'
  } finally {
    loading.value = false
  }
}

watch([activeLottery, activeTab], () => loadData(), { immediate: true })

// 每日推荐: 基于趋势分析取众数/热号
const recommendation = computed(() => {
  if (!records.value.length) return { red: [] as number[], blue: [] as number[] }
  const count = records.value.length
  // 统计每个红球出现频率
  const freq = new Map<number, number>()
  for (let i = 1; i <= (activeLottery.value === 'ssq' ? 33 : 35); i++) freq.set(i, 0)
  for (const r of records.value) {
    for (const n of r.reds) {
      if (freq.has(n)) freq.set(n, freq.get(n)! + 1)
    }
  }
  // 取频率最高的6个(或5个)作为红球
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])
  const redCount = activeLottery.value === 'ssq' ? 6 : 5
  const reds = sorted.slice(0, redCount)

  // 蓝球取出现频率最高
  const bfreq = new Map<number, number>()
  for (let i = 1; i <= (activeLottery.value === 'ssq' ? 16 : 12); i++) bfreq.set(i, 0)
  for (const r of records.value) {
    for (const n of r.blues) {
      if (bfreq.has(n)) bfreq.set(n, bfreq.get(n)! + 1)
    }
  }
  const blueSorted = Array.from(bfreq.entries()).sort((a, b) => b[1] - a[1])
  const blues = blueSorted.map(e => e[0]).slice(0, 1)

  return { red: reds.sort((a, b) => a - b), blue: blues.sort((a, b) => a - b) }
})

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <Transition name="trend-modal">
    <div v-if="visible" class="trend-overlay" @click="handleOverlayClick">
      <div class="trend-content">
        <div class="trend-header">
          <h3 class="trend-title">每日推荐</h3>
          <div class="trend-actions">
            <button class="trend-refresh" :class="{ loading }" @click="loadData" title="刷新数据">
              <RiRefreshLine :class="{ spinning: loading }" />
            </button>
            <button class="trend-close" @click="emit('close')">
              <RiCloseLine />
            </button>
          </div>
        </div>

        <!-- 彩种切换 -->
        <div class="lottery-tabs">
          <button
            v-for="t in [{key:'ssq' as LotteryType, label:'双色球'}, {key:'dlt' as LotteryType, label:'大乐透'}]"
            :key="t.key"
            class="lottery-tab"
            :class="{ active: activeLottery === t.key }"
            @click="activeLottery = t.key"
          >{{ t.label }}</button>
        </div>

        <!-- 期数切换 -->
        <div class="period-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="period-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>

        <!-- 推荐号码 -->
        <div class="recommendation">
          <div class="rec-label">今日推荐</div>
          <div class="rec-balls">
            <span
              v-for="n in recommendation.red"
              :key="'r' + n"
              class="rec-ball rec-ball--red"
            >{{ pad(n) }}</span>
            <span
              v-for="n in recommendation.blue"
              :key="'b' + n"
              class="rec-ball rec-ball--blue"
            >{{ pad(n) }}</span>
          </div>
          <div class="rec-source">基于近 {{ activeTab }} 期走势分析</div>
        </div>

        <!-- 走势表格 -->
        <div class="trend-analysis">
          <div class="analysis-title">
            走势分析 · 近 {{ activeTab }} 期
            <span v-if="refreshTime" class="refresh-time">更新: {{ refreshTime }}</span>
          </div>

          <div v-if="loading" class="loading-state">加载中...</div>
          <div v-else-if="!records.length" class="empty-state">暂无数据</div>

          <table v-else class="trend-table">
            <thead>
              <tr>
                <th>期号</th>
                <th v-for="i in (activeLottery === 'ssq' ? 6 : 5)" :key="'h1'+i">#{{i}}</th>
                <th v-if="activeLottery === 'ssq'" class="blue-h">蓝</th>
                <th v-else v-for="i in 2" :key="'h2'+i">#{{i}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, ri) in records" :key="r.issue" :class="{ 'row-first': ri === 0 }">
                <td class="issue-cell">{{ r.issue.slice(-5) }}</td>
                <td v-for="n in r.reds" :key="'r'+n" class="num-cell num-red">{{ pad(n) }}</td>
                <template v-if="activeLottery === 'ssq'">
                  <td v-for="n in r.blues" :key="'b'+n" class="num-cell num-blue">{{ pad(n) }}</td>
                </template>
                <template v-else>
                  <td v-for="n in r.blues" :key="'bl'+n" class="num-cell num-blue">{{ pad(n) }}</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.trend-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

.trend-content {
  width: 100%;
  max-width: 720px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
}

.trend-title {
  font-size: 18px;
  font-weight: 700;
  color: #92400E;
  margin: 0;
  font-family: 'SourceHanSans-Bold';
}

.trend-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.trend-refresh,
.trend-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #B45309;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.trend-refresh:hover,
.trend-close:hover {
  background: rgba(217, 119, 6, 0.1);
}

.trend-refresh svg,
.trend-close svg {
  width: 20px;
  height: 20px;
}

.trend-refresh.loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.lottery-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 20px;
}

.lottery-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #92400E;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'SourceHanSans-Medium';
  transition: all 0.2s;
}

.lottery-tab.active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(245, 158, 11, 1) 100%);
  color: white;
}

.period-tabs {
  display: flex;
  gap: 6px;
  padding: 4px 20px 12px;
}

.period-tab {
  padding: 6px 16px;
  border: 1px solid #FDE68A;
  border-radius: 9999px;
  background: transparent;
  color: #D97706;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'SourceHanSans-Medium';
  transition: all 0.2s;
}

.period-tab.active {
  background: #F59E0B;
  color: white;
  border-color: #F59E0B;
}

.recommendation {
  margin: 0 20px 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(255, 251, 235, 0.8) 100%);
  border: 1px solid rgba(253, 230, 138, 0.6);
  text-align: center;
}

.rec-label {
  font-size: 12px;
  color: #B45309;
  margin-bottom: 8px;
  font-weight: 600;
}

.rec-balls {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.rec-ball {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.rec-ball--red {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.rec-ball--blue {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.rec-source {
  font-size: 11px;
  color: #B45309;
  margin-top: 8px;
  opacity: 0.7;
}

.trend-analysis {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 16px;
}

.analysis-title {
  font-size: 14px;
  font-weight: 700;
  color: #92400E;
  margin-bottom: 10px;
  font-family: 'SourceHanSans-Bold';
}

.refresh-time {
  font-size: 11px;
  color: #B45309;
  font-weight: 400;
  opacity: 0.7;
  font-family: inherit;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px 0;
  color: #92400E;
  opacity: 0.6;
}

.trend-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.trend-table th {
  padding: 6px 2px;
  color: #92400E;
  font-weight: 600;
  font-size: 11px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.2);
  text-align: center;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
}

.trend-table td {
  padding: 5px 2px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SourceHanSans-Bold';
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.row-first td {
  background: rgba(254, 243, 199, 0.3);
}

.issue-cell {
  font-size: 11px !important;
  color: #B45309;
  min-width: 36px;
}

.num-cell {
  min-width: 32px;
}

.num-red {
  color: #DC2626;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.num-blue {
  color: #2563EB;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 过渡动画 */
.trend-modal-enter-active,
.trend-modal-leave-active {
  transition: opacity 0.3s ease;
}

.trend-modal-enter-from,
.trend-modal-leave-to {
  opacity: 0;
}

@media screen and (max-width: 480px) {
  .trend-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .trend-content {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
  }

  .rec-ball {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .trend-table {
    font-size: 11px;
  }

  .num-red, .num-blue {
    width: 22px;
    height: 22px;
    font-size: 10px;
  }
}
</style>
