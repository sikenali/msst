<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RiCloseLine, RiRefreshLine, RiTimerLine } from '@remixicon/vue'
import { useHistoryData } from '@/composables/useHistoryData'
import { useKillRules } from '@/composables/useKillRules'
import { setKillRulesType, setKillRule } from '@/composables/useKillRules'

interface Props {
  visible: boolean
  lotteryType: 'ssq' | 'dlt'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  apply: []
}>()

const currentTab = ref<'history' | 'rules'>('history')
const { ssqHistoryData, dltHistoryData, isLoading, lastUpdated, dltLastUpdated, fetchHistoryData } = useHistoryData()
const { userKillRules, isAllKillEnabled, killEnabledCount, toggleAllKill } = useKillRules()

const ruleLabels: Record<string, string> = {
  cold5: '杀5个冷号',
  last3: '杀上期3个号',
  consecutive: '杀连号后区',
  zone2: '区间限2号',
  hotTail4: '杀4个热尾数',
}
 
const ruleDescriptions: Record<string, string> = {
  cold5: '连续10期以上没开出的号码为冷号，杀掉遗漏期数最长的5个冷号',
  last3: '上期号码下一期通常只重复1个，从上期号中至少杀掉3个',
  consecutive: '上期连号的后区号码开出概率低，每期最多保留1个连号后区',
  zone2: '分三个区间(1-12,13-24,25-35)，每个区间最多留2个号',
  hotTail4: '观察最近5期，杀掉出现次数最多的4个尾数对应的所有号码',
}

const isDlt = computed(() => props.lotteryType === 'dlt')
const showAllData = ref(false)

const ssqTableData = computed(() => {
  const limit = showAllData.value ? 30 : 10
  return ssqHistoryData.value.slice(0, limit)
})

const dltTableData = computed(() => {
  const limit = showAllData.value ? 30 : 10
  return dltHistoryData.value.slice(0, limit)
})

const hasMoreSSQ = computed(() => ssqHistoryData.value.length > 10)
const hasMoreDLT = computed(() => dltHistoryData.value.length > 10)

const updatedText = computed(() => {
  if (isDlt.value) return dltLastUpdated.value
  return lastUpdated.value
})

const refreshTime = ref('')

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

async function handleRefresh() {
  console.log('handleRefresh called, lotteryType:', props.lotteryType)
  setKillRulesType(props.lotteryType)
  await fetchHistoryData(props.lotteryType)
  refreshTime.value = formatDateTime(new Date())
}

function toggleShowAll() {
  showAllData.value = !showAllData.value
}

onMounted(() => {
  if (!updatedText.value && !isLoading.value) {
    handleRefresh()
  }
})

function handleToggle(key: string) {
  setKillRule(key, !userKillRules.value[key])
}

function handleToggleAll() {
  toggleAllKill()
}

function handleApply() {
  emit('apply')
  emit('close')
}

function handleClose() {
  emit('close')
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}
</script>

<template>
  <Transition name="kr-modal">
    <div v-if="visible" class="kr-overlay" @click="handleOverlayClick">
      <div class="kr-content" :class="{ 'kr-dlt': isDlt }" @click.stop>
        <div class="kr-header">
          <h3 class="kr-title">杀号规则</h3>
          <button class="kr-close" @click="handleClose">
            <RiCloseLine class="kr-close-icon" />
          </button>
        </div>
        <div class="kr-divider"></div>

        <!-- Tabs -->
        <div class="kr-tabs">
          <button class="kr-tab" :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'">历史数据</button>
          <button class="kr-tab" :class="{ active: currentTab === 'rules' }" @click="currentTab = 'rules'">杀号规则</button>
        </div>

        <div class="kr-body">
          <!-- Tab: 历史数据 -->
          <template v-if="currentTab === 'history'">
            <div class="kr-auto-update-hint">
              <RiTimerLine class="kr-clock-icon" />
              <span>系统每天22:00自动更新</span>
              <button class="kr-auto-refresh-btn" @click="handleRefresh" :disabled="isLoading">
                <RiRefreshLine class="kr-refresh-icon" :class="{ spinning: isLoading }" />
              </button>
              <span v-if="refreshTime" class="kr-refresh-time">{{ refreshTime }}</span>
            </div>

            <!-- SSQ table -->
            <div v-if="!isDlt" class="kr-history-table-wrap">
              <table class="kr-history-table">
                <thead>
                  <tr>
                    <th>期号</th>
                    <th v-for="i in 6" :key="i" class="kr-th-red">红球</th>
                    <th class="kr-th-blue">蓝球</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in ssqTableData" :key="row.issue">
                    <td class="kr-issue">{{ row.issue }}</td>
                    <td v-for="n in row.red" :key="n" class="kr-red-ball">{{ String(n).padStart(2, '0') }}</td>
                    <td class="kr-blue-ball">{{ String(row.blue).padStart(2, '0') }}</td>
                  </tr>
                </tbody>
              </table>
              
              <div v-if="isLoading" class="kr-loading-overlay">
                <div class="kr-loading-spinner"></div>
                <span>加载中...</span>
              </div>
            </div>
            <div v-if="!isDlt && hasMoreSSQ" class="kr-toggle-all-wrap">
              <button class="kr-toggle-all-btn" @click="toggleShowAll">
                {{ showAllData ? '收起' : `展开全部 30 期` }}
              </button>
            </div>
            
            <!-- DLT table -->
            <div v-if="isDlt" class="kr-history-table-wrap">
              <table class="kr-history-table">
                <thead>
                  <tr>
                    <th>期号</th>
                    <th v-for="i in 5" :key="i" class="kr-th-red">前区</th>
                    <th v-for="i in 2" :key="i" class="kr-th-blue">后区</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in dltTableData" :key="row.issue">
                    <td class="kr-issue">{{ row.issue }}</td>
                    <td v-for="n in row.front" :key="n" class="kr-red-ball">{{ String(n).padStart(2, '0') }}</td>
                    <td v-for="n in row.back" :key="n" class="kr-blue-ball">{{ String(n).padStart(2, '0') }}</td>
                  </tr>
                </tbody>
              </table>
              
              <div v-if="isLoading" class="kr-loading-overlay">
                <div class="kr-loading-spinner"></div>
                <span>加载中...</span>
              </div>
            </div>
            <div v-if="isDlt && hasMoreDLT" class="kr-toggle-all-wrap">
              <button class="kr-toggle-all-btn" @click="toggleShowAll">
                {{ showAllData ? '收起' : `展开全部 30 期` }}
              </button>
            </div>

            <div v-if="!isLoading && (ssqTableData?.length || 0) === 0 && (dltTableData?.length || 0) === 0" class="kr-empty">
              <p>正在加载{{ isDlt ? '大乐透' : '双色球' }}历史开奖数据...</p>
            </div>
          </template>

          <!-- Tab: 杀号规则 -->
          <template v-else>
            <div class="kr-rules-header">
              <span class="kr-rules-count">已开启 {{ killEnabledCount }} / 5 条规则</span>
              <label class="kr-all-toggle">
                <input type="checkbox" :checked="isAllKillEnabled" @change="handleToggleAll" />
                <span class="kr-all-track"></span>
              </label>
            </div>

            <div class="kr-rules-list">
              <div v-for="(enabled, key) in userKillRules" :key="key" class="kr-rule-item">
                <div class="kr-rule-info">
                  <span class="kr-rule-name">{{ ruleLabels[key as string] || key }}</span>
                  <span class="kr-rule-desc">{{ ruleDescriptions[key as string] || '' }}</span>
                </div>
                <label class="kr-toggle">
                  <input type="checkbox" :checked="enabled" @change="handleToggle(key as string)">
                  <span class="kr-track"></span>
                </label>
              </div>
            </div>

            <div class="kr-actions">
              <button class="kr-btn kr-btn--cancel" @click="handleClose">取消</button>
              <button class="kr-btn kr-btn--apply" @click="handleApply">应用</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.kr-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.kr-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.kr-modal-enter-active .kr-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.kr-modal-leave-active .kr-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.kr-modal-enter-from, .kr-modal-leave-to { opacity: 0; }
.kr-modal-enter-from .kr-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.kr-modal-enter-to .kr-content { transform: scale(1) translateY(0); opacity: 1; }
.kr-modal-leave-to .kr-content { transform: scale(0.92) translateY(15px); opacity: 0; }

.kr-overlay {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4); padding: 24px;
}

.kr-content {
  width: 540px; height: 480px; overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06);
  display: flex; flex-direction: column;
}

.kr-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0 16px; }
.kr-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.kr-close { width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; background: transparent; transition: background 0.2s; }
.kr-close:hover { background: rgba(0, 0, 0, 0.05); }
.kr-close-icon { width: 18px; height: 18px; color: #92400E; }
.kr-divider { margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6); }

.kr-tabs { display: flex; gap: 0; margin: 8px 16px 0 16px; border-bottom: 1px solid rgba(253, 230, 138, 0.5); }
.kr-tab { flex: 1; padding: 8px 0; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #B45309; background: transparent; font-family: 'SourceHanSans-SemiBold'; transition: color 0.2s; position: relative; }
.kr-tab.active { color: #92400E; }
.kr-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 2px; background: #F59E0B; border-radius: 1px; }

.kr-body { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; }

@keyframes kr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.kr-auto-update-hint { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 11px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.kr-clock-icon { width: 12px; height: 12px; }
.kr-refresh-time { margin-left: auto; font-size: 10px; color: #B45309; }
.kr-auto-refresh-btn { display: flex; align-items: center; justify-content: center; padding: 6px; border: none; background: transparent; cursor: pointer; border-radius: 6px; transition: all 0.2s; pointer-events: auto; z-index: 10; min-width: 28px; min-height: 28px; }
.kr-auto-refresh-btn:hover:not(:disabled) { background: rgba(245, 158, 11, 0.15); }
.kr-auto-refresh-btn:active:not(:disabled) { transform: scale(0.95); }
.kr-auto-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.kr-refresh-icon { width: 16px; height: 16px; color: #92400E; }
.kr-refresh-icon.spinning { animation: kr-spin 1s linear infinite; }

.kr-history-table-wrap { overflow-x: auto; position: relative; width: 100%; box-sizing: border-box; padding: 0 4px; }
.kr-history-table { width: 100%; max-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; font-family: 'SourceHanSans-Regular'; background: rgba(255, 251, 235, 0.5); border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.4); overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.kr-history-table thead, .kr-history-table tbody { display: table-header-group; }
.kr-history-table tr { display: table-row; }
.kr-history-table tr:first-child th:first-child { border-radius: 9px 0 0 0; }
.kr-history-table tr:first-child th:last-child { border-radius: 0 9px 0 0; }
.kr-history-table tr:last-child td:first-child { border-radius: 0 0 0 9px; }
.kr-history-table tr:last-child td:last-child { border-radius: 0 0 9px 0; }
.kr-history-table th { display: table-cell; position: sticky; top: 0; background: linear-gradient(180deg, rgba(255, 251, 235, 0.95) 0%, rgba(254, 243, 199, 0.9) 100%); padding: 8px 4px; text-align: center; font-weight: 700; font-family: 'SourceHanSans-Bold'; border-bottom: 2px solid rgba(253, 230, 138, 0.6); vertical-align: middle; font-size: 11px; }
.kr-history-table td { display: table-cell; padding: 6px 4px; text-align: center; color: #92400E; vertical-align: middle; border-bottom: 1px solid rgba(253, 230, 138, 0.2); }
.kr-history-table tr:last-child td { border-bottom: none; }
.kr-history-table tr:not(:first-child):hover { background: rgba(254, 243, 199, 0.6); }
.kr-history-table tr:nth-child(even) { background: rgba(255, 251, 235, 0.6); }
.kr-history-table tr:nth-child(odd):not(:first-child) { background: rgba(255, 255, 255, 0.8); }
.kr-history-table .kr-th-red { color: #DC2626; }
.kr-history-table .kr-th-blue { color: #2563EB; }

.kr-history-table th:first-child, .kr-history-table td:first-child { min-width: 52px; width: 52px; }
.kr-history-table th:not(:first-child), .kr-history-table td:not(:first-child) { min-width: 26px; width: 26px; }

.kr-issue { font-weight: 600; font-family: 'SourceHanSans-Medium'; line-height: 18px; font-size: 11px; color: #92400E; }
.kr-red-ball { color: #DC2626; font-weight: 700; font-family: 'SourceHanSans-Bold'; font-size: 12px; }
.kr-blue-ball { color: #2563EB; font-weight: 700; font-family: 'SourceHanSans-Bold'; font-size: 12px; }

.kr-empty { display: flex; align-items: center; justify-content: center; min-height: 200px; }
.kr-empty p { color: #B45309; font-size: 14px; font-family: 'SourceHanSans-Regular'; }

.kr-toggle-all-wrap { display: flex; justify-content: center; margin-top: 12px; }
.kr-toggle-all-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #FCD34D; background: rgba(255, 251, 235, 0.6); color: #92400E; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.kr-toggle-all-btn:hover { background: rgba(255, 251, 235, 0.9); border-color: #F59E0B; }

.kr-loading-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px); z-index: 10; }
.kr-loading-spinner { width: 24px; height: 24px; border: 2px solid #FCD34D; border-top-color: #F59E0B; border-radius: 50%; animation: kr-spin 0.8s linear infinite; }
@keyframes kr-spin { to { transform: rotate(360deg); } }

.kr-rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 8px; }
.kr-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }

.kr-all-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.kr-all-toggle input { opacity: 0; width: 0; height: 0; }
.kr-all-track { position: absolute; cursor: pointer; inset: 0; background: #D1D5DB; border-radius: 9999px; transition: 0.3s; }
.kr-all-track::before { content: ''; position: absolute; left: 2px; bottom: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
.kr-all-toggle input:checked + .kr-all-track { background: #8B5CF6; }
.kr-all-toggle input:checked + .kr-all-track::before { transform: translateX(16px); }

.kr-rules-list { display: flex; flex-direction: column; gap: 10px; }
.kr-rule-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.4); }
.kr-rule-info { display: flex; flex-direction: column; gap: 2px; }
.kr-rule-name { font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.kr-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }

.kr-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.kr-toggle input { opacity: 0; width: 0; height: 0; }
.kr-track { position: absolute; cursor: pointer; inset: 0; background: #D1D5DB; border-radius: 9999px; transition: 0.3s; }
.kr-track::before { content: ''; position: absolute; left: 2px; bottom: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
.kr-toggle input:checked + .kr-track { background: #F59E0B; }
.kr-toggle input:checked + .kr-track::before { transform: translateX(16px); }
.kr-toggle input:checked + .kr-toggle-slider::before { transform: translateX(16px); }

.kr-dlt .kr-tab.active::after { background: #3B82F6; }
.kr-dlt .kr-fetch-btn { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
.kr-dlt .kr-toggle input:checked + .kr-toggle-slider { background: #3B82F6; }

.kr-actions { display: flex; gap: 12px; margin-top: 16px; }
.kr-btn { flex: 1; height: 38px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.kr-btn:active { transform: scale(0.96); }
.kr-btn--cancel { background: #F3F4F6; color: #6B7280; }
.kr-btn--cancel:hover { background: #E5E7EB; }
.kr-btn--apply { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFF; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25); }
.kr-dlt .kr-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }

@media screen and (max-width: 480px) {
  .kr-overlay { padding: 12px; }
  .kr-content { width: 100%; height: auto; max-height: 85vh; }
  .kr-body { flex: 1; overflow-y: auto; }
}
</style>
