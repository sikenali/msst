<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import BaguaIcon from '@/components/BaguaIcon.vue'
import { allSelectRules } from '@/rules/select/index'
import { setSelectRuleNames, selectRuleNames } from '@/composables/useRuleEngine'
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
const previewRule = ref<null | (typeof allSelectRules[number])>(null)

const filteredRules = computed(() =>
  allSelectRules.filter(r => !r.appliesTo || r.appliesTo.includes(props.lotteryType))
)

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
  setSelectRuleNames(selected)
  emit('apply')
  emit('close')
}

function handleClose() { emit('close') }

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}

function initRules() {
  for (const r of filteredRules.value) {
    enabledRules.value[r.name] = selectRuleNames.value.includes(r.name)
  }
}

onMounted(initRules)
watch(() => props.visible, (v) => { if (v) initRules() })
</script>

<template>
  <Transition name="sm-modal">
    <div v-if="visible" class="sm-overlay" @click="handleOverlayClick">
      <div class="sm-content" :class="{ 'sm-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="sm-header">
          <h3 class="sm-title">选号方法</h3>
          <button class="sm-close" @click="handleClose"><RiCloseLine class="sm-close-icon" /></button>
        </div>
        <div class="sm-divider"></div>
        <div class="sm-body">
          <div class="sm-rules-header">
            <span class="sm-rules-count">已选 {{ enabledCount }}/{{ filteredRules.length }}</span>
            <div class="sm-header-actions">
              <button class="sm-toggle-all" @click="toggleAll(true)">全部开启</button>
              <button class="sm-toggle-all" @click="toggleAll(false)">全部关闭</button>
            </div>
          </div>
          <div class="sm-rules-list">
            <div v-for="rule in filteredRules" :key="rule.name" class="sm-rule-item" :class="{ 'sm-rule-item--active': previewRule?.name === rule.name }">
              <div class="sm-rule-left" @click="previewRule = previewRule?.name === rule.name ? null : rule">
                <div class="sm-rule-bagua"><BaguaIcon :type="rule.bagua" /></div>
                <div class="sm-rule-info">
                  <span class="sm-rule-name">{{ rule.name }}</span>
                  <span class="sm-rule-desc">{{ rule.description }}</span>
                </div>
              </div>
              <label class="sm-toggle">
                <input type="checkbox" :checked="enabledRules[rule.name]" @change="toggleRule(rule.name)">
                <span class="sm-toggle-slider"></span>
              </label>
            </div>
          </div>
          <Transition name="sm-preview">
            <div v-if="previewRule" class="sm-preview">
              <div class="sm-preview-diagram"><BaguaIcon :type="previewRule.bagua" /></div>
              <div class="sm-preview-label">{{ previewRule.name }}</div>
            </div>
          </Transition>
        </div>
        <div class="sm-actions">
          <button class="sm-btn sm-btn--cancel" @click="handleClose">取消</button>
          <button class="sm-btn sm-btn--apply" @click="handleApply">应用 ({{ enabledCount }})</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sm-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.sm-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.sm-modal-enter-active .sm-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.sm-modal-leave-active .sm-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.sm-modal-enter-from, .sm-modal-leave-to { opacity: 0; }
.sm-modal-enter-from .sm-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.sm-modal-enter-to .sm-content { transform: scale(1) translateY(0); opacity: 1; }
.sm-modal-leave-to .sm-content { transform: scale(0.92) translateY(15px); opacity: 0; }
.sm-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); padding: 24px; }
.sm-content { width: 500px; max-height: 80vh; overflow: hidden; border-radius: 18px; background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.55); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; }
.sm-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0 16px; }
.sm-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.sm-close { width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; background: transparent; transition: background 0.2s; }
.sm-close:hover { background: rgba(0, 0, 0, 0.05); }
.sm-close-icon { width: 18px; height: 18px; color: #92400E; }
.sm-divider { margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6); }
.sm-body { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; }
.sm-rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.sm-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.sm-header-actions { display: flex; gap: 6px; }
.sm-toggle-all { padding: 4px 10px; border-radius: 6px; border: 1px solid #FCD34D; background: transparent; color: #92400E; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: background 0.2s; }
.sm-toggle-all:hover { background: rgba(253, 230, 138, 0.3); }
.sm-rules-list { display: flex; flex-direction: column; gap: 6px; }
.sm-rule-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 8px; border: 1px solid rgba(253, 230, 138, 0.4); }
.sm-rule-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.sm-rule-bagua { width: 28px; height: 28px; flex-shrink: 0; color: #B45309; }
.sm-rule-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.sm-rule-name { font-size: 13px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.sm-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }
.sm-toggle { position: relative; display: inline-block; width: 36px; height: 20px; flex-shrink: 0; }
.sm-toggle input { opacity: 0; width: 0; height: 0; }
.sm-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #D1D5DB; border-radius: 9999px; transition: 0.3s; }
.sm-toggle-slider::before { content: ''; position: absolute; left: 2px; bottom: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
.sm-toggle input:checked + .sm-toggle-slider { background: #F59E0B; }
.sm-toggle input:checked + .sm-toggle-slider::before { transform: translateX(16px); }
.sm-actions { display: flex; gap: 12px; margin-top: 16px; }
.sm-btn { flex: 1; height: 38px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.sm-btn:active { transform: scale(0.96); }
.sm-btn--cancel { background: #F3F4F6; color: #6B7280; }
.sm-btn--cancel:hover { background: #E5E7EB; }
.sm-btn--apply { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFF; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25); }
.sm-dlt .sm-toggle input:checked + .sm-toggle-slider { background: #3B82F6; }
.sm-dlt .sm-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.sm-rule-item--active { border-color: #F59E0B; background: rgba(253, 230, 138, 0.25); }
.sm-rule-left { cursor: pointer; }
.sm-preview { margin-top: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 24px 16px; background: rgba(255, 251, 235, 0.6); border-radius: 12px; border: 1px solid rgba(253, 230, 138, 0.5); }
.sm-preview-diagram { width: 80px; height: 80px; color: #B45309; }
.sm-preview-label { font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.sm-preview-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.sm-preview-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 1, 1); }
.sm-preview-enter-from, .sm-preview-leave-to { opacity: 0; transform: translateY(-8px) scale(0.92); }
.sm-dlt .sm-rule-item--active { border-color: #3B82F6; background: rgba(59, 130, 246, 0.08); }
@media screen and (max-width: 480px) { .sm-overlay { padding: 12px; } .sm-content { width: 100%; max-height: 85vh; } }
</style>
