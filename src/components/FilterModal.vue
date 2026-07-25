<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import { allFilters } from '@/rules/filters/index'
import { setFilterNames, filterNames } from '@/composables/useRuleEngine'
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

const enabledRules = ref<Record<string, boolean>>({})

const enabledCount = computed(() =>
  Object.entries(enabledRules.value).filter(([, v]) => v).length
)

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
  setFilterNames(selected)
  emit('apply')
  emit('close')
}

function handleClose() { emit('close') }

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}

function initRules() {
  for (const r of allFilters) {
    enabledRules.value[r.name] = filterNames.value.includes(r.name)
  }
}

onMounted(initRules)
watch(() => props.visible, (v) => { if (v) initRules() })
</script>

<template>
  <Transition name="fm-modal">
    <div v-if="visible" class="fm-overlay" @click="handleOverlayClick">
      <div class="fm-content" :class="{ 'fm-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="fm-header">
          <h3 class="fm-title">组合过滤</h3>
          <button class="fm-close" @click="handleClose"><RiCloseLine class="fm-close-icon" /></button>
        </div>
        <div class="fm-divider"></div>
        <div class="fm-body">
          <div class="fm-rules-header">
            <span class="fm-rules-count">已选 {{ enabledCount }}/{{ allFilters.length }}</span>
            <div class="fm-header-actions">
              <button class="fm-toggle-all" @click="toggleAll(true)">全部开启</button>
              <button class="fm-toggle-all" @click="toggleAll(false)">全部关闭</button>
            </div>
          </div>
          <div class="fm-rules-list">
            <div v-for="rule in allFilters" :key="rule.name" class="fm-rule-item">
              <div class="fm-rule-info">
                <span class="fm-rule-name">{{ rule.name }}</span>
                <span class="fm-rule-desc">{{ rule.description }}</span>
              </div>
              <label class="fm-toggle">
                <input type="checkbox" :checked="enabledRules[rule.name]" @change="toggleRule(rule.name)">
                <span class="fm-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="fm-actions">
          <button class="fm-btn fm-btn--cancel" @click="handleClose">取消</button>
          <button class="fm-btn fm-btn--apply" @click="handleApply">应用 ({{ enabledCount }})</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fm-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.fm-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.fm-modal-enter-active .fm-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.fm-modal-leave-active .fm-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.fm-modal-enter-from, .fm-modal-leave-to { opacity: 0; }
.fm-modal-enter-from .fm-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.fm-modal-enter-to .fm-content { transform: scale(1) translateY(0); opacity: 1; }
.fm-modal-leave-to .fm-content { transform: scale(0.92) translateY(15px); opacity: 0; }
.fm-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); padding: 24px; }
.fm-content { width: 500px; max-height: 80vh; overflow: hidden; border-radius: 18px; background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.55); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; }
.fm-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0 16px; }
.fm-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.fm-close { width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; background: transparent; transition: background 0.2s; }
.fm-close:hover { background: rgba(0, 0, 0, 0.05); }
.fm-close-icon { width: 18px; height: 18px; color: #92400E; }
.fm-divider { margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6); }
.fm-body { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; }
.fm-rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.fm-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.fm-header-actions { display: flex; gap: 6px; }
.fm-toggle-all { padding: 4px 10px; border-radius: 6px; border: 1px solid #FCD34D; background: transparent; color: #92400E; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: background 0.2s; }
.fm-toggle-all:hover { background: rgba(253, 230, 138, 0.3); }
.fm-rules-list { display: flex; flex-direction: column; gap: 6px; }
.fm-rule-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 8px; border: 1px solid rgba(253, 230, 138, 0.4); }
.fm-rule-info { display: flex; flex-direction: column; gap: 1px; }
.fm-rule-name { font-size: 13px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.fm-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }
.fm-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.fm-toggle input { opacity: 0; width: 0; height: 0; }
.fm-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #D1D5DB; border-radius: 9999px; transition: 0.3s; }
.fm-toggle-slider::before { content: ''; position: absolute; left: 2px; bottom: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
.fm-toggle input:checked + .fm-toggle-slider { background: #3B82F6; }
.fm-toggle input:checked + .fm-toggle-slider::before { transform: translateX(16px); }
.fm-actions { display: flex; gap: 12px; margin-top: 16px; }
.fm-btn { flex: 1; height: 38px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.fm-btn:active { transform: scale(0.96); }
.fm-btn--cancel { background: #F3F4F6; color: #6B7280; }
.fm-btn--cancel:hover { background: #E5E7EB; }
.fm-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFF; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.fm-dlt .fm-toggle input:checked + .fm-toggle-slider { background: #3B82F6; }
.fm-dlt .fm-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
@media screen and (max-width: 480px) { .fm-overlay { padding: 12px; } .fm-content { width: 100%; max-height: 85vh; } }
</style>
