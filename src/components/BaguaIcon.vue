<template>
  <svg
    class="bagua-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 乾 (Qian): 三连 - 三条阳爻 -->
    <template v-if="type === 'qian'">
      <line x1="4" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 兑 (Dui): 上缺 - 下两阳上一阴 -->
    <template v-else-if="type === 'dui'">
      <line x1="4" y1="5" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 离 (Li): 中虚 - 上下阳中间阴 -->
    <template v-else-if="type === 'li'">
      <line x1="4" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 震 (Zhen): 仰盂 - 下两阴上一阳 -->
    <template v-else-if="type === 'zhen'">
      <line x1="4" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 巽 (Xun): 下断 - 下阴上两阳 -->
    <template v-else-if="type === 'xun'">
      <line x1="4" y1="5" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 坎 (Kan): 中满 - 上下阴中间阳 -->
    <template v-else-if="type === 'kan'">
      <line x1="4" y1="5" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 艮 (Gen): 覆碗 - 下两阴上一阳 -->
    <template v-else-if="type === 'gen'">
      <line x1="4" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 坤 (Kun): 六断 - 三条阴爻 -->
    <template v-else-if="type === 'kun'">
      <line x1="4" y1="5" x2="12" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="19" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="19" x2="20" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </template>
    
    <!-- 太极图 (Taiji) -->
    <template v-else-if="type === 'taiji'">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M12 3C12 3 7 8 7 12C7 16 12 21 12 21" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/>
      <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
    </template>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  type?: 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun' | 'taiji'
}

withDefaults(defineProps<Props>(), {
  type: 'qian'
})
</script>

<style scoped>
.bagua-icon {
  width: 100%;
  height: 100%;
  color: var(--word-icon-color, currentColor);
}
</style>
