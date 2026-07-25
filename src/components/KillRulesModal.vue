<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import { allKillRules, applySelectedKillRules } from '@/rules/kill/index'
import { useWuxingQilie } from '@/composables/useWuxingQilie'
import { setWuxingType } from '@/composables/useWuxingQilie'
import { getHistoryDraws } from '@/composables/useHistoryData'
import { setKillRuleNames, killRuleNames } from '@/composables/useRuleEngine'
import type { LotteryType } from '@/rules/types'

interface Props {
  visible: boolean
  lotteryType: LotteryType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  apply: []
}>()

const currentTab = ref<'regular' | 'wuxing'>('regular')
const enabledRules = ref<Record<string, boolean>>({})
const showPool = ref(true)

const regularRules = computed(() =>
  allKillRules.filter(r =>
    r.name !== '五行七列杀号' &&
    (!r.appliesTo || r.appliesTo.includes(props.lotteryType))
  )
)

const enabledCount = computed(() =>
  Object.entries(enabledRules.value).filter(([, v]) => v).length
)

const range = computed(() => props.lotteryType === 'ssq' ? 33 : 35)

const allNumbers = computed(() =>
  Array.from({ length: range.value }, (_, i) => i + 1)
)

const killedNumbers = computed(() => {
  const selected = Object.entries(enabledRules.value)
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (selected.length === 0) return new Set<number>()
  const history = getHistoryDraws(props.lotteryType)
  if (history.length === 0) return new Set<number>()
  return applySelectedKillRules(selected, history, range.value, props.lotteryType)
})

function isKilled(n: number): boolean {
  return killedNumbers.value.has(n)
}

const { rows, brokenRowEnabled, brokenColumnEnabled } = useWuxingQilie()

function toggleRule(name: string) {
  if (enabledRules.value[name] !== undefined) {
    enabledRules.value[name] = !enabledRules.value[name]
  }
}

function toggleAll(enabled: boolean) {
  for (const key of Object.keys(enabledRules.value)) {
    enabledRules.value[key] = enabled
  }
}

function handleApply() {
  const selected = Object.entries(enabledRules.value)
    .filter(([, v]) => v)
    .map(([k]) => k)
  setKillRuleNames(selected)
  emit('apply')
  emit('close')
}

function handleClose() { emit('close') }

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}

function resetDefaults() {
  const defaults = [
    '减法/差值杀号', '红一红二减法杀号', '龙头杀号', '凤尾杀号',
    '龙头+蓝球杀号', '龙头与蓝球差值杀号', '和值尾数杀号',
    '过热尾数杀号', '断区杀号', '红蓝联动绝对值杀号',
  ]
  for (const key of Object.keys(enabledRules.value)) {
    enabledRules.value[key] = defaults.includes(key)
  }
}

onMounted(() => {
  setWuxingType(props.lotteryType)
  for (const r of allKillRules) {
    enabledRules.value[r.name] = killRuleNames.value.includes(r.name)
  }
})

watch(() => props.lotteryType, (t) => {
  setWuxingType(t)
  for (const r of allKillRules) {
    enabledRules.value[r.name] = killRuleNames.value.includes(r.name)
  }
})
</script>

<template>
  <Transition name="km-modal">
    <div v-if="visible" class="km-overlay" @click="handleOverlayClick">
      <div class="km-content" :class="{ 'km-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="km-header">
          <h3 class="km-title">杀号规则</h3>
          <button class="km-close" @click="handleClose">
            <RiCloseLine class="km-close-icon" />
          </button>
        </div>
        <div class="km-divider"></div>

        <div class="km-tabs">
          <button class="km-tab" :class="{ active: currentTab === 'regular' }"
            @click="currentTab = 'regular'">常规杀号 ({{ regularRules.length }})</button>
          <button class="km-tab" :class="{ active: currentTab === 'wuxing' }"
            @click="currentTab = 'wuxing'">五行七列</button>
        </div>

        <div class="km-body">
          <template v-if="currentTab === 'regular'">
            <!-- 号码池预览 -->
            <div v-if="showPool" class="km-pool-section">
              <div class="km-pool-header">
                <span class="km-pool-label">号码池</span>
                <span class="km-pool-status">已杀 <b>{{ killedNumbers.size }}</b> 码 / 剩余 <b>{{ range - killedNumbers.size }}</b> 码</span>
                <button class="km-pool-toggle" @click="showPool = false">收起</button>
              </div>
              <div class="km-pool-grid">
                <div v-for="n in allNumbers" :key="n"
                  class="km-pool-ball"
                  :class="{ killed: isKilled(n) }"
                >{{ String(n).padStart(2, '0') }}</div>
              </div>
            </div>
            <div v-else class="km-pool-header">
              <button class="km-pool-toggle" @click="showPool = true">展开号码池</button>
            </div>

            <div class="km-rules-header">
              <span class="km-rules-count">已选 {{ enabledCount }}/{{ regularRules.length }}</span>
              <div class="km-header-actions">
                <button class="km-toggle-all" @click="toggleAll(true)">全部开启</button>
                <button class="km-toggle-all" @click="toggleAll(false)">全部关闭</button>
                <button class="km-toggle-all km-reset" @click="resetDefaults">恢复默认</button>
              </div>
            </div>
            <div class="km-rules-list">
              <div v-for="rule in regularRules" :key="rule.name" class="km-rule-item">
                <div class="km-rule-info">
                  <span class="km-rule-name">{{ rule.name }}</span>
                  <span class="km-rule-desc">{{ rule.description }}</span>
                </div>
                <label class="km-toggle">
                  <input type="checkbox" :checked="enabledRules[rule.name]" @change="toggleRule(rule.name)">
                  <span class="km-toggle-slider"></span>
                </label>
              </div>
            </div>
          </template>

          <template v-if="currentTab === 'wuxing'">
            <div class="km-chart">
              <div v-for="row in rows" :key="row.name" class="km-row">
                <div class="km-row-label" :style="{ color: row.color }">{{ row.name }}</div>
                <div class="km-row-numbers">
                  <template v-for="(_, idx) in 7" :key="idx">
                    <span v-if="row.numbers[idx] !== undefined" class="km-cell"
                      :style="{ backgroundColor: row.color + '18', borderColor: row.color + '40', color: row.color }"
                    >{{ String(row.numbers[idx]).padStart(2, '0') }}</span>
                    <span v-else class="km-cell km-empty-cell"
                      :style="{ backgroundColor: row.color + '08', borderColor: row.color + '20' }"></span>
                  </template>
                </div>
              </div>
            </div>
            <div class="km-controls">
              <div class="km-control-group">
                <label class="km-control-label">
                  <span class="km-control-name">断行</span>
                  <label class="km-toggle">
                    <input type="checkbox" :checked="brokenRowEnabled" @change="brokenRowEnabled = !brokenRowEnabled">
                    <span class="km-toggle-slider"></span>
                  </label>
                </label>
                <p class="km-control-desc">排除连续空开/热极必反/长期冷行</p>
              </div>
              <div class="km-control-group">
                <label class="km-control-label">
                  <span class="km-control-name">断列</span>
                  <label class="km-toggle">
                    <input type="checkbox" :checked="brokenColumnEnabled" @change="brokenColumnEnabled = !brokenColumnEnabled">
                    <span class="km-toggle-slider"></span>
                  </label>
                </label>
                <p class="km-control-desc">排除空开列/冷列</p>
              </div>
            </div>
          </template>
        </div>

        <div class="km-actions">
          <button class="km-btn km-btn--cancel" @click="handleClose">取消</button>
          <button class="km-btn km-btn--apply" @click="handleApply">应用 ({{ enabledCount }})</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.km-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.km-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.km-modal-enter-active .km-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.km-modal-leave-active .km-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.km-modal-enter-from, .km-modal-leave-to { opacity: 0; }
.km-modal-enter-from .km-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.km-modal-enter-to .km-content { transform: scale(1) translateY(0); opacity: 1; }
.km-modal-leave-to .km-content { transform: scale(0.92) translateY(15px); opacity: 0; }

.km-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); padding: 24px; }
.km-content { width: 580px; max-height: 85vh; overflow: hidden; border-radius: 18px; background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.55); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; }
.km-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0 16px; }
.km-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.km-close { width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; background: transparent; transition: background 0.2s; }
.km-close:hover { background: rgba(0, 0, 0, 0.05); }
.km-close-icon { width: 18px; height: 18px; color: #92400E; }
.km-divider { margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6); }
.km-tabs { display: flex; gap: 0; margin: 8px 16px 0 16px; border-bottom: 1px solid rgba(253, 230, 138, 0.5); }
.km-tab { flex: 1; padding: 8px 0; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #B45309; background: transparent; font-family: 'SourceHanSans-SemiBold'; transition: color 0.2s; position: relative; }
.km-tab.active { color: #92400E; }
.km-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px; background: #F59E0B; border-radius: 1px; }
.km-body { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; }

/* 号码池 */
.km-pool-section { margin-bottom: 12px; }
.km-pool-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.km-pool-label { font-size: 13px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.km-pool-status { font-size: 12px; color: #B45309; font-family: 'SourceHanSans-Regular'; }
.km-pool-status b { font-weight: 700; }
.km-pool-toggle { padding: 2px 8px; border-radius: 4px; border: 1px solid #FCD34D; background: transparent; color: #92400E; font-size: 11px; cursor: pointer; font-family: 'SourceHanSans-Regular'; }
.km-pool-grid { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; background: rgba(255, 251, 235, 0.4); border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.3); }
.km-pool-ball { width: 34px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; font-family: 'SourceHanSans-Bold'; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #DC2626; transition: all 0.2s; }
.km-pool-ball.killed { opacity: 0.25; background: rgba(156, 163, 175, 0.15); border-color: rgba(156, 163, 175, 0.2); color: #9CA3AF; text-decoration: line-through; }

.km-rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.km-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.km-header-actions { display: flex; gap: 6px; }
.km-toggle-all { padding: 4px 10px; border-radius: 6px; border: 1px solid #FCD34D; background: transparent; color: #92400E; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: background 0.2s; }
.km-toggle-all:hover { background: rgba(253, 230, 138, 0.3); }
.km-reset { border-color: #D4D4D8; color: #6B7280; }
.km-rules-list { display: flex; flex-direction: column; gap: 6px; }
.km-rule-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 8px; border: 1px solid rgba(253, 230, 138, 0.4); }
.km-rule-info { display: flex; flex-direction: column; gap: 1px; }
.km-rule-name { font-size: 13px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.km-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }

.km-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.km-toggle input { opacity: 0; width: 0; height: 0; }
.km-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #D1D5DB; border-radius: 9999px; transition: 0.3s; }
.km-toggle-slider::before { content: ''; position: absolute; left: 2px; bottom: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
.km-toggle input:checked + .km-toggle-slider { background: #EF4444; }
.km-toggle input:checked + .km-toggle-slider::before { transform: translateX(16px); }

.km-chart { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; align-items: center; }
.km-row { display: flex; align-items: center; gap: 8px; justify-content: center; }
.km-row-label { width: 24px; font-size: 14px; font-weight: 800; font-family: 'SourceHanSans-Black'; text-align: center; flex-shrink: 0; }
.km-row-numbers { display: flex; gap: 4px; flex-wrap: wrap; }
.km-cell { width: 36px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 1px solid; }
.km-empty-cell { border: 1px dashed rgba(59, 130, 246, 0.2); }
.km-controls { display: flex; flex-direction: column; gap: 10px; }
.km-control-group { padding: 10px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.4); }
.km-control-label { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.km-control-name { font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.km-control-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; margin: 4px 0 0 0; }
.km-actions { display: flex; gap: 12px; }
.km-btn { flex: 1; height: 38px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.km-btn:active { transform: scale(0.96); }
.km-btn--cancel { background: #F3F4F6; color: #6B7280; }
.km-btn--cancel:hover { background: #E5E7EB; }
.km-btn--apply { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #FFF; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); }

.km-dlt .km-tab.active::after { background: #3B82F6; }
.km-dlt .km-toggle input:checked + .km-toggle-slider { background: #3B82F6; }
.km-dlt .km-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }

@media screen and (max-width: 480px) {
  .km-overlay { padding: 12px; }
  .km-content { width: 100%; max-height: 85vh; }
  .km-cell { width: 32px; height: 28px; font-size: 11px; }
  .km-pool-ball { width: 30px; height: 26px; font-size: 10px; }
  .km-header-actions { flex-wrap: wrap; }
}
</style>
