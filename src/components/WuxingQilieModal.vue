<script setup lang="ts">
import { onMounted } from 'vue'
import { RiCloseLine, RiMoneyCnyCircleFill } from '@remixicon/vue'
import { useWuxingQilie } from '@/composables/useWuxingQilie'
import { setWuxingType } from '@/composables/useWuxingQilie'
import CopperCoinIcon from '@/components/CopperCoinIcon.vue'

interface Props {
  visible: boolean
  lotteryType: 'ssq' | 'dlt'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  apply: []
}>()

const { rows, brokenRowEnabled, brokenColumnEnabled } = useWuxingQilie()

function handleToggleRow() {
  brokenRowEnabled.value = !brokenRowEnabled.value
}

function handleToggleColumn() {
  brokenColumnEnabled.value = !brokenColumnEnabled.value
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

onMounted(() => {
  setWuxingType(props.lotteryType)
})
</script>

<template>
  <Transition name="wq-modal">
    <div v-if="visible" class="wq-overlay" @click="handleOverlayClick">
      <div class="wq-content" :class="{ 'wq-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="wq-header">
          <h3 class="wq-title">五行七列</h3>
          <button class="wq-close" @click="handleClose">
            <RiCloseLine class="wq-close-icon" />
          </button>
        </div>
        <div class="wq-divider"></div>

        <div class="wq-body">
          <div class="wq-chart">
            <div v-for="row in rows" :key="row.name" class="wq-row">
              <div class="wq-row-label" :style="{ color: row.color }">{{ row.name }}</div>
              <div class="wq-row-numbers">
                <template v-for="(_, idx) in 7" :key="idx">
                  <span
                    v-if="row.numbers[idx] !== undefined"
                    class="wq-cell"
                    :style="{
                      '--cell-color': row.color,
                      backgroundColor: row.color + '18',
                      borderColor: row.color + '40',
                      color: row.color,
                    }"
                  >{{ String(row.numbers[idx]).padStart(2, '0') }}</span>
                  <span
                    v-else-if="lotteryType === 'ssq' && row.name === '水' && idx === 5"
                    class="wq-cell wq-icon-cell"
                    :style="{
                      '--cell-color': row.color,
                      backgroundColor: row.color + '18',
                      borderColor: row.color + '40',
                    }"
                  >
                    <RiMoneyCnyCircleFill class="wq-icon" />
                  </span>
                  <span
                    v-else-if="lotteryType === 'ssq' && row.name === '水' && idx === 6"
                    class="wq-cell wq-icon-cell"
                    :style="{
                      '--cell-color': row.color,
                      backgroundColor: row.color + '18',
                      borderColor: row.color + '40',
                    }"
                  >
                    <CopperCoinIcon class="wq-icon" />
                  </span>
                  <span
                    v-else
                    class="wq-cell wq-empty-cell"
                    :style="{
                      '--cell-color': row.color,
                      backgroundColor: row.color + '08',
                      borderColor: row.color + '20',
                    }"
                  ></span>
                </template>
              </div>
            </div>
          </div>

          <div class="wq-controls">
            <div class="wq-control-group">
              <label class="wq-control-label">
                <span class="wq-control-name">断行</span>
                <label class="wq-toggle">
                  <input type="checkbox" :checked="brokenRowEnabled" @change="handleToggleRow">
                  <span class="wq-toggle-slider"></span>
                </label>
              </label>
              <p class="wq-control-desc">排除连续空开/热极必反/长期冷行</p>
            </div>
            <div class="wq-control-group">
              <label class="wq-control-label">
                <span class="wq-control-name">断列</span>
                <label class="wq-toggle">
                  <input type="checkbox" :checked="brokenColumnEnabled" @change="handleToggleColumn">
                  <span class="wq-toggle-slider"></span>
                </label>
              </label>
              <p class="wq-control-desc">排除空开列/冷列</p>
            </div>
          </div>

          <div class="wq-actions">
            <button class="wq-btn wq-btn--cancel" @click="handleClose">取消</button>
            <button class="wq-btn wq-btn--apply" @click="handleApply">应用</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wq-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.wq-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.wq-modal-enter-active .wq-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.wq-modal-leave-active .wq-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.wq-modal-enter-from, .wq-modal-leave-to { opacity: 0; }
.wq-modal-enter-from .wq-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.wq-modal-enter-to .wq-content { transform: scale(1) translateY(0); opacity: 1; }
.wq-modal-leave-to .wq-content { transform: scale(0.92) translateY(15px); opacity: 0; }

.wq-overlay {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4); padding: 24px;
}

.wq-content {
  width: 540px; height: 480px; overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06);
  display: flex; flex-direction: column;
}

.wq-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 0 16px;
}

.wq-title {
  font-size: 16px; font-weight: 700; color: #92400E;
  font-family: 'SourceHanSans-Bold'; margin: 0;
}

.wq-close {
  width: 28px; height: 28px; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; padding: 0; background: transparent;
  transition: background 0.2s;
}
.wq-close:hover { background: rgba(0, 0, 0, 0.05); }
.wq-close-icon { width: 18px; height: 18px; color: #92400E; }

.wq-divider {
  margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6);
}

.wq-tabs {
  display: flex; gap: 0; margin: 8px 16px 0 16px;
  border-bottom: 1px solid rgba(253, 230, 138, 0.5);
}

.wq-tab {
  flex: 1; padding: 8px 0; border: none; cursor: pointer;
  font-size: 14px; font-weight: 600;
  color: #B45309; background: transparent;
  font-family: 'SourceHanSans-SemiBold';
  transition: color 0.2s;
  position: relative;
}
.wq-tab.active { color: #92400E; }
.wq-tab.active::after {
  content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%;
  height: 2px; background: #F59E0B; border-radius: 1px;
}

.wq-body {
  flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px;
}

/* Chart */
.wq-chart {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
  align-items: center;
}
.wq-row {
  display: flex; align-items: center; gap: 8px;
  justify-content: center;
}
.wq-row-label {
  width: 24px; font-size: 14px; font-weight: 800;
  font-family: 'SourceHanSans-Black'; text-align: center; flex-shrink: 0;
}
.wq-row-numbers {
  display: flex; gap: 4px; flex-wrap: wrap;
}
.wq-cell {
  width: 36px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; font-family: 'SourceHanSans-Bold';
  border: 1px solid; transition: all 0.2s;
}
.wq-icon-cell {
  color: #3B82F6;
}
.wq-icon {
  width: 18px;
  height: 18px;
}
.wq-empty-cell {
  background: rgba(59, 130, 246, 0.05);
  border: 1px dashed rgba(59, 130, 246, 0.2);
}

/* Controls */
.wq-controls {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;
}
.wq-control-group {
  padding: 10px 12px;
  background: rgba(255, 251, 235, 0.5);
  border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.4);
}
.wq-control-label {
  display: flex; align-items: center; justify-content: space-between; cursor: pointer;
}
.wq-control-name {
  font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold';
}
.wq-control-desc {
  font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; margin: 4px 0 0 0;
}

.wq-note {
  text-align: center; padding: 8px; margin-bottom: 8px;
  background: rgba(254, 243, 199, 0.4); border-radius: 8px;
}
.wq-note p { font-size: 12px; color: #B45309; font-family: 'SourceHanSans-Regular'; margin: 0; }

/* Toggle */
.wq-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.wq-toggle input { opacity: 0; width: 0; height: 0; }
.wq-toggle-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #D1D5DB; border-radius: 9999px; transition: 0.3s;
}
.wq-toggle-slider::before {
  content: ''; position: absolute; left: 2px; bottom: 2px;
  width: 16px; height: 16px; background: #fff; border-radius: 50%;
  transition: 0.3s;
}
.wq-toggle input:checked + .wq-toggle-slider { background: #8B5CF6; }
.wq-toggle input:checked + .wq-toggle-slider::before { transform: translateX(16px); }

/* Rules tab */
.wq-rules-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.wq-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.wq-toggle-all {
  padding: 4px 12px; border-radius: 6px; border: 1px solid #FCD34D;
  background: transparent; color: #92400E; font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: 'SourceHanSans-SemiBold';
}

.wq-rules-list { display: flex; flex-direction: column; gap: 10px; }

.wq-rule-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 251, 235, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(253, 230, 138, 0.4);
}
.wq-rule-info { display: flex; flex-direction: column; gap: 2px; }
.wq-rule-name { font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.wq-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }

/* Actions */
.wq-actions {
  display: flex; gap: 12px; margin-top: 16px;
}
.wq-btn {
  flex: 1; height: 38px; border-radius: 8px; border: none;
  font-size: 14px; font-weight: 600; cursor: pointer;
  font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s;
}
.wq-btn:active { transform: scale(0.96); }
.wq-btn--cancel { background: #F3F4F6; color: #6B7280; }
.wq-btn--cancel:hover { background: #E5E7EB; }
.wq-btn--apply {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: #FFF; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

/* DLT theme */
.wq-dlt .wq-tab.active::after { background: #3B82F6; }
.wq-dlt .wq-toggle input:checked + .wq-toggle-slider { background: #3B82F6; }
.wq-dlt .wq-btn--apply {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

@media screen and (max-width: 480px) {
  .wq-overlay { padding: 12px; }
  .wq-content { width: 100%; height: auto; max-height: 85vh; }
  .wq-body { flex: 1; overflow-y: auto; }
  .wq-cell { width: 32px; height: 28px; font-size: 11px; }
}
</style>
