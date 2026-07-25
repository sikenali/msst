<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { RiCloseLine, RiRefreshLine } from '@remixicon/vue'
import { useHistoryData, fetchHistoryData, isLoading } from '@/composables/useHistoryData'

const { ssqHistoryData, dltHistoryData, lastUpdated, dltLastUpdated } = useHistoryData()

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const historyType = ref<'ssq' | 'dlt'>('ssq')
const showAll = ref(false)
const tabsEl = ref<HTMLElement>()
const indicatorStyle = ref({ left: '20%', width: '60%' })

function switchTab(type: 'ssq' | 'dlt') {
  historyType.value = type
  nextTick(updateIndicator)
}
function updateIndicator() {
  if (!tabsEl.value) return
  const active = tabsEl.value.querySelector('.dhp-tab.active') as HTMLElement
  if (!active) return
  const parent = tabsEl.value
  indicatorStyle.value = {
    left: `${active.offsetLeft + active.offsetWidth * 0.2}px`,
    width: `${active.offsetWidth * 0.6}px`,
  }
}

const visibleCount = computed(() => showAll.value ? 30 : 10)

const displayData = computed(() => {
  const data = historyType.value === 'ssq' ? ssqHistoryData.value : dltHistoryData.value
  return data.slice(0, 30)
})

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(updateIndicator)
    Promise.all([fetchHistoryData('ssq'), fetchHistoryData('dlt')])
  }
})

function redBalls(item: any): number[] {
  return 'red' in item ? item.red : item.front
}
function blueBalls(item: any): number[] {
  return 'blue' in item ? [item.blue] : item.back
}
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const manualRefreshTime = ref<string>('')
const updateTime = computed(() => manualRefreshTime.value || (historyType.value === 'ssq' ? lastUpdated.value : dltLastUpdated.value))

async function handleRefresh() {
  manualRefreshTime.value = new Date().toLocaleString('zh-CN')
  await Promise.all([fetchHistoryData('ssq'), fetchHistoryData('dlt')])
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Transition name="dhp-modal">
    <div v-if="visible" class="dhp-overlay" @click="handleOverlayClick">
      <div class="dhp-content" :class="{ 'dhp-dlt': historyType === 'dlt' }">
        <div class="dhp-header">
          <h3 class="dhp-title">开奖历史</h3>
          <div class="dhp-header-actions">
            <span v-if="updateTime" class="dhp-update-time">更新: {{ updateTime }}</span>
            <button class="dhp-refresh" :class="{ loading: isLoading }" @click="handleRefresh" title="刷新数据">
              <RiRefreshLine class="dhp-refresh-icon" />
            </button>
            <button class="dhp-close" @click="emit('close')">
              <RiCloseLine class="dhp-close-icon" />
            </button>
          </div>
        </div>
        <div class="dhp-divider"></div>

        <div ref="tabsEl" class="dhp-tabs">
          <button
            class="dhp-tab"
            :class="{ active: historyType === 'ssq' }"
            @click="switchTab('ssq')"
          >双色球 ({{ ssqHistoryData.length }})</button>
          <button
            class="dhp-tab"
            :class="{ active: historyType === 'dlt' }"
            @click="switchTab('dlt')"
          >大乐透 ({{ dltHistoryData.length }})</button>
          <span class="dhp-indicator" :style="indicatorStyle"></span>
        </div>

        <div class="dhp-body">
          <div v-for="item in displayData.slice(0, visibleCount)" :key="item.issue" class="dhp-row">
            <span class="dhp-issue">{{ item.issue }}</span>
            <span class="dhp-balls">
              <span class="dhp-reds">
                <span v-for="n in redBalls(item)" :key="n" class="dhp-ball dhp-ball--red">{{ pad(n) }}</span>
              </span>
              <span class="dhp-sep"></span>
              <span class="dhp-blues">
                <span v-for="n in blueBalls(item)" :key="n" class="dhp-ball dhp-ball--blue">{{ pad(n) }}</span>
              </span>
            </span>
          </div>
          <div v-if="isLoading && displayData.length === 0" class="dhp-empty">加载中...</div>
          <div v-else-if="displayData.length === 0" class="dhp-empty">暂无开奖数据</div>
          <button v-if="displayData.length > 10" class="dhp-more" @click="showAll = !showAll">
            {{ showAll ? '收起' : '展开全部' }}
            <span class="dhp-more-arrow">{{ showAll ? '↑' : '↓' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dhp-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.dhp-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.dhp-modal-enter-active .dhp-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.dhp-modal-leave-active .dhp-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.dhp-modal-enter-from,
.dhp-modal-leave-to { opacity: 0; }
.dhp-modal-enter-from .dhp-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.dhp-modal-leave-to .dhp-content { transform: scale(0.92) translateY(15px); opacity: 0; }

.dhp-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 24px;
}

.dhp-content {
  width: 580px;
  max-height: 85vh;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.dhp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
}

.dhp-title {
  font-size: 16px;
  font-weight: 700;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
  margin: 0;
}

.dhp-close {
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

.dhp-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dhp-close-icon {
  width: 18px;
  height: 18px;
  color: #92400E;
}

.dhp-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dhp-refresh {
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

.dhp-refresh:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dhp-refresh.loading .dhp-refresh-icon {
  animation: dhp-spin 0.8s linear infinite;
}

.dhp-refresh-icon {
  width: 16px;
  height: 16px;
  color: #B45309;
}

.dhp-update-time {
  font-size: 11px;
  color: #B45309;
  font-family: 'SourceHanSans-Regular';
  white-space: nowrap;
}

@keyframes dhp-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dhp-divider {
  margin: 6px 16px 0 16px;
  height: 1px;
  background: rgba(253, 230, 138, 0.6);
}

.dhp-tabs {
  display: flex;
  gap: 0;
  margin: 2px 16px 0 16px;
  border-bottom: 1px solid rgba(253, 230, 138, 0.5);
  position: relative;
}

.dhp-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #B45309;
  background: transparent;
  font-family: 'SourceHanSans-SemiBold';
  transition: color 0.25s;
  position: relative;
  z-index: 1;
}

.dhp-tab.active {
  color: #92400E;
}

.dhp-indicator {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: #F59E0B;
  border-radius: 1px;
  transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.dhp-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 16px 16px;
}

.dhp-body::-webkit-scrollbar {
  width: 4px;
}
.dhp-body::-webkit-scrollbar-thumb {
  background: #FCD34D;
  border-radius: 2px;
}

.dhp-body {
  flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px;
}

.dhp-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.dhp-row:nth-child(odd) {
  background: rgba(255, 251, 235, 0.4);
  border-color: rgba(253, 230, 138, 0.25);
}
.dhp-row:hover {
  background: rgba(255, 251, 235, 0.7);
  border-color: rgba(253, 230, 138, 0.5);
  transform: translateX(2px);
}
.dhp-row + .dhp-row {
  margin-top: 6px;
}

.dhp-issue {
  font-size: 12px; font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  color: #92400E;
  flex-shrink: 0; width: 56px;
}

.dhp-balls {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
}
.dhp-reds, .dhp-blues {
  display: flex; align-items: center; gap: 4px;
}
.dhp-sep {
  width: 1px; height: 20px;
  background: rgba(253, 230, 138, 0.5);
  flex-shrink: 0;
  margin: 0 2px;
}

.dhp-more {
  width: 100%;
  padding: 10px 0;
  margin-top: 12px;
  border: 1px dashed rgba(253, 230, 138, 0.5);
  border-radius: 8px;
  background: rgba(255, 251, 235, 0.3);
  cursor: pointer;
  font-size: 13px; font-weight: 600;
  font-family: 'SourceHanSans-SemiBold';
  color: #B45309;
  transition: all 0.2s;
}
.dhp-more:hover {
  background: rgba(255, 251, 235, 0.7);
  border-color: rgba(253, 230, 138, 0.7);
}
.dhp-more-arrow { font-size: 12px; }

.dhp-ball {
  width: 36px; height: 30px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  border: 1px solid;
  transition: all 0.15s;
  line-height: 1;
}
.dhp-ball:hover { transform: scale(1.08); }

.dhp-ball--red {
  background-color: rgba(239, 68, 68, 0.094);
  border-color: rgba(239, 68, 68, 0.25);
  color: rgb(239, 68, 68);
}
.dhp-ball--blue {
  background-color: rgba(59, 130, 246, 0.094);
  border-color: rgba(59, 130, 246, 0.25);
  color: rgb(59, 130, 246);
}

.dhp-empty {
  text-align: center; padding: 30px 0;
  font-size: 14px; color: #B45309;
  font-family: 'SourceHanSans-Regular';
}

.dhp-dlt .dhp-indicator { background: #3B82F6; }
.dhp-dlt .dhp-ball--blue {
  background-color: rgba(139, 92, 246, 0.094);
  border-color: rgba(139, 92, 246, 0.25);
  color: rgb(139, 92, 246);
}

@media screen and (max-width: 480px) {
  .dhp-overlay { padding: 12px; }
  .dhp-content { width: 100%; max-height: 85vh; }
  .dhp-ball { width: 30px; height: 26px; font-size: 11px; }
  .dhp-issue { font-size: 11px; width: 48px; }
  .dhp-row { padding: 6px 10px; gap: 6px; }
}
</style>
