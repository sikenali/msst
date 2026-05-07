<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RiCloseLine, RiLightbulbLine, RiFireLine, RiSparkling2Line, RiRefreshLine } from '@remixicon/vue'
import { useUserSelections, setCurrentType } from '@/composables/useUserSelections'
import { useLotteryHistory, fetchHistoryData } from '@/composables/useLotteryHistory'

interface Props {
  visible: boolean
  lotteryType: 'ssq' | 'dlt'
  defaultTab?: 'cover' | 'strategy'  // 默认显示的Tab
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 内部Tab状态（三三制选号法页面用）
const internalTab = ref<'stats' | 'rules'>('stats')

// 标题根据来源和彩种动态变化
const title = computed(() => {
  return props.defaultTab === 'cover' ? '三注覆盖法' : '三三制选号法'
})

// 从全局状态获取规则开关
const { userCoverRules, userStrategyRules, setCoverRule, setStrategyRule, setAllCoverRules, setAllStrategyRules } = useUserSelections()

// 获取历史数据
const { ssqStats, dltStats, isLoading, refresh } = useLotteryHistory()
const currentStats = computed(() => props.lotteryType === 'ssq' ? ssqStats.value : dltStats.value)

// 弹窗打开时同步彩种并加载数据
watch(() => props.visible, async (val) => {
  if (val && props.lotteryType) {
    setCurrentType(props.lotteryType)
    internalTab.value = 'stats'  // 重置内部Tab
    await fetchHistoryData()
  }
})

onMounted(async () => {
  await fetchHistoryData()
})

// ====== 双色球规则数据 ======
const ssqCoverRules = [
  { num: '1', text: '将红球(01-33)分为三个区间：小区(01-11)、中区(12-22)、大区(23-33)', color: '#DC2626', bg: '#FEE2E2' },
  { num: '2', text: '第一注(均衡型)：小区2个 + 中区2个 + 大区2个，覆盖全面', color: '#DC2626', bg: '#FEE2E2' },
  { num: '3', text: '第二注(偏小中)：小区3个 + 中区3个 + 大区0个，适合号码偏小', color: '#2563EB', bg: '#DBEAFE' },
  { num: '4', text: '第三注(偏中大)：小区0个 + 中区3个 + 大区3个，适合号码偏大', color: '#2563EB', bg: '#DBEAFE' },
  { num: '5', text: '三注之间尽量不要重复号码，扩大覆盖范围', color: '#D97706', bg: '#FEF3C7' },
  { num: '6', text: '每注内部加一组连号(如24-25)，尾数尽量分散', color: '#D97706', bg: '#FEF3C7' },
]

const ssqStrategyRules = [
  { num: '1', text: '热温冷比例：优先 2热+2温+2冷 或 3热+2温+1冷，占比68.6%', color: '#DC2626', bg: '#FEE2E2' },
  { num: '2', text: '奇偶比优先3:3，次选4:2或2:4，避开5:1/6:0极端比例', color: '#DC2626', bg: '#FEE2E2' },
  { num: '3', text: '大小比优先3:3，次选4:2或2:4，避开全大或全小', color: '#2563EB', bg: '#DBEAFE' },
  { num: '4', text: '尾数冗余排除：6个红球至少覆盖4个不同尾数(准确率99%)', color: '#2563EB', bg: '#DBEAFE' },
  { num: '5', text: '和值范围控制在90-130之间，跨度在22-30之间', color: '#D97706', bg: '#FEF3C7' },
  { num: '6', text: '连号设置：优先有且仅有一组两连号，避免无连号或两组以上', color: '#D97706', bg: '#FEF3C7' },
  { num: '7', text: '斜连码定位：关注已形成斜线趋势的号码(如09→14→19)', color: '#8B5CF6', bg: '#EDE9FE' },
  { num: '8', text: '黄金分割点：上期红球平均值±3范围内，下期常出1-2个号码', color: '#8B5CF6', bg: '#EDE9FE' },
]

// ====== 大乐透规则数据（蓝色主题） ======
const dltCoverRules = [
  { num: '1', text: '将前区(01-35)分为三个区间：小区(01-12)、中区(13-24)、大区(25-35)', color: '#1D4ED8', bg: '#DBEAFE' },
  { num: '2', text: '第一注(均衡型)：小区2个 + 中区2个 + 大区1个，覆盖全面', color: '#1D4ED8', bg: '#DBEAFE' },
  { num: '3', text: '第二注(偏小中)：小区2个 + 中区3个 + 大区0个，适合号码偏小', color: '#1E40AF', bg: '#BFDBFE' },
  { num: '4', text: '第三注(偏中大)：小区0个 + 中区2个 + 大区3个，适合号码偏大', color: '#1E40AF', bg: '#BFDBFE' },
  { num: '5', text: '三注之间尽量不要重复号码，扩大覆盖范围', color: '#3B82F6', bg: '#EFF6FF' },
  { num: '6', text: '后区(01-12)每注固定选2个，注意奇偶和大小平衡', color: '#3B82F6', bg: '#EFF6FF' },
]

const dltStrategyRules = [
  { num: '1', text: '热温冷比例：优先 2热+2温+1冷 或 2热+1温+2冷，覆盖主流分布', color: '#1D4ED8', bg: '#DBEAFE' },
  { num: '2', text: '奇偶比优先3:2或2:3，次选4:1或1:4，避开5:0/0:5极端比例', color: '#1D4ED8', bg: '#DBEAFE' },
  { num: '3', text: '大小比优先3:2或2:3，次选4:1或1:4，避开全大或全小', color: '#1E40AF', bg: '#BFDBFE' },
  { num: '4', text: '尾数冗余排除：5个前区至少覆盖4个不同尾数', color: '#1E40AF', bg: '#BFDBFE' },
  { num: '5', text: '和值范围控制在75-125之间，跨度在20-28之间', color: '#3B82F6', bg: '#EFF6FF' },
  { num: '6', text: '连号设置：优先有且仅有一组两连号，避免无连号或两组以上', color: '#3B82F6', bg: '#EFF6FF' },
  { num: '7', text: '斜连码定位：关注已形成斜线趋势的号码(如08→13→18)', color: '#60A5FA', bg: '#F0F9FF' },
  { num: '8', text: '黄金分割点：上期前区平均值±3范围内，下期常出1-2个号码', color: '#60A5FA', bg: '#F0F9FF' },
]

const coverRulesData = computed(() => props.lotteryType === 'ssq' ? ssqCoverRules : dltCoverRules)
const strategyRulesData = computed(() => props.lotteryType === 'ssq' ? ssqStrategyRules : dltStrategyRules)

// Tab名称根据彩种区分
const coverTabName = computed(() => props.lotteryType === 'ssq' ? '三注覆盖法·红球' : '三注覆盖法·前区')
const strategyTabName = computed(() => props.lotteryType === 'ssq' ? '三三制选号法·红球' : '三三制选号法·前区')

// 全选/取消全选
// 三注覆盖法全选控制
const isAllCoverEnabled = computed(() => {
  return Object.values(userCoverRules.value).every(v => v)
})

function toggleAllCover() {
  setAllCoverRules(!isAllCoverEnabled.value)
}

const coverEnabledCount = computed(() => {
  return Object.values(userCoverRules.value).filter(v => v).length
})

const coverTotalCount = computed(() => {
  return Object.keys(userCoverRules.value).length
})

// 三三制选号法全选控制
const isAllStrategyEnabled = computed(() => {
  return Object.values(userStrategyRules.value).every(v => v)
})

function toggleAllStrategy() {
  setAllStrategyRules(!isAllStrategyEnabled.value)
}

const strategyEnabledCount = computed(() => {
  return Object.values(userStrategyRules.value).filter(v => v).length
})

const strategyTotalCount = computed(() => {
  return Object.keys(userStrategyRules.value).length
})

// 格式化比例数据
function formatRatio(ratio: { [key: string]: number }): string {
  if (!ratio) return ''
  const entries = Object.entries(ratio)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  return entries.map(([k, v]) => `${k}(${v}期)`).join(' ')
}

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Transition name="strategy-modal">
    <div v-if="visible" class="strategy-overlay" @click="handleOverlayClick">
      <div class="strategy-content" :class="{ 'dlt-theme': lotteryType === 'dlt' }" @click.stop>
        <!-- 头部 -->
        <div class="strategy-header">
          <div class="strategy-header-left">
            <h3 class="strategy-title">{{ title }}</h3>
          </div>
          <button class="strategy-close" @click="handleClose">
            <RiCloseLine class="close-icon" />
          </button>
        </div>
        <div class="strategy-divider"></div>

        <!-- Tab 切换 - 三三制选号法显示两个Tab -->
        <div v-if="defaultTab !== 'cover'" class="strategy-tabs">
          <button
            class="strategy-tab"
            :class="{ active: internalTab === 'stats' }"
            @click="internalTab = 'stats'"
          >
            <span>近50期数据统计</span>
          </button>
          <button
            class="strategy-tab"
            :class="{ active: internalTab === 'rules' }"
            @click="internalTab = 'rules'"
          >
            <span>选号规则</span>
          </button>
        </div>

        <!-- 规则列表 -->
        <div class="strategy-body">
          <!-- 三注覆盖法内容 -->
          <div v-if="defaultTab === 'cover'" class="strategy-section">
            <p class="strategy-section-desc">
              {{ lotteryType === 'ssq'
                ? '每期选3注号码，按区间搭配覆盖1-33全部范围，分散风险'
                : '每期选3注号码，按区间搭配覆盖1-35全部范围，分散风险' }}
            </p>

            <!-- 全选控制 -->
            <div class="strategy-select-all" @click="toggleAllCover">
              <div class="toggle-switch" :class="{ on: isAllCoverEnabled }">
                <div class="toggle-thumb"></div>
              </div>
              <span class="select-all-text">全部{{ isAllCoverEnabled ? '关闭' : '启用' }}</span>
              <span class="select-all-count">{{ coverEnabledCount }}/{{ coverTotalCount }} 条已启用</span>
            </div>

            <!-- 规则列表 -->
            <div class="strategy-rules">
              <div
                v-for="rule in coverRulesData"
                :key="rule.num"
                class="strategy-rule-item"
                :class="{ disabled: !userCoverRules[rule.num] }"
              >
                <div
                  class="toggle-switch"
                  :class="{ on: userCoverRules[rule.num] }"
                  @click="setCoverRule(rule.num, !userCoverRules[rule.num])"
                >
                  <div class="toggle-thumb"></div>
                </div>
                <div
                  class="rule-num-badge"
                  :style="{ background: userCoverRules[rule.num] ? rule.bg : '#F3F4F6' }"
                >
                  <span class="rule-num-text" :style="{ color: userCoverRules[rule.num] ? rule.color : '#9CA3AF' }">{{ rule.num }}</span>
                </div>
                <p class="rule-text">{{ rule.text }}</p>
              </div>
            </div>
          </div>

          <!-- 三三制选号法内容 -->
          <div v-else class="strategy-section">
            <!-- 近50期数据统计 Tab -->
            <div v-if="internalTab === 'stats'" class="stats-panel">
              <div class="stats-header">
                <span class="stats-title">📊 近50期数据统计</span>
                <button class="stats-refresh" @click="refresh" :disabled="isLoading">
                  <RiRefreshLine class="refresh-icon" :class="{ spinning: isLoading }" />
                </button>
              </div>
              <div class="stats-grid" v-if="currentStats">
                <!-- 热温冷号 -->
                <div class="stats-item">
                  <span class="stats-label">热号</span>
                  <span class="stats-value hot">{{ currentStats.hotNumbers.slice(0, 6).join(' ') }}</span>
                </div>
                <div class="stats-item">
                  <span class="stats-label">温号</span>
                  <span class="stats-value warm">{{ currentStats.warmNumbers.slice(0, 6).join(' ') }}</span>
                </div>
                <div class="stats-item">
                  <span class="stats-label">冷号</span>
                  <span class="stats-value cold">{{ currentStats.coldNumbers.slice(0, 6).join(' ') }}</span>
                </div>
                <!-- 奇偶比分布 -->
                <div class="stats-item wide">
                  <span class="stats-label">奇偶比</span>
                  <span class="stats-value">{{ formatRatio(currentStats.oddEvenRatio) }}</span>
                </div>
                <!-- 大小比分布 -->
                <div class="stats-item wide">
                  <span class="stats-label">大小比</span>
                  <span class="stats-value">{{ formatRatio(currentStats.bigSmallRatio) }}</span>
                </div>
                <!-- 和值范围 -->
                <div class="stats-item">
                  <span class="stats-label">和值范围</span>
                  <span class="stats-value">{{ currentStats.sumRange.min }}-{{ currentStats.sumRange.max }} (平均{{ currentStats.sumRange.avg }})</span>
                </div>
                <!-- 连号率 -->
                <div class="stats-item">
                  <span class="stats-label">连号出现率</span>
                  <span class="stats-value">{{ currentStats.consecutiveRate }}%</span>
                </div>
              </div>
            </div>

            <!-- 选号规则 Tab -->
            <div v-else>
              <p class="strategy-section-desc">
                热温冷定基调 + 奇偶大小定骨架 + 尾数和值验证，淘汰90%垃圾组合
              </p>

              <!-- 全选控制 -->
              <div class="strategy-select-all" @click="toggleAllStrategy">
                <div class="toggle-switch" :class="{ on: isAllStrategyEnabled }">
                  <div class="toggle-thumb"></div>
                </div>
                <span class="select-all-text">全部{{ isAllStrategyEnabled ? '关闭' : '启用' }}</span>
                <span class="select-all-count">{{ strategyEnabledCount }}/{{ strategyTotalCount }} 条已启用</span>
              </div>

              <!-- 规则列表 -->
              <div class="strategy-rules">
                <div
                  v-for="rule in strategyRulesData"
                  :key="rule.num"
                  class="strategy-rule-item"
                  :class="{ disabled: !userStrategyRules[rule.num] }"
                >
                  <div
                    class="toggle-switch"
                    :class="{ on: userStrategyRules[rule.num] }"
                    @click="setStrategyRule(rule.num, !userStrategyRules[rule.num])"
                  >
                    <div class="toggle-thumb"></div>
                  </div>
                  <div
                    class="rule-num-badge"
                    :style="{ background: userStrategyRules[rule.num] ? rule.bg : '#F3F4F6' }"
                  >
                    <span class="rule-num-text" :style="{ color: userStrategyRules[rule.num] ? rule.color : '#9CA3AF' }">{{ rule.num }}</span>
                  </div>
                  <p class="rule-text">{{ rule.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部提示 - 只在三注覆盖法显示 -->
          <div v-if="defaultTab === 'cover'" class="strategy-footer-tip">
            <span class="footer-tip-icon">⚠️</span>
            <span class="footer-tip-text">勾选的规则将参与号码生成，所有技巧基于历史数据概率统计，仅供参考</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 动画 */
.strategy-modal-enter-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.strategy-modal-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.strategy-modal-enter-active .strategy-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.strategy-modal-leave-active .strategy-content {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1),
              opacity 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.strategy-modal-enter-from,
.strategy-modal-leave-to {
  opacity: 0;
}
.strategy-modal-enter-from .strategy-content {
  transform: scale(0.88) translateY(30px);
  opacity: 0;
}
.strategy-modal-leave-to .strategy-content {
  transform: scale(0.92) translateY(15px);
  opacity: 0;
}

/* 遮罩层 */
.strategy-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

/* 弹窗内容 */
.strategy-content {
  width: 500px;
  height: 450px;
  max-height: 85vh;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
}

/* 大乐透蓝色主题 */
.strategy-content.dlt-theme {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow:
    0 20px 40px rgba(59, 130, 246, 0.12),
    0 8px 16px rgba(59, 130, 246, 0.08),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.8);
}

.strategy-content.dlt-theme .strategy-title-icon {
  color: #3B82F6;
}

.strategy-content.dlt-theme .strategy-title {
  color: #1E40AF;
}

.strategy-content.dlt-theme .close-icon {
  color: #1E40AF;
}

.strategy-content.dlt-theme .strategy-divider {
  background: rgba(59, 130, 246, 0.3);
}

.strategy-content.dlt-theme .strategy-tab {
  background: linear-gradient(90deg, rgba(59,130,246,0.9) 0%, rgba(99,102,241,0.9) 100%);
  border-color: #3B82F6;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.strategy-content.dlt-theme .strategy-section-desc {
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(239, 246, 255, 0.7) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  color: #1E40AF;
}

.strategy-content.dlt-theme .stats-panel {
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(239, 246, 255, 0.7) 100%);
  border-color: rgba(59, 130, 246, 0.3);
}

.strategy-content.dlt-theme .stats-title {
  color: #1E40AF;
}

.strategy-content.dlt-theme .refresh-icon {
  color: #3B82F6;
}

.strategy-content.dlt-theme .stats-label {
  color: #3B82F6;
}

.strategy-content.dlt-theme .stats-value {
  color: #1E40AF;
}

.strategy-content.dlt-theme .strategy-select-all {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(59, 130, 246, 0.3);
}

.strategy-content.dlt-theme .select-all-text {
  color: #1E40AF;
}

.strategy-content.dlt-theme .select-all-count {
  color: #3B82F6;
}

.strategy-content.dlt-theme .toggle-switch.on {
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
}

.strategy-content.dlt-theme .rule-text {
  color: #1E40AF;
}

.strategy-content.dlt-theme .strategy-rule-item.disabled .rule-text {
  color: #93C5FD;
}

.strategy-content.dlt-theme .strategy-footer-tip {
  background: rgba(219, 234, 254, 0.4);
  border-color: rgba(59, 130, 246, 0.3);
}

.strategy-content.dlt-theme .footer-tip-text {
  color: #1E40AF;
}

/* 头部 */
.strategy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
  flex-shrink: 0;
}

.strategy-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-title-icon {
  width: 22px;
  height: 22px;
  color: #D97706;
}

.strategy-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.strategy-close {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  background: transparent;
  transition: background 0.2s;
}

.strategy-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.close-icon {
  width: 18px;
  height: 18px;
  color: #92400E;
}

.strategy-divider {
  margin: 8px 16px 0 16px;
  height: 1px;
  background: rgba(253, 230, 138, 0.6);
  flex-shrink: 0;
}

/* Tab 切换 */
.strategy-tabs {
  display: flex;
  gap: 8px;
  padding: 10px 16px 0 16px;
  flex-shrink: 0;
}

.strategy-tab {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid #FDE68A;
  background: rgba(255, 251, 235, 0.6);
  color: #D97706;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SourceHanSans-SemiBold';
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  padding: 0;
}

.strategy-tab.active {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-color: #D97706;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.25);
}

.strategy-tab:not(.active):hover {
  background: rgba(255, 251, 235, 1);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* 内容区 */
.strategy-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px 14px 16px;
  -webkit-overflow-scrolling: touch;
}

.strategy-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategy-section-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #78350F;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.4) 0%, rgba(255, 251, 235, 0.6) 100%);
  border-radius: 8px;
  border: 1px solid rgba(253, 230, 138, 0.5);
}

/* 全选控制 */
.strategy-select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(253, 230, 138, 0.4);
  cursor: pointer;
  user-select: none;
}

.select-all-text {
  font-size: 13px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
}

.select-all-count {
  font-size: 12px;
  color: #B45309;
  font-family: 'SourceHanSans-Regular';
  margin-left: auto;
}

/* 开关组件 */
.toggle-switch {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: #D1D5DB;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.25s ease;
}

.toggle-switch.on {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(14px);
}

/* 规则列表 */
.strategy-rules {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.strategy-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.strategy-rule-item.disabled {
  opacity: 0.45;
}

.strategy-rule-item:not(.disabled):hover {
  background: rgba(255, 251, 235, 0.3);
}

/* 统计面板 */
.stats-panel {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(255, 251, 235, 0.7) 100%);
  border-radius: 10px;
  padding: 10px;
  border: 1px solid rgba(253, 230, 138, 0.5);
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stats-title {
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  font-family: 'SourceHanSans-SemiBold';
}

.stats-refresh {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.2s;
}

.stats-refresh:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
}

.stats-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 14px;
  height: 14px;
  color: #D97706;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.stats-item.wide {
  grid-column: span 2;
}

.stats-label {
  font-size: 11px;
  color: #B45309;
  font-family: 'SourceHanSans-Regular';
}

.stats-value {
  font-size: 12px;
  color: #78350F;
  font-family: 'SourceHanSans-Medium';
  word-break: break-all;
}

.stats-value.hot {
  color: #DC2626;
}

.stats-value.warm {
  color: #D97706;
}

.stats-value.cold {
  color: #2563EB;
}

.rule-num-badge {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.rule-num-text {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  font-family: 'SourceHanSans-Bold';
  transition: color 0.2s ease;
}

.rule-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: #78350F;
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

.strategy-rule-item.disabled .rule-text {
  color: #9CA3AF;
}

/* 底部提示 */
.strategy-footer-tip {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(254, 243, 199, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(253, 230, 138, 0.5);
}

.footer-tip-icon {
  flex-shrink: 0;
  font-size: 12px;
  line-height: 1.4;
}

.footer-tip-text {
  font-size: 11px;
  line-height: 1.4;
  color: #92400E;
  font-family: 'SourceHanSans-Regular';
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .strategy-overlay {
    padding: 16px;
  }

  .strategy-content {
    width: 90vw;
    max-width: 400px;
    border-radius: 20px;
  }

  .strategy-tab {
    font-size: 12px;
    height: 34px;
  }

  .tab-icon {
    width: 14px;
    height: 14px;
  }

  .rule-text {
    font-size: 13px;
  }
}
</style>
