<script setup lang="ts">
const modelValue = defineModel<'ssq' | 'dlt'>({ default: 'ssq' })
const emit = defineEmits<{
  'update:modelValue': [value: 'ssq' | 'dlt']
}>()

function switchTab(type: 'ssq' | 'dlt') {
  modelValue.value = type
  emit('update:modelValue', type)
}
</script>

<template>
  <!-- 选项卡容器 -->
  <div class="tab-container">
    <!-- 双色球选项卡 -->
    <button
      class="tab-btn"
      :class="modelValue === 'ssq' ? 'tab-btn--active-ssq' : ''"
      @click="switchTab('ssq')"
    >
      双色球
    </button>

    <!-- 大乐透选项卡 -->
    <button
      class="tab-btn"
      :class="modelValue === 'dlt' ? 'tab-btn--active-dlt' : ''"
      @click="switchTab('dlt')"
    >
      大乐透
    </button>
  </div>
</template>

<style scoped>
.tab-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 8px;
  background: #FFFBEB;
  padding: 0;
  white-space: nowrap;
}

.tab-btn {
  height: 40px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.2;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  background: transparent;
  color: #92400E;
  font-family: 'SourceHanSans-Medium';
  white-space: nowrap;
}

.tab-btn--active-ssq {
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

.tab-btn--active-dlt {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  color: #FFFFFF;
  font-family: 'SourceHanSans-SemiBold';
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1);
}

/* 移动端适配 - 缩小选项卡 */
@media screen and (max-width: 480px) {
  .tab-container {
    height: 40px;
    padding: 0;
  }

  .tab-btn {
    height: 38px;
    font-size: 14px;
    padding: 8px 16px;
  }
}

/* 小屏手机适配 */
@media screen and (max-width: 375px) {
  .tab-container {
    height: 40px;
    padding: 3px;
  }

  .tab-btn {
    height: 34px;
    font-size: 13px;
    padding: 6px 12px;
  }
}

/* 平板适配 */
@media screen and (min-width: 481px) and (max-width: 767px) {
  .tab-container {
    height: 50px;
    padding: 4px;
  }

  .tab-btn {
    height: 42px;
    font-size: 16px;
    padding: 10px 24px;
  }
}
</style>
