<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RiCloseLine } from '@remixicon/vue'
import { allMatrixRules } from '@/rules/matrix/index'
import { setMatrixRuleName, matrixRuleName } from '@/composables/useRuleEngine'
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

const filteredRules = computed(() =>
  allMatrixRules.filter(r => !r.appliesTo || r.appliesTo.includes(props.lotteryType))
)

const selectedRule = ref('')

function handleApply() {
  if (selectedRule.value) {
    setMatrixRuleName(selectedRule.value)
  }
  emit('apply')
  emit('close')
}

function handleClose() { emit('close') }

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) handleClose()
}

function initRules() {
  const rules = filteredRules.value
  if (matrixRuleName.value && rules.some(r => r.name === matrixRuleName.value)) {
    selectedRule.value = matrixRuleName.value
  } else if (rules.length > 0) {
    selectedRule.value = rules[0].name
  }
}

onMounted(initRules)
watch(() => props.visible, (v) => { if (v) initRules() })
</script>

<template>
  <Transition name="mm-modal">
    <div v-if="visible" class="mm-overlay" @click="handleOverlayClick">
      <div class="mm-content" :class="{ 'mm-dlt': lotteryType === 'dlt' }" @click.stop>
        <div class="mm-header">
          <h3 class="mm-title">矩阵缩水</h3>
          <button class="mm-close" @click="handleClose"><RiCloseLine class="mm-close-icon" /></button>
        </div>
        <div class="mm-divider"></div>
        <div class="mm-body">
          <div class="mm-rules-header">
            <span class="mm-rules-count">请选择一种矩阵方式</span>
          </div>
          <div class="mm-rules-list">
            <div v-for="rule in filteredRules" :key="rule.name"
              class="mm-rule-item" :class="{ selected: selectedRule === rule.name }"
              @click="selectedRule = rule.name">
              <div class="mm-radio">
                <div class="mm-radio-dot" :class="{ active: selectedRule === rule.name }"></div>
              </div>
              <div class="mm-rule-info">
                <span class="mm-rule-name">{{ rule.name }}</span>
                <span class="mm-rule-desc">{{ rule.description }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mm-actions">
          <button class="mm-btn mm-btn--cancel" @click="handleClose">取消</button>
          <button class="mm-btn mm-btn--apply" @click="handleApply">应用</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mm-modal-enter-active { transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.mm-modal-leave-active { transition: opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.mm-modal-enter-active .mm-content { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.mm-modal-leave-active .mm-content { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s cubic-bezier(0.4, 0, 1, 1); }
.mm-modal-enter-from, .mm-modal-leave-to { opacity: 0; }
.mm-modal-enter-from .mm-content { transform: scale(0.88) translateY(30px); opacity: 0; }
.mm-modal-enter-to .mm-content { transform: scale(1) translateY(0); opacity: 1; }
.mm-modal-leave-to .mm-content { transform: scale(0.92) translateY(15px); opacity: 0; }
.mm-overlay { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.4); padding: 24px; }
.mm-content { width: 480px; max-height: 80vh; overflow: hidden; border-radius: 18px; background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.55); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; }
.mm-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 0 16px; }
.mm-title { font-size: 16px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; margin: 0; }
.mm-close { width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; background: transparent; transition: background 0.2s; }
.mm-close:hover { background: rgba(0, 0, 0, 0.05); }
.mm-close-icon { width: 18px; height: 18px; color: #92400E; }
.mm-divider { margin: 10px 16px 0 16px; height: 1px; background: rgba(253, 230, 138, 0.6); }
.mm-body { flex: 1; overflow-y: auto; padding: 12px 16px 16px 16px; }
.mm-rules-header { margin-bottom: 12px; }
.mm-rules-count { font-size: 13px; color: #92400E; font-family: 'SourceHanSans-Regular'; }
.mm-rules-list { display: flex; flex-direction: column; gap: 8px; }
.mm-rule-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: rgba(255, 251, 235, 0.5); border-radius: 10px; border: 1px solid rgba(253, 230, 138, 0.4); cursor: pointer; transition: all 0.2s; }
.mm-rule-item:hover { background: rgba(255, 251, 235, 0.8); border-color: #FCD34D; }
.mm-rule-item.selected { border-color: #8B5CF6; background: rgba(139, 92, 246, 0.08); }
.mm-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #D1D5DB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.2s; }
.mm-rule-item.selected .mm-radio { border-color: #8B5CF6; }
.mm-radio-dot { width: 10px; height: 10px; border-radius: 50%; background: transparent; transition: background 0.2s; }
.mm-radio-dot.active { background: #8B5CF6; }
.mm-rule-info { display: flex; flex-direction: column; gap: 1px; }
.mm-rule-name { font-size: 14px; font-weight: 700; color: #92400E; font-family: 'SourceHanSans-Bold'; }
.mm-rule-desc { font-size: 11px; color: #B45309; font-family: 'SourceHanSans-Regular'; }
.mm-actions { display: flex; gap: 12px; margin-top: 16px; }
.mm-btn { flex: 1; height: 38px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'SourceHanSans-SemiBold'; transition: all 0.2s; }
.mm-btn:active { transform: scale(0.96); }
.mm-btn--cancel { background: #F3F4F6; color: #6B7280; }
.mm-btn--cancel:hover { background: #E5E7EB; }
.mm-btn--apply { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFF; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25); }
.mm-dlt .mm-rule-item.selected { border-color: #3B82F6; }
.mm-dlt .mm-rule-item.selected .mm-radio { border-color: #3B82F6; }
.mm-dlt .mm-radio-dot.active { background: #3B82F6; }
.mm-dlt .mm-btn--apply { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
@media screen and (max-width: 480px) { .mm-overlay { padding: 12px; } .mm-content { width: 100%; max-height: 85vh; } }
</style>
